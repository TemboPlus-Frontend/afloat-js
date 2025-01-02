import type { z } from "@npm/zod.ts";
import type {
  contactInputSchema,
  contactSchema,
  contactTypeSchema,
} from "@models/contact/schemas.ts";

/**
 * Represents a complete contact record.
 */
export type Contact = z.infer<typeof contactSchema>;

/**
 * Represents user-provided contact information for creation/updates.
 */
export type ContactInput = z.infer<typeof contactInputSchema>;

/**
 * Valid contact channel types.
 */
export type ContactType = z.infer<typeof contactTypeSchema>;
