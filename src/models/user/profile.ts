import { z } from "zod";

/**
 * Type definition for profile schema using Zod.
 * This type helper ensures type safety when implementing the actual schema.
 */
type ProfileType = z.ZodObject<{
  id: z.ZodString;
  firstName: z.ZodString;
  lastName: z.ZodString;
  displayName: z.ZodString;
  phone: z.ZodString;
  accountNo: z.ZodString;
  email: z.ZodString;
}>;

/**
 * Zod schema for validating user profile data.
 * Defines validation rules and constraints for each profile field.
 *
 * @const {ProfileType}
 *
 * @property {string} id - Unique identifier for the profile
 * @property {string} firstName - User's first name
 * @property {string} lastName - User's last name
 * @property {string} displayName - User's display name
 * @property {string} phone - User's contact phone number
 * @property {string} accountNo - User's account number
 * @property {string} email - User's email address
 */
export const profileSchema: ProfileType = z.object({
  id: z.string().uuid("Invalid profile ID format"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  displayName: z.string().min(1, "Display name is required"),
  phone: z.string().min(1, "Phone number is required")
    .regex(/^\+?[\d\s-]+$/, "Invalid phone number format"),
  accountNo: z.string().min(1, "Account number is required"),
  email: z.string().email("Invalid email format"),
});

/**
 * TypeScript type representing a validated user profile.
 * Use this type for profile instances that have been validated against the schema.
 *
 * @see {@link profileSchema} for validation rules
 */
export type Profile = z.infer<typeof profileSchema>;
