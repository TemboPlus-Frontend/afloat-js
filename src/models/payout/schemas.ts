import { z } from "@npm/zod.ts";
import { PAYOUT_APPROVAL_STATUS, PAYOUT_STATUS } from "@models/payout/enums.ts";

const identifierSchema: z.ZodObject<
  { name: z.ZodString; identity: z.ZodString }
> = z.object({
  name: z.string(),
  identity: z.string(),
});

const nullableToUndefined = <T extends z.ZodType>(schema: T) =>
  schema.nullable().optional().transform((val) => val ?? undefined);

const payoutStatusSchema = z.enum([
  PAYOUT_STATUS.CREATED,
  PAYOUT_STATUS.PAID,
  PAYOUT_STATUS.FAILED,
  PAYOUT_STATUS.REJECTED,
  PAYOUT_STATUS.PENDING,
]);

const approvalPayoutStatusSchema = z.enum([
  PAYOUT_APPROVAL_STATUS.APPROVED,
  PAYOUT_APPROVAL_STATUS.PENDING,
  PAYOUT_APPROVAL_STATUS.REJECTED,
]);

const basePayoutSchema = z.object({
  channel: z.string(),
  msisdn: z.string(),
  amount: z.number(),
  description: z.string(),
  notes: nullableToUndefined(z.string()).optional(),
});

const payoutInputSchema = z.object({
  payeeName: z.string(),
}).merge(basePayoutSchema);

const payoutSchema = z.object({
  id: z.string(),
  profileId: z.string(),
  payeeName: z.string(),
  status: payoutStatusSchema,
  statusMessage: z.string(),
  partnerReference: nullableToUndefined(z.string()).optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  approvalStatus: approvalPayoutStatusSchema,
  createdBy: nullableToUndefined(identifierSchema).optional(),
  actionedBy: nullableToUndefined(identifierSchema).optional(),
}).merge(basePayoutSchema);

export const PayoutSchemas = {
  payoutData: payoutSchema,
  payoutInput: payoutInputSchema,
  payoutTransactionStatus: payoutStatusSchema,
  payoutApprovalStatus: approvalPayoutStatusSchema,
  payoutApprover: identifierSchema,
};
