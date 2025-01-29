import { z } from "zod";
import { initContract } from "@ts-rest/core";
import { profileSchema } from "@models/index.ts";

/**
 * Auth API contract
 */
export const authContract = initContract().router({
  logIn: {
    method: "POST",
    path: "/login",
    body: z.object({
      type: z.string().default("password"),
      identity: z.string().email(),
      password: z.string(),
    }),
    responses: {
      201: z.object({
        profile: profileSchema,
        token: z.string(),
        access: z.array(z.string()),
        resetPassword: z.boolean(),
      }),
      400: z.object({}),
    },
  },
  access: {
    method: "GET",
    path: "/access",
    headers: z.object({ token: z.string() }),
    responses: {
      200: z.string().array(),
    },
  },
  resetPassword: {
    method: "PUT",
    path: "/password",
    body: z.object({
      currentPassword: z.string(),
      newPassword: z.string(),
    }),
    responses: {},
  },
});
