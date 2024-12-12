import { type AppRouter, initClient } from "@ts-rest/core";
import { ApiError } from "./types/api_error.ts";
import type { APIErrorResponse } from "./index.ts";
import { v4 as uuidv4 } from "uuid";
import { AuthManager } from "../../mod.ts";
import type { InitClientArgs } from "@ts-rest/core";

const BASE_CLIENT_PARAMS: InitClientArgs = {
  baseUrl: "https://api.afloat.money/v1",
  baseHeaders: {
    "token": AuthManager.instance.getUserToken() ?? "",
    "x-request-id": uuidv4(),
  },
};

export class BaseRepository<TContract extends AppRouter> {
  protected client;

  constructor(contract: TContract) {
    this.client = initClient(contract, BASE_CLIENT_PARAMS);
  }

  handleResponse<T>(
    result: { status: number; body: unknown },
    successStatusCode: number,
  ): T {
    if (successStatusCode === result.status) {
      return result.body as T;
    }

    if (result.status === 400) {
      throw ApiError.fromResponse(result.body as APIErrorResponse);
    }

    throw new ApiError({
      message:
        "We encountered an error trying to process your request. Please try again later",
      statusCode: 520,
      error: "UNKNOWN ERROR",
    });
  }
}
