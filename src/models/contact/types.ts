import type { z } from "@npm/zod.ts";
import type { ContactSchemas } from "@models/contact/schemas.ts";

/**
 * Represents a complete contact record.
 */
export type ContactData = z.infer<typeof ContactSchemas.contactData>;

/**
 * Represents user-provided contact information for creation/updates.
 */
export type ContactInput = z.infer<typeof ContactSchemas.contactInput>;

/**
 * Valid contact channel types.
 */
export type ContactType = z.infer<typeof ContactSchemas.contactType>;
