import { z } from "zod";
import { initContract } from "@ts-rest/core";

/**
 * Auth API contract
 */
export const accessContract = initContract().router({
  getAccessList: {
    method: "GET",
    path: "/access",
    responses: {
      200: z.string().array(),
    },
  },
});
