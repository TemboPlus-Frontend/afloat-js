import { z } from "zod";
import { initContract } from "@ts-rest/core";
import { profileSchema } from "@models/index.ts";

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
    responses: {
      200: z.object({
        name: z.string(),
        identity: z.string(),
      }),
    },
  },
});
