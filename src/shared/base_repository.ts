import { type AppRouter, initClient } from "@npm/ts_rest.ts";
import { APIError } from "@errors/api_error.ts";
import { v4 as uuidv4 } from "@npm/uuid.ts";
import type { InitClientArgs } from "@npm/ts_rest.ts";
import type { Common400APIResponse } from "@shared/index.ts";
import { AfloatAuth } from "@features/auth/index.ts";

/**
 * BaseRepository
 *
 * A generic base class to build repositories for interacting with the Afloat API.
 * This class initializes a "ts-rest" client using a specified "ts-rest" contract and provides
 * helper methods to handle API responses consistently.
 *
 * @template TContract - The API contract extending `AppRouter` from `@npm/ts_rest.ts`.
 */
export class BaseRepository<TContract extends AppRouter> {
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
   * Constructs a new instance of `BaseRepository`.
   *
   * @param contract - The "ts-rest" contract
   * @param endpoint - API endpoint
   */
  constructor(endpoint: string, contract: TContract, args?: { root?: string }) {
    this.contract = contract;
    this.endpoint = endpoint;
    this.root = args?.root;
  }

  get client() {
    const baseUrl = this.root
      ? `${this.root}/${this.endpoint}`
      : `https://api.afloat.money/v1/${this.endpoint}`;

    const args: InitClientArgs = {
      baseUrl,
      baseHeaders: {
        "token": AfloatAuth.instance.getUserToken() ?? "",
        "x-request-id": uuidv4(),
      },
    };

    return initClient(this.contract, args);
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
