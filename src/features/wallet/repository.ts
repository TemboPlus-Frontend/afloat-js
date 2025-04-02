import { BaseRepository } from "@shared/base_repository.ts";
import { contract } from "@features/wallet/contract.ts";
import { Wallet, WalletStatementEntry } from "@models/wallet/index.ts";
import type { AfloatAuth } from "@features/auth/manager.ts";
import { Permissions } from "@models/permission.ts";
import { PermissionError } from "@errors/index.ts";

/**
 * Repository class for managing wallet operations including balance checking,
 * statement generation, and wallet information retrieval. Uses Wallet and
 * WalletStatementEntry classes for data representation.
 * @extends {BaseRepository<typeof contract>}
 */
export class WalletRepo extends BaseRepository<typeof contract> {
  /**
   * Creates an instance of WalletRepo initialized with the wallet contract.
   * @param {Object} [options] - Optional configuration
   * @param {string} [options.root] - Custom API root URL
   * @param {AfloatAuth} [options.auth] - Auth instance to use
   */
  constructor(props?: { root?: string; auth?: AfloatAuth }) {
    super("wallet", contract, {
      root: props?.root,
      auth: props?.auth,
    });
  }

  /**
   * Retrieves the current available balance for the wallet.
   * @throws {PermissionError} If user lacks the ViewBalance permission
   * @throws {Error} If the balance fetch operation fails
   * @returns {Promise<number>} The available balance amount
   */
  async getBalance(): Promise<number> {
    const auth = this.getAuthForPermissionCheck();
    const requirePerm = Permissions.Wallet.ViewBalance;

    if (!auth.checkPermission(requirePerm)) {
      throw new PermissionError({
        message: "You are not authorized to view the account balance.",
        requiredPermissions: [requirePerm],
      });
    }

    const result = await this.client.getBalance();

    // Assuming 200 or 201 indicates success based on original code
    if (result.status === 200 || result.status === 201) {
      // Type assertion might be needed depending on contract definition
      return (result.body as { availableBalance: number }).availableBalance;
    }

    // Consider more specific error handling based on status codes
    throw new Error(`Failed to fetch balance. Status: ${result.status}`);
  }

  /**
   * Retrieves all wallets associated with the current context as Wallet class instances.
   * @throws {Error} If the wallet fetch operation fails or data is invalid.
   * @returns {Promise<Wallet[]>} Array of validated Wallet instances.
   */
  async getWallets(): Promise<Wallet[]> {
    const result = await this.client.getWallets();

    if (result.status === 200) {
      const rawWallets = result.body

      // Map raw data to Wallet class instances, filtering out invalid entries
      const walletInstances = rawWallets.reduce((acc: Wallet[], data) => {
        const instance = Wallet.from(data); // Attempt to create instance (includes validation)
        if (instance) {
          acc.push(instance);
        } else {
          console.warn(
            "[WalletRepo] Received invalid wallet data from API, skipping item:",
            data,
          );
        }
        return acc;
      }, []);

      return walletInstances;
    }

    throw new Error(`Failed to fetch wallets. Status: ${result.status}`);
  }

  /**
   * Retrieves wallet statement items as WalletStatementEntry class instances
   * for a specified date range and account.
   * If no range is provided, defaults to the current month (1st to 30th).
   * @param {Object} props - The statement request properties
   * @param {Object} [props.range] - Optional date range for the statement
   * @param {Date} props.range.startDate - Start date for the statement period
   * @param {Date} props.range.endDate - End date for the statement period
   * @param {string} [props.accountNo] - Optional account number to fetch statement for
   * @throws {PermissionError} If user lacks the ViewStatement permission
   * @throws {Error} If the statement fetch operation fails or data is invalid.
   * @returns {Promise<WalletStatementEntry[]>} Array of validated WalletStatementEntry instances.
   */
  async getStatement(
    props: {
      range?: { startDate: Date; endDate: Date };
      accountNo?: string;
    },
  ): Promise<WalletStatementEntry[]> {
    const auth = this.getAuthForPermissionCheck();
    const requirePerm = Permissions.Wallet.ViewStatement;

    if (!auth.checkPermission(requirePerm)) {
      throw new PermissionError({
        message: "You are not authorized to view the statement.",
        requiredPermissions: [requirePerm],
      });
    }

    // Determine date range
    const now = new Date();
    // Ensure start date is the actual beginning of the month
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    // Ensure end date is the actual end of the month (handles different month lengths)
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0); // Day 0 of next month is last day of current

    const range = props.range !== undefined
      ? { startDate: props.range.startDate, endDate: props.range.endDate }
      : { startDate: monthStart, endDate: monthEnd }; // Default range corrected

    const body = { ...range, accountNo: props.accountNo };
    const result = await this.client.getStatement({ body });

    if (result.status === 201) {
      // Assuming result.body is an array of raw statement entry data objects
      const rawEntries = result.body; // Use a more specific type if available e.g., RawStatementEntryData[]

      // Map raw data to WalletStatementEntry class instances, filtering out invalid entries
      const entryInstances = rawEntries.reduce(
        (acc: WalletStatementEntry[], data) => {
          const instance = WalletStatementEntry.from(data); // Attempt to create instance (includes validation)
          if (instance) {
            acc.push(instance);
          } else {
            // Optional: Log a warning for data that failed validation
            console.warn(
              "[WalletRepo] Received invalid statement entry data from API, skipping item:",
              data,
            );
          }
          return acc;
        },
        [],
      );

      return entryInstances;
    }

    // Consider more specific error handling based on status codes
    throw new Error(`Failed to fetch statement. Status: ${result.status}`);
  }
}
