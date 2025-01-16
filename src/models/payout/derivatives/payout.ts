import { Amount, Bank, PhoneNumber } from "@temboplus/frontend-core";
import type { PayoutApprover, PayoutData } from "@models/payout/index.ts";
import { PayoutSchemas } from "@models/payout/schemas.ts";
import {
  BankContactInfo,
  type ContactInfo,
  MobileContactInfo,
} from "@models/contact/index.ts";
import { type PAYOUT_APPROVAL_STATUS, PAYOUT_STATUS } from "../status.ts";
import { createPayoutChannelCode } from "@models/payout/channel.ts";

/**
 * Payout class that wraps the Zod schema and provides additional functionality
 */
export class Payout {
  private readonly data: PayoutData;

  /**
   * Private constructor - use static methods to create instances
   */
  private constructor(data: PayoutData) {
    this.data = PayoutSchemas.payoutData.parse(data);
  }

  // Getters for all properties
  /** Unique identifier for the payout */
  get id(): string {
    return this.data.id;
  }

  /** Profile identifier associated with this payout */
  get profileId(): string {
    return this.data.profileId;
  }

  /** Name of the payee/recipient */
  get payeeName(): string {
    return this.data.payeeName;
  }

  /** Payment channel used for this payout */
  get channel(): string {
    return this.data.channel;
  }

  /** Mobile number or bank account identifier */
  get msisdn(): string {
    return this.data.msisdn;
  }

  /**
   * Amount to be paid out
   * @returns {Amount} Amount object representing the payout value
   */
  get amount(): Amount {
    return Amount.from(this.data.amount)!;
  }

  /** Description of the payout purpose */
  get description(): string {
    return this.data.description;
  }

  /** Optional additional notes about the payout */
  get notes(): string | undefined {
    return this.data.notes;
  }

  /**
   * Current status of the payout
   * Derived from both approval status and transaction status:
   * - Returns REJECTED if approval status is "Rejected"
   * - Returns FAILED if approved but transaction failed
   * - Returns PAID if approved and transaction succeeded
   * - Returns PENDING if awaiting approval
   * - Falls back to transaction status in other cases
   *
   * @returns {PAYOUT_STATUS} Current status of the payout
   * @see {@link PAYOUT_STATUS} for all possible status values
   */
  get status(): PAYOUT_STATUS {
    if (this.data.approvalStatus === "Rejected") {
      return PAYOUT_STATUS.REJECTED;
    }
    if (this.data.approvalStatus === "Approved") {
      if (this.data.status === "FAILED") {
        return PAYOUT_STATUS.FAILED;
      }
      return PAYOUT_STATUS.PAID;
    }
    if (this.data.approvalStatus === "Pending") {
      return PAYOUT_STATUS.PENDING;
    }

    return this.data.status;
  }

  /** Status message providing details about current state */
  get statusMessage(): string {
    return this.data.statusMessage;
  }

  /** Optional reference ID from payment partner */
  get partnerReference(): string | undefined {
    return this.data.partnerReference;
  }

  /** Timestamp when payout was created */
  get createdAt(): Date {
    return this.data.createdAt;
  }

  /** Timestamp when payout was last updated */
  get updatedAt(): Date {
    return this.data.updatedAt;
  }

  /** Current approval status of the payout */
  get approvalStatus(): PAYOUT_APPROVAL_STATUS {
    return this.data.approvalStatus;
  }

  /** Information about who created the payout */
  get createdBy(): PayoutApprover | undefined {
    return this.data.createdBy;
  }

  /** Information about who last actioned the payout */
  get actionedBy(): PayoutApprover | undefined {
    return this.data.actionedBy;
  }

