import type { z } from "@npm/zod.ts";
import type { WalletSchemas } from "@models/wallet/schemas.ts";

export type Wallet = z.infer<typeof WalletSchemas.wallet>;
export type WalletStatementItem = z.infer<typeof WalletSchemas.statementEntry>;
