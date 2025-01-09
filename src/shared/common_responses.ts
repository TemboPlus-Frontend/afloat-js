import type { AppRouteResponse } from "@npm/ts-rest.ts";
import { z } from "@npm/zod.ts";

/* Common 400 API Error Response */
type ApiErrorResponseSchemaType = z.ZodObject<{
  statusCode: z.ZodNumber;
  message: z.ZodString;
  error: z.ZodString;
  details: z.ZodOptional<z.ZodRecord>;
}>;
export const common400ResponseSchema: ApiErrorResponseSchemaType = z.object({
  statusCode: z.number(),
  message: z.string(),
  error: z.string(),
  details: z.record(z.string()).optional(),
});
export type Common400APIResponse = z.infer<typeof common400ResponseSchema>;

export const commonAPIResponses: Record<number, AppRouteResponse> = {
  400: common400ResponseSchema,
};
