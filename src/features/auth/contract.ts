import { z } from "zod";
import { initContract } from "@ts-rest/core";
import { identitySchema, userSchema } from "./types/user.ts";

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
      201: userSchema,
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
