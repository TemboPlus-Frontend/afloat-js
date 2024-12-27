import { z } from "@npm/zod.ts";

const statementEntrySchema = z.object({
  accountNo: z.string().nullable().optional(),
  cbaRefNo: z.string().nullable().optional(),
  debitOrCredit: z.string(),
  tranRefNo: z.string(),
  narration: z.string(),
  txnDate: z.coerce.date(),
  valueDate: z.coerce.date(),
  amountCredited: z.number(),
  amountDebited: z.number(),
  balance: z.number(),
});

const walletSchema = z.object({
  id: z.string(),
  profileId: z.string(),
  accountNo: z.string(),
  accountName: z.string(),
  channel: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const WalletSchemas = {
  wallet: walletSchema,
  statementEntry: statementEntrySchema,
};
