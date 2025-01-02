import { z } from "@npm/zod.ts";

/**
 * Defines valid contact channel types.
 * Currently supports "Bank" and "Mobile" channels.
 */
export const contactTypeSchema = z.enum(["Bank", "Mobile"]);

/**
 * Internal type definition for contact input validation.
 * Used to enforce type consistency in the contactInputSchema.
 */
type _ContactInput = z.ZodObject<{
  displayName: z.ZodString;
  accountNo: z.ZodString;
  channel: z.ZodString;
  type: z.ZodEnum<["Bank", "Mobile"]>;
}>;

/**
 * Schema for validating contact input data.
 * Ensures all required fields are present and properly formatted.
 */
export const contactInputSchema: _ContactInput = z.object({
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
 * Internal type definition for complete contact object.
 * Extends ContactInput with system-generated fields.
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
 * Schema for validating complete contact objects.
 * Includes both user-provided and system-generated fields.
 */
export const contactSchema: _Contact = z.object({
  id: z.string().min(1, "Contact id is required"),
  profileId: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
}).merge(contactInputSchema);
