export enum PROFILE_PERMISSION {
  GET_CURRENT = "profile.getCurrent",
  UPDATE = "profile.update",
}

export enum CONTACT_PERMISSION {
  FIND_BY_ID = "contact.findById",
  FIND_ALL = "contact.findAll",
  CREATE = "contact.create",
  UPDATE = "contact.update",
  DELETE = "contact.delete",
}

export enum PAYMENT_PERMISSION {
  FIND_BY_ID = "payment.findById",
  FIND_ALL = "payment.findAll",
  CREATE = "payment.create",
}

export enum PAYOUT_PERMISSION {
  FIND_BY_ID = "payout.findById",
  FIND_ALL = "payout.findAll",
  CREATE = "payout.create",
  APPROVE = "payout.approve",
}

export enum TRANSFER_PERMISSION {
  FIND_BY_ID = "transfer.findById",
  FIND_ALL = "transfer.findAll",
  CREATE = "transfer.create",
  APPROVE = "transfer.approve",
}

export enum WALLET_PERMISSION {
  GET_BALANCE = "wallet.getBalance",
  GET_STATEMENT = "wallet.getStatement",
}

export type Permission =
  | PROFILE_PERMISSION
  | TRANSFER_PERMISSION
  | WALLET_PERMISSION
  | PAYMENT_PERMISSION
  | PAYOUT_PERMISSION
  | CONTACT_PERMISSION;

export interface PermissionError {
  requiredPermissions: Permission[];
  message: string;
}

// Type guard for PermissionError
export function isInstanceOfPermissionError(
  obj: unknown,
): obj is PermissionError {
  return (
    obj != null &&
    typeof obj === "object" &&
    "requiredPermissions" in obj &&
    "message" in obj &&
    typeof obj.message === "string"
  );
}
