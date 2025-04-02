import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { Country, type CountryCode } from "@temboplus/frontend-core";
import { Wallet } from "@models/wallet/index.ts"; // Assuming Class import
import { WalletRepo } from "@features/wallet/repository.ts"; // Assuming Class import
import { AuthContext } from "@features/auth/manager.ts"; // Assuming path
import { getUniqueCountries } from "@features/wallet/utils.ts"; // Assuming path

// --- Constants for Initial Placeholder State ---
// These values MUST satisfy the types but are only placeholders
// before the store is marked as initialized. They should not be
// relied upon directly without checking isInitialized.
const initialSelectedWalletId = ""; // Placeholder ID
const initialSelectedCountryCode: CountryCode = "TZ"; // Placeholder/Default Country

// --- Zustand Store Definition ---

/**
 * Defines the shape of the persisted wallet session state.
 * IMPORTANT: Properties like selectedWalletId/selectedCountryCode are guaranteed
 * non-nullable and valid ONLY when isInitialized is true.
 */
interface WalletSession {
  userId: string;
  wallets: Wallet[]; // Guaranteed non-empty when isInitialized = true
  selectedWalletId: string; // Guaranteed valid when isInitialized = true
  selectedCountryCode: CountryCode; // Guaranteed valid when isInitialized = true
  lastSynced: Date | string; // Date object in runtime, string in storage
  isInitialized: boolean; // Crucial guard flag
}

/**
 * Defines the complete state shape including actions and internal getters.
 */
interface WalletState extends WalletSession {
  // Actions
  setWallets: (wallets: Wallet[]) => void;
  setSelectedWallet: (wallet: Wallet) => void; // Input must be valid Wallet
  setSelectedCountry: (countryCode: CountryCode) => void; // Input must be valid CountryCode
  reset: () => void;

  // Internal Getters (Assume called only when state is consistent and initialized)
  _getWalletsByCountry: (countryCode: CountryCode) => Wallet[];
  _getSelectedWallet: () => Wallet; // Throws if called when not initialized or inconsistent
}

