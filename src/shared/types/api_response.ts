import { z } from 'zod';

// StringMap schema
export const stringMapSchema: z.ZodRecord = z.record(z.string());

// APIErrorResponse schema
type ApiErrorResponseSchemaType =  z.ZodObject<{
  statusCode: z.ZodNumber;
  message: z.ZodString;
  error: z.ZodString;
  details: z.ZodOptional<z.ZodRecord>;
}>;
export const apiErrorResponseSchema: ApiErrorResponseSchemaType = z.object({
  statusCode: z.number(),
  message: z.string(),
  error: z.string(),
  details: stringMapSchema.optional()
});

// Type inference (optional but useful)
export type StringMap = z.infer<typeof stringMapSchema>;
export type APIErrorResponse = z.infer<typeof apiErrorResponseSchema>;