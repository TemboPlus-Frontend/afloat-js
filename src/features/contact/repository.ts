import { BaseRepository } from "@shared/base_repository.ts";
import { contract } from "@features/contact/contract.ts";
import {
  Contact,
  type ContactData,
  type ContactInput,
} from "@models/contact/index.ts";
import { AfloatAuth } from "@features/auth/index.ts";
import { Permissions } from "@models/index.ts";
import { PermissionError } from "@errors/index.ts";

/**
 * Repository class for managing `Contact` data through API interactions.
 * Extends the `BaseRepository` to leverage shared functionality.
 */
export class ContactRepository extends BaseRepository<typeof contract> {
  /**
   * Creates an instance of `ContactRepository` using the contact contract.
   */
  constructor() {
    super("contact", contract);
  }

  /**
   * Creates a new contact record.
   * @param {ContactInput} input - The data required to create a new contact.
   * @returns {Promise<Contact>} A promise that resolves to the newly created contact.
   * @throws {APIError} If the response status code is not 201.
   */
  async create(input: ContactInput): Promise<Contact> {
    if (!AfloatAuth.instance.checkPermission(Permissions.Contact.Create)) {
      throw new PermissionError({
        message: "You are not authorized to add contacts.",
        requiredPermissions: [Permissions.Contact.Create],
      });
    }

    const result = await this.client.postContact({ body: input });
    const data = this.handleResponse<ContactData>(result, 201);
    return Contact.create(data);
  }

  /**
   * Updates an existing contact record by ID.
   * @param {string} id - The unique identifier of the contact to edit.
   * @param {ContactInput} input - The data to update the contact with.
   * @returns {Promise<Contact>} A promise that resolves to the updated contact.
   * @throws {APIError} If the response status code is not 200.
   */
  async edit(id: string, input: ContactInput): Promise<Contact> {
    if (!AfloatAuth.instance.checkPermission(Permissions.Contact.Update)) {
      throw new PermissionError({
        message: "You are not authorized to update contacts.",
        requiredPermissions: [Permissions.Contact.Update],
      });
    }

    const result = await this.client.editContact({
      params: { id },
      body: input,
    });
    const data = this.handleResponse<ContactData>(result, 200);
    return Contact.create(data);
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
   * Retrieves all contacts
   * Results are ordered in descending order by default.
   *
   * @returns {Promise<Contact[]>} A promise that resolves to an array of contacts.
   * @throws {APIError} If the response status code is not 200 or the range is invalid.
   * @example
   * const repository = new ContactRepository();
   * repository.getAll().then(contacts => console.log(contacts));
   */
  async getAll(): Promise<Contact[]> {
    if (!AfloatAuth.instance.checkPermission(Permissions.Contact.List)) {
      throw new PermissionError({
        message: "You are not authorized to view contacts.",
        requiredPermissions: [Permissions.Contact.List],
      });
    }

    const query = { orderByDesc: "createdAt" };
    const result = await this.client.getContacts({ query });
    const data = this.handleResponse<ContactData[]>(result, 200);
    return Contact.createMany(data);
  }
}