// Create the Zustand store with persistence
const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      // --- Initial State ---
      userId: "",
      wallets: [], // Starts empty
      selectedWalletId: initialSelectedWalletId, // Placeholder
      selectedCountryCode: initialSelectedCountryCode, // Placeholder/Default
      lastSynced: new Date(),
      isInitialized: false, // Starts uninitialized

      // --- Actions ---
      setWallets: (wallets: Wallet[]) => {
        const validatedWallets = wallets.filter((w) => Wallet.is(w));

        // --- Constraint Enforcement ---
        if (validatedWallets.length === 0) {
          throw new Error(
            "setWallets received an empty or invalid wallet list. User must have at least one valid wallet.",
          );
        }
        // --- End Constraint Enforcement ---

        const currentSelectedId = get().selectedWalletId;
        const isCurrentlyInitialized = get().isInitialized;

        let walletToSelect: Wallet;
        const currentWalletStillValid = validatedWallets.some((w) =>
          w.id === currentSelectedId
        );

        if (
          isCurrentlyInitialized && currentWalletStillValid &&
          currentSelectedId !== initialSelectedWalletId
        ) {
          walletToSelect = validatedWallets.find((w) =>
            w.id === currentSelectedId
          )!;
          if (!walletToSelect) {
            console.error(
              "Inconsistency: currentWalletStillValid was true, but find failed.",
            );
            walletToSelect = validatedWallets[0];
          }
        } else {
          walletToSelect = validatedWallets[0];
        }

        // Set state and mark as initialized
        set({
          wallets: validatedWallets,
          selectedWalletId: walletToSelect.id,
          selectedCountryCode: walletToSelect.countryCode,
          lastSynced: new Date(),
          isInitialized: true, // Mark as initialized AFTER setting valid state
        });
      },

      setSelectedWallet: (wallet: Wallet) => { // Input is non-nullable Wallet
        if (!Wallet.is(wallet)) {
          throw new Error(
            "setSelectedWallet called with an invalid Wallet object.",
          );
        }
        if (!get().wallets.some((w) => w.id === wallet.id)) {
          throw new Error(
            `Attempted to select wallet (ID: ${wallet.id}) which is not present in the current wallet list.`,
          );
        }
        set({
          selectedWalletId: wallet.id,
          selectedCountryCode: wallet.countryCode,
        });
      },

      setSelectedCountry: (countryCode: CountryCode) => { // Input is non-nullable CountryCode
        const countryWallets = get()._getWalletsByCountry(countryCode);

        // --- Constraint Enforcement ---
        if (countryWallets.length === 0) {
          throw new Error(
            `Cannot select country ${countryCode}: No wallets found for this country (check if code is valid or state is consistent).`,
          );
        }
        // --- End Constraint Enforcement ---

        set({
          selectedCountryCode: countryCode,
          selectedWalletId: countryWallets[0].id,
        });
      },

      reset: () => {
        // Reset to initial placeholder state and mark as uninitialized
        set({
          userId: "",
          wallets: [],
          selectedWalletId: initialSelectedWalletId,
          selectedCountryCode: initialSelectedCountryCode,
          lastSynced: new Date(),
          isInitialized: false, // Mark as uninitialized
        });
      },

      // --- Internal Getters ---
      _getWalletsByCountry: (countryCode: CountryCode) => {
        return get().wallets.filter((w) => w.countryCode === countryCode);
      },

      _getSelectedWallet: (): Wallet => { // Returns non-nullable Wallet, throws if unsafe
        const state = get();
        if (!state.isInitialized) { // Check guard flag first
          throw new Error(
            "Cannot get selected wallet: Wallet session not initialized.",
          );
        }
        // If initialized, selectedWalletId should be valid (not the placeholder)
        if (state.selectedWalletId === initialSelectedWalletId) {
          throw new Error(
            "Cannot get selected wallet: Selection is still placeholder (initialization incomplete?).",
          );
        }

        const wallet = state.wallets.find((w) =>
          w.id === state.selectedWalletId
        );
        if (!wallet) {
          console.error("Inconsistent state details:", {
            id: state.selectedWalletId,
            walletCount: state.wallets.length,
          });
          throw new Error(
            `Inconsistent state: Selected wallet ID '${state.selectedWalletId}' not found in wallet list.`,
          );
        }
        return wallet;
      },
    }),
    {
      name: "wallet-session-storage",
      storage: createJSONStorage(() => localStorage, {
        reviver: (key, value) => {
          if (key === "wallets" && Array.isArray(value)) {
            return value.map((data) => {
              try {
                const instance = Wallet.from(data);
                if (!instance) {
                  console.warn(
                    "Filtering out invalid wallet data during rehydration:",
                    data,
                  );
                  return undefined;
                }
                return instance;
              } catch (error) {
                console.error(
                  "Error rehydrating Wallet instance from persisted data:",
                  data,
                  error,
                );
                return undefined;
              }
            }).filter((w): w is Wallet => w !== undefined);
          }
          if (key === "lastSynced" && typeof value === "string") {
            try {
              const date = new Date(value);
              return isNaN(date.getTime()) ? new Date() : date;
            } catch {
              return new Date();
            }
          }
          return value;
        },
        replacer: (key, value) => {
          if (key === "lastSynced" && value instanceof Date) {
            return value.toISOString();
          }
          if (key === "wallets" && Array.isArray(value)) {
            return value.map((walletInstance) =>
              walletInstance instanceof Wallet &&
                typeof walletInstance.toObject === "function"
                ? walletInstance.toObject()
                : walletInstance
            );
          }
          return value;
        },
      }),
      partialize: (state) => ({
        userId: state.userId,
        wallets: state.wallets,
        selectedWalletId: state.selectedWalletId,
        selectedCountryCode: state.selectedCountryCode,
        lastSynced: state.lastSynced,
        isInitialized: state.isInitialized,
      }),
    },
  ),
);

// --- React Hooks ---

/**
 * Hook to access the list of all available wallets. Guaranteed non-empty *after* initialization.
 * @returns {Wallet[]} An array of Wallet instances. Returns [] before initialization.
 */
const useWallets = (): Wallet[] => {
  // This hook doesn't need the isInitialized check directly, as consumers
  // will likely use useIsWalletInitialized alongside it if needed.
  // It simply returns the current list.
  return useWalletStore((state) => state.wallets);
};

/**
 * Hook to check if the wallet state has been initialized and contains valid selections.
 * @returns {boolean} True if initialized, false otherwise.
 */
