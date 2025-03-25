import { User } from "@models/index.ts";
import { BaseRepository } from "@shared/base_repository.ts";
import { authContract } from "@features/auth/contract.ts";
import { APIError } from "@errors/api_error.ts";
import { LoginRepository } from "@features/auth/identity/repository.ts";

/**
 * Class representing the AuthRepository.
 * Provides methods to handle authentication-related operations, such as login and password updates.
 */
export class AuthRepository extends BaseRepository<typeof authContract> {
  /**
   * Initializes an instance of AuthRepository.
   */
  constructor() {
    super("auth", authContract);
  }

  /**
   * Logs in a user with the provided email and password.
   * @param email - The email of the user attempting to log in.
   * @param password - The password of the user.
   * @returns A promise that resolves to a User object on successful login.
   * @throws {APIError} If the email or password is invalid, or if another error occurs during the login process.
   */
  async logIn(email: string, password: string): Promise<User> {
    const body = { type: "password", identity: email, password };
    const result = await this.client.logIn({ body });
    if (result.status === 400) {
      throw new APIError({
        message: "Invalid email or password",
        statusCode: 400,
      });
    }

    if (result.status === 201) {
      const repo = new LoginRepository();
      const loginCredentials = await repo.getIdentity(result.body.token);
      const user = User.from({ ...result.body, ...loginCredentials });
      if (user) return user;
    }

    throw new APIError({
      message: "An error occurred while trying to log in",
      statusCode: 502,
    });
  }

  /**
   * Updates the user's password.
   * @param currentPassword - The user's current password.
   * @param newPassword - The new password the user wants to set.
   * @returns A promise that resolves to true if the password update is successful.
   * @throws {APIError} If the current password is invalid or another error occurs during the update process.
   */
  async updatePassword(
    currentPassword: string,
    newPassword: string,
  ): Promise<boolean> {
    const result = await this.client.resetPassword({
      body: { currentPassword, newPassword },
    });
    if (result.status === 200) return true;
    if (result.status === 400) {
      throw new APIError({
        message: "Invalid current password",
        statusCode: 400,
      });
    }

    throw new APIError({
      message: "An error occurred while trying to update password",
      statusCode: 502,
    });
  }

  async getAccessList(token: string): Promise<string[]> {
    const result = await this.client.access({ headers: { token: token } });
    if (result.status === 200) return result.body;

    throw new APIError({
      message: "An error occurred while trying to get access list",
      statusCode: 502,
    });
  }
}
