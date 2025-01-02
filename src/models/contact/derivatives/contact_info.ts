import type { ContactType } from "@models/contact/index.ts";
import { type Bank, PhoneNumber } from "@temboplus/tembo-core";
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
      validateBankAccNo(this.accNo);
  }
}

/**
 * Union type of possible contact detail types.
 */
export type ContactInfo = MobileContactInfo | BankContactInfo;
