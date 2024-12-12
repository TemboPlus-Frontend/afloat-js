import type { APIErrorResponse, StringMap } from "./api_response.ts";

// For runtime error handling
export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly error?: string;
  public readonly details?: StringMap;

  constructor(args: {
    message: string;
    statusCode: number;
    error?: string;
    details?: StringMap;
  }) {
    super(args.message);
    this.name = "ApiError";

    this.statusCode = args.statusCode;
    if (this.error) this.error = args.error;
    if (args.details) this.details = args.details;
  }

  // Factory method to create from API response
  static fromResponse(response: APIErrorResponse): ApiError {
    return new ApiError(response);
  }

  // Helper to check if an error is an ApiError
  static isApiError(error: unknown): error is ApiError {
    return error instanceof ApiError;
  }
}
