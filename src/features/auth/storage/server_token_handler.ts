import type { TokenHandler } from "@features/auth/storage/types.ts";
import { Profile, User } from "@models/index.ts";
import { profileContract } from "@features/auth/profile/contract.ts";
import { identityContract } from "@features/auth/identity/contract.ts";
import { TokenRequiredRepository } from "../../../shared/token_required_repository.ts";
import { accessContract } from "@features/auth/access/contract.ts";

/**
 * Server-side implementation of TokenHandler.
 * Manages tokens in memory for the duration of a request.
 * Uses TokenRequiredRepository instead of repositories that rely on AfloatAuth.
 * @implements {TokenHandler}
 */
export class ServerTokenHandler implements TokenHandler {
  private token: string;
  private accessRepo: TokenRequiredRepository<typeof accessContract>;
  private profileRepo: TokenRequiredRepository<typeof profileContract>;
  private identityRepo: TokenRequiredRepository<typeof identityContract>;

  /**
   * Creates a new instance of ServerTokenHandler.
   * @param {string} [token] - Optional initial token value
   */
  constructor(token: string) {
    this.token = token;
    this.accessRepo = new TokenRequiredRepository(
      "auth",
      accessContract,
      this.token,
    );

    this.profileRepo = new TokenRequiredRepository(
      "profile",
      profileContract,
      this.token,
    );

    this.identityRepo = new TokenRequiredRepository(
      "login",
      identityContract,
      this.token,
    );
  }

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
    this.accessRepo.setToken(token);
    this.profileRepo.setToken(token);
    this.identityRepo.setToken(token);
  }

  clearToken(): void {
    this.token = "";
    this.accessRepo.setToken("");
    this.profileRepo.setToken("");
    this.identityRepo.setToken("");
  }

  /**
   * Fetches and constructs the full user data
   * @returns {Promise<User>}
   */
  async constructUser(token: string): Promise<User> {
    if (!this.token) {
      throw new Error("Token is required to construct user");
    }

    this.setUserToken(token);

    try {
      // Fetch all data concurrently with Promise.all
      const [access, profileResult, identityResult] = await Promise.all([
        this.accessRepo!.client.getAccessList(),
        this.profileRepo!.client.getCurrentProfile(),
        this.identityRepo!.client.getUserCredentials(),
      ]);

      // Extract and validate response data
      const accessList = this.accessRepo!.handleResponse<string[]>(access, 200);
      const profileData = this.profileRepo!.handleResponse(profileResult, 200);
      const identityData = this.identityRepo!.handleResponse<
        { name: string; identity: string }
      >(
        identityResult,
        200,
      );

      // Create profile object
      const profile = Profile.from(profileData);
      if (!profile) {
        throw new Error("Failed to create profile from response data");
      }

      // Construct and return user object
      const user = User.from({
        token: this.token,
        profile,
        access: accessList,
        resetPassword: false,
        ...identityData,
      });

      if (!user) {
        throw new Error("Failed to construct user");
      }

      return user;
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : "Unknown error occurred";
      throw new Error(`Error constructing user: ${message}`);
    }
  }
}
