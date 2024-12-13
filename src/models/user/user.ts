import { Permissions } from "@models/permission.ts";
import type { Profile } from "@models/user/profile.ts";

/**
 * Represents a user in Afloat
 *
 * This class centralizes user-related logic, simplifying interaction
 * with user-related data and ensuring consistent permission checks across the application.
 */
export class User {
  /**
   * The user's Afloat profile, containing personal information such as name, contact details, and account information.
   */
  public profile: Profile;

  /**
   * The user's authentication token. This token must be passed in the request headers
   * for all authenticated API endpoints.
   */
  public token: string;

  /**
   * Indicates whether the user is required to change their default password.
   *
   * Afloat users are initially provided with a default username and password. After the first
   * successful login, `resetPassword` will be set to `true` to prompt the user to set a new password.
   */
  public resetPassword: boolean;

  /**
   * A map of permission keys to boolean values, indicating whether the user has access
   * to specific actions or features in the system.
   */
  private permissionsMap: Record<string, boolean>;

  /**
   * Creates a new instance of the `User` class.
   *
   * @param userData - An object of type `CoreUser` containing the user's profile, token,
   * permissions (access list), and the `resetPassword` flag.
   */
  constructor(data: {
    profile: Profile;
    token: string;
    access: string[];
    resetPassword: boolean;
  }) {
    const { profile, token, access, resetPassword } = data;

    this.profile = profile;
    this.token = token;
    this.resetPassword = resetPassword;

    // Initialize the permissions map
    this.permissionsMap = {};
    for (const permission of Object.values(Permissions)) {
      if (typeof permission === "object") {
        Object.values(permission).forEach((perm) => {
          this.permissionsMap[perm] = access.includes(perm);
        });
      }
    }
  }

  /**
   * Checks if the user has a specific permission.
   *
   * @param permission - The permission key to check.
   * @returns `true` if the user has the specified permission, otherwise `false`.
   */
  public can(permission: string): boolean {
    return this.permissionsMap[permission] ?? false;
  }

  /**
   * Serializes the `User` instance to a JSON string.
   *
   * @returns A JSON string representation of the `User` instance, including:
   * - `profile`: The user's profile information.
   * - `token`: The user's authentication token.
   * - `resetPassword`: Indicates whether the user must reset their password.
   * - `permissions`: An array of permission keys the user has.
   */
  public toJSON(): string {
    return JSON.stringify({
      profile: this.profile,
      token: this.token,
      resetPassword: this.resetPassword,
      permissions: Object.keys(this.permissionsMap).filter(
        (key) => this.permissionsMap[key],
      ),
    });
  }

  /**
   * Creates a new `User` instance from a JSON string.
   *
   * @param jsonString - A JSON string containing user data.
   * @returns A `User` instance reconstructed from the JSON data.
   * @throws Will throw an error if the JSON data is invalid or incomplete.
   */
  public static fromJSON(jsonString: string): User {
    const data = JSON.parse(jsonString);

    if (
      !data.profile ||
      !data.token ||
      !Array.isArray(data.permissions) ||
      typeof data.resetPassword !== "boolean"
    ) {
      throw new Error("Invalid JSON data for User");
    }

    // Reconstruct the CoreUser structure
    const args = {
      profile: data.profile,
      token: data.token,
      access: data.permissions,
      resetPassword: data.resetPassword,
    };

    return new User(args);
  }
}
