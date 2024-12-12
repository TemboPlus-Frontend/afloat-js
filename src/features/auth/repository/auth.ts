import { BaseRepository } from "../../../shared/base_repository.ts";
import { authContract, identityContract } from "../contract.ts";
import type { User, UserIdentity } from "../types/user.ts";

export class AuthRepository extends BaseRepository<typeof authContract> {
  constructor() {
    super(authContract);
  }

  async logIn(
    email: string,
    password: string,
  ): Promise<{ user: User; token: string }> {
    const body = { type: "password", identity: email, password };
    const result = await this.client.logIn({ body });
    if (result.status === 400) throw new Error("Invalid email or password");

    if (result.status === 201) {
      const repo = new LoginRepository();
      const identity = await repo.getIdentity();
      return {
        user: { ...result.body, ...identity },
        token: result.body.token,
      };
    }

    throw new Error(
      "An error happened while fetching your profile. Please try again.",
    );
  }

  async updatePassword(currentPassword: string, newPassword: string) {
    const result = await this.client.resetPassword({
      body: { currentPassword, newPassword },
    });
    if (result.status === 200) return true;
    if (result.status === 400) {
      throw new Error("Please provide the correct current password");
    }

    throw new Error("Unknown Error");
  }
}

class LoginRepository extends BaseRepository<typeof identityContract> {
  constructor() {
    super(identityContract);
  }

  async getIdentity(): Promise<UserIdentity> {
    const result = await this.client.getUserCredentials();
    if (result.status === 200) return result.body;

    throw new Error(
      "An error happened while fetching your profile. Please try again.",
    );
  }
}
