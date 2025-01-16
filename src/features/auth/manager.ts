import {
  create,
  type StoreApi,
  type UseBoundStore,
  useStore,
} from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { AuthRepository } from "@features/auth/repository.ts";
import { User } from "@models/index.ts";
import type { Permission } from "@models/permission.ts";

const AUTH_STORE_SESSION_STORAGE_KEY = "auth-store";

/**
 * Singleton class responsible for user authentication and session management.
 */
export class AfloatAuth {
  private static _instance: AfloatAuth;

  /**
   * Private constructor to prevent direct instantiation.
   */
  private constructor() {}

  /**
   * Gets the singleton instance of AfloatAuth.
   * @returns {AfloatAuth} The singleton instance.
   */
  public static get instance(): AfloatAuth {
    return this._instance || (this._instance = new this());
  }

  /**
   * Fetches the authentication repository.
   * @private
   * @returns {AuthRepository} The repository instance for authentication-related API calls.
   */
  private get repo(): AuthRepository {
    return new AuthRepository();
  }

  /**
   * Retrieves the current user's authentication token.
   * @returns {string | undefined} The token of the currently authenticated user.
   */
  getUserToken(): string | undefined {
    return this.currentUser?.token;
  }

  /**
   * Gets the currently logged-in user.
   * @returns {User | undefined} The current user object, or `undefined` if no user is logged in.
   */
  get currentUser(): User | undefined {
    return store.getState().getUser();
  }
  /**
   * React hook that retrieves the currently authenticated user from the global store.
   *
   * @returns {User | undefined} The current user object if authenticated, or `undefined` if no user is logged in.
   */
  useCurrentUser(): User | undefined {
    return useStore(store).getUser();
  }

  /**
   * Checks if the current user has the specified permission.
   * @param {Permission} perm - The permission to check.
   * @returns {boolean} `true` if the user has the permission, otherwise `false`.
   */
  checkPermission(perm: Permission): boolean {
    return this.currentUser?.can(perm) ?? false;
  }

  /**
   * Logs in a user with the provided email and password.
   * @param {string} email - The user's email address.
   * @param {string} password - The user's password.
   * @returns {Promise<User>} A promise that resolves to the authenticated user.
   * @throws Will throw an error if authentication fails.
   */
  async logIn(email: string, password: string): Promise<User> {
    const user = await this.repo.logIn(email, password);
    this.clearSavedData();
    store.getState().setUser(user);
    return user;
  }

  /**
   * Resets the user's password.
   * @param {string} current - The current password.
   * @param {string} updated - The new password.
   * @returns {Promise<boolean>} A promise that resolves to `true` if the operation is successful.
   * @throws Will throw an error if the reset fails.
   */
  async resetPassword(current: string, updated: string): Promise<boolean> {
    await this.repo.updatePassword(current, updated);
    this.clearSavedData();
    return true;
  }

  /**
   * Logs out the current user and clears session data.
   */
  logOut(): void {
    this.clearSavedData();
  }

  /**
   * Clears saved authentication data from the store and session storage.
   * @private
   */
  private clearSavedData(): void {
    store.getState().refresh();
    sessionStorage.removeItem(AUTH_STORE_SESSION_STORAGE_KEY);
  }
}

type State = { user: string | undefined };

interface Actions {
  setUser: (user: User) => void;
  getUser: () => User | undefined;
  refresh: () => void;
}

const initialState: State = { user: undefined };

const store: UseBoundStore<StoreApi<State & Actions>> = create<
  State & Actions,
  // deno-lint-ignore no-explicit-any
  any
>(
  persist(
    (set, get) => ({
      ...initialState,

      getUser: () => {
        try {
          const jsonUser = get().user;
          if (jsonUser) return User.fromJSON(jsonUser);
        } catch (_) {
          console.log(_);
        }

        return undefined;
      },
      setUser: (user) => set({ user: user.toJSON() }),
      refresh: () => set(initialState),
    }),
    {
      name: AUTH_STORE_SESSION_STORAGE_KEY,
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);
