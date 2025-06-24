import { Wallet } from "@models/wallet/wallet.ts";
import { WalletStatementEntry } from "@models/wallet/statement_entry.ts";
import {
  Currency,
  ISO2CountryCodesSet,
  ValidCurrencyCodesSet,
} from "@temboplus/frontend-core";
import { z } from "zod";

/**
 * Zod schema definition for validating Wallet data structures.
 * Ensures data integrity for wallet objects, including runtime validation
 * of country codes against the imported ISO2CountryCodesSet.
 */
const walletQuerySchema = z.object({
  id: z.string().optional(),
  profileId: z.string().optional(),
  accountNo: z.string().optional(),
  accountName: z.string().optional(),
  channel: z.string().optional(),
  // Validate countryCode as a string present in the imported Set
  countryCode: z.string().default("TZ")
    .refine(
      (code) => ISO2CountryCodesSet.has(code),
      { message: "Provided country code is not a valid ISO2 code." },
    ).optional(),
  // Validate currencyCode as a string present in the imported Set
  currencyCode: z.string().default("TZS")
    .refine(
      (code) => {
        const currency = Currency.from(code);
        return currency !== undefined &&
          ValidCurrencyCodesSet.has(currency.code);
      },
      { message: "Provided currency code is not a valid currency code." },
    ).optional(),
});

/**
 * Collection of wallet-related schemas for export.
 * Provides access to both wallet and statement entry validation schemas.
 */
export const WalletSchemas = {
  wallet: Wallet.schema,
  walletQuery: walletQuerySchema,
  statementEntry: WalletStatementEntry.schema,
};
