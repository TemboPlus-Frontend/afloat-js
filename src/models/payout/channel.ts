import { NetworkOperator, type TZPhoneNumber } from "@temboplus/frontend-core";

/**
 * Represents the available channels through which payouts can be processed.
 * @enum {string}
 * @readonly
 */
export enum PAYOUT_CHANNEL {
  /** Payment processed through mobile money services */
  MOBILE = "Mobile",
  /** Payment processed through traditional banking channels */
  BANK = "Bank",
  /** Payment processed through CRDB named account */
  CRDB_NAMED_ACC = "CRDB_NAMED_ACC",
}

/**
 * Valid payout channel codes that can be used in the system
 *
 * @remarks
 * - `TZ-BANK-B2C`: Code for bank transfers
 * - `TZ-VERTO-B2C`: Code for Verto transfers
 * - `TZ-${telecom}-B2C`: Pattern for mobile money transfers where the telecom company is the provider code
 *
 * @see {@link createPayoutChannelCode} for functions to generate valid codes
 */
export type PayoutChannelCode =
  | "TZ-BANK-B2C"
  | "TZ-VERTO-B2C"
  | `TZ-${string}-B2C`;

/**
 * Utility functions to create standardized payout channel codes
 *
 * @example
 * ```ts
 * // Create bank channel code
 * const bankCode = createPayoutChannelCode.bank(); // Returns "TZ-BANK-B2C"
 *
 * // Create mobile channel code
 * const mobileCode = createPayoutChannelCode.mobile(phoneNumber); // Returns "TZ-VODACOM-B2C" for Vodacom number
 * ```
 */
export const createPayoutChannelCode = {
  /**
   * Creates a bank transfer channel code
   * @returns {"TZ-BANK-B2C"} Standard bank transfer code
   */
  bank: (): "TZ-BANK-B2C" => "TZ-BANK-B2C" as const,

  /**
   * Creates a Verto transfer channel code
   * @returns {"TZ-VERTO-B2C"} Standard Verto transfer code
   */
  verto: (): "TZ-VERTO-B2C" => "TZ-VERTO-B2C" as const,

  /**
   * Creates a mobile money channel code based on the telecom provider
   * @param {TZPhoneNumber} phoneNumber - Phone number object containing telecom information
   * @returns {PayoutChannelCode} Channel code in format "TZ-{TELECOM}-B2C"
   *
   * @see {@link TZPhoneNumber} from "@jsr/temboplus__tembo-core" for phone number structure
   */
  mobile: function (phoneNumber: TZPhoneNumber): PayoutChannelCode {
    //! fix: Channeling all Vodacom numbers to Tigo. Request from Mr. Tesha to solve some specific problem
    if (phoneNumber.networkOperator.id === NetworkOperator.VODACOM) {
      return `TZ-${NetworkOperator.TIGO.toString().toUpperCase()}-B2C` as PayoutChannelCode;
    }
    return `TZ-${phoneNumber.networkOperator.id.toString().toUpperCase()}-B2C` as PayoutChannelCode;
  },
};
