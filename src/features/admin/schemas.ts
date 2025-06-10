import { z } from "zod";

/**
 * Type definition for password schema using Zod.
 * This is used as a TypeScript type helper for the actual schema implementation.
 */
type _PasswordType = z.ZodEffects<
  z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>,
  string,
  string
>;

// ====================== Custom Schema Definitions ====================== //

/**
 * Custom password schema that enforces strong password requirements.
 * Password must contain:
 * - At least 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character (!@#$%^&*()_+-=[]{}|;:,.<>?)
 * - No common passwords or sequential patterns
 */
const passwordSchema: _PasswordType = z
  .string()
  .min(8, "Password must be at least 8 characters long")
  .max(128, "Password must not exceed 128 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(
    /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/,
    "Password must contain at least one special character (!@#$%^&*()_+-=[]{}|;:,.<>?)",
  )
  .refine(
    (password) => {
      // Check for common weak patterns
      const weakPatterns = [
        /(.)\1{2,}/, // Three or more consecutive identical characters
        /123456|654321|abcdef|qwerty|password|admin|user/i, // Common passwords
        /^[0-9]+$/, // Only numbers
        /^[a-zA-Z]+$/, // Only letters
      ];

      return !weakPatterns.some((pattern) => pattern.test(password));
    },
    "Password contains weak patterns. Avoid repeated characters, common words, or simple sequences",
  )
  .refine((password) => {
    // Check for sequential characters (e.g., "abcd", "1234")
    const hasSequential =
      /(?:abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|012|123|234|345|456|567|678|789)/i
        .test(password);
    return !hasSequential;
  }, "Password should not contain sequential characters")
  .refine((password) => {
    // Check for keyboard patterns (e.g., "qwer", "asdf")
    const keyboardPatterns =
      /(?:qwer|wert|erty|rtyu|tyui|yuio|uiop|asdf|sdfg|dfgh|fghj|ghjk|hjkl|zxcv|xcvb|cvbn|vbnm)/i;
    return !keyboardPatterns.test(password);
  }, "Password should not contain keyboard patterns");

// ====================== Schema Type Definitions ====================== //

/**
 * Type definition for role schema using Zod.
 * This is used as a TypeScript type helper for the actual schema implementation.
 */
type _RoleType = z.ZodObject<{
  id: z.ZodString;
  name: z.ZodString;
  description: z.ZodOptional<z.ZodString>;
  access: z.ZodArray<z.ZodString>;
  createdAt: z.ZodString;
  updatedAt: z.ZodString;
}>;

/**
 * Type definition for managed user schema using Zod.
 * This is used as a TypeScript type helper for the actual schema implementation.
 */
type _ManagedUserType = z.ZodObject<{
  id: z.ZodString;
  name: z.ZodString;
  identity: z.ZodString;
  type: z.ZodString;
  profileId: z.ZodString;
  roleId: z.ZodString;
  resetPassword: z.ZodBoolean;
  isActive: z.ZodBoolean;
  role: z.ZodType<Role>;
  createdAt: z.ZodString;
  updatedAt: z.ZodString;
}>;

/**
 * Type definition for create user request schema using Zod.
 * This is used as a TypeScript type helper for the actual schema implementation.
 */
type _CreateUserRequestType = z.ZodObject<{
  name: z.ZodString;
  identity: z.ZodString;
  password: _PasswordType;
  roleId: z.ZodOptional<z.ZodString>;
  resetPassword: z.ZodOptional<z.ZodBoolean>;
}>;

/**
 * Type definition for update user request schema using Zod.
 * This is used as a TypeScript type helper for the actual schema implementation.
 */
type _UpdateUserRequestType = z.ZodObject<{
  name: z.ZodOptional<z.ZodString>;
  roleId: z.ZodOptional<z.ZodString>;
  password: z.ZodOptional<_PasswordType>;
  resetPassword: z.ZodOptional<z.ZodBoolean>;
  isActive: z.ZodOptional<z.ZodBoolean>;
}>;

/**
 * Type definition for reset password request schema using Zod.
 * This is used as a TypeScript type helper for the actual schema implementation.
 */
type _ResetPasswordRequestType = z.ZodObject<{
  newPassword: z.ZodOptional<_PasswordType>;
  sendNotification: z.ZodOptional<z.ZodBoolean>;
}>;

/**
 * Type definition for create user response schema using Zod.
 * This is used as a TypeScript type helper for the actual schema implementation.
 */
type _CreateUserResponseType = z.ZodObject<{
  id: z.ZodString;
  name: z.ZodString;
  identity: z.ZodString;
  type: z.ZodString;
  profileId: z.ZodString;
  roleId: z.ZodString;
  isActive: z.ZodBoolean;
  createdAt: z.ZodString;
}>;

// ====================== Schema Definitions ====================== //

/**
 * Schema definition for a role.
 * Represents a user role with permissions in the system.
 *
 * @property {string} id - Unique identifier for the role
 * @property {string} name - Display name of the role
 * @property {string} description - Optional description of the role
 * @property {string[]} access - Array of permission strings
 * @property {string} createdAt - ISO datetime string of role creation
 * @property {string} updatedAt - ISO datetime string of last role update
 */
const roleSchema: _RoleType = z.object({
  id: z.string().min(1),
  name: z.string().min(1, "Role name is required"),
  description: z.string().optional(),
  access: z.array(z.string()),
  createdAt: z.string().datetime("Invalid creation timestamp"),
  updatedAt: z.string().datetime("Invalid update timestamp"),
});

