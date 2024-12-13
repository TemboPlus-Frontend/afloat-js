import { z } from "zod";
import { initContract } from "@ts-rest/core";
import { commonAPIResponses } from "../../shared/index.ts";
import {
  contactInputSchema,
  contactSchema,
} from "../../models/contact/index.ts";

export const contract = initContract().router({
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
  commonResponses: commonAPIResponses,
});