  /**
   * Constructs contact information based on payout channel
   *
   * @returns {ContactInfo | undefined} Contact information object:
   * - MobileContactInfo for mobile money payouts
   * - BankContactInfo for bank transfers
   * - undefined if contact info cannot be constructed
   *
   * @remarks
   * For bank payouts, expects msisdn in format "SWIFTCODE:ACCOUNTNUMBER"
   *
   * @example
   * ```ts
   * // Mobile payout
   * payout.contactInfo // Returns MobileContactInfo with phone details
   *
   * // Bank payout
   * payout.contactInfo // Returns BankContactInfo with bank and account details
   * ```
   */
  get contactInfo(): ContactInfo | undefined {
    let contactInfo: ContactInfo | undefined;

    // extracting mobile contact information
    const phone = PhoneNumber.from(this.data.msisdn);
    if (phone) {
      contactInfo = new MobileContactInfo(this.data.payeeName, phone);
    }

    // extracting bank contact information
    const isBankPayout = this.data.channel === createPayoutChannelCode.bank() ||
      this.data.channel === createPayoutChannelCode.verto();
    if (isBankPayout) {
      // getting bank information from payout msisdn
      const text = this.data.msisdn.trim().split(":");

      try {
        const swiftcode = text[0];
        const accNo = text[1];

        const bank = Bank.fromSWIFTCode(swiftcode);
        if (bank) {
          contactInfo = new BankContactInfo(this.data.payeeName, bank, accNo);
        }
      } catch (_) {
        //
      }
    }

    return contactInfo;
  }

  /**
   * Creates a Payout instance from raw data
   * @throws {ZodError} if validation fails
   */
  static create(data: PayoutData): Payout {
    return new Payout(data);
  }

  /**
   * Creates multiple Payout instances from an array of raw data
   * @throws {ZodError} if validation fails for any item
   */
  static createMany(dataArray: PayoutData[]): Payout[] {
    return dataArray.map((data) => new Payout(data));
  }

  /**
   * Creates a Payout instance from raw data without throwing
   * @returns {Payout | null} Payout instance or null if validation fails
   */
  public static createSafe(data: PayoutData): Payout | null {
    try {
      return new Payout(data);
    } catch {
      return null;
    }
  }

  /**
   * Checks if an unknown value contains valid data to construct a Payout instance.
   * This is useful when validating raw data structures before instantiation.
   *
   * @param {unknown} obj - The value containing potential payout data
   * @returns {obj is Payout} Type predicate indicating if a Payout can be constructed
   *
   * @example
   * ```typescript
   * const rawData = await fetchPayoutData();
   * if (Payout.canConstruct(rawData)) {
   *   const payout = Payout.create(rawData);
   *   // TypeScript knows payout is valid here
   *   console.log(payout.amount.toString());
   * }
   * ```
   *
   * @throws {never} This method never throws errors
   *
   * @remarks
   * This method performs strict validation against the {@link PayoutData} schema
   */
  public static canConstruct(obj: unknown): obj is Payout {
    if (!obj || typeof obj !== "object") return false;

    const result = PayoutSchemas.payoutData.safeParse(obj);
    if (!result.success) return false;

    const payout = Payout.createSafe(result.data);
    return payout !== null;
  }

  /**
   * Validates if an unknown value is a Payout instance.
   * This is a runtime type guard that ensures proper object structure and data validity.
   *
   * @param {unknown} obj - The value to validate
   * @returns {obj is Payout} Type predicate indicating if the value is a valid Payout
   *
   * @example
   * ```typescript
   * const maybePayout = getPayoutFromCache();
   * if (Payout.is(maybePayout)) {
   *   // TypeScript knows maybePayout is a Payout here
   *   console.log(maybePayout.status);
   * }
   * ```
   *
   * @throws {never} This method never throws errors
   *
   * @remarks
   * This method performs a complete structural validation:
   * 1. Checks if the value is an object
   * 2. Verifies presence of internal data property
   * 3. Validates the data against PayoutData schema
   * 4. Ensures the object is a proper Payout instance
   *
   * Use this method when:
   * - Validating cached Payout instances
   * - Checking serialized Payout objects
   * - Verifying API responses
   * - Type narrowing in conditional blocks
   */
  public static is(obj: unknown): obj is Payout {
    if (!obj || typeof obj !== "object") return false;
    if (!("data" in obj)) return false;

    return Payout.canConstruct(obj.data);
  }

  /**
   * Converts Payout instance to a plain object
   */
  public toJSON(): PayoutData {
    return { ...this.data };
  }
}
