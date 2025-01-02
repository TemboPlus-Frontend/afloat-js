/**
 * All Afloat Permissions
 */
export const Permissions = {
  Profile: {
    ViewCurrent: "profile.getCurrent",
    Update: "profile.update",
  },
  Contact: {
    View: "contact.findById",
    List: "contact.findAll",
    Create: "contact.create",
    Update: "contact.update",
    Delete: "contact.delete",
  },
  Payment: {
    View: "payment.findById",
    List: "payment.findAll",
    Create: "payment.create",
  },
  Payout: {
    View: "payout.findById",
    List: "payout.findAll",
    Create: "payout.create",
    Approve: "payout.approve",
  },
  Transfer: {
    View: "transfer.findById",
    List: "transfer.findAll",
    Create: "transfer.create",
    Approve: "transfer.approve",
  },
  Wallet: {
    ViewBalance: "wallet.getBalance",
    ViewStatement: "wallet.getStatement",
  },
} as const; // Make it deeply readonly

/**
 * Permission Type
 */
export type Permission =
  | typeof Permissions.Profile[keyof typeof Permissions.Profile]
  | typeof Permissions.Contact[keyof typeof Permissions.Contact]
  | typeof Permissions.Payment[keyof typeof Permissions.Payment]
  | typeof Permissions.Payout[keyof typeof Permissions.Payout]
  | typeof Permissions.Transfer[keyof typeof Permissions.Transfer]
  | typeof Permissions.Wallet[keyof typeof Permissions.Wallet];

