import { BaseRepository } from "@shared/base_repository.ts";
import { contract } from "@features/wallet/contract.ts";
import type {
  STATEMENT_OUTPUT_TYPE,
  Wallet,
  WalletStatementItem,
} from "@models/wallet/index.ts";
import { AfloatFilesRepo } from "@features/files-gen/repository.ts";

export class WalletRepo extends BaseRepository<typeof contract> {
  /**
   * Creates an instance of `PayoutRepository` using the contact contract.
   */
  constructor() {
    super("wallet", contract);
  }

  private get fileGenRepo() {
    return new AfloatFilesRepo();
  }

  async getBalance(): Promise<number> {
    const result = await this.client.getBalance();

    if (result.status === 201) {
      return result.body.availableBalance;
    }

    throw new Error("An error occured while fetching balance");
  }

  async getWallets(): Promise<Wallet[]> {
    const result = await this.client.getWallets();

    if (result.status === 200) {
      return result.body;
    }

    throw new Error("An error occured while fetching wallets");
  }

  async getStatement(
    props: {
      range?: { startDate: Date; endDate: Date };
      accountNo?: string;
    },
  ): Promise<WalletStatementItem[]> {
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

  async genStatement(
    fileType: STATEMENT_OUTPUT_TYPE,
    props: {
      startDate: Date;
      endDate: Date;
      accountNo?: string;
    },
  ) {
    return await this.fileGenRepo.downloadStatement({
      start_date: props.startDate,
      end_date: props.endDate,
      return_file_type: fileType,
      account_no: props.accountNo,
    });
  }

  async genWalletDetailsPDF() {
    return await this.fileGenRepo.genAccountDetailsPDF();
  }
}
