import { z } from "zod";

/**
 * Helper function to make a field optional with undefined
 * Transforms null values to undefined for consistency
 * @param schema - The Zod schema to make optional
 * @returns A schema that only allows string or undefined (no null)
 */
const makeOptional = <T extends z.ZodType>(schema: T) =>
  schema.optional().transform((val) => val ?? undefined);

/**
 * Type definition for statement entry schema using Zod.
 * This is used as a TypeScript type helper for the actual schema implementation.
 */
type _StatementEntryType = z.ZodObject<{
  accountNo: z.ZodEffects<z.ZodOptional<z.ZodString>>;
  cbaRefNo: z.ZodEffects<z.ZodOptional<z.ZodString>>;
  debitOrCredit: z.ZodString;
  tranRefNo: z.ZodString;
  narration: z.ZodString;
  txnDate: z.ZodDate;
  valueDate: z.ZodDate;
  amountCredited: z.ZodNumber;
  amountDebited: z.ZodNumber;
  balance: z.ZodNumber;
}>;

/**
 * Schema definition for a statement entry.
 * Represents a single transaction in a wallet's statement history.
 *
 * @property {string} accountNo - The account number associated with the transaction (optional)
 * @property {string} cbaRefNo - Core banking system reference number (optional)
 * @property {string} debitOrCredit - Indicator if transaction is debit or credit
 * @property {string} tranRefNo - Transaction reference number
 * @property {string} narration - Description of the transaction
 * @property {Date} txnDate - Date when transaction was initiated
 * @property {Date} valueDate - Date when transaction value was applied
 * @property {number} amountCredited - Amount credited in transaction (if credit)
 * @property {number} amountDebited - Amount debited in transaction (if debit)
 * @property {number} balance - Running balance after transaction
 */
const statementEntrySchema: _StatementEntryType = z.object({
  accountNo: makeOptional(z.string()),
  cbaRefNo: makeOptional(z.string()),
  debitOrCredit: z.string().min(1, "Transaction type is required"),
  tranRefNo: z.string().min(1, "Transaction reference is required"),
  narration: z.string().min(1, "Transaction description is required"),
  txnDate: z.coerce.date(),
  valueDate: z.coerce.date(),
  amountCredited: z.number().min(0, "Credited amount must be non-negative"),
  amountDebited: z.number().min(0, "Debited amount must be non-negative"),
  balance: z.number(),
});

/**
 * Type definition for wallet schema using Zod.
 * This is used as a TypeScript type helper for the actual schema implementation.
 */
type _WalletType = z.ZodObject<{
  id: z.ZodString;
  profileId: z.ZodString;
  accountNo: z.ZodString;
  accountName: z.ZodString;
  channel: z.ZodString;
  createdAt: z.ZodString;
  updatedAt: z.ZodString;
}>;

/**
 * Schema definition for a wallet.
 * Represents a digital wallet that can hold funds and process transactions.
 *
 * @property {string} id - Unique identifier for the wallet
 * @property {string} profileId - ID of the profile that owns this wallet
 * @property {string} accountNo - Account number associated with the wallet
 * @property {string} accountName - Name of the account holder
 * @property {string} channel - Payment channel or provider (e.g., "MPESA", "BANK")
 * @property {string} createdAt - ISO datetime string of wallet creation
 * @property {string} updatedAt - ISO datetime string of last wallet update
 */
const walletSchema: _WalletType = z.object({
  id: z.string().uuid("Invalid wallet ID format"),
  profileId: z.string().min(1, "Profile ID is required"),
  accountNo: z.string().min(1, "Account number is required"),
  accountName: z.string().min(1, "Account name is required"),
  channel: z.string().min(1, "Channel is required"),
  createdAt: z.string().datetime("Invalid creation timestamp"),
  updatedAt: z.string().datetime("Invalid update timestamp"),
});

/**
 * Collection of wallet-related schemas for export.
 * Provides access to both wallet and statement entry validation schemas.
 */
export const WalletSchemas = {
  wallet: walletSchema,
  statementEntry: statementEntrySchema,
};

/**
 * TypeScript type for a validated wallet object.
 * Use this type for wallet instances that have been validated against the schema.
 */
export type Wallet = z.infer<typeof WalletSchemas.wallet>;

/**
 * TypeScript type for a validated statement entry object.
 * Use this type for statement entries that have been validated against the schema.
 */
export type WalletStatementItem = z.infer<typeof WalletSchemas.statementEntry>;
