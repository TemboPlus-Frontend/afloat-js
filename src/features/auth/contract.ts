import { z } from "@npm/zod.ts";
import { initContract } from "@npm/ts_rest.ts";
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

export const identityContract = initContract().router({
  getUserCredentials: {
    method: "GET",
    path: "/me",
    headers: z.object({
      token: z.string(),
    }),
    responses: {
      200: z.object({
        name: z.string(),
        identity: z.string(),
      }),
    },
  },
});
