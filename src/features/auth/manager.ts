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
import { WalletSessionManager } from "../wallet/manager.session.ts";

/**
 * Global context to hold the current auth instance reference.
 * This provides a way to access the auth instance across the application
 * without directly coupling to the singleton pattern.
 */
export const AuthContext = {
  // Default undefined state - will be set during initialization
  current: undefined as AfloatAuth | undefined,
};

/**
 * Main authentication class that works in both client and server environments.
 * Provides authentication functionality and user management.
 */
export class AfloatAuth {
  /** The auth store implementation */
  private store: AuthStore;

  /** The token handler implementation */
  private tokenHandler: TokenHandler;

  /** client AfloatAuth instance */
  private static _instance: AfloatAuth | null = null;

  /**
   * Private constructor to maintain control over instantiation.
   * @param {AuthStore} store - The auth store implementation to use
   * @param {TokenHandler} tokenHandler - The token handler implementation to use
   */
  private constructor(store: AuthStore, tokenHandler: TokenHandler) {
    this.store = store;
    this.tokenHandler = tokenHandler;
  }

  /**
   * Gets or creates the client-side singleton instance of AfloatAuth.
   * This getter will automatically initialize the client instance if it hasn't been created yet.
   * For server-side usage, use initializeServer() instead.
   *
   * @returns {AfloatAuth} The client-side singleton instance
   * @example
   * // Client-side usage
   * const auth = AfloatAuth.instance;
   *
   * // Server-side usage (don't use .instance)
   * const serverAuth = await AfloatAuth.initializeServer(token);
   */
  public static get instance(): AfloatAuth {
    if (!AfloatAuth._instance) {
      AfloatAuth._instance = new AfloatAuth(
        createClientStore(),
        ClientTokenHandler.instance,
      );

      // Set as current instance for global access
      AuthContext.current = AfloatAuth._instance;
    }

    return AfloatAuth._instance;
  }

  /**
   * Creates a new server-side instance of AfloatAuth.
   * Unlike the client-side instance getter, this creates a new instance each time.
   *
   * @param {string} token - Authentication token
   * @returns {Promise<AfloatAuth>} A new server-side instance
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
      const user = await tokenHandler.constructUser(token);
      store.setUser(user);

      // Create and initialize auth instance
      const auth = new AfloatAuth(store, tokenHandler);

      // Set as current instance for global access
      AuthContext.current = auth;

      return auth;
    } catch (error) {
      if (error instanceof Error) {
        console.log(error.stack);
        throw new Error(`Failed to initialize server auth: ${error.message}`);
      }

      throw new Error("Failed to initialize server auth");
    }
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

    // Initialize wallet manager after successful login
    await WalletSessionManager.instance.initialize();

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
    WalletSessionManager.instance.reset();
  }
}