/**
 * Schema definition for a managed user account.
 * Represents a user account from the admin management perspective.
 *
 * @property {string} id - Unique identifier for the user account
 * @property {string} name - Full name of the user
 * @property {string} identity - User's email address or phone number
 * @property {string} type - Type of user account
 * @property {string} profileId - ID of the associated profile
 * @property {string} roleId - ID of the assigned role
 * @property {boolean} resetPassword - Whether user must reset password on next login
 * @property {boolean} isActive - Whether the account is currently active
 * @property {Role} role - Full role object with permissions
 * @property {string} createdAt - ISO datetime string of account creation
 * @property {string} updatedAt - ISO datetime string of last account update
 */
const managedUserSchema: _ManagedUserType = z.object({
  id: z.string().min(1),
  name: z.string().min(1, "User name is required"),
  identity: z.string().email("Invalid email address"),
  type: z.string().min(1, "User type is required"),
  profileId: z.string().min(1, "Profile ID is required"),
  roleId: z.string().min(1, "Role ID is required"),
  resetPassword: z.boolean(),
  isActive: z.boolean(),
  role: roleSchema,
  createdAt: z.string().datetime("Invalid creation timestamp"),
  updatedAt: z.string().datetime("Invalid update timestamp"),
});

/**
 * Schema definition for creating a new user account.
 * Defines the required and optional fields for user creation.
 *
 * @property {string} name - Full name of the user
 * @property {string} identity - User's email address
 * @property {string} password - Initial password for the account
 * @property {string} roleId - Optional role ID (defaults to system default)
 * @property {boolean} resetPassword - Optional flag to force password reset (defaults to true)
 */
const createUserRequestSchema: _CreateUserRequestType = z.object({
  name: z.string().min(1, "User name is required"),
  identity: z.string().email("Valid email address is required"),
  password: passwordSchema,
  roleId: z.string().optional(),
  resetPassword: z.boolean().optional(),
});

/**
 * Schema definition for updating a user account.
 * All fields are optional for partial updates.
 *
 * @property {string} name - Optional updated name
 * @property {string} roleId - Optional updated role ID
 * @property {string} password - Optional new password
 * @property {boolean} resetPassword - Optional flag to force password reset
 * @property {boolean} isActive - Optional account activation status
 */
const updateUserRequestSchema: _UpdateUserRequestType = z.object({
  name: z.string().min(1, "User name cannot be empty").optional(),
  roleId: z.string().min(1, "Role ID cannot be empty").optional(),
  password: passwordSchema.optional(),
  resetPassword: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

/**
 * Schema definition for resetting a user's password.
 * Both fields are optional with system defaults.
 *
 * @property {string} newPassword - Optional new password (random generated if not provided)
 * @property {boolean} sendNotification - Optional flag to send notification to user
 */
const resetPasswordRequestSchema: _ResetPasswordRequestType = z.object({
  newPassword: passwordSchema.optional(),
  sendNotification: z.boolean().optional(),
});

/**
 * Schema definition for the response when creating a user.
 * Returns basic user information without sensitive data.
 *
 * @property {string} id - Unique identifier for the created user
 * @property {string} name - Full name of the user
 * @property {string} identity - User's email address
 * @property {string} type - Type of user account
 * @property {string} profileId - ID of the associated profile
 * @property {string} roleId - ID of the assigned role
 * @property {boolean} isActive - Whether the account is active
 * @property {string} createdAt - ISO datetime string of account creation
 */
const createUserResponseSchema: _CreateUserResponseType = z.object({
  id: z.string(),
  name: z.string(),
  identity: z.string(),
  type: z.string(),
  profileId: z.string(),
  roleId: z.string(),
  isActive: z.boolean(),
  createdAt: z.string().datetime(),
});

// ====================== Schema Collections ====================== //

/**
 * Collection of user management schemas for export.
 * Provides access to all user and role validation schemas.
 */
export const UserManagementSchemas = {
  role: roleSchema,
  managedUser: managedUserSchema,
  createUserRequest: createUserRequestSchema,
  updateUserRequest: updateUserRequestSchema,
  resetPasswordRequest: resetPasswordRequestSchema,
  createUserResponse: createUserResponseSchema,
  password: passwordSchema, // Export password schema for reuse
};

// ====================== TypeScript Types ====================== //

/**
 * TypeScript type for a validated role object.
 * Use this type for role instances that have been validated against the schema.
 */
type Role = z.infer<typeof UserManagementSchemas.role>;

/**
 * TypeScript type for a create user request object.
 * Use this type for user creation requests that have been validated against the schema.
 */
export type CreateUserRequest = z.infer<
  typeof UserManagementSchemas.createUserRequest
>;

/**
 * TypeScript type for an update user request object.
 * Use this type for user update requests that have been validated against the schema.
 */
export type UpdateUserRequest = z.infer<
  typeof UserManagementSchemas.updateUserRequest
>;

/**
 * TypeScript type for a reset password request object.
 * Use this type for password reset requests that have been validated against the schema.
 */
export type ResetPasswordRequest = z.infer<
  typeof UserManagementSchemas.resetPasswordRequest
>;

/**
 * TypeScript type for a create user response object.
 * Use this type for user creation responses that have been validated against the schema.
 */
export type CreateUserResponse = z.infer<
  typeof UserManagementSchemas.createUserResponse
>;
