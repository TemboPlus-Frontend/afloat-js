import {
  type ContactData,
  ContactSchemas,
  type ContactType,
} from "@models/contact/schemas.ts";
import { MobileContactInfo } from "@models/contact/index.ts";
import { Bank, PhoneNumber } from "@temboplus/frontend-core";
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

  /**
   * Unique identifier for the contact
   */
  get id(): string {
    return this.data.id;
  }

  /**
   * Profile identifier associated with this contact
   */
  get profileId(): string {
    return this.data.profileId;
  }

  /**
   * Display name of the contact
   */
  get displayName(): string {
    return this.data.displayName;
  }

  /**
   * Type of contact (Bank or Mobile)
   */
  get type(): ContactType {
    return this.data.type;
  }

  /**
   * Creation timestamp of the contact
   */
  get createdAt(): Date {
    return this.data.createdAt;
  }

  /**
   * Detailed contact information based on contact type
   *
   * @returns {ContactInfo | undefined} Contact information object:
   * - MobileContactInfo for mobile money contacts
   * - BankContactInfo for bank contacts
   * - undefined if contact information cannot be constructed
   *
   * @remarks
   * For mobile contacts, constructs from phone number
   * For bank contacts, constructs from SWIFT code and account number
   */
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

  /**
   * Payment channel for the contact
   *
   * @returns {string} Channel information:
   * - For valid contacts, returns formatted channel from ContactInfo
   * - For invalid contacts, falls back to account number
   */
  get channel(): string {
    const info = this.info;
    if (info) return info.channel;
    return this.data.accountNo;
  }

  /**
   * Account number for the contact
   *
   * @returns {string} Account number:
   * - For valid contacts, returns formatted account number from ContactInfo
   * - For invalid contacts, falls back to raw account number
   */
  get accNo(): string {
    const info = this.info;
    if (info) return info.accNumber;
    return this.data.accountNo;
  }

  /**
   * Account name for the contact
   * Always returns the display name
   */
  get accName(): string {
    return this.data.displayName;
  }

  /**
   * Label for the account number field based on contact type
   *
   * @returns {string} Appropriate label:
   * - "Phone Number" for mobile contacts
   * - "Bank Account Number" for bank contacts
   * - "Account Number" as fallback
   */
  get accNoLabel(): string {
    const info = this.info;
    if (info instanceof MobileContactInfo) return "Phone Number";
    if (info instanceof BankContactInfo) return "Bank Account Number";
    return "Account Number";
  }

  /**
   * Label for the channel field based on contact type
   *
   * @returns {string} Appropriate label:
   * - "Channel" for mobile contacts
   * - "Bank" for bank contacts
   * - "Channel" as fallback
   */
  get channelLabel(): string {
    const info = this.info;
    if (info instanceof MobileContactInfo) return "Channel";
    if (info instanceof BankContactInfo) return "Bank";
    return "Channel";
  }

  /**
   * Label for the account name field based on contact type
   *
   * @returns {string} Appropriate label:
   * - "Full Name" for mobile contacts
   * - "Bank Account Name" for bank contacts
   * - "Display Name" as fallback
   */
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
  public static create(data: ContactData): Contact {
    return new Contact(data);
  }

  /**
   * Creates multiple Contact instances from an array of raw data
   * @throws {ZodError} if validation fails for any item
   */
  public static createMany(dataArray: ContactData[]): Contact[] {
    return dataArray.map((data) => new Contact(data));
  }

  /**
   * Creates a Contact instance from raw data without throwing
   * @returns {Contact | null} Contact instance or null if validation fails
   */
  public static createSafe(data: ContactData): Contact | null {
    try {
      return new Contact(data);
    } catch {
      return null;
    }
  }

  /**
   * Checks if an unknown value contains valid data to construct a Contact instance.
   * This is useful when validating raw data structures before instantiation.
   *
   * @param {unknown} obj - The value containing potential contact data
   * @returns {obj is Contact} Type predicate indicating if a Contact can be constructed
   *
   * @example
   * ```typescript
   * const rawData = await fetchFromAPI();
   * if (Contact.canConstruct(rawData)) {
   *   const contact = Contact.create(rawData);
   *   // TypeScript knows contact is valid here
   *   console.log(contact.displayName);
   * }
   * ```
   *
   * @throws {never} This method never throws errors
   *
   * @remarks
   * This method performs strict validation against the {@link ContactData} schema.
   */
  public static canConstruct(obj: unknown): obj is Contact {
    if (!obj || typeof obj !== "object") return false;

    const result = ContactSchemas.contactData.safeParse(obj);
    if (!result.success) return false;

    const contact = Contact.createSafe(result.data);
    return contact !== null;
  }

  /**
   * Validates if an unknown value is a Contact instance.
   * This is a runtime type guard that ensures proper object structure and data validity.
   *
   * @param {unknown} obj - The value to validate
   * @returns {obj is Contact} Type predicate indicating if the value is a valid Contact
   *
   * @example
   * ```typescript
   * const maybeContact = getContactFromCache();
   * if (Contact.is(maybeContact)) {
   *   // TypeScript knows maybeContact is a Contact here
   *   console.log(maybeContact.displayName);
   * }
   * ```
   *
   * @throws {never} This method never throws errors
   *
   * @remarks
   * This method performs a complete structural validation:
   * 1. Checks if the value is an object
   * 2. Verifies presence of internal data property
   * 3. Validates the data against ContactData schema
   * 4. Ensures the object is a proper Contact instance
   *
   * Use this method when:
   * - Validating cached Contact instances
   * - Checking serialized Contact objects
   * - Verifying API responses
   * - Type narrowing in conditional blocks
   */
  public static is(obj: unknown): obj is Contact {
    if (!obj || typeof obj !== "object") return false;
    if (!("data" in obj)) return false;

    return Contact.canConstruct(obj.data);
  }

  /**
   * Converts Payout instance to a plain object
   */
  toJSON(): ContactData {
    return { ...this.data };
  }
}
