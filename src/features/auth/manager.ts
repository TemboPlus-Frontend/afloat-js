import { AuthRepository } from "@features/auth/repository.ts";
import type { User } from "@models/index.ts";
import type { Permission } from "@models/permission.ts";
import type { AuthStore, TokenHandler } from "@features/auth/storage/types.ts";
import {
  createClientStore,
  useClientUser,
} from "@features/auth/storage/client_store.ts";
import { ClientTokenHandler } from "@features/auth/storage/client_token_handler.ts";
import { ServerStore } from "@features/auth/storage/server_store.ts";
import { ServerTokenHandler } from "@features/auth/storage/server_token_handler.ts";

let _instance: AfloatAuth | null = null;

/**
 * Main authentication class that works in both client and server environments.
 * Provides authentication functionality and user management.
 */
export class AfloatAuth {
  /** The auth store implementation */
  private store: AuthStore;

  /** The token handler implementation */
  private tokenHandler: TokenHandler;

  /**
   * Private constructor to prevent direct instantiation.
   * @param {AuthStore} store - The auth store implementation to use
   * @param {TokenHandler} tokenHandler - The token handler implementation to use
   */
  private constructor(store: AuthStore, tokenHandler: TokenHandler) {
    this.store = store;
    this.tokenHandler = tokenHandler;
  }

  /**
   * Initializes AfloatAuth for client-side use.
   * This should be called once at application startup in client environments.
   * @returns {AfloatAuth} The singleton instance configured for client-side
   */
  public static initializeClient(): AfloatAuth {
    if (!_instance) {
      _instance = new AfloatAuth(
        createClientStore(),
        ClientTokenHandler.instance,
      );
    }
    return _instance;
  }

  /**
   * Creates a new instance of AfloatAuth configured for server-side use.
   * Initializes the user by fetching necessary data using the provided token.
   * @param {string} token - Authentication token
   * @returns {Promise<AfloatAuth>} A new instance configured for server-side
   * @throws {Error} If token is invalid or required data cannot be fetched
   */
  public static async initializeServer(token: string): Promise<AfloatAuth> {
    if (!token) {
      throw new Error("Token is required for server initialization");
    }

    const tokenHandler = new ServerTokenHandler(token);
    const store = new ServerStore();

    try {
      // Fetch and construct user data
      const user = await tokenHandler.constructUser();
      store.setUser(user);

      // Create and initialize auth instance
      _instance = new AfloatAuth(store, tokenHandler);
      return _instance;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to initialize server auth: ${error.message}`);
      }

      throw new Error("Failed to initialize server auth");
    }
  }

  /**
   * Gets the singleton instance of AfloatAuth.
   * @throws {Error} If AfloatAuth hasn't been initialized
   * @returns {AfloatAuth} The singleton instance
   */
  public static get instance(): AfloatAuth {
    if (!_instance) {
      throw new Error(
        "AfloatAuth not initialized. Call initializeClient() or initializeServer() first",
      );
    }
    return _instance;
  }

  /**
   * Gets the authentication repository instance.
   * @private
   * @returns {AuthRepository} The repository for auth operations
   */
  private get repo(): AuthRepository {
    return new AuthRepository();
  }

  /**
   * Gets the current authentication token.
   * @returns {string | undefined} The current token or undefined if not authenticated
   */
  getUserToken(): string | undefined {
    return this.tokenHandler.getUserToken();
  }

  /**
   * Gets the currently authenticated user.
   * @returns {User | undefined} The current user or undefined if not authenticated
   */
  get currentUser(): User | undefined {
    return this.store.getUser();
  }

  /**
   * React hook for accessing the current user in client-side code.
   * @throws {Error} If called in a server environment
   * @returns {User | undefined} The current user or undefined if not authenticated
   */
  useCurrentUser(): User | undefined {
    return useClientUser();
  }

  /**
   * Checks if the current user has a specific permission.
   * @param {Permission} perm - The permission to check
   * @returns {boolean} True if the user has the permission, false otherwise
   */
  checkPermission(perm: Permission): boolean {
    return this.currentUser?.can(perm) ?? false;
  }

  /**
   * Authenticates a user with email and password.
   * @param {string} email - The user's email
   * @param {string} password - The user's password
   * @returns {Promise<User>} Promise resolving to the authenticated user
   * @throws Will throw an error if authentication fails
   */
  async logIn(email: string, password: string): Promise<User> {
    const user = await this.repo.logIn(email, password);
    this.clearSavedData();
    this.store.setUser(user);
    this.tokenHandler.setUserToken(user.token);
    return user;
  }

  /**
   * Updates the user's password.
   * @param {string} current - The current password
   * @param {string} updated - The new password
   * @returns {Promise<boolean>} Promise resolving to true if successful
   * @throws Will throw an error if the password update fails
   */
  async resetPassword(current: string, updated: string): Promise<boolean> {
    await this.repo.updatePassword(current, updated);
    this.clearSavedData();
    return true;
  }

  /**
   * Logs out the current user.
   */
  logOut(): void {
    this.clearSavedData();
  }

  /**
   * Clears all authentication data.
   * @private
   */
  private clearSavedData(): void {
    this.store.refresh();
    this.tokenHandler.clearToken();
  }
}
