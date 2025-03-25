// deno-lint-ignore-file no-explicit-any
import { Permissions } from "@models/permission.ts";
import { Profile } from "@models/user/profile.ts";

/**
 * Represents a user in Afloat.
 *
 * This class centralizes user-related logic, simplifying interaction
 * with user-related data and ensuring consistent permission checks across the application.
 */
export class User {
  /**
   * Logged-in user name
   */
  public name: string;

  /**
   * Logged-in identity: phone-number or email address
   */
  public identity: string;

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
   * @param userData - An object containing the user's profile, token,
   * permissions (access list), and the `resetPassword` flag.
   */
  private constructor(data: {
    profile: Profile;
    token: string;
    access: string[];
    resetPassword: boolean;
    name: string;
    identity: string;
  }) {
    const { profile, token, access, resetPassword, name, identity } = data;

    this.profile = profile;
    this.token = token;
    this.resetPassword = resetPassword;
    this.name = name;
    this.identity = identity;

    // Initialize the permissions map
    this.permissionsMap = {};
    for (const permission of Object.values(Permissions)) {
      if (typeof permission === "object") {
        Object.values(permission).forEach((perm) => {
          this.permissionsMap[perm] = access.includes(perm);
        });
      } else {
        this.permissionsMap[permission] = access.includes(permission);
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
   * - `profile`: The user's profile information. (Requires profile.toJSON() method)
   * - `token`: The user's authentication token.
   * - `resetPassword`: Indicates whether the user must reset their password.
   * - `permissions`: An array of permission keys the user has.
   */
  public toJSON(): string {
    return JSON.stringify({
      profile: this.profile.toJSON(),
      token: this.token,
      resetPassword: this.resetPassword,
      name: this.name,
      identity: this.identity,
      permissions: Object.keys(this.permissionsMap).filter(
        (key) => this.permissionsMap[key],
      ),
    });
  }

  /**
   * Creates a new `User` instance from a JSON string.
   *
   * @param jsonString - A JSON string containing user data.
   * @returns A `User` instance reconstructed from the JSON data, or undefined if jsonString is invalid.
   */
  public static fromJSON(jsonString: string): User | undefined {
    try {
      return User.from(JSON.parse(jsonString));
    } catch (e) {
      console.error("Invalid JSON string:", e);
      return undefined;
    }
  }

  /**
   * Creates a new `User` instance from a data object, JSON string, or object with a Profile instance/object.
   *
   * @param data - The data object, JSON string, or object with Profile instance/object containing user information.
   * @returns A `User` instance, or undefined if data is invalid.
   */
  public static from(data: any): User | undefined {
    let parsedData: any;

    if (typeof data === "string") {
      try {
        parsedData = JSON.parse(data);
      } catch (error) {
        console.error("Invalid JSON string:", error);
        return undefined;
      }
    } else {
      parsedData = data;
    }

    if (!parsedData) {
      console.error("Data is null or undefined.");
      return undefined;
    }

    let profile: Profile | undefined;

    if (parsedData.profile instanceof Profile) {
      profile = parsedData.profile;
    } else if (typeof parsedData.profile === "object") {
      profile = Profile.from(parsedData.profile);
      if (!profile) {
        console.error("Invalid profile data:", parsedData.profile);
        return undefined;
      }
    } else {
      console.error("Invalid profile type:", parsedData.profile);
      return undefined;
    }

    if (
      typeof parsedData.token !== "string" ||
      typeof parsedData.name !== "string" ||
      typeof parsedData.identity !== "string" ||
      !Array.isArray(parsedData.access) ||
      typeof parsedData.resetPassword !== "boolean"
    ) {
      console.error("Invalid user data:", parsedData);
      return undefined;
    }

    const args = {
      profile: profile!,
      token: parsedData.token,
      access: parsedData.access,
      resetPassword: parsedData.resetPassword,
      name: parsedData.name,
      identity: parsedData.identity,
    };

    return new User(args);
  }
}
