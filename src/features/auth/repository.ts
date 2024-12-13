import type { ClientInferResponseBody } from "@ts-rest/core";
import { User } from "../../models/index.ts";
import { BaseRepository } from "../../shared/base_repository.ts";
import { authContract, identityContract } from "./contract.ts";
import { APIError } from "@errors/api_error.ts";

type GetUserIdentityResponse = ClientInferResponseBody<
  typeof identityContract.getUserCredentials
>;

export class AuthRepository extends BaseRepository<typeof authContract> {
  constructor() {
    super(authContract);
  }

  async logIn(
    email: string,
    password: string,
  ): Promise<User> {
    const body = { type: "password", identity: email, password };
    const result = await this.client.logIn({ body });
    if (result.status === 400) {
      throw new APIError({
        message: "Invalid email or password",
        statusCode: 400,
      });
    }

    if (result.status === 201) {
      const repo = new LoginRepository();
      const loginCredentials = await repo.getIdentity();

      const user: User = new User({ ...result.body, loginCredentials });
      return user;
    }

    throw new APIError({
      message: "An error occurred while trying to log in",
      statusCode: 502,
    });
  }

  async updatePassword(currentPassword: string, newPassword: string) {
    const result = await this.client.resetPassword({
      body: { currentPassword, newPassword },
    });
    if (result.status === 200) return true;
    if (result.status === 400) {
      throw new APIError({
        message: "Invalid current password",
        statusCode: 400,
      });
    }

    throw new APIError({
      message: "An error occurred while trying to update password",
      statusCode: 502,
    });
  }
}

class LoginRepository extends BaseRepository<typeof identityContract> {
  constructor() {
    super(identityContract);
  }

  async getIdentity(): Promise<GetUserIdentityResponse> {
    const result = await this.client.getUserCredentials();
    if (result.status === 200) return result.body;

    throw new APIError({
      message: "An error occurred while trying to get login credentials",
      statusCode: 502,
    });
  }
}
