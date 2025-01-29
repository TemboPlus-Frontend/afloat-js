import type { User } from "@models/user/index.ts";
import type { AuthStore } from "@features/auth/storage/types.ts";

/**
 * Server-side implementation of AuthStore.
 * Maintains user state in memory for the duration of a request.
 */
export class ServerStore implements AuthStore {
  private user?: User;

  /**
   * Retrieves the current user from memory.
   * @returns {User | undefined} The current user or undefined if not set
   */
  getUser(): User | undefined {
    return this.user;
  }

  /**
   * Sets the current user in memory.
   * @param {User} user - The user to store
   */
  setUser(user: User): void {
    this.user = user;
  }

  /**
   * Clears the stored user from memory.
   */
  refresh(): void {
    this.user = undefined;
  }
}
