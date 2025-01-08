import type { PhoneNumber } from "@jsr/temboplus__tembo-core";
import type { PayoutChannelCode } from "@models/payout/types.ts";

export const createPayoutChannelCode = {
  bank: () => "TZ-BANK-B2C" as const,
  verto: () => "TZ-VERTO-B2C" as const,
  mobile: (phoneNumber: PhoneNumber) =>
    `TZ-${phoneNumber.telecom.label.toUpperCase()}-B2C` as PayoutChannelCode,
};