const useIsWalletInitialized = (): boolean => {
  return useWalletStore((state) => state.isInitialized);
};

/**
 * Hook to get the currently selected Wallet instance.
 * Returns `undefined` if the store is not yet initialized.
 * Components using this hook should also use `useIsWalletInitialized` to handle the loading state.
 * @returns {Wallet | undefined} The selected Wallet instance or undefined.
 */
const useSelectedWallet = (): Wallet | undefined => {
  const { selectedWalletId, wallets, isInitialized } = useWalletStore(
    (state) => ({
      selectedWalletId: state.selectedWalletId,
      wallets: state.wallets,
      isInitialized: state.isInitialized,
    }),
  );

  if (!isInitialized) {
    throw new Error(
      "Wallet session not initialized.",
    );
  }

  if (selectedWalletId === initialSelectedWalletId) {
    return undefined;
  }
  const wallet = wallets.find((w) => w.id === selectedWalletId);
  if (!wallet) {
    // This indicates an inconsistent state occurred *after* initialization
    console.error(
      `Inconsistency detected in useSelectedWallet: Wallet ID ${selectedWalletId} not found.`,
    );
    // Decide recovery strategy: return undefined or potentially trigger a refresh/reset?
    // Returning undefined is safest for the hook itself.
    return undefined;
  }
  return wallet;
};

/**
 * Hook to get the currently selected Country object.
 * Returns `undefined` if the store is not yet initialized.
 * Components using this hook should also use `useIsWalletInitialized` to handle the loading state.
 * @returns {Country | undefined} The selected Country instance or undefined.
 */
const useSelectedCountry = (): Country | undefined => {
  const { selectedCountryCode, isInitialized } = useWalletStore((state) => ({
    selectedCountryCode: state.selectedCountryCode,
    isInitialized: state.isInitialized,
  }));

  if (!isInitialized) {
    throw new Error(
      "Wallet session not initialized.",
    );
  }

  // If initialized, selectedCountryCode is guaranteed to be valid by store logic
  try {
    return Country.fromCode(selectedCountryCode);
  } catch (error) {
    // Log error if Country.fromCode fails unexpectedly for a supposedly valid code
    console.error(
      `Failed to create Country object from supposedly valid code: ${selectedCountryCode}`,
      error,
    );
    return undefined;
  }
};

/**
 * Hook to get wallets only for the currently selected country.
 * Returns an empty array if the store is not yet initialized.
 * @returns {Wallet[]} Array of wallets for the selected country.
 */
const useSelectedCountryWallets = (): Wallet[] => {
  const { selectedCountryCode, wallets, isInitialized } = useWalletStore(
    (state) => ({
      selectedCountryCode: state.selectedCountryCode,
      wallets: state.wallets,
      isInitialized: state.isInitialized,
    }),
  );

  // If not initialized, no country is meaningfully selected yet
  if (!isInitialized) {
    throw new Error(
      "Wallet session not initialized.",
    );
  }
  // If initialized, filter by the guaranteed valid selectedCountryCode
  return wallets.filter((w) => w.countryCode === selectedCountryCode);
};

/**
 * Hook to get the list of unique available country codes based on the wallets.
 * @returns {CountryCode[]} An array of available CountryCode strings. Returns [] before initialization.
 */
const useAvailableCountries = (): CountryCode[] => {
  const wallets = useWallets();
  return getUniqueCountries(wallets);
};

/**
 * Hook to access wallet state modification actions.
 * Use `WalletSessionManager.instance` for actions involving async logic or repository calls (initialize, refreshWallets).
 * @returns {object} An object containing action functions: setSelectedWallet, setSelectedCountry, reset.
 */
const useWalletActions = () => {
  return useWalletStore(
    (state) => ({
      setSelectedWallet: state.setSelectedWallet,
      setSelectedCountry: state.setSelectedCountry,
      reset: state.reset,
    }),
  );
};

// Export hooks using the preferred grouped object pattern
export const WalletSessionHooks = {
  useWallets,
  useSelectedCountryWallets,
  useIsWalletInitialized,
  useSelectedWallet,
  useSelectedCountry,
  useAvailableCountries,
  useWalletActions,
};

// --- WalletSessionManager (Primary Public Interface) ---

