import { z } from 'zod';

// StringMap schema
export const stringMapSchema = z.record(z.string());

// APIErrorResponse schema
export const apiErrorResponseSchema = z.object({
  statusCode: z.number(),
  message: z.string(),
  error: z.string(),
  details: stringMapSchema.optional()
});

// Type inference (optional but useful)
export type StringMap = z.infer<typeof stringMapSchema>;
export type APIErrorResponse = z.infer<typeof apiErrorResponseSchema>;