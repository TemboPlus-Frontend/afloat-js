export enum PAYOUT_CHANNEL {
  MOBILE = "Mobile",
  BANK = "Bank",
  CRDB_NAMED_ACC = "CRDB_NAMED_ACC",
}

export enum PAYOUT_STATUS {
  PENDING = "PENDING",
  PAID = "PAID",
  FAILED = "FAILED",
  REJECTED = "REJECTED",
  CREATED = "CREATED",
}

export enum PAYOUT_APPROVAL_STATUS {
  PENDING = "Pending",
  APPROVED = "Approved",
  REJECTED = "Rejected",
}
