import type { ContactData, ContactType } from "@models/contact/types.ts";
import { ContactSchemas } from "@models/contact/schemas.ts";
import { MobileContactInfo } from "@models/contact/index.ts";
import { Bank, PhoneNumber } from "@temboplus/tembo-core";
import {
  BankContactInfo,
  type ContactInfo,
} from "@models/contact/derivatives/contact_info.ts";

/**
 * Contact class that wraps the Zod schema and provides additional functionality
 */
export class Contact {
  private readonly data: ContactData;

  /**
   * Private constructor - use static methods to create instances
   */
  private constructor(data: ContactData) {
    this.data = ContactSchemas.contactData.parse(data);
  }

  // Getters for all properties
  get id(): string {
    return this.data.id;
  }
  get profileId(): string {
    return this.data.profileId;
  }
  get displayName(): string {
    return this.data.displayName;
  }
  get type(): ContactType {
    return this.data.type;
  }
  get createdAt(): Date {
    return this.data.createdAt;
  }
  get info(): ContactInfo | undefined {
    if (this.data.type === "Mobile") {
      const phone = PhoneNumber.from(this.data.accountNo);
      if (phone) {
        return new MobileContactInfo(this.data.displayName, phone);
      }
    }

    if (this.data.type === "Bank") {
      const bank = Bank.fromSWIFTCode(this.data.channel);

      if (bank) {
        return new BankContactInfo(
          this.data.displayName,
          bank,
          this.data.accountNo,
        );
      }
    }

    return undefined;
  }

  get channel(): string {
    const info = this.info;
    if (info) return info.channel;
    return this.data.accountNo;
  }

  get accNo(): string {
    const info = this.info;
    if (info) return info.accNumber;
    return this.data.accountNo;
  }

  get accName(): string {
    return this.data.displayName;
  }

  get accNoLabel(): string {
    const info = this.info;
    if (info instanceof MobileContactInfo) return "Phone Number";
    if (info instanceof BankContactInfo) return "Bank Account Number";
    return "Account Number";
  }

  get channelLabel(): string {
    const info = this.info;
    if (info instanceof MobileContactInfo) return "Channel";
    if (info instanceof BankContactInfo) return "Bank";
    return "Channel";
  }

  get accNameLabel(): string {
    const info = this.info;
    if (info instanceof MobileContactInfo) return "Full Name";
    if (info instanceof BankContactInfo) return "Bank Account Name";
    return "Display Name";
  }

  /**
   * Creates a Contact instance from raw data
   * @throws {ZodError} if validation fails
   */
  static create(data: ContactData): Contact {
    return new Contact(data);
  }

  /**
   * Creates multiple Contact instances from an array of raw data
   * @throws {ZodError} if validation fails for any item
   */
  static createMany(dataArray: ContactData[]): Contact[] {
    return dataArray.map((data) => new Contact(data));
  }

  /**
   * Creates a Contact instance from raw data without throwing
   * @returns {Contact | undefined} Contact instance or undefined if validation fails
   */
  static createSafe(data: ContactData): Contact | undefined {
    try {
      return new Contact(data);
    } catch {
      return;
    }
  }

  /**
   * Checks if raw data matches the Contact schema
   */
  static isValid(data: unknown): data is ContactData {
    return ContactSchemas.contactData.safeParse(data).success;
  }
}
