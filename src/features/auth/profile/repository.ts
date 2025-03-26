import { Profile } from "@models/index.ts";
import { APIError } from "@errors/api_error.ts";
import { profileContract } from "@features/auth/profile/contract.ts";
import { TokenRequiredRepository } from "../../../shared/token_required_repository.ts";

export class ProfileRepository extends TokenRequiredRepository<typeof profileContract> {
  /**
   * Initializes an instance of ProfileRepository.
   */
  constructor() {
    super("profile", profileContract, "");
  }

  async getCurrentProfile(token: string): Promise<Profile> {
    this.setToken(token)
    const result = await this.client.getCurrentProfile();
    if (result.status === 200) {
      const profile =  Profile.from(result.body);
      if(profile) return profile;
    }

    throw new APIError({
      message: "An error occurred while trying to get the current profile",
      statusCode: 502,
    });
  }
}
