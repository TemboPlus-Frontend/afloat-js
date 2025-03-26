import { APIError } from "@errors/api_error.ts";
import { identityContract } from "@features/auth/identity/contract.ts";
import type { ClientInferResponseBody } from "@ts-rest/core";
import { TokenRequiredRepository } from "../../../shared/token_required_repository.ts";

type GetUserIdentityResponse = ClientInferResponseBody<
  typeof identityContract.getUserCredentials
>;

/**
 * Class representing the LoginRepository.
 * Provides methods to retrieve user identity-related information.
 */
export class LoginRepository
  extends TokenRequiredRepository<typeof identityContract> {
  /**
   * Initializes an instance of LoginRepository.
   */
  constructor() {
    super("login", identityContract, "");
  }

  /**
   * Retrieves the user's login credentials.
   * @returns A promise that resolves to the user's login credentials on success.
   * @throws {APIError} If an error occurs while retrieving the credentials.
   */
  async getIdentity(token: string): Promise<GetUserIdentityResponse> {
    this.setToken(token);
    const result = await this.client.getUserCredentials();
    if (result.status === 200) return result.body;

    throw new APIError({
      message: "An error occurred while trying to get login credentials",
      statusCode: 502,
    });
  }
}
