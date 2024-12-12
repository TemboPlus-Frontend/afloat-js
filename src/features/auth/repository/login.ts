import { BaseRepository } from "../../../shared/base_repository.ts";
import type { identityContract } from "../contract.ts";
import type { UserIdentity } from "../types/user.ts";

export class AuthRepository extends BaseRepository<typeof identityContract> {
  async getIdentity(): Promise<UserIdentity> {
    const result = await this.client.getUserCredentials();
    if (result.status === 200) return result.body;

    throw new Error(
      "An error happened while fetching your profile. Please try again.",
    );
  }
}
