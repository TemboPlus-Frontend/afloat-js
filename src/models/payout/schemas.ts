import { z } from "@npm/zod.ts";
import { PAYOUT_APPROVAL_STATUS, PAYOUT_STATUS } from "./status.ts";

/**
 * Type definition for identifier schema
 * Used for tracking who created or actioned a payout
 * Contains a name and unique identity string
 */
type IdentifierType = z.ZodObject<{
  name: z.ZodString;
  identity: z.ZodString;
}>;

/**
 * Type definition for payout status enum
 * Represents all possible states of a payout:
 *
 * @see {@link PAYOUT_STATUS} for the enum definition in "@models/payout/status.ts"
 */
type PayoutStatusType = z.ZodEnum<[
  typeof PAYOUT_STATUS.CREATED,
  typeof PAYOUT_STATUS.PAID,
  typeof PAYOUT_STATUS.FAILED,
  typeof PAYOUT_STATUS.REJECTED,
  typeof PAYOUT_STATUS.PENDING,
]>;

/**
 * Type definition for payout approval status enum
 * Represents the approval state of a payout:
 *
 * @see {@link PAYOUT_APPROVAL_STATUS} for the enum definition in "@models/payout/status.ts"
 */
type ApprovalPayoutStatusType = z.ZodEnum<[
  typeof PAYOUT_APPROVAL_STATUS.APPROVED,
  typeof PAYOUT_APPROVAL_STATUS.PENDING,
  typeof PAYOUT_APPROVAL_STATUS.REJECTED,
]>;
/**
 * Type definition for base payout schema
 * Contains common fields required for all payout operations:
 * - channel: Payment channel used
 * - msisdn: Mobile number or identifier
 * - amount: Payment amount
 * - description: Purpose of payment
 * - notes: Optional additional information
 */
type BasePayoutType = z.ZodObject<{
  channel: z.ZodString;
  msisdn: z.ZodString;
  amount: z.ZodNumber;
  description: z.ZodString;
  notes: z.ZodEffects<z.ZodOptional<z.ZodString>>;
}>;

/**
 * Type definition for payout input schema
 * Extends the base payout type with payee information required for creating new payouts
 *
 * @extends {BasePayoutType}
 * @property {z.ZodString} payeeName - Name of the payment recipient
 */
type PayoutInputType = z.ZodObject<{
  channel: z.ZodString;
  msisdn: z.ZodString;
  amount: z.ZodNumber;
  description: z.ZodString;
  notes: z.ZodEffects<z.ZodOptional<z.ZodString>>;
  payeeName: z.ZodString;
}>;

/**
 * Type definition for complete payout schema
 * Extends the base payout type with additional fields for tracking
 * the full lifecycle of a payout transaction
 *
 * @extends {BasePayoutType}
 * @property {z.ZodString} id - Unique identifier for the payout
 * @property {z.ZodString} profileId - ID of the profile initiating the payout
 * @property {z.ZodString} payeeName - Name of the payment recipient
 * @property {PayoutStatusType} status - Current status of the payout
 * @property {z.ZodString} statusMessage - Detailed message about the current status
 * @property {z.ZodString} partnerReference - Optional reference from payment partner
 * @property {z.ZodDate} createdAt - Timestamp of payout creation
 * @property {z.ZodDate} updatedAt - Timestamp of last payout update
 * @property {ApprovalPayoutStatusType} approvalStatus - Current approval state
 * @property {IdentifierType} createdBy - User who created the payout
 * @property {IdentifierType} actionedBy - User who last actioned the payout
 */
type PayoutType = z.ZodObject<{
  channel: z.ZodString;
  msisdn: z.ZodString;
  amount: z.ZodNumber;
  description: z.ZodString;
  notes: z.ZodEffects<z.ZodOptional<z.ZodString>>;
  id: z.ZodString;
  profileId: z.ZodString;
  payeeName: z.ZodString;
  status: PayoutStatusType;
  statusMessage: z.ZodString;
  partnerReference: z.ZodEffects<z.ZodOptional<z.ZodString>>;
  createdAt: z.ZodDate;
  updatedAt: z.ZodDate;
  approvalStatus: ApprovalPayoutStatusType;
  createdBy: z.ZodEffects<z.ZodOptional<IdentifierType>>;
  actionedBy: z.ZodEffects<z.ZodOptional<IdentifierType>>;
}>;

