import { BaseRepository } from "@shared/base_repository.ts";
import { contract } from "@features/wallet/contract.ts";
import {
  Wallet,
  type WalletSchemas,
  WalletStatementEntry,
} from "@models/wallet/index.ts";
import type { AfloatAuth } from "@features/auth/manager.ts";
import { Permissions } from "@models/permission.ts";
import { PermissionError } from "@errors/index.ts";
import type z from "zod";

/**
 * Repository class for managing wallet operations including balance checking,
 * statement generation, and wallet information retrieval.
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
  async getBalance(props: { accountNo?: string }): Promise<number> {
    const auth = this.getAuthForPermissionCheck();
    const requirePerm = Permissions.Wallet.ViewBalance;

    if (!auth.checkPermission(requirePerm)) {
      throw new PermissionError({
        message: "You are not authorized to view the account balance.",
        requiredPermissions: [requirePerm],
      });
    }

    const result = await this.client.getBalance({
      body: { accountNo: props.accountNo },
    });

    if (result.status === 201) {
      return result.body.availableBalance;
    }

    throw new Error("An error occured while fetching balance");
  }

  /**
   * Retrieves all wallets associated with the current context.
   * @throws {Error} If the wallet fetch operation fails
   * @returns {Promise<Wallet[]>} Array of wallet objects
   */
  async getWallets(
    args?: z.infer<typeof WalletSchemas.walletQuery>,
  ): Promise<Wallet[]> {
    const result = await this.client.getWallets({ query: args });

    if (result.status === 200) {
      return result.body.map((w) => Wallet.from(w)!);
    }

    throw new Error("An error occured while fetching wallets");
  }

  /**
   * Retrieves wallet statement items for a specified date range and account.
   * If no range is provided, defaults to the current month (1st to 30th).
   * @param {Object} props - The statement request properties
   * @param {Object} [props.range] - Optional date range for the statement
   * @param {Date} props.range.startDate - Start date for the statement period
   * @param {Date} props.range.endDate - End date for the statement period
   * @param {string} [props.accountNo] - Optional account number to fetch statement for
   * @throws {PermissionError} If user lacks the ViewStatement permission
   * @throws {Error} If the statement fetch operation fails
   * @returns {Promise<WalletStatementEntry[]>} Array of statement items for the specified period
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

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth(), 30);

    const range = props.range !== undefined
      ? { startDate: props.range.startDate, endDate: props.range.endDate }
      : { startDate: monthStart, endDate: monthEnd };
    const body = { ...range, accountNo: props.accountNo };
    const result = await this.client.getStatement({ body });

    if (result.status === 201) {
      return result.body.map((e) => WalletStatementEntry.from(e)!);
    }

    throw new Error("An error occured while fetching statement");
  }
}
