import { z } from "zod";

/**
 * Custom error class representing API-related errors.
 * Extends the built-in `Error` class to include additional properties such as `statusCode`, `error`, and `details`.
 */
export class APIError extends Error {
  /**
   * The HTTP status code associated with the error.
   * @type {number}
   */
  public readonly statusCode: number;

  /**
   * An optional error identifier or code.
   * @type {string | undefined}
   */
  public readonly error?: string;

  /**
   * Additional details about the error, often used for debugging purposes.
   * @type {Record<string, unknown> | undefined}
   */
  public readonly details?: Record<string, unknown>;

  /**
   * Creates a new `APIError` instance.
   * @param {Object} args - The arguments to initialize the error.
   * @param {string} args.message - The error message.
   * @param {number} args.statusCode - The HTTP status code associated with the error.
   * @param {string} [args.error] - An optional error identifier or code.
   * @param {Record<string, unknown>} [args.details] - Additional details about the error.
   */
  constructor(args: {
    message: string;
    statusCode: number;
    error?: string;
    details?: Record<string, unknown>;
  }) {
    super(args.message);
    this.name = "ApiError";

    this.statusCode = args.statusCode;
    if (this.error) this.error = args.error;
    if (args.details) this.details = args.details;
  }

  /**
   * Validates whether an unknown value conforms to the APIError schema.
   * This is more thorough than an instanceof check as it verifies all required properties
   * and their types using the defined schema.
   *
   * @param {unknown} error - Any value to be validated
   * @returns {error is APIError} Type predicate indicating if the value is a valid APIError
   *
   * @example
   * try {
   *   throw new Error('Network failed');
   * } catch (err) {
   *   if (APIError.is(err)) {
   *     // err is typed as APIError here
   *     console.log(err.statusCode);
   *   }
   * }
   */
  public static is(error: unknown): error is APIError {
    const result = APIError.schema.safeParse(error);
    return result.success;
  }

  public static unknown(message?: string): APIError {
    return new APIError({
      message: message ?? "An unknown error occurred",
      statusCode: 502,
    });
  }

  public static get schema(): z.ZodObject<{
    message: z.ZodString;
    statusCode: z.ZodNumber;
    error: z.ZodOptional<z.ZodString>;
    details: z.ZodOptional<z.AnyZodObject>;
  }> {
    return z.object({
      message: z.string(),
      statusCode: z.number().int(),
      error: z.string().optional(),
      details: z.object({}).optional(),
    });
  }
}
