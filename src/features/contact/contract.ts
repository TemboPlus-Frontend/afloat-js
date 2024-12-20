import { z } from "@npm/zod.ts";
import { initContract } from "@npm/ts_rest.ts";
import { commonAPIResponses } from "@shared/index.ts";
import {
  contactInputSchema,
  contactSchema,
} from "@models/contact/index.ts";

/**
 * Contact API contract
 */
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
