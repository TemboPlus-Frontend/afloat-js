import { Bank, PhoneNumber } from "@temboplus/tembo-core";
import type { Contact } from "@models/contact/types.ts";
import {
  BankContactInfo,
  type ContactInfo,
  MobileContactInfo,
} from "@models/contact/derivatives/contact_info.ts";

/**
 * Class representing a processed contact with its details.
 */
export class ProcessedContact {
  constructor(
    /** Original contact identifier */
    public readonly id: string,
    /** Processed contact details */
    public readonly info: ContactInfo,
    /** Original unprocessed contact data */
    public readonly sourceRecord: Contact,
  ) {}

  /**
   * Validates the processed contact data.
   * @returns boolean indicating if the contact is valid
   */
  validate(): boolean {
    return (
      this.id.length > 0 &&
      this.info.validate() &&
      this.sourceRecord !== undefined
    );
  }

  /**
   * Creates a ProcessedContact instance from raw contact data.
   * @param contact - The raw contact data
   * @returns ProcessedContact instance
   */
  static fromContact(contact: Contact): ProcessedContact | undefined {
    const bank = Bank.fromSWIFTCode(contact.channel);
    let info: ContactInfo | undefined;

    if (bank) {
      info = new BankContactInfo(contact.displayName, bank, contact.accountNo);
    }

    const phone = PhoneNumber.from(contact.accountNo);
    if (phone) {
      info = new MobileContactInfo(contact.displayName, phone);
    }

    if (!info) return;

    return new ProcessedContact(
      contact.id,
      info,
      contact,
    );
  }

  /**
   * Returns the contact name regardless of contact type.
   */
  get displayName(): string {
    return this.info instanceof MobileContactInfo
      ? this.info.name
      : this.info.accName;
  }

  /**
   * Returns the contact channel
   */
  get type(): string {
    return this.info.type;
  }
}
