import { initContract } from "@ts-rest/core";
import { z } from "zod";

/**
 * Identity API contract
 */
export const identityContract = initContract().router({
  getUserCredentials: {
    method: "GET",
    path: "/me",
    headers: z.object({ token: z.string() }),
    responses: {
      200: z.object({
        name: z.string(),
        identity: z.string(),
      }),
    },
  },
});
