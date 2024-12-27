import { z } from "@npm/zod.ts";
import { PAYOUT_APPROVAL_STATUS, PAYOUT_STATUS } from "@models/payout/enums.ts";

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
  notes: z.string().nullable().optional(),
});

const identifierSchema = z.object({
  name: z.string(),
  identity: z.string(),
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
  partnerReference: z.string().nullable().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  approvalStatus: approvalPayoutStatusSchema,
  createdBy: identifierSchema.nullable().optional(),
  actionedBy: identifierSchema.nullable().optional(),
}).merge(basePayoutSchema);

export const PayoutSchemas = {
  payout: payoutSchema,
  input: payoutInputSchema,
  status: payoutStatusSchema,
  approvalStatus: approvalPayoutStatusSchema,
};
