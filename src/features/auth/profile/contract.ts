import { initContract } from "@ts-rest/core";
import { Profile } from "@models/index.ts";

/**
 * Profile API contract
 */
export const profileContract = initContract().router({
  getCurrentProfile: {
    method: "GET",
    path: "/me",
    responses: {
      200: Profile.schema,
    },
  },
});
