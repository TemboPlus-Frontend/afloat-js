import { z } from "@npm/zod.ts";

/**
 * Schema for contact channel types.
 *
 * @remarks
 * Currently supports two channel types:
 * - "Bank": For traditional banking channels
 * - "Mobile": For mobile money channels
 *
 * @see {@link ContactType} for the inferred type
 */
const contactTypeSchema: z.ZodEnum<["Bank", "Mobile"]> = z.enum([
  "Bank",
  "Mobile",
]);

/**
 * Valid contact channel types.
 * Inferred from the contactTypeSchema.
 *
 * @see {@link contactTypeSchema} for validation rules
 */
export type ContactType = z.infer<typeof ContactSchemas.contactType>;

/**
 * Schema type definition for contact input validation.
 *
 * @internal
 * This is an internal type used to enforce type consistency
 * in the contactInputSchema.
 */
type _ContactInput = z.ZodObject<{
  displayName: z.ZodString;
  accountNo: z.ZodString;
  channel: z.ZodString;
  type: z.ZodEnum<["Bank", "Mobile"]>;
}>;

/**
 * Type representing user-provided contact information.
 * Used for creating or updating contacts.
 *
 * @see {@link contactInputSchema} for validation rules
 * @see {@link ContactSchemas} for all available schemas
 */
export type ContactInput = z.infer<typeof ContactSchemas.contactInput>;

/**
 * Schema for validating contact input data.
 *
 * @remarks
 * Validates the following fields:
 * - displayName: Non-empty string
 * - accountNo: Non-empty string
 * - channel: Non-empty string
 * - type: Must be either "Bank" or "Mobile"
 */
const contactInputSchema: _ContactInput = z.object({
  displayName: z
    .string()
    .min(1, "Display name is required"),
  accountNo: z
    .string()
    .min(1, "Account number is required"),
  channel: z
    .string()
    .min(1, "Channel is required"),
  type: contactTypeSchema,
});

/**
 * Schema type definition for complete contact records.
 *
 * @internal
 * Extends ContactInput with system-generated fields like
 * IDs and timestamps.
 */
type _Contact = z.ZodObject<{
  displayName: z.ZodString;
  accountNo: z.ZodString;
  channel: z.ZodString;
  type: z.ZodEnum<["Bank", "Mobile"]>;
  id: z.ZodString;
  profileId: z.ZodString;
  createdAt: z.ZodDate;
  updatedAt: z.ZodDate;
}>;

/**
 * Schema for complete contact records.
 *
 * @remarks
 * Extends contactInputSchema with additional system fields:
 * - id: Unique identifier
 * - profileId: Associated profile ID
 * - createdAt: Creation timestamp
 * - updatedAt: Last update timestamp
 */
const contactSchema: _Contact = z.object({
  id: z.string().min(1, "Contact id is required"),
  profileId: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
}).merge(contactInputSchema);

/**
 * Type representing a complete contact record.
 * Includes both user-provided and system-generated fields.
 *
 * @see {@link contactSchema} for validation rules
 */
export type ContactData = z.infer<typeof ContactSchemas.contactData>;

/**
 * Collection of all contact-related schemas.
 */
export const ContactSchemas = {
  /** Schema for complete contact records */
  contactData: contactSchema,
  /** Schema for contact input validation */
  contactInput: contactInputSchema,
  /** Schema for contact channel types */
  contactType: contactTypeSchema,
};
