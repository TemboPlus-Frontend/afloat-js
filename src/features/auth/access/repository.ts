import { Profile } from "@models/index.ts";
import { APIError } from "@errors/api_error.ts";
import { TokenRequiredRepository } from "../../../shared/token_required_repository.ts";
import { accessContract } from "@features/auth/access/contract.ts";

export class AccessRepository
  extends TokenRequiredRepository<typeof accessContract> {
  /**
   * Initializes an instance of ProfileRepository.
   */
  constructor() {
    super("auth", accessContract, "");
  }

  async getCurrentProfile(token: string): Promise<Profile> {
    this.setToken(token);
    const result = await this.client.getAccessList();
    if (result.status === 200) {
      const profile = Profile.from(result.body);
      if (profile) return profile;
    }

    throw new APIError({
      message: "An error occurred while trying to get the current access list",
      statusCode: 502,
    });
  }
}
