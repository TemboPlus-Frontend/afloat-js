import type { ContactType } from "@models/contact/index.ts";
import { Bank, MobileNumberFormat, PhoneNumber } from "@temboplus/frontend-core";
import {
  validateAccName,
  validateBankAccNo,
} from "@models/contact/validation.ts";

/**
 * Abstract base class that provides a common interface for different types of contact information.
 * This class defines the structure and validation requirements for both mobile and bank contacts.
 *
 * @abstract
 * @class BaseContactInfo
 * @property {ContactType} type - The type of contact (either "Mobile" or "Bank")
 */
abstract class BaseContactInfo {
  public readonly type: ContactType;

  /**
   * Creates a new instance of BaseContactInfo
   * @param {ContactType} type - The type of contact to create
   */
  constructor(type: ContactType) {
    this.type = type;
  }

  /**
   * Validates the contact information according to type-specific rules
   * @abstract
   * @returns {boolean} True if the contact information is valid, false otherwise
   */
  abstract validate(): boolean;

  /**
   * Gets the primary display name for the contact
   * @abstract
   * @returns {string} The contact's display name (personal name for mobile, account name for bank)
   */
  abstract get displayName(): string;

  /**
   * Gets the primary account/identification number for the contact
   * @abstract
   * @returns {string} The contact's number (phone number for mobile, account number for bank)
   */
  abstract get accNumber(): string;

  /**
   * Gets the service provider or institution name for the contact
   * @abstract
   * @returns {string} The contact's channel (telecom company for mobile, bank name for bank)
   */
  abstract get channel(): string;

  /**
   * Gets the localized label for the display name field
   * @abstract
   * @returns {string} The appropriate label for the display name based on contact type
   */
  abstract get displayNameLabel(): string;

  /**
   * Gets the localized label for the account number field
   * @abstract
   * @returns {string} The appropriate label for the account number based on contact type
   */
  abstract get accNumberLabel(): string;

  /**
   * Gets the localized label for the channel field
   * @abstract
   * @returns {string} The appropriate label for the channel based on contact type
   */
  abstract get channelLabel(): string;
}

/**
 * Implementation of BaseContactInfo for mobile phone contacts.
 * Handles storage and validation of contact details specific to mobile numbers.
 *
 * @extends BaseContactInfo
 * @class MobileContactInfo
 * @property {string} name - The contact's personal name
 * @property {PhoneNumber} phoneNumber - The contact's phone number object
 */
export class MobileContactInfo extends BaseContactInfo {
  /**
   * Creates a new mobile contact
   * @param {string} name - The contact's personal name
   * @param {PhoneNumber} phoneNumber - The contact's phone number
   */
  constructor(
    public readonly name: string,
    public readonly phoneNumber: PhoneNumber,
  ) {
    super("Mobile");
  }

  /**
   * Validates the mobile contact information
   * Checks that:
   * - Phone number is defined and valid
   * - Contact name is not empty
   * @returns {boolean} True if all validation checks pass
   */
  validate(): boolean {
    return this.phoneNumber !== undefined &&
      PhoneNumber.canConstruct(this.phoneNumber.compactNumber) &&
      this.name.length > 0;
  }

  /**
   * Validates if an unknown value is a valid MobileContactInfo object.
   * Checks both the structural integrity and data validity of name and phone number properties.
   *
   * @param {unknown} obj - The value to validate
   * @returns {obj is MobileContactInfo} Type predicate indicating if the value is a valid MobileContactInfo
   *
   * @example
   * const maybeContact = JSON.parse(someData);
   * if (MobileContactInfo.is(maybeContact)) {
   *   // maybeContact is typed as MobileContactInfo
   *   console.log(maybeContact.name);
   *   console.log(maybeContact.phoneNumber.label);
   * }
   *
   * @remarks
   * - Name must be a non-empty string
   * - Phone number can be either:
   *   - A string that can be parsed into a valid PhoneNumber
   *   - A PhoneNumber object with valid properties
   * - Returns false if either property is invalid or missing
   */
  public static is(obj: unknown): obj is MobileContactInfo {
    if (!obj || typeof obj !== "object") return false;

    const mobileContactInfo = obj as Record<string, unknown>;

    // checks if name exists and is a string
    if (typeof mobileContactInfo.name !== "string") return false;
    const name = mobileContactInfo.name;

    // checks if phoneNumber exists and is valid
    let phone_number: PhoneNumber | undefined = undefined;

    if (typeof mobileContactInfo.phoneNumber === "string") {
      phone_number = PhoneNumber.from(mobileContactInfo.phoneNumber);
    }

    if (typeof mobileContactInfo.phoneNumber === "object") {
      const obj = mobileContactInfo.phoneNumber;
      const isValidPhone = PhoneNumber.is(obj);
      if (isValidPhone) {
        phone_number = obj;
      }
    }

    const validName = name.trim().length > 0;
    const validPhone = phone_number !== undefined;
    return validName && validPhone;
  }

