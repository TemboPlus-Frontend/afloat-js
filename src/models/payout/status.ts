/**
 * Represents the current status of a payout transaction.
 * @enum {string}
 * @readonly
 */
export enum PAYOUT_STATUS {
  /** Payout is awaiting processing */
  PENDING = "PENDING",
  /** Payout has been successfully processed */
  PAID = "PAID",
  /** Payout processing has failed */
  FAILED = "FAILED",
  /** Payout has been rejected */
  REJECTED = "REJECTED",
  /** Payout has been initially created but not yet processed */
  CREATED = "CREATED",
}

/**
 * Represents the approval status for payouts that require authorization.
 * @enum {string}
 * @readonly
 */
export enum PAYOUT_APPROVAL_STATUS {
  /** Payout is awaiting approval decision */
  PENDING = "Pending",
  /** Payout has been approved */
  APPROVED = "Approved",
  /** Payout has been rejected during approval process */
  REJECTED = "Rejected",
}
