import { z } from "zod";

/**
 * Helper function to make a field optional with undefined
 * Transforms null values to undefined for consistency
 * @param schema - The Zod schema to make optional
 * @returns A schema that only allows string or undefined (no null)
 */
const makeOptional = <T extends z.ZodType>(schema: T) =>
  schema.optional().transform((val) => val ?? undefined);

/**
 * Schema definition for a statement entry.
 */
const statementEntrySchema = z.object({
  accountNo: makeOptional(z.string()),
  debitOrCredit: z.string().min(1, "Transaction type is required"),
  tranRefNo: z.string().min(1, "Transaction reference is required"),
  narration: z.string().min(1, "Transaction description is required"),
  txnDate: z.coerce.date({
    errorMap: () => ({ message: "Invalid transaction date format" }),
  }),
  valueDate: z.coerce.date({
    errorMap: () => ({ message: "Invalid value date format" }),
  }),
  amountCredited: z.number().min(0, "Credited amount must be non-negative"),
  amountDebited: z.number().min(0, "Debited amount must be non-negative"),
  balance: z.number(),
});

type WalletStatementEntryDTO = z.infer<typeof statementEntrySchema>;

/**
 * Represents a single entry in a Wallet's statement history.
 *
 * This class provides methods for creating, validating, and accessing statement entry data.
 * It integrates with the Zod schema validation for data integrity.
 */
export class WalletStatementEntry {
  private _accountNo?: string;
  private _debitOrCredit: string;
  private _tranRefNo: string;
  private _narration: string;
  private _txnDate: Date;
  private _valueDate: Date;
  private _amountCredited: number;
  private _amountDebited: number;
  private _balance: number;

  /**
   * Gets the statement entry schema used for validation.
   */
  static get schema() {
    return statementEntrySchema;
  }

  /**
   * Private constructor to enforce use of static factory methods.
   * Assumes data is already validated and dates are Date objects.
   * @param data - Object containing statement entry information conforming to WalletStatementItem.
   */
  private constructor(data: WalletStatementEntryDTO) {
    this._accountNo = data.accountNo;
    this._debitOrCredit = data.debitOrCredit;
    this._tranRefNo = data.tranRefNo;
    this._narration = data.narration;
    this._txnDate = data.txnDate; // Should be Date object from validation
    this._valueDate = data.valueDate; // Should be Date object from validation
    this._amountCredited = data.amountCredited;
    this._amountDebited = data.amountDebited;
    this._balance = data.balance;
  }

  /**
   * Creates a new WalletStatementEntry instance after validating the input data.
   * Handles date coercion via the schema.
   *
   * @param data - Object containing statement entry information. Dates can be strings or Date objects.
   * @returns A new WalletStatementEntry instance, or undefined if validation fails.
   */
  static create(data: {
    accountNo?: string | null; // Allow null input, schema transforms to undefined
    cbaRefNo?: string | null; // Allow null input, schema transforms to undefined
    debitOrCredit: string;
    tranRefNo: string;
    narration: string;
    txnDate: string | Date; // Allow string or Date input
    valueDate: string | Date; // Allow string or Date input
    amountCredited: number;
    amountDebited: number;
    balance: number;
  }): WalletStatementEntry | undefined {
    const validationResult = WalletStatementEntry.schema.safeParse(data);

    if (!validationResult.success) {
      console.error(
        "WalletStatementEntry data validation failed:",
        validationResult.error.flatten(),
      );
      return undefined;
    }

    // Use validated data (dates are coerced to Date objects, optional strings handled)
    return new WalletStatementEntry(validationResult.data);
  }

  // --- Getters ---
  get accountNo(): string | undefined {
    return this._accountNo;
  }
  get debitOrCredit(): string {
    return this._debitOrCredit;
  }
  get tranRefNo(): string {
    return this._tranRefNo;
  }
  get narration(): string {
    return this._narration;
  }
  get txnDate(): Date {
    return this._txnDate;
  }
  get valueDate(): Date {
    return this._valueDate;
  }
  get amountCredited(): number {
    return this._amountCredited;
  }
  get amountDebited(): number {
    return this._amountDebited;
  }
  get balance(): number {
    return this._balance;
  }

