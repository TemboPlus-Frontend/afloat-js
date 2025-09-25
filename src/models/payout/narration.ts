import {
  BankContactInfo,
  type ContactInfo,
  MobileContactInfo,
} from "@temboplus/afloat";
import { Bank, TZPhoneNumber } from "@temboplus/frontend-core";

/** Prefix for Ecobank mobile transfer narrations */
export const ECOBANK_PREFIX = "MOBILE TRANSFER ";

/** Current format prefix for bank payout narrations */
export const BANK_NARR_PREFIX: string = "PAYOUT TO BANK";
/** Legacy format prefix for bank payout narrations */
export const LEGACY_BANK_NARR_PREFIX: string = "TO_BANK";

/** Current format prefix for mobile money payout narrations */
export const MOBILE_NARR_PREFIX: string = "PAYOUT TO MOBILE";
/** Legacy format prefix for mobile money payout narrations */
export const LEGACY_MOBILE_NARR_PREFIX: string = "TO_MOMO";

/**
 * Handles payout narration generation and parsing for the Afloat platform.
 *
 * This class provides functionality to:
 * - Generate standardized default narrations for mobile money and bank payouts
 * - Parse existing narrations to extract contact information
 * - Format narration text for different display contexts
 * - Handle both current and legacy narration formats for backward compatibility
 *
 * @example
 * ```typescript
 * // Generate default narration for a mobile contact
 * const mobileContact = new MobileContactInfo("John Doe", phoneNumber);
 * const narration = Narration.generateDefaultPayoutNarration(mobileContact);
 * // Result: "PAYOUT TO MOBILE +255123456789 JOHN DOE"
 *
 * // Parse narration to extract contact details
 * const existingNarration = new Narration("PAYOUT TO BANK CRDB 1234567890 Jane Smith");
 * const contact = existingNarration.getContactDetails();
 * ```
 */
export class Narration {
  /** The raw narration text */
  text: string;

  /**
   * Creates a new Narration instance.
   *
   * @param text - The narration text to wrap
   */
  constructor(text: string) {
    this.text = text;
  }

  /**
   * Returns a medium-length version of the narration text suitable for table columns.
   * Truncates to 47 characters + "..." if longer than 50 characters.
   *
   * @returns Truncated narration text for medium-width displays
   */
  get mediumText() {
    if (this.text.length > 50) {
      return this.text.substring(0, 47) + "...";
    }

    return this.text;
  }

  /**
   * Returns a short version of the narration text suitable for compact displays.
   * Truncates to 32 characters + "..." if longer than 35 characters.
   *
   * @returns Truncated narration text for narrow displays
   */
  get shortText() {
    if (this.text.length > 35) {
      return this.text.substring(0, 32) + "...";
    }

    return this.text;
  }

  /**
   * Generates a default payout narration based on contact information.
   * Automatically determines whether to generate mobile or bank narration based on contact type.
   *
   * @param data - Contact information (either MobileContactInfo or BankContactInfo)
   * @returns Formatted default narration string in uppercase, or empty string if contact type is unrecognized
   *
   * @example
   * ```typescript
   * const mobileContact = new MobileContactInfo("John Doe", phoneNumber);
   * const narration = Narration.generateDefaultPayoutNarration(mobileContact);
   * // Returns: "PAYOUT TO MOBILE +255123456789 JOHN DOE"
   *
   * const bankContact = new BankContactInfo("Jane Smith", bank, "1234567890");
   * const narration = Narration.generateDefaultPayoutNarration(bankContact);
   * // Returns: "PAYOUT TO BANK CRDB 1234567890 JANE SMITH"
   * ```
   */
  static generateDefaultPayoutNarration(data: ContactInfo): string {
    if (MobileContactInfo.is(data)) {
      return Narration.generateMobilePayoutNarration(data);
    } else if (BankContactInfo.is(data)) {
      return Narration.generateBankPayoutNarration(data);
    } else {
      return "";
    }
  }

