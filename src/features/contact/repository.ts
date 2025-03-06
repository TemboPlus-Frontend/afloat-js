import { BaseRepository } from "@shared/base_repository.ts";
import { contract } from "@features/contact/contract.ts";
import {
  Contact,
  type ContactData,
  type ContactInput,
} from "@models/contact/index.ts";
import type { AfloatAuth } from "@features/auth/manager.ts";
import { Permissions } from "@models/index.ts";
import { PermissionError } from "@errors/index.ts";

/**
 * Repository class for managing `Contact` data through API interactions.
 * Extends the `BaseRepository` to leverage shared functionality.
 */
export class ContactRepository extends BaseRepository<typeof contract> {
  /**
   * Creates an instance of `ContactRepository` using the contact contract.
   * @param {Object} [props] - Optional constructor properties
   * @param {AfloatAuth} [props.auth] - Optional auth instance to use
   * @param {string} [props.root] - Optional API root URL
   */
  constructor(props?: { auth?: AfloatAuth; root?: string }) {
    super("contact", contract, props);
  }

  /**
   * Creates a new contact record.
   * @param {ContactInput} input - The data required to create a new contact.
   * @returns {Promise<Contact>} A promise that resolves to the newly created contact.
   * @throws {PermissionError} If the user lacks required permissions
   * @throws {APIError} If the response status code is not 201.
   */
  async create(input: ContactInput): Promise<Contact> {
    const auth = this.getAuthForPermissionCheck();
    const requiredPerm = Permissions.Contact.Create;
    
    if (!auth.checkPermission(requiredPerm)) {
      throw new PermissionError({
        message: "You are not authorized to add contacts.",
        requiredPermissions: [requiredPerm],
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
   * @throws {PermissionError} If the user lacks required permissions
   * @throws {APIError} If the response status code is not 200.
   */
  async edit(id: string, input: ContactInput): Promise<Contact> {
    const auth = this.getAuthForPermissionCheck();
    const requiredPerm = Permissions.Contact.Update;
    
    if (!auth.checkPermission(requiredPerm)) {
      throw new PermissionError({
        message: "You are not authorized to update contacts.",
        requiredPermissions: [requiredPerm],
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
   * @throws {PermissionError} If the user lacks required permissions
   * @throws {APIError} If the response status code is not 200.
   */
  async remove(id: string): Promise<void> {
    const auth = this.getAuthForPermissionCheck();
    const requiredPerm = Permissions.Contact.Delete;
    
    if (!auth.checkPermission(requiredPerm)) {
      throw new PermissionError({
        message: "You are not authorized to delete contacts.",
        requiredPermissions: [requiredPerm],
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
   * @throws {PermissionError} If the user lacks required permissions
   * @throws {APIError} If the response status code is not 200 or the range is invalid.
   * @example
   * const repository = new ContactRepository();
   * repository.getAll().then(contacts => console.log(contacts));
   */
  async getAll(): Promise<Contact[]> {
    const auth = this.getAuthForPermissionCheck();
    const requiredPerm = Permissions.Contact.List;
    
    if (!auth.checkPermission(requiredPerm)) {
      throw new PermissionError({
        message: "You are not authorized to view contacts.",
        requiredPermissions: [requiredPerm],
      });
    }

    const query = { orderByDesc: "createdAt" };
    const result = await this.client.getContacts({ query });
    const data = this.handleResponse<ContactData[]>(result, 200);
    return Contact.createMany(data);
  }
}