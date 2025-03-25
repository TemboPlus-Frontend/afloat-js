import { Profile } from "@models/index.ts";
import { BaseRepository } from "@shared/base_repository.ts";
import { APIError } from "@errors/api_error.ts";
import { profileContract } from "@features/auth/profile/contract.ts";

export class ProfileRepository extends BaseRepository<typeof profileContract> {
  /**
   * Initializes an instance of ProfileRepository.
   */
  constructor() {
    super("profile", profileContract);
  }

  async getCurrentProfile(token: string): Promise<Profile> {
    const headers = { token };
    const result = await this.client.getCurrentProfile({ headers });
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
