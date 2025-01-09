import type { Permission } from "@models/permission.ts";

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
   * Validates if an unknown value is a PermissionError instance.
   *
   * @param {unknown} error - The value to validate.
   * @returns {error is PermissionError} - Whether the value is a valid PermissionError instance.
   *
   * @example
   * try {
   *   // Some code that might throw
   * } catch (error) {
   *   if (PermissionError.validate(error)) {
   *     console.log(error.requiredPermissions);
   *   }
   * }
   */
  public static validate(error: unknown): error is PermissionError {
    return (
      error instanceof Error &&
      error instanceof PermissionError &&
      error.name === "PermissionError" &&
      Array.isArray(error.requiredPermissions) &&
      error.requiredPermissions.every((permission) =>
        typeof permission === "string" ||
        (typeof permission === "object" && permission !== null)
      )
    );
  }
}
