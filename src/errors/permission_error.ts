import { type Permission, Permissions } from "@models/permission.ts";
import { z } from "zod";

/**
 * Custom error class representing an error caused by missing required permissions.
 * Extends the built-in {@link Error} class to include the `requiredPermissions` property.
 */
export class PermissionError extends Error {
  /**
   * The permissions that are required but were not present, causing the error.
   * @type {Permission[]}
   */
  public readonly requiredPermissions: Permission[];

  /**
   * Creates a new `PermissionError` instance.
   * @param {Object} args - The constructor arguments.
   * @param {Permission[]} args.requiredPermissions - An array of permissions required for the operation.
   * @param {string} [args.message] - An optional custom error message. Defaults to listing the missing permissions.
   */
  constructor(args: {
    requiredPermissions: Permission[];
    message?: string;
  }) {
    super(
      args.message ??
        `Missing required permissions: ${args.requiredPermissions.join(", ")}`,
    );
    this.name = "PermissionError";
    this.requiredPermissions = args.requiredPermissions;
  }

  /**
   * Validates if an unknown value is a valid PermissionError instance.
   * Performs structural validation of the error object and its properties.
   *
   * @param {unknown} error - The value to validate.
   * @returns {error is PermissionError} Type predicate indicating if the value is a valid PermissionError.
   *
   * @example
   * try {
   *   throw new Error('Access denied');
   * } catch (error) {
   *   if (PermissionError.is(error)) {
   *     // error is typed as PermissionError with properly typed requiredPermissions
   *     console.log(error.requiredPermissions);
   *   }
   * }
   *
   * @remarks
   * Validates the following:
   * - Has all required Error properties
   * - Has correct error name
   * - Contains properly structured requiredPermissions array
   * - Maintains proper prototype chain
   */
  public static is(error: unknown): error is PermissionError {
    const permissionSchema = z.union([
      z.enum(Object.values(Permissions.Profile) as [string, ...string[]]),
      z.enum(Object.values(Permissions.Contact) as [string, ...string[]]),
      z.enum(Object.values(Permissions.Payment) as [string, ...string[]]),
      z.enum(Object.values(Permissions.Payout) as [string, ...string[]]),
      z.enum(Object.values(Permissions.Transfer) as [string, ...string[]]),
      z.enum(Object.values(Permissions.Wallet) as [string, ...string[]]),
    ]);

    const errorSchema = z.object({
      name: z.literal("PermissionError"),
      message: z.string(),
      requiredPermissions: z.array(permissionSchema),
    });

    return errorSchema.safeParse(error).success;
  }
}
