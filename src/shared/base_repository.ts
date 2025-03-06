import { type AppRouter, initClient } from "@ts-rest/core";
import { APIError } from "@errors/api_error.ts";
import { v4 as uuidv4 } from "uuid";
import type { InitClientArgs } from "@ts-rest/core";
import type { Common400APIResponse } from "@shared/index.ts";
import { AfloatAuth, AuthContext } from "@features/auth/manager.ts";

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
   * The auth instance to use for authentication
   * 
   * @protected
   */
  protected auth: AfloatAuth | undefined;

  /**
   * Constructs a new instance of `BaseRepository`.
   *
   * @param endpoint - API endpoint
   * @param contract - The "ts-rest" contract
   * @param args - Optional constructor arguments
   * @param args.root - Optional API root URL
   * @param args.auth - Optional auth instance to use
   */
  constructor(endpoint: string, contract: TContract, args?: { 
    root?: string;
    auth?: AfloatAuth;
  }) {
    this.contract = contract;
    this.endpoint = endpoint;
    this.root = args?.root;
    
    // Use provided auth or try to get the current context
    this.auth = args?.auth || AuthContext.current;
  }

  /**
   * Gets an auth instance that can be used for permission checks.
   * Follows a fallback strategy to find a valid auth instance.
   * 
   * @protected
   * @returns {AfloatAuth} A valid auth instance
   * @throws {Error} If no valid auth instance is available
   */
  protected getAuthForPermissionCheck(): AfloatAuth {
    // Use the instance provided in constructor, or fallback to context
    const auth = this.auth || AuthContext.current;
    
    if (!auth) {
      try {
        // Last resort: try to get the client singleton
        return AfloatAuth.instance;
      } catch (_) {
        throw new Error(`No valid auth instance available for ${this.endpoint} repository`);
      }
    }
    
    return auth;
  }

  /**
   * Gets the initialized client for making API requests.
   * Uses authentication token if available.
   */
  get client() {
    const baseUrl = this.root
      ? `${this.root}/${this.endpoint}`
      : `https://api.afloat.money/v1/${this.endpoint}`;

    let token = "";
    
    // Try to get token from the provided auth instance
    if (this.auth) {
      token = this.auth.getUserToken() ?? "";
    } 
    // Fall back to singleton if no auth was provided, but handle exceptions
    // that occur in server environments
    else {
      try {
        token = AfloatAuth.instance.getUserToken() ?? "";
      } catch (_) {
        // This will fail when called within the server without initialization
        // We'll proceed with an empty token
      }
    }

    const args: InitClientArgs = {
      baseUrl,
      baseHeaders: {
        "token": token,
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