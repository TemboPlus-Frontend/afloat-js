import { z } from "zod";
import type { AppRouteResponse } from "@ts-rest/core";

// APIErrorResponse schema
type ApiErrorResponseSchemaType = z.ZodObject<{
  statusCode: z.ZodNumber;
  message: z.ZodString;
  error: z.ZodString;
  details: z.ZodOptional<z.ZodRecord>;
}>;
const apiErrorResponseSchema: ApiErrorResponseSchemaType = z.object({
  statusCode: z.number(),
  message: z.string(),
  error: z.string(),
  details: z.record(z.string()).optional(),
});

export const commonAPIResponses: Record<number, AppRouteResponse> = {
  400: apiErrorResponseSchema,
};

export type Common400APIResponse = z.infer<typeof apiErrorResponseSchema>;
