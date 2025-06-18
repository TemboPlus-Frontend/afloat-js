import { Wallet } from "@models/wallet/wallet.ts";
import { WalletStatementEntry } from "@models/wallet/statement_entry.ts";

/**
 * Collection of wallet-related schemas for export.
 * Provides access to both wallet and statement entry validation schemas.
 */
export const WalletSchemas = {
  wallet: Wallet.schema,
  statementEntry: WalletStatementEntry.schema,
};
