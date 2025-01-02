import type { ContactType } from "@models/contact/index.ts";
import {
  type Bank,
  MobileNumberFormat,
  PhoneNumber,
} from "@temboplus/tembo-core";
import {
  validateBankAccName,
  validateBankAccNo,
} from "@models/contact/validation.ts";

/**
 * Base class for contact details with common validation functionality.
 */
abstract class BaseContactInfo {
  public readonly type: ContactType;

  constructor(type: ContactType) {
    this.type = type;
  }

  abstract validate(): boolean;
  abstract getChannelLabel(size?: "short" | "long"): string;

  /**
   * Resolves to name for mobile contacts, bank accout name for bank contacts
   */
  abstract get displayName(): string;

  /**
   * Resolves to phone number for mobile contacts, bank accout number for bank contacts
   */
  abstract get accNumber(): string;
}

/**
 * Represents mobile contact-specific details.
 * @extends BaseContactInfo
 */
export class MobileContactInfo extends BaseContactInfo {
  constructor(
    public readonly name: string,
    public readonly phoneNumber: PhoneNumber,
  ) {
    super("Mobile");
  }

  validate(): boolean {
    return this.phoneNumber !== undefined &&
      PhoneNumber.validate(this.phoneNumber.compactNumber) &&
      this.name.length > 0;
  }

  override get displayName(): string {
    return name;
  }

  override get accNumber(): string {
    return this.phoneNumber.getNumberWithFormat(MobileNumberFormat.s255);
  }

  override getChannelLabel(size?: "short" | "long"): string {
    if (size === "short") {
      return this.phoneNumber.telecom.company;
    }

    return `${
      this.phoneNumber.getNumberWithFormat(MobileNumberFormat.s255)
    } (${this.phoneNumber.telecom.company})`;
  }
}

/**
 * Represents bank contact-specific details.
 * @extends BaseContactInfo
 */
export class BankContactInfo extends BaseContactInfo {
  constructor(
    public readonly accName: string,
    public readonly bank: Bank,
    public readonly accNo: string,
  ) {
    super("Bank");
  }

  validate(): boolean {
    return this.bank.validate() &&
      validateBankAccName(this.accName) &&
      validateBankAccNo(this.accNumber);
  }

  override get displayName(): string {
    return this.accName;
  }

  override get accNumber(): string {
    return this.accNumber;
  }

  override getChannelLabel(size?: "short" | "long"): string {
    if (size === "long") {
      return `${this.accNumber} (${this.bank.shortName})`;
    }

    return this.bank.shortName;
  }
}

/**
 * Union type of possible contact detail types.
 */
export type ContactInfo = MobileContactInfo | BankContactInfo;
