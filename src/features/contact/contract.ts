import { z } from "@npm/zod.ts";
import { initContract } from "@npm/ts-rest.ts";
import { commonAPIResponses } from "@shared/index.ts";
import { ContactSchemas } from "@models/index.ts";

/**
 * Contact API contract
 * Defines the REST endpoints for managing contacts
 *
 * @property {Object} postContact - Create a new contact (POST /)
 * @property {Object} editContact - Update an existing contact (PATCH /:id)
 * @property {Object} getContacts - Retrieve contacts list (GET /)
 * @property {Object} deleteContact - Delete a contact (DELETE /:id)
 */
export const contract = initContract().router({
  postContact: {
    method: "POST",
    path: "/",
    body: ContactSchemas.contactInput,
    responses: {
      201: ContactSchemas.contactData,
    },
  },
  editContact: {
    method: "PATCH",
    path: "/:id",
    body: ContactSchemas.contactInput,
    responses: {
      200: ContactSchemas.contactData,
    },
  },
  getContacts: {
    method: "GET",
    path: "/",
    query: z.object({ orderByDesc: z.string() }),
    responses: {
      200: z.array(ContactSchemas.contactData),
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

/**
 * Export type for use in client implementations
 */
export type ContactAPI = typeof contract;
