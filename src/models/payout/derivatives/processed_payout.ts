import {
  BankContactInfo,
  type ContactInfo,
  MobileContactInfo,
} from "@models/contact/index.ts";
import { Amount, Bank, PhoneNumber } from "@temboplus/tembo-core";
import type { Payout } from "@models/payout/index.ts";
import { PAYOUT_CHANNEL } from "@models/payout/enums.ts";

export class ProcessedPayout {
  constructor(
    public readonly id: string,
    public readonly contactInfo: ContactInfo | undefined,
    public readonly amount: Amount,
    public readonly sourceRecord: Payout,
  ) {
  }

  static from(payout: Payout): ProcessedPayout | undefined {
    let contactInfo: ContactInfo | undefined;

    // extracting mobile contact information
    const phone = PhoneNumber.from(payout.msisdn);
    if (phone) {
      contactInfo = new MobileContactInfo(payout.payeeName, phone);
    }

    // extracting bank contact information
    const isBankPayout = payout.channel === PAYOUT_CHANNEL.BANK ||
      payout.channel === PAYOUT_CHANNEL.CRDB_NAMED_ACC;
    if (isBankPayout) {
      // getting bank information from payout msisdn
      const text = payout.msisdn.trim().split(":");

      try {
        const swiftcode = text[0];
        const accNo = text[1];

        const bank = Bank.fromSWIFTCode(swiftcode);
        if (bank) {
          contactInfo = new BankContactInfo(payout.payeeName, bank, accNo);
        }
      } catch (_) {
        //
      }
    }

    const amount = Amount.from(payout.amount);

    return new ProcessedPayout(payout.id, contactInfo, amount!, payout);
  }

  get transactionStatus() {
    if (this.sourceRecord.approvalStatus === "Rejected") {
      return "REJECTED";
    }
    if (this.sourceRecord.approvalStatus === "Approved") {
      if (this.sourceRecord.status === "FAILED") {
        return "FAILED";
      }
      return "PAID";
    }
    if (this.sourceRecord.approvalStatus === "Pending") {
      return "PENDING";
    }

    return this.sourceRecord.status;
  }
}
