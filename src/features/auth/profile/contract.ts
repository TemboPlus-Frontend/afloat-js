import { initContract } from "@ts-rest/core";
import { profileSchema } from "@models/index.ts";
import { z } from "zod";

/**
 * Profile API contract
 */
export const profileContract = initContract().router({
  getCurrentProfile: {
    method: "GET",
    path: "/me",
    headers: z.object({ token: z.string() }),
    responses: {
      200: profileSchema,
    },
  },
});
