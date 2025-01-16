import { PayoutSchemas } from "@models/payout/index.ts";
import { APIError } from "@errors/api_error.ts";
import { initContract } from "@ts-rest/core";
import { z } from "zod";

/** Default eager loading settings for payout API */
export const DEFAULT_PAYOUT_API_EAGER = "[createdBy,actionedBy]";

/** Default sort order for payout listings */
export const DEFAULT_ORDER_BY_DESC = "createdAt";

/**
 * Payout management API contract
 * Defines endpoints for creating and managing payouts
 *
 * @property {Object} getPayouts - List payouts with filtering (GET /)
 * @property {Object} getPayoutsByApprovalStatus - List payouts by approval status (GET /)
 * @property {Object} postPayout - Create new payout (POST /)
 * @property {Object} approve - Approve/reject payout (POST /:id/approve)
 */
export const contract = initContract().router({
  getPayouts: {
    method: "GET",
    path: "",
    query: z.object({
      rangeStart: z.number(),
      rangeEnd: z.number(),
      eager: z.string(),
      approvalStatus: PayoutSchemas.payoutApprovalStatus.nullable().optional(),
      orderByDesc: z.string(),
    }),
    responses: {
      200: z.object({
        results: z.array(PayoutSchemas.payoutData),
        total: z.number(),
      }),
    },
  },
  getPayoutsByApprovalStatus: {
    method: "GET",
    path: "",
    query: z.object({
      rangeStart: z.number(),
      rangeEnd: z.number(),
      eager: z.string(),
      approvalStatus: PayoutSchemas.payoutApprovalStatus,
      orderByDesc: z.string(),
    }),
    responses: {
      200: z.object({
        results: z.array(PayoutSchemas.payoutData),
        total: z.number(),
      }),
    },
  },
  postPayout: {
    method: "POST",
    path: "",
    body: PayoutSchemas.payoutInput,
    responses: {
      201: PayoutSchemas.payoutData,
      400: APIError.schema,
    },
  },
  approve: {
    method: "POST",
    path: "/:id/approve",
    body: z.object({
      action: z.enum(["Approve", "Reject"]),
      notes: z.string().optional(),
    }),
    responses: {
      201: PayoutSchemas.payoutData,
      404: z.object({}),
      409: z.object({}),
    },
  },
});

/**
 * Export type for use in client implementations
 */
export type PayoutAPI = typeof contract;
