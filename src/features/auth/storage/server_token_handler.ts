import type { TokenHandler } from "@features/auth/storage/types.ts";
import { User } from "@models/index.ts";
import { ProfileRepository } from "@features/auth/profile/repository.ts";
import { LoginRepository } from "@features/auth/identity/repository.ts";
import { AuthRepository } from "@features/auth/repository.ts";

/**
 * Server-side implementation of TokenHandler.
 * Manages tokens in memory for the duration of a request.
 * @implements {TokenHandler}
 */
export class ServerTokenHandler implements TokenHandler {
  /**
   * Creates a new instance of ServerTokenHandler.
   * @param {string} [token] - Optional initial token value
   */
  constructor(private token?: string) {}

  /**
   * Returns the stored token.
   * @returns {string | undefined} The current token or undefined if not set
   */
  getUserToken(): string | undefined {
    return this.token;
  }

  /**
   * Stores the provided token in memory.
   * @param {string} token - The token to store
   */
  setUserToken(token: string): void {
    this.token = token;
  }

  /**
   * Clears the stored token from memory.
   */
  clearToken(): void {
    this.token = undefined;
  }

  /**
   * Fetches and constructs the full user data
   * @returns {Promise<User>}
   */
  async constructUser(): Promise<User> {
    if (!this.token) {
      throw new Error("Token is required to construct user");
    }

    const profileRepo = new ProfileRepository();
    const authRepo = new AuthRepository();
    const logInRepo = new LoginRepository();

    const token = this.token;

    const [access, profile, identity] = await Promise.all([
      authRepo.getAccessList(token),
      profileRepo.getCurrentProfile(token),
      logInRepo.getIdentity(token),
    ]);

    return new User({
      token,
      profile,
      access,
      resetPassword: false,
      loginCredentials: identity,
    });
  }
}
