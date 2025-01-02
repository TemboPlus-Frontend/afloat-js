import { Amount, Bank, PhoneNumber } from "@temboplus/tembo-core";
import { PAYOUT_CHANNEL, type PayoutData } from "@models/payout/index.ts";
import { PayoutSchemas } from "@models/payout/schemas.ts";
import {
  BankContactInfo,
  type ContactInfo,
  MobileContactInfo,
} from "@models/contact/index.ts";
import type {
  payoutApprovalStatus,
  PayoutApprover,
  payoutTransactionStatus,
} from "@models/payout/types.ts";
import { PAYOUT_STATUS } from "@models/payout/enums.ts";

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
  get id(): string {
    return this.data.id;
  }
  get profileId(): string {
    return this.data.profileId;
  }
  get payeeName(): string {
    return this.data.payeeName;
  }
  get channel(): string {
    return this.data.channel;
  }
  get msisdn(): string {
    return this.data.msisdn;
  }
  get amount(): Amount {
    return Amount.from(this.data.amount)!;
  }
  get description(): string {
    return this.data.description;
  }
  get notes(): string | undefined {
    return this.data.notes;
  }
  get status(): payoutTransactionStatus {
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
  get statusMessage(): string {
    return this.data.statusMessage;
  }
  get partnerReference(): string | undefined {
    return this.data.partnerReference;
  }
  get createdAt(): Date {
    return this.data.createdAt;
  }
  get updatedAt(): Date {
    return this.data.updatedAt;
  }
  get approvalStatus(): payoutApprovalStatus {
    return this.data.approvalStatus;
  }
  get createdBy(): PayoutApprover | undefined {
    return this.data.createdBy;
  }
  get actionedBy(): PayoutApprover | undefined {
    return this.data.actionedBy;
  }

  get contactInfo(): ContactInfo | undefined {
    let contactInfo: ContactInfo | undefined;

    // extracting mobile contact information
    const phone = PhoneNumber.from(this.data.msisdn);
    if (phone) {
      contactInfo = new MobileContactInfo(this.data.payeeName, phone);
    }

    // extracting bank contact information
    const isBankPayout = this.data.channel === PAYOUT_CHANNEL.BANK ||
      this.data.channel === PAYOUT_CHANNEL.CRDB_NAMED_ACC;
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
  static createSafe(data: PayoutData): Payout | null {
    try {
      return new Payout(data);
    } catch {
      return null;
    }
  }

  /**
   * Converts Payout instance to a plain object
   */
  toJSON(): PayoutData {
    return { ...this.data };
  }
}