  /**
   * Creates a plain object representation of the statement entry for validation or serialization.
   * @returns A plain object matching the WalletStatementItem interface.
   */
  toObject(): WalletStatementEntryDTO {
    return {
      accountNo: this._accountNo,
      debitOrCredit: this._debitOrCredit,
      tranRefNo: this._tranRefNo,
      narration: this._narration,
      txnDate: this._txnDate,
      valueDate: this._valueDate,
      amountCredited: this._amountCredited,
      amountDebited: this._amountDebited,
      balance: this._balance,
    };
  }

  /**
   * Converts the statement entry to a JSON string.
   * Dates will be serialized to ISO strings automatically by JSON.stringify.
   * @returns A JSON string representation of the statement entry.
   */
  toJSON(): string {
    return JSON.stringify(this.toObject());
  }

  /**
   * Validates the current statement entry instance data against the Zod schema.
   * @returns True if the statement entry instance data is valid, false otherwise.
   */
  validate(): boolean {
    const result = WalletStatementEntry.schema.safeParse(this.toObject());
    if (!result.success) {
      console.warn(
        "WalletStatementEntry instance validation failed:",
        result.error.flatten(),
      );
    }
    return result.success;
  }

  /**
   * Creates a WalletStatementEntry instance from a JSON string.
   * Validates the data after parsing, including date coercion.
   * @param jsonString - JSON string containing statement entry data.
   * @returns A new WalletStatementEntry instance, or undefined if parsing or validation fails.
   */
  static fromJSON(jsonString: string): WalletStatementEntry | undefined {
    try {
      const data = JSON.parse(jsonString);
      // Dates will be strings here, 'create' handles validation and coercion
      return WalletStatementEntry.from(data);
    } catch (error) {
      console.error("Error parsing statement entry JSON:", error);
      return undefined;
    }
  }

  /**
   * Creates a WalletStatementEntry instance from a plain object.
   * Validates the data using the schema, including date coercion.
   * @param data - Object containing statement entry data. Dates can be strings or Date objects.
   * @returns A new WalletStatementEntry instance, or undefined if the object is invalid.
   */
  // deno-lint-ignore no-explicit-any
  static from(data: any): WalletStatementEntry | undefined {
    if (!data || typeof data !== "object") {
      console.error(
        "Invalid data provided to WalletStatementEntry.from: not an object or null.",
      );
      return undefined;
    }
  
    // Use the create method which includes validation and date coercion
    return WalletStatementEntry.create({
      accountNo: data.accountNo,
      debitOrCredit: data.debitOrCredit,
      tranRefNo: data.tranRefNo,
      narration: data.narration,
      txnDate: data.txnDate, // Pass potentially string date
      valueDate: data.valueDate, // Pass potentially string date
      amountCredited: data.amountCredited,
      amountDebited: data.amountDebited,
      balance: data.balance,
    });
  }

  /**
   * Type guard to check if an unknown object is a valid WalletStatementEntry instance.
   * Performs structural checks (duck typing).
   * @param obj - The object to check.
   * @returns Type predicate indicating if the object is a WalletStatementEntry instance.
   */
  static is(obj: unknown): obj is WalletStatementEntry {
    if (!obj || typeof obj !== "object") return false;

    const maybeEntry = obj as WalletStatementEntry;
    return (
      (typeof maybeEntry.accountNo === "string" ||
        maybeEntry.accountNo === undefined) &&
      typeof maybeEntry.debitOrCredit === "string" &&
      typeof maybeEntry.tranRefNo === "string" &&
      typeof maybeEntry.narration === "string" &&
      maybeEntry.txnDate instanceof Date && // Check for Date object
      maybeEntry.valueDate instanceof Date && // Check for Date object
      typeof maybeEntry.amountCredited === "number" &&
      typeof maybeEntry.amountDebited === "number" &&
      typeof maybeEntry.balance === "number" &&
      typeof maybeEntry.toObject === "function" && // Check for a key method
      typeof maybeEntry.validate === "function"
    );
  }
}
