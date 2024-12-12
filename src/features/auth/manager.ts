import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { AuthRepository } from "./repository/auth.ts";
import type { User } from "./types/index.ts";

const AUTH_STORE_SESSION_STORAGE_KEY = "auth-store";

export class AuthManager {
  private static _instance: AuthManager;
  private constructor() {}

  public static get instance() {
    return this._instance || (this._instance = new this());
  }

  private get repo() {
    return new AuthRepository();
  }

  getUserToken(): string | undefined {
    return store.getState().token;
  }

  getUser(): User | undefined {
    return store.getState().user;
  }

  async logIn(email: string, password: string): Promise<User> {
    const result = await this.repo.logIn(email, password);
    this.clearSavedData();
    store.getState().setUser(result.user, result.token);
    return result.user;
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
  setUser: (user: User, token: string) => void;
  refresh: () => void;
}

type State = { user: User | undefined; token: string | undefined };

const initialState: State = { user: undefined, token: undefined };

// deno-lint-ignore no-explicit-any
export const store = create<State & Actions, any>(
  persist(
    (set) => ({
      ...initialState,
      setUser: (user, token) => set({ user, token }),
      refresh: () => set(initialState),
    }),
    {
      name: AUTH_STORE_SESSION_STORAGE_KEY,
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);