  /**
   * Generates a standardized mobile money payout narration.
   * Format: "PAYOUT TO MOBILE {phone_number} {name}"
   *
   * @param data - Mobile contact information containing phone number and name
   * @returns Formatted mobile payout narration in uppercase
   *
   * @example
   * ```typescript
   * const contact = new MobileContactInfo("John Doe", phoneNumber);
   * const narration = Narration.generateMobilePayoutNarration(contact);
   * // Returns: "PAYOUT TO MOBILE +255123456789 JOHN DOE"
   * ```
   */
  static generateMobilePayoutNarration(data: MobileContactInfo): string {
    const { phoneNumber, name } = data;
    return `${MOBILE_NARR_PREFIX.trim()} ${phoneNumber.label.trim()} ${name.trim()}`.toUpperCase();
  }

  /**
   * Generates a standardized bank payout narration.
   * Format: "PAYOUT TO BANK {bank_short_name} {account_number} {account_name}"
   *
   * @param data - Bank contact information containing bank details, account number, and account name
   * @returns Formatted bank payout narration in uppercase
   *
   * @example
   * ```typescript
   * const contact = new BankContactInfo("Jane Smith", bank, "1234567890");
   * const narration = Narration.generateBankPayoutNarration(contact);
   * // Returns: "PAYOUT TO BANK CRDB 1234567890 JANE SMITH"
   * ```
   */
  static generateBankPayoutNarration(data: BankContactInfo): string {
    const { bank, accName, accNo } = data;
    return `${BANK_NARR_PREFIX.trim()} ${bank.shortName.trim()} ${accNo.trim()} ${accName.trim()}`.toUpperCase();
  }

  /**
   * Extracts contact information from the narration text.
   * Attempts to parse both bank and mobile contact details from the narration.
   *
   * @returns Parsed ContactInfo (BankContactInfo or MobileContactInfo) if successful, undefined otherwise
   *
   * @example
   * ```typescript
   * const narration = new Narration("PAYOUT TO BANK CRDB 1234567890 Jane Smith");
   * const contact = narration.getContactDetails();
   * // Returns: BankContactInfo instance with parsed details
   * ```
   */
  getContactDetails = (): ContactInfo | undefined => {
    const result1 = this.getBankContactDetails();
    const result2 = this.getMobileContactDetails();

    if (result1) return result1;
    if (result2) return result2;
  };

  /**
   * Extracts bank contact information from the narration text.
   * Handles both current format ("PAYOUT TO BANK") and legacy format ("TO_BANK").
   * Also handles Ecobank-prefixed narrations by stripping the prefix.
   *
   * Current format: "PAYOUT TO BANK {bank_name} {account_number} {account_name}"
   * Legacy format: "TO_BANK => {json_object}"
   *
   * @returns BankContactInfo if parsing is successful, undefined otherwise
   *
   * @example
   * ```typescript
   * // Current format
   * const narration = new Narration("PAYOUT TO BANK CRDB 1234567890 Jane Smith");
   * const contact = narration.getBankContactDetails();
   *
   * // Legacy format
   * const legacyNarration = new Narration('TO_BANK => {"account_number":"1234567890","account_name":"Jane Smith","swift_code":"CORUTZTZ"}');
   * const legacyContact = narration.getBankContactDetails();
   * ```
   */
  getBankContactDetails = (): BankContactInfo | undefined => {
    let narr = this.text.trim();

    if (narr.startsWith(ECOBANK_PREFIX)) {
      narr = narr.substring(ECOBANK_PREFIX.length);
    }

    try {
      // Handle legacy format: "TO_BANK => {json}"
      if (narr.startsWith(LEGACY_BANK_NARR_PREFIX)) {
        const json = narr.split("=>")[1].trim();
        const map = JSON.parse(json) as Record<string, string>;
        const accNo = map["account_number"];
        const accName = map["account_name"];
        const code = map["swift_code"];

        const bank = Bank.fromSWIFTCode(code);

        if (accNo && accName && bank) {
          return new BankContactInfo(accName, bank, accNo);
        }
      }

      // Handle current format: "PAYOUT TO BANK {bank} {accNo} {accName}"
      if (narr.startsWith(BANK_NARR_PREFIX)) {
        const data = narr.replace(BANK_NARR_PREFIX, "").trim().split(" ");
        const bank = Bank.fromBankName(data[0]);
        const accNo = data[1];
        const accName = data.slice(2).map(capitalizeFirstLetter).join(" ");

        if (accName && accNo && bank) {
          return new BankContactInfo(accName, bank, accNo);
        }
      }
    } catch (_) {
      return undefined;
    }
  };

