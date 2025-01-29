import type { TokenHandler } from "@features/auth/storage/types.ts";

/**
 * Client-side implementation of TokenHandler.
 * Manages tokens using sessionStorage.
 * @implements {TokenHandler}
 */
export class ClientTokenHandler implements TokenHandler {
  /** Singleton instance */
  private static _instance: ClientTokenHandler;

  /** Private constructor to enforce singleton pattern */
  private constructor() {}

  /**
   * Gets the singleton instance of ClientTokenHandler.
   * @returns {ClientTokenHandler} The singleton instance
   */
  static get instance(): ClientTokenHandler {
    return this._instance || (this._instance = new this());
  }

  /**
   * Retrieves the token from sessionStorage.
   * @returns {string | undefined} The stored token or undefined if not present
   */
  getUserToken(): string | undefined {
    return sessionStorage.getItem("auth_token") || undefined;
  }

  /**
   * Stores the token in sessionStorage.
   * @param {string} token - The token to store
   */
  setUserToken(token: string): void {
    sessionStorage.setItem("auth_token", token);
  }

  /**
   * Removes the token from sessionStorage.
   */
  clearToken(): void {
    sessionStorage.removeItem("auth_token");
  }
}
