import { z } from "@npm/zod.ts";
import {
  WalletSchemas,
  type WalletStatementItem,
} from "@models/wallet/schemas.ts";

/**
 * Type guard function that checks if the provided data is an array of valid wallet statement items.
 * Uses Zod schema validation to ensure each item in the array matches the WalletStatementItem schema.
 *
 * @param {unknown} data - The data to be type checked. Can be any value.
 * @returns {boolean} Returns true if the data is an array of valid WalletStatementItem objects,
 *                    false otherwise
 */
export function isWalletStatementItemArray(
  data: unknown,
): data is WalletStatementItem[] {
  const result = z.array(WalletSchemas.statementEntry).safeParse(data);
  return result.success;
}
