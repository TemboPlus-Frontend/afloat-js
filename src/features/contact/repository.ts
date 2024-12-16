import type { ClientInferResponseBody } from "@ts-rest/core";
import { APIError } from "@errors/api_error.ts";
import { BaseRepository } from "@shared/base_repository.ts";
import { DEFAULT_ORDER_BY_DESC } from "@shared/index.ts";
import { contract } from "@features/contact/contract.ts";
import type { Contact, ContactInput } from "@models/contact/types.ts";
import { AfloatAuth } from "@features/auth/index.ts";
import { Permissions } from "@models/index.ts";
import { PermissionError } from "@errors/index.ts";

type GetContactsArgs = ClientInferResponseBody<typeof contract.getContacts>;

/**
 * Repository class for managing `Contact` data through API interactions.
 * Extends the `BaseRepository` to leverage shared functionality.
 */
export class ContactRepository extends BaseRepository<typeof contract> {
  /**
   * Creates an instance of `ContactRepository` using the contact contract.
   */
  constructor() {
    super(contract);
  }

  /**
   * Creates a new contact record.
   * @param {ContactInput} data - The data required to create a new contact.
   * @returns {Promise<Contact>} A promise that resolves to the newly created contact.
   * @throws {APIError} If the response status code is not 201.
   */
  async create(data: ContactInput): Promise<Contact> {
    if (!AfloatAuth.instance.checkPermission(Permissions.Contact.Create)) {
      throw new PermissionError({
        message: "You are not authorized to add contacts.",
        requiredPermissions: [Permissions.Contact.Create],
      });
    }

    const result = await this.client.postContact({ body: data });
    return this.handleResponse<Contact>(result, 201);
  }

  /**
   * Updates an existing contact record by ID.
   * @param {string} id - The unique identifier of the contact to edit.
   * @param {ContactInput} data - The data to update the contact with.
   * @returns {Promise<Contact>} A promise that resolves to the updated contact.
   * @throws {APIError} If the response status code is not 200.
   */
  async edit(id: string, data: ContactInput): Promise<Contact> {
    if (!AfloatAuth.instance.checkPermission(Permissions.Contact.Update)) {
      throw new PermissionError({
        message: "You are not authorized to update contacts.",
        requiredPermissions: [Permissions.Contact.Update],
      });
    }

    const result = await this.client.editContact({
      params: { id },
      body: data,
    });
    return this.handleResponse<Contact>(result, 200);
  }

  /**
   * Deletes a contact record by ID.
   * @param {string} id - The unique identifier of the contact to remove.
   * @returns {Promise<void>} A promise that resolves when the deletion is complete.
   * @throws {APIError} If the response status code is not 200.
   */
  async remove(id: string): Promise<void> {
    if (!AfloatAuth.instance.checkPermission(Permissions.Contact.Delete)) {
      throw new PermissionError({
        message: "You are not authorized to delete contacts.",
        requiredPermissions: [Permissions.Contact.Delete],
      });
    }

    const result = await this.client.deleteContact({ params: { id } });
    this.handleResponse<void>(result, 200);
  }

  /**
   * Retrieves all contacts within the specified range.
   * If `rangeStart` or `rangeEnd` is not provided, defaults to retrieving the first 1000 contacts.
   * Results are ordered in descending order by default.
   *
   * @param {GetContactsArgs} [args] - Optional arguments for contact retrieval:
   *   - `rangeStart` {number} The start index of the range.
   *   - `rangeEnd` {number} The end index of the range.
   * @returns {Promise<Contact[]>} A promise that resolves to an array of contacts.
   * @throws {APIError} If the response status code is not 200 or the range is invalid.
   * @example
   * const repository = new ContactRepository();
   * repository.getAll({ rangeStart: 0, rangeEnd: 10 }).then(contacts => console.log(contacts));
   */
  async getAll(args?: GetContactsArgs): Promise<Contact[]> {
    if (!AfloatAuth.instance.checkPermission(Permissions.Contact.List)) {
      throw new PermissionError({
        message: "You are not authorized to view contacts.",
        requiredPermissions: [Permissions.Contact.List],
      });
    }

    const rangeStart = args?.rangeStart ?? 0;
    const rangeEnd = args?.rangeEnd ?? 1000;
    const query = { rangeStart, rangeEnd, orderByDesc: DEFAULT_ORDER_BY_DESC };

    if (rangeEnd <= rangeStart) {
      throw new APIError({
        message: "Please check your range",
        statusCode: 404,
        error: "Invalid Range",
      });
    }

    const result = await this.client.getContacts({ query });
    return this.handleResponse<Contact[]>(result, 200);
  }
}
