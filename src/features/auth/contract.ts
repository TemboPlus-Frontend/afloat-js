import { z } from "zod";
import { initContract } from "@ts-rest/core";
import { coreUserSchema, identitySchema } from "../../models/user/schemas.ts";

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
      201: coreUserSchema,
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
      200: identitySchema,
    },
  },
});
