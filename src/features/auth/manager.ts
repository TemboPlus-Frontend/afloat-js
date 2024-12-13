import { create, type StoreApi, type UseBoundStore } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { AuthRepository } from "./repository.ts";
import type { User } from "../../models/index.ts";

const AUTH_STORE_SESSION_STORAGE_KEY = "auth-store";

export class AfloatAuth {
  private static _instance: AfloatAuth;
  private constructor() {}

  public static get instance(): AfloatAuth {
    return this._instance || (this._instance = new this());
  }

  private get repo() {
    return new AuthRepository();
  }

  getUserToken(): string | undefined {
    return this.currentUser?.token;
  }

  get currentUser(): User | undefined {
    return store.getState().user;
  }

  async logIn(email: string, password: string): Promise<User> {
    const user = await this.repo.logIn(email, password);
    this.clearSavedData();
    store.getState().setUser(user);
    return user;
  }

  async resetPassword(current: string, updated: string): Promise<boolean> {
    await this.repo.updatePassword(current, updated);
    this.clearSavedData();
    return true;
  }

  logOut() {
    this.clearSavedData();
  }

  private clearSavedData() {
    store.getState().refresh();
    sessionStorage.removeItem(AUTH_STORE_SESSION_STORAGE_KEY);
  }
}

interface Actions {
  setUser: (user: User) => void;
  refresh: () => void;
}

type State = { user: User | undefined };

const initialState: State = { user: undefined };

export const store: UseBoundStore<StoreApi<State & Actions>> = create<
  State & Actions,
  // deno-lint-ignore no-explicit-any
  any
>(
  persist(
    (set) => ({
      ...initialState,

      setUser: (user) => set({ user }),
      refresh: () => set(initialState),
    }),
    {
      name: AUTH_STORE_SESSION_STORAGE_KEY,
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);
