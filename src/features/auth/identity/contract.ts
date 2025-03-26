import { initContract } from "@ts-rest/core";
import { z } from "zod";

/**
 * Identity API contract
 */
export const identityContract = initContract().router({
  getUserCredentials: {
    method: "GET",
    path: "/me",
    responses: {
      200: z.object({
        name: z.string(),
        identity: z.string(),
      }),
    },
  },
});
