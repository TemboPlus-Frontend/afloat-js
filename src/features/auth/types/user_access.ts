export interface UserAccess {
  canApprovePayout: boolean;
  canCreatePayout: boolean;
  canViewPayouts: boolean;

  canCreateRecipient: boolean;
  canEditRecipient: boolean;
  canDeleteRecipient: boolean;
  canViewRecipients: boolean;

  canViewBalance: boolean;
  canViewStatement: boolean;
}
