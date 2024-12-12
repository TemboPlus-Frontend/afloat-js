import { ApiError } from "../../shared/types/api_error.ts";
import { BaseRepository } from "../../shared/base_repository.ts";
import { DEFAULT_ORDER_BY_DESC } from "../../shared/index.ts";
import { contract } from "./contract.ts";
import type { Contact, ContactInput, GetContactsArgs } from "./types/index.ts";

export class ContactRepository extends BaseRepository<typeof contract> {
  constructor() {
    super(contract);
  }

  async create(data: ContactInput): Promise<Contact> {
    const result = await this.client.postContact({ body: data });
    return this.handleResponse<Contact>(result, 201);
  }

  async edit(id: string, data: ContactInput): Promise<Contact> {
    const result = await this.client.editContact({
      params: { id },
      body: data,
    });
    return this.handleResponse<Contact>(result, 200);
  }

  async remove(id: string): Promise<void> {
    const result = await this.client.deleteContact({ params: { id } });
    this.handleResponse<void>(result, 200);
  }

  async getAll(args?: GetContactsArgs): Promise<Contact[]> {
    const rangeStart = args?.rangeStart ?? 0;
    const rangeEnd = args?.rangeEnd ?? 1000;
    const query = { rangeStart, rangeEnd, orderByDesc: DEFAULT_ORDER_BY_DESC };

    if (rangeEnd <= rangeStart) {
      throw new ApiError({
        message: "Please check your range",
        statusCode: 404,
        error: "Invalid Range",
      });
    }

    const result = await this.client.getContacts({ query });
    return this.handleResponse<Contact[]>(result, 200);
  }
}
