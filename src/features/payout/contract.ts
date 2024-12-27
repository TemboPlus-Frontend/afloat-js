import { PayoutSchemas } from "@models/payout/index.ts";
import { APIError } from "@errors/api_error.ts";
import { initContract } from "@npm/ts_rest.ts";
import { z } from "@npm/zod.ts";

export const DEFAULT_PAYOUT_API_EAGER = "[createdBy,actionedBy]";
export const DEFAULT_ORDER_BY_DESC = "createdAt";

const payout_list_schema = z.object({
  results: z.array(PayoutSchemas.payout),
  total: z.number(),
});

export const contract = initContract().router({
  getPayouts: {
    method: "GET",
    path: "",
    query: z.object({
      rangeStart: z.number(),
      rangeEnd: z.number(),
      eager: z.string(),
      approvalStatus: PayoutSchemas.approvalStatus.nullable().optional(),
      orderByDesc: z.string(),
    }),
    responses: {
      200: payout_list_schema,
    },
  },
  getPayoutsByApprovalStatus: {
    method: "GET",
    path: "",
    query: z.object({
      rangeStart: z.number(),
      rangeEnd: z.number(),
      eager: z.string(),
      approvalStatus: PayoutSchemas.approvalStatus,
      orderByDesc: z.string(),
    }),
    responses: {
      200: payout_list_schema,
    },
  },
  postPayout: {
    method: "POST",
    path: "",
    body: PayoutSchemas.input,
    responses: {
      201: PayoutSchemas.payout,
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
      201: PayoutSchemas.payout,
      404: z.object({}),
      409: z.object({}),
    },
  },
});
