import type { APIErrorResponse } from "../shared/api/common_responses.ts";

// For runtime error handling
export class APIError extends Error {
  public readonly statusCode: number;
  public readonly error?: string;
  public readonly details?: APIErrorResponse["details"];

  constructor(args: {
    message: string;
    statusCode: number;
    error?: string;
    details?: APIErrorResponse["details"];
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