/**
 * WalletSessionManager handles wallet-related operations and state management coordination.
 * It uses a Zustand store (`useWalletStore`) for state and interacts with WalletRepo.
 *
 * IMPORTANT: This manager enforces the invariant that an initialized user session
 * always has at least one wallet and a valid selection. Methods that return selected
 * data (`getSelectedWallet`, `getSelectedCountry`, etc.) will THROW AN ERROR if called
 * before the session is initialized via the `initialize()` method.
 */
export class WalletSessionManager {
  private repo: WalletRepo;
  private static _instance: WalletSessionManager | undefined = undefined;

  /**
   * @private
   */
  private constructor() {
    this.repo = new WalletRepo();
  }

  /**
   * Gets the singleton instance of WalletSessionManager.
   * @returns {WalletSessionManager} The singleton instance.
   */
  public static get instance(): WalletSessionManager {
    if (!WalletSessionManager._instance) {
      WalletSessionManager._instance = new WalletSessionManager();
    }
    return WalletSessionManager._instance;
  }

  /**
   * Checks if the wallet session is initialized.
   * @returns {boolean} True if initialized, false otherwise.
   */
  public isInitialized(): boolean {
    // Direct access to state is safe for this boolean flag
    return useWalletStore.getState().isInitialized;
  }

  /**
   * Initializes the wallet manager for the current user.
   * Fetches wallets if the store isn't already initialized.
   * Throws an error if the user is not authenticated or if the user is found to have no wallets.
   * @async
   * @returns {Promise<void>} Resolves when initialization is complete.
   * @throws {Error} If user not authenticated or user has no wallets.
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized()) {
      console.log("WalletSessionManager: Already initialized.");
      return; // Avoid re-initializing if already done
    }

    const user = AuthContext.current?.currentUser;
    if (!user) {
      throw new Error(
        "User must be authenticated to initialize wallet manager",
      );
    }

    const storeState = useWalletStore.getState();

    // Reset if user changed (relevant if initialize could be called again after reset)
    if (storeState.userId && storeState.userId !== user.profile.id) {
      console.log(
        "WalletSessionManager: User changed, resetting wallet state before initialization.",
      );
      storeState.reset(); // Reset sets isInitialized to false
      useWalletStore.setState({ userId: user.profile.id });
    } else if (!storeState.userId) {
      useWalletStore.setState({ userId: user.profile.id });
    }

    // Fetch wallets - refreshWallets handles the non-empty check and calls setWallets
    console.log("WalletSessionManager: Initializing wallets from server.");
    await this.refreshWallets();
    // If refreshWallets succeeds, setWallets will have run and set isInitialized = true
  }

  /**
   * Fetches the latest wallet data from the server and updates the store.
   * Throws an error if the user has no wallets or if the fetch fails.
   * Ensures the store is updated and marked as initialized.
   * @async
   * @returns {Promise<void>} Resolves when refresh is complete.
   * @throws {Error} If fetch fails or user has no wallets.
   */
  public async refreshWallets(): Promise<void> {
    console.log("WalletSessionManager: Refreshing wallets...");
    try {
      const wallets = await this.repo.getWallets();
      if (!wallets || wallets.length === 0) {
        throw new Error(
          "User has no wallets associated with their account. Cannot proceed.",
        );
      }
      // setWallets handles validation, selection guarantee, and setting isInitialized=true
      useWalletStore.getState().setWallets(wallets);
      console.log("WalletSessionManager: Wallets refreshed successfully.");
    } catch (error) {
      console.error("Failed to refresh wallets:", error);
      // Optional: Could set an error state here if needed
      throw error; // Re-throw for callers
    }
  }

  // --- Getters (Enforce Initialization) ---

  /**
   * Gets all available wallets. Guaranteed non-empty after successful initialization.
   * @returns {Wallet[]} Non-empty array of Wallet instances.
   * @throws {Error} If called before initialization is complete.
   */
  public getWallets(): Wallet[] {
    const state = useWalletStore.getState();
    if (!state.isInitialized) { // Check the guard
      throw new Error("Cannot get wallets: Wallet session not initialized.");
    }
    // Post-init, wallets is guaranteed non-empty by setWallets logic
    return state.wallets;
  }

