import type { User } from "@models/user/index.ts";

/**
 * Interface defining the contract for auth storage implementations.
 * This allows for different storage strategies in different environments.
 */
export interface AuthStore {
  /**
   * Retrieves the currently authenticated user.
   * @returns {User | undefined} The current user or undefined if not authenticated
   */
  getUser(): User | undefined;

  /**
   * Sets the current authenticated user.
   * @param {User} user - The user to set as currently authenticated
   */
  setUser(user: User): void;

  /**
   * Clears the current authentication state.
   */
  refresh(): void;
}

/**
 * Interface defining the contract for token handling implementations.
 * This allows for different token storage strategies in different environments.
 */
export interface TokenHandler {
  /**
   * Retrieves the current authentication token.
   * @returns {string | undefined} The current token or undefined if not present
   */
  getUserToken(): string | undefined;

  /**
   * Sets the authentication token.
   * @param {string} token - The token to store
   */
  setUserToken(token: string): void;

  /**
   * Clears the stored authentication token.
   */
  clearToken(): void;
}
