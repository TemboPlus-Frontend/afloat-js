import { Payout, PayoutSchemas } from "@models/payout/index.ts";

/**
 * Since runtime instanceof checks are unreliable, this validator checks if an object
 * is a valid Payout instance by verifying it has a data property matching the PayoutData structure.
 */
export class PayoutValidator {
  /**
   * @param obj: unknown
   *
   * Returns true if the object is a valid Payout instance
   */
  static isValidPayoutObject(obj: unknown): obj is Payout {
    if (!obj || typeof obj !== "object") return false;
    if (!("data" in obj)) return false;

    const result = PayoutSchemas.payoutData.safeParse(obj.data);
    if (!result.success) return false;

    const payout = Payout.createSafe(result.data);
    return payout !== null;
  }
}