  override get displayName(): string {
    return this.name;
  }

  /**
   * Gets the phone number formatted according to the 255 standard
   * @returns {string} Formatted phone number
   */
  override get accNumber(): string {
    return this.phoneNumber.getNumberWithFormat(MobileNumberFormat.s255);
  }

  override get channel(): string {
    return this.phoneNumber.networkOperator.mobileMoneyService;
  }

  override get displayNameLabel(): string {
    return "Name";
  }

  override get accNumberLabel(): string {
    return "Phone Number";
  }

  override get channelLabel(): string {
    return "Channel";
  }
}

/**
 * Implementation of BaseContactInfo for bank account contacts.
 * Handles storage and validation of contact details specific to bank accounts.
 *
 * @extends BaseContactInfo
 * @class BankContactInfo
 * @property {string} accName - The bank account holder's name
 * @property {Bank} bank - The bank object containing institution details
 * @property {string} accNo - The bank account number
 */
export class BankContactInfo extends BaseContactInfo {
  /**
   * Creates a new bank contact
   * @param {string} accName - The account holder's name
   * @param {Bank} bank - The bank object
   * @param {string} accNo - The account number
   */
  constructor(
    public readonly accName: string,
    public readonly bank: Bank,
    public readonly accNo: string,
  ) {
    super("Bank");
  }

  /**
   * Validates the bank contact information
   * Checks that:
   * - Bank object is valid
   * - Account name meets requirements
   * - Account number meets bank-specific format requirements
   * @returns {boolean} True if all validation checks pass
   */
  validate(): boolean {
    return this.bank.validate() &&
      validateAccName(this.accName) &&
      validateBankAccNo(this.accNumber);
  }

  /**
   * Validates if an unknown value is a valid BankContactInfo object.
   * Checks both the structural integrity and data validity of account name, account number, and bank details.
   *
   * @param {unknown} obj - The value to validate
   * @returns {obj is BankContactInfo} Type predicate indicating if the value is a valid BankContactInfo
   *
   * @example
   * const maybeBank = JSON.parse(someData);
   * if (BankContactInfo.is(maybeBank)) {
   *   // maybeBank is typed as BankContactInfo
   *   console.log(maybeBank.accName);
   *   console.log(maybeBank.accNumber);
   *   console.log(maybeBank.bank.name);
   * }
   *
   * @remarks
   * - Account name must be a valid string (validated by {@link validateAccName})
   * - Account number must be a valid string (validated by {@link validateBankAccNo})
   * - Bank must be a valid Bank object (validated by {@link Bank.is})
   * - Returns false if any property is invalid or missing
   * - All properties are required and must pass their respective validations
   */
  public static is(obj: unknown): obj is BankContactInfo {
    if (!obj || typeof obj !== "object") return false;

    const bankContactInfo = obj as Record<string, unknown>;

    // checks if acc. name exists and is a string
    if (typeof bankContactInfo.accName !== "string") return false;
    const accName = bankContactInfo.accName;

    // checks if acc. no. exists and is a string
    if (typeof bankContactInfo.accNumber !== "string") return false;
    const accNumber = bankContactInfo.accNumber;

    // checks if phoneNumber exists and is valid
    let bank: Bank | undefined = undefined;

    if (typeof bankContactInfo.bank === "object") {
      const obj = bankContactInfo.bank;
      const isValidBank = Bank.is(obj);
      if (isValidBank) {
        bank = obj;
      }
    }

    const validAccName = validateAccName(accName);
    const validAccNumber = validateBankAccNo(accNumber);
    const validBank = bank !== undefined;
    return validAccName && validAccNumber && validBank;
  }

  override get displayName(): string {
    return this.accName;
  }

  override get accNumber(): string {
    return this.accNo;
  }

  override get channel(): string {
    return this.bank.shortName;
  }

  override get displayNameLabel(): string {
    return "Acc. Name";
  }

  override get accNumberLabel(): string {
    return "Bank Acc. No.";
  }

  override get channelLabel(): string {
    return "Bank";
  }
}

/**
 * Union type representing either a mobile or bank contact
 * Used for type-safe handling of contact information throughout the application
 */
export type ContactInfo = MobileContactInfo | BankContactInfo;