/**
 * Helper function to make a field optional with undefined
 * Transforms null values to undefined for consistency
 * @param schema - The Zod schema to make optional
 * @returns A schema that only allows string or undefined (no null)
 */
const makeOptional = <T extends z.ZodType>(schema: T) =>
  schema.optional().transform((val) => val ?? undefined);

/**
 * Schema for identifying users in the payout process
 * Used to track who created or actioned a payout
 */
const identifierSchema: IdentifierType = z.object({
  name: z.string(),
  identity: z.string(),
});

/**
 * Type definition inferred from identifierSchema
 * Represents the structure of a user who actions the payout
 */
type PayoutApprover = z.infer<typeof identifierSchema>;

/**
 * Schema for payout status
 * Defines all possible states a payout can be in
 */
const payoutStatusSchema: PayoutStatusType = z.enum([
  PAYOUT_STATUS.CREATED,
  PAYOUT_STATUS.PAID,
  PAYOUT_STATUS.FAILED,
  PAYOUT_STATUS.REJECTED,
  PAYOUT_STATUS.PENDING,
]);

/**
 * Schema for payout approval status
 * Defines all possible approval states
 */
const approvalPayoutStatusSchema: ApprovalPayoutStatusType = z.enum([
  PAYOUT_APPROVAL_STATUS.APPROVED,
  PAYOUT_APPROVAL_STATUS.PENDING,
  PAYOUT_APPROVAL_STATUS.REJECTED,
]);

/**
 * Base schema for payout operations
 * Contains common fields used across all payout operations
 */
const basePayoutSchema: BasePayoutType = z.object({
  channel: z.string(),
  msisdn: z.string(),
  amount: z.number(),
  description: z.string(),
  notes: makeOptional(z.string()),
});

/**
 * Type definition inferred from payoutInputSchema
 * Represents the structure of data required to create a new payout
 */
type PayoutInput = z.infer<typeof payoutInputSchema>;

/**
 * Schema for creating a new payout
 * Extends base payout schema with payee information
 */
const payoutInputSchema: PayoutInputType = basePayoutSchema.extend({
  payeeName: z.string(),
});

/**
 * Type definition inferred from payoutSchema
 * Represents the complete payout record structure
 */
type PayoutData = z.infer<typeof payoutSchema>;

/**
 * Schema for complete payout record
 * Extends base payout schema with additional fields for:
 * - Identification (id, profileId)
 * - Status tracking
 * - Timestamps
 * - Approval information
 * - User tracking (created by, actioned by)
 */
const payoutSchema: PayoutType = basePayoutSchema.extend({
  id: z.string(),
  profileId: z.string(),
  payeeName: z.string(),
  status: payoutStatusSchema,
  statusMessage: z.string(),
  partnerReference: makeOptional(z.string()),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  approvalStatus: approvalPayoutStatusSchema,
  createdBy: makeOptional(identifierSchema),
  actionedBy: makeOptional(identifierSchema),
});

/**
 * Export object containing all payout-related schemas
 * Used for validation and type checking throughout the application
 */
export const PayoutSchemas = {
  payoutData: payoutSchema, // Complete payout record schema
  payoutInput: payoutInputSchema, // New payout input schema
  payoutTransactionStatus: payoutStatusSchema, // Payout status enum schema
  payoutApprovalStatus: approvalPayoutStatusSchema, // Approval status enum schema
  payoutApprover: identifierSchema, // Identifier schema for approvers
} as const;

/**
 * Export types for use in other parts of the application
 * These types can be used for type checking and documentation
 */
export type { PayoutApprover, PayoutData, PayoutInput };
