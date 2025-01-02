import type { z } from "@npm/zod.ts";
import type { PayoutSchemas } from "@models/payout/schemas.ts";

export type PayoutInput = z.infer<typeof PayoutSchemas.payoutInput>;
export type PayoutData = z.infer<typeof PayoutSchemas.payoutData>;
export type PayoutApprover = z.infer<typeof PayoutSchemas.payoutApprover>;
export type payoutApprovalStatus = z.infer<
  typeof PayoutSchemas.payoutApprovalStatus
>;
export type payoutTransactionStatus = z.infer<
  typeof PayoutSchemas.payoutTransactionStatus
>;
