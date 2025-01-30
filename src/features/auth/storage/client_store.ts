import { User } from "@models/user/index.ts";
import { create, type StoreApi, type UseBoundStore, useStore } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { AuthStore } from "@features/auth/storage/types.ts";

/** Key used for storing auth data in session storage */
const AUTH_STORE_SESSION_STORAGE_KEY = "auth-store";

/** Type definition for the store's state */
type State = { user: string | undefined };

/** Type definition for the store's actions */
interface Actions {
  setUser: (user: User) => void;
  getUser: () => User | undefined;
  refresh: () => void;
}

/**
 * Creates and exports the Zustand store directly for reactive hooks
 * @internal This should only be used by AfloatAuth
 */
export const clientStore: UseBoundStore<StoreApi<State & Actions>> = create<
  State & Actions,
  // deno-lint-ignore no-explicit-any
  any
>(
  persist(
    (set, get) => ({
      user: undefined,

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
      refresh: () => set({ user: undefined }),
    }),
    {
      name: AUTH_STORE_SESSION_STORAGE_KEY,
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);

/**
 * Creates a client-side authentication store using Zustand.
 * @returns {AuthStore} An implementation of AuthStore for client-side use
 */
export const createClientStore = (): AuthStore => {
  return {
    getUser: () => clientStore.getState().getUser(),
    setUser: (user) => clientStore.getState().setUser(user),
    refresh: () => clientStore.getState().refresh(),
  };
};

/**
 * React hook to access the current user with reactive updates.
 * @returns {User | undefined} The current user or undefined if not authenticated
 */
export const useClientUser = (): User | undefined => {
  return useStore(clientStore).getUser();
};
