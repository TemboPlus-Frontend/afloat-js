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
   * Checks if a given object is an instance of `APIError`.
   * @param {unknown} error - The object to check.
   * @returns {boolean} `true` if the object is an `APIError`, otherwise `false`.
   */
  static isApiError(error: unknown): error is APIError {
    return error instanceof APIError;
  }
}