  /**
   * Gets unique available country codes based on current wallets.
   * @returns {CountryCode[]} Array of CountryCodes. Guaranteed non-empty after initialization.
   * @throws {Error} If called before initialization is complete.
   */
  public getCountries(): CountryCode[] {
    const wallets = this.getWallets(); // Uses the guarded getter
    // Since getWallets guarantees non-empty, getUniqueCountries will also return non-empty
    return getUniqueCountries(wallets);
  }

  /**
   * Gets wallets for a specific country.
   * @param {CountryCode} countryCode The country code to filter by.
   * @returns {Wallet[]} Array of Wallet instances for the country. May be empty if no wallets match the code, but the overall list isn't empty.
   * @throws {Error} If called before initialization is complete.
   */
  public getWalletsByCountry(countryCode: CountryCode): Wallet[] {
    if (!this.isInitialized()) { // Check guard first
      throw new Error(
        "Cannot get wallets by country: Wallet session not initialized.",
      );
    }
    // Delegate to internal getter which is safe once initialized
    return useWalletStore.getState()._getWalletsByCountry(countryCode);
  }

  /**
   * Gets the currently selected wallet instance.
   * @returns {Wallet} The selected Wallet instance (guaranteed non-nullable).
   * @throws {Error} If called before initialization is complete or if state is inconsistent.
   */
  public getSelectedWallet(): Wallet {
    // Delegate to the internal getter which checks initialization and consistency
    return useWalletStore.getState()._getSelectedWallet();
  }

  /**
   * Gets the currently selected country code.
   * @returns {CountryCode} The selected CountryCode (guaranteed non-nullable).
   * @throws {Error} If called before initialization is complete.
   */
  public getSelectedCountryCode(): CountryCode {
    const state = useWalletStore.getState();
    if (!state.isInitialized) { // Check guard
      throw new Error(
        "Cannot get selected country code: Wallet session not initialized.",
      );
    }
    // If initialized, the code is guaranteed by store logic
    return state.selectedCountryCode;
  }

  /**
   * Gets the currently selected Country object.
   * @returns {Country} The selected Country object (guaranteed non-nullable).
   * @throws {Error} If called before initialization or if Country.fromCode fails for the selected code.
   */
  public getSelectedCountry(): Country {
    const code = this.getSelectedCountryCode(); // Uses the guarded getter for the code
    try {
      const country = Country.fromCode(code);
      if (!country) { // Belt-and-braces check in case fromCode returns null/undefined
        throw new Error(
          `Country.fromCode returned invalid result for code: ${code}`,
        );
      }
      return country;
    } catch (error) {
      console.error(`Failed to get Country object for code ${code}:`, error);
      // This indicates a problem with the Country class or an invalid code in the state
      throw new Error(
        `Failed to create Country object for selected code ${code}.`,
      );
    }
  }

  // --- Actions ---

  /**
   * Changes the selected wallet in the store.
   * Throws error if the provided walletId is not found in the current list.
   * @param {string} walletId - The ID of the wallet to select.
   * @returns {void}
   * @throws {Error} If wallet with given ID is not found or if called before initialization.
   */
  public changeWallet(walletId: string): void {
    if (!this.isInitialized()) {
      throw new Error("Cannot change wallet: Wallet session not initialized.");
    }
    const store = useWalletStore.getState();
    const wallet = store.wallets.find((w) => w.id === walletId);
    if (!wallet) {
      throw new Error(
        `Cannot change wallet: Wallet with ID ${walletId} not found.`,
      );
    }
    store.setSelectedWallet(wallet); // Use the action
  }

  /**
   * Changes the selected country in the store.
   * Automatically selects the first available wallet for that country.
   * Throws error if no wallets exist for the given countryCode or if called before initialization.
   * @param {CountryCode} countryCode - The country code to select.
   * @returns {void}
   * @throws {Error} If no wallets found for the country code or if called before initialization.
   */
  public changeCountry(countryCode: CountryCode): void {
    if (!this.isInitialized()) {
      throw new Error("Cannot change country: Wallet session not initialized.");
    }
    // Delegate to the action, which contains internal checks
    useWalletStore.getState().setSelectedCountry(countryCode);
  }

  /**
   * Resets the wallet store to its initial (uninitialized) state.
   * Typically used during user logout.
   */
  public reset(): void {
    useWalletStore.getState().reset();
    console.log("WalletSessionManager: State reset.");
  }
}
