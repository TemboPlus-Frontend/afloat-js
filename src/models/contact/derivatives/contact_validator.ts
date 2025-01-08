import { Contact, ContactSchemas } from "@models/contact/index.ts";

/**
 * Since runtime instanceof checks are unreliable, this validator checks if an object
 * is a valid Contact instance by verifying it has a data property matching the ContactData structure.
 */
export class ContactValidator {
  /**
   * @param obj: unknown
   *
   * Returns true if the object is a valid Contact instance
   */
  static isValidContactObject(obj: unknown): obj is Contact {
    if (!obj || typeof obj !== "object") return false;
    if (!("data" in obj)) return false;

    const result = ContactSchemas.contactData.safeParse(obj.data);
    if (!result.success) return false;

    const contact = Contact.createSafe(result.data);
    return contact !== null;
  }
}
