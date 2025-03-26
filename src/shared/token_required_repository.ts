import { type AppRouter, initClient } from "@ts-rest/core";
import { APIError } from "@errors/api_error.ts";
import { v4 as uuidv4 } from "uuid";
import type { InitClientArgs } from "@ts-rest/core";
import type { Common400APIResponse } from "@shared/index.ts";

/**
 * TokenRequiredRepository
 *
 * A generic base class to build repositories for interacting with the API,
 * without any dependency on AfloatAuth. Instead, it requires token to be
 * explicitly provided when initializing the repository.
 *
 * @template TContract - The API contract extending `AppRouter` from `@ts-rest/core`.
 */
export class TokenRequiredRepository<TContract extends AppRouter> {
  /**
   * A "ts-rest" contract
   *
   * @protected
   */
  protected contract: TContract;

  /**
   * An API endpoint
   *
   * @protected
   */
  protected endpoint: string;

  /**
   * An API Root URL
   *
   * @protected
   */
  protected root: string | undefined;

  /**
   * Authentication token
   *
   * @protected
   */
  protected token: string;

  /**
   * Constructs a new instance of `TokenRequiredRepository`.
   *
   * @param endpoint - API endpoint
   * @param contract - The "ts-rest" contract
   * @param token - Authentication token (required)
   * @param root - Optional API root URL
   */
  constructor(
    endpoint: string,
    contract: TContract,
    token: string,
    root?: string,
  ) {
    this.contract = contract;
    this.endpoint = endpoint;
    this.token = token;
    this.root = root;
  }

  /**
   * Gets the initialized client for making API requests.
   * Uses the provided authentication token.
   */
  get client() {
    const baseUrl = this.root
      ? `${this.root}/${this.endpoint}`
      : `https://api.afloat.money/v1/${this.endpoint}`;

    const args: InitClientArgs = {
      baseUrl,
      baseHeaders: {
        "token": this.token,
        "x-request-id": uuidv4(),
      },
    };

    return initClient(this.contract, args);
  }

  /**
   * Updates the token used by this repository
   *
   * @param token - New authentication token
   */
  setToken(token: string): void {
    this.token = token;
  }

  /**
   * Gets the current token
   *
   * @returns The current authentication token
   */
  getToken(): string {
    return this.token;
  }

  /**
   * Handles the API response by checking the HTTP status code and returning the response body
   * for successful requests or throwing an `APIError` for errors.
   *
   * @template T - The expected type of the successful response body.
   * @param result - The API response object containing the status code and response body.
   * @param successStatusCode - The expected HTTP status code indicating success (e.g., 200, 201).
   * @returns The response body typed as `T` if the status code matches the success criteria.
   * @throws `APIError` - If the status code indicates a failure.
   */
  handleResponse<T>(
    result: { status: number; body: unknown },
    successStatusCode: number,
  ): T {
    if (successStatusCode === result.status) {
      return result.body as T;
    }

    if (result.status === 400) {
      throw new APIError(result.body as Common400APIResponse);
    }

    throw new APIError({
      message:
        "We encountered an error trying to process your request. Please try again later",
      statusCode: 520,
      error: "UNKNOWN ERROR",
    });
  }
}
