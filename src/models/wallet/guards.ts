import type { WalletStatementItem } from "@models/wallet/types.ts";
import { z } from "@npm/zod.ts";
import { WalletSchemas } from "@models/wallet/schemas.ts";

// Define a type guard for an array of WalletStatementItem
export function isWalletStatementItemArray(
  data: unknown,
): data is WalletStatementItem[] {
  const result = z.array(WalletSchemas.statementEntry).safeParse(data);
  return result.success;
}
