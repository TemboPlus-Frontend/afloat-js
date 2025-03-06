import { BaseRepository } from "@shared/base_repository.ts";
import { contract } from "@features/wallet/contract.ts";
import type {
  STATEMENT_OUTPUT_TYPE,
  StatementFile,
  Wallet,
  WalletStatementItem,
} from "@models/wallet/index.ts";
import { AfloatFilesRepo } from "@features/files-gen/repository.ts";
import type { AfloatAuth } from "@features/auth/manager.ts";
import { Permissions } from "@models/permission.ts";
import { PermissionError } from "@errors/index.ts";

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
   * Gets an instance of the file generation repository.
   * @private
   * @returns {AfloatFilesRepo} A new instance of AfloatFilesRepo
   */
  private get fileGenRepo(): AfloatFilesRepo {
    return new AfloatFilesRepo({ auth: this.auth });
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
  async getWallets(): Promise<Wallet[]> {
    const result = await this.client.getWallets();

    if (result.status === 200) {
      return result.body;
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
   * @returns {Promise<WalletStatementItem[]>} Array of statement items for the specified period
   */
  async getStatement(
    props: {
      range?: { startDate: Date; endDate: Date };
      accountNo?: string;
    },
  ): Promise<WalletStatementItem[]> {
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
      return result.body;
    }

    throw new Error("An error occured while fetching statement");
  }

  /**
   * Generates a statement file for the specified period and account.
   * @param {STATEMENT_OUTPUT_TYPE} fileType - The desired output format type for the statement
   * @param {Object} props - The statement generation properties
   * @param {Date} props.startDate - Start date for the statement period
   * @param {Date} props.endDate - End date for the statement period
   * @param {string} [props.accountNo] - Optional account number to generate statement for
   * @throws {PermissionError} If user lacks the ViewStatement permission
   * @returns {Promise<StatementFile>} The generated statement file
   */
  async genStatement(
    fileType: STATEMENT_OUTPUT_TYPE,
    props: {
      startDate: Date;
      endDate: Date;
      accountNo?: string;
    },
  ): Promise<StatementFile> {
    const auth = this.getAuthForPermissionCheck();
    const requirePerm = Permissions.Wallet.ViewStatement;

    if (!auth.checkPermission(requirePerm)) {
      throw new PermissionError({
        message: "You are not authorized to view the statement.",
        requiredPermissions: [requirePerm],
      });
    }

    return await this.fileGenRepo.downloadStatement({
      start_date: props.startDate,
      end_date: props.endDate,
      return_file_type: fileType,
      account_no: props.accountNo,
    });
  }

  /**
   * Generates a PDF containing detailed wallet account information.
   * @throws {PermissionError} If user lacks the ViewBalance permission
   * @returns {Promise<StatementFile>} The generated PDF file containing wallet details
   */
  async genWalletDetailsPDF(): Promise<StatementFile> {
    const auth = this.getAuthForPermissionCheck();
    const requirePerm = Permissions.Wallet.ViewBalance;

    if (!auth.checkPermission(requirePerm)) {
      throw new PermissionError({
        message: "You are not authorized to view the account details.",
        requiredPermissions: [requirePerm],
      });
    }

    return await this.fileGenRepo.genAccountDetailsPDF();
  }
}