  /**
   * Extracts mobile contact information from the narration text.
   * Handles both current format ("PAYOUT TO MOBILE") and legacy format ("TO_MOMO").
   * Also handles Ecobank-prefixed narrations by stripping the prefix.
   *
   * Current format: "PAYOUT TO MOBILE {phone_number} {name}"
   * Legacy format: "TO_MOMO => {json_object}"
   *
   * @returns MobileContactInfo if parsing is successful, undefined otherwise
   *
   * @example
   * ```typescript
   * // Current format
   * const narration = new Narration("PAYOUT TO MOBILE +255123456789 John Doe");
   * const contact = narration.getMobileContactDetails();
   *
   * // Legacy format
   * const legacyNarration = new Narration('TO_MOMO => {"phone_number":"+255123456789","username":"John Doe"}');
   * const legacyContact = narration.getMobileContactDetails();
   * ```
   */
  getMobileContactDetails = (): MobileContactInfo | undefined => {
    let narr = this.text.trim();

    if (narr.startsWith(ECOBANK_PREFIX)) {
      narr = narr.substring(ECOBANK_PREFIX.length);
    }

    try {
      // Handle legacy format: "TO_MOMO => {json}"
      if (narr.startsWith(LEGACY_MOBILE_NARR_PREFIX)) {
        const json = narr.split("=>")[1].trim();
        const map = JSON.parse(json) as Record<string, string>;
        const phoneNumber = TZPhoneNumber.from(map["phone_number"]);
        let username = map["username"];
        if (username === undefined) username = "";

        // Clean up username: remove extra spaces and capitalize each word
        let names = username.split(" ");
        names = names.filter((n) => n.trim().length > 0);
        username = names.map(capitalizeFirstLetter).join(" ");

        if (phoneNumber && username) {
          return new MobileContactInfo(username, phoneNumber);
        }
      }

      // Handle current format: "PAYOUT TO MOBILE {phone} {username}"
      if (narr.startsWith(MOBILE_NARR_PREFIX)) {
        const data = narr.replace(MOBILE_NARR_PREFIX, "").trim().split(" ");
        const phone = TZPhoneNumber.from(data[0]);
        const username = data.slice(1).map(capitalizeFirstLetter).join(" ");

        if (phone && username) {
          return new MobileContactInfo(username, phone);
        }
      }
    } catch (_) {
      return undefined;
    }
  };
}

/**
 * Capitalizes the first letter of a string and converts the rest to lowercase.
 * Used for standardizing name formatting in narrations.
 *
 * @param str - The string to capitalize
 * @returns String with first letter capitalized and rest in lowercase
 *
 * @example
 * ```typescript
 * capitalizeFirstLetter("john") // Returns: "John"
 * capitalizeFirstLetter("SMITH") // Returns: "Smith"
 * capitalizeFirstLetter("") // Returns: ""
 * ```
 */
function capitalizeFirstLetter(str: string): string {
  if (str.length === 0) {
    return str; // Return an empty string if input is empty
  }

  const firstLetter = str.charAt(0).toUpperCase();
  const restOfString = str.slice(1).toLowerCase();

  return firstLetter + restOfString;
}
