import type { ContactType } from "@models/contact/index.ts";
import {
  type Bank,
  MobileNumberFormat,
  PhoneNumber,
} from "@temboplus/tembo-core";
import {
  validateAccName,
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

  /**
   * Resolves to name for mobile contacts, bank accout name for bank contacts
   */
  abstract get displayName(): string;

  /**
   * Resolves to phone number for mobile contacts, bank accout number for bank contacts
   */
  abstract get accNumber(): string;

  /**
   * Resolves to telecom company for mobile contacts, bank short name for bank contacts
   */
  abstract get channel(): string;

  abstract get displayNameLabel(): string;

  abstract get accNumberLabel(): string;

  abstract get channelLabel(): string;
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
    return this.name;
  }

  override get accNumber(): string {
    return this.phoneNumber.getNumberWithFormat(MobileNumberFormat.s255);
  }

  override get channel(): string {
    return this.phoneNumber.telecom.company;
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
      validateAccName(this.accName) &&
      validateBankAccNo(this.accNumber);
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
 * Union type of possible contact detail types.
 */
export type ContactInfo = MobileContactInfo | BankContactInfo;
