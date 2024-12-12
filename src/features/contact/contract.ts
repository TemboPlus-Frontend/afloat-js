import { z } from "zod";
import { initContract } from "@ts-rest/core";
import { contactInputSchema, contactSchema } from "./types/index.ts";
import { apiErrorResponseSchema } from "../../shared/index.ts";

const c = initContract();

export const contract = c.router({
  postContact: {
    method: "POST",
    path: "/",
    body: contactInputSchema,
    responses: {
      201: contactSchema,
    },
  },
  editContact: {
    method: "PATCH",
    path: "/:id",
    body: contactInputSchema,
    responses: {
      200: contactSchema,
    },
  },
  getContacts: {
    method: "GET",
    path: "/",
    query: z.object({
      rangeStart: z.number(),
      rangeEnd: z.number(),
      orderByDesc: z.string(),
    }),
    responses: {
      200: z.array(contactSchema),
    },
  },
  deleteContact: {
    method: "DELETE",
    path: "/:id",
    body: z.object({}),
    responses: {
      200: z.object({}),
    },
  },
}, {
  commonResponses: {
    400: apiErrorResponseSchema,
  },
});
