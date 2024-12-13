// For runtime error handling
export class APIError extends Error {
  public readonly statusCode: number;
  public readonly error?: string;
  public readonly details?: Record<string, unknown>;

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

  // Helper to check if an error is an ApiError
  static isApiError(error: unknown): error is APIError {
    return error instanceof APIError;
  }
}
