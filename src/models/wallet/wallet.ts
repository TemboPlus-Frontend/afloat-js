import { z } from "zod";
import {
  type CountryCode,
  ISO2CountryCodesSet,
} from "@temboplus/frontend-core";

/**
 * Zod schema definition for validating Wallet data structures.
 * Ensures data integrity for wallet objects, including runtime validation
 * of country codes against the imported ISO2CountryCodesSet.
 */
const walletSchema = z.object({
  id: z.string().min(1, { message: "Wallet ID is required." }),
  profileId: z.string().min(1, { message: "Profile ID is required." }),
  accountNo: z.string().min(1, { message: "Account number is required." }),
  accountName: z.string().min(1, { message: "Account name is required." }),
  channel: z.string().min(1, { message: "Channel is required." }),
  // Validate countryCode as a string present in the imported Set
  countryCode: z.string().default("TZ")
    .refine(
      (code) => ISO2CountryCodesSet.has(code),
      { message: "Provided country code is not a valid ISO2 code." },
    ),
  createdAt: z.string().datetime({
    message: "Creation timestamp must be a valid ISO 8601 datetime string.",
  }),
  updatedAt: z.string().datetime({
    message: "Update timestamp must be a valid ISO 8601 datetime string.",
  }),
});

/**
 * TypeScript type representing the validated data structure for a Wallet.
 * Derived from the walletSchema. Note: countryCode is inferred as string.
 */
type WalletDataType = z.infer<typeof walletSchema>;

/**
 * Represents a digital Wallet entity.
 *
 * Provides methods for creating, validating, and accessing wallet data,
 * leveraging Zod for schema validation including runtime checks for country codes.
 */
export class Wallet {
  private readonly _id: string;
  private readonly _profileId: string;
  private readonly _accountNo: string;
  private readonly _accountName: string;
  private readonly _channel: string;
  private readonly _countryCode: CountryCode;
  private readonly _createdAt: string; // Stored as ISO 8601 string
  private readonly _updatedAt: string; // Stored as ISO 8601 string

  /**
   * Retrieves the Zod schema used for Wallet validation.
   * @returns The Zod schema object for Wallet.
   */
  static get schema(): typeof walletSchema {
    return walletSchema;
  }

  /**
   * Private constructor enforces instantiation via static factory methods.
   * @param data - The validated wallet data object (countryCode is string).
   */
  private constructor(data: WalletDataType) {
    this._id = data.id;
    this._profileId = data.profileId;
    this._accountNo = data.accountNo;
    this._accountName = data.accountName;
    this._channel = data.channel;
    this._countryCode = data.countryCode as CountryCode; // Assigns the validated string
    this._createdAt = data.createdAt;
    this._updatedAt = data.updatedAt;
  }

  /**
   * Creates a new Wallet instance from provided data after validation.
   * Validation includes checking if the countryCode exists in ISO2CountryCodesSet.
   *
   * @param data - An object containing the necessary properties for a Wallet.
   * @returns A new Wallet instance if validation succeeds, otherwise undefined.
   */
  static create(data: {
    id: string;
    profileId: string;
    accountNo: string;
    accountName: string;
    channel: string;
    countryCode: string; // Expecting string, validation done by schema
    createdAt: string;
    updatedAt: string;
  }): Wallet | undefined {
    const validationResult = Wallet.schema.safeParse(data);

    if (!validationResult.success) {
      console.error(
        "Wallet data validation failed:",
        validationResult.error.flatten(),
      );
      return undefined;
    }

    // validationResult.data contains the validated data, including the countryCode string
    return new Wallet(validationResult.data);
  }

  // --- Public Accessors ---

  get id(): string {
    return this._id;
  }
  get profileId(): string {
    return this._profileId;
  }
  get accountNo(): string {
    return this._accountNo;
  }
  get accountName(): string {
    return this._accountName;
  }
  get channel(): string {
    return this._channel;
  }
  get countryCode(): CountryCode {
    return this._countryCode;
  }
  get createdAt(): string {
    return this._createdAt;
  }
  get updatedAt(): string {
    return this._updatedAt;
  }

  /**
   * Provides the creation timestamp as a Date object.
   * @returns The creation Date object.
   */
  get createdAtDate(): Date {
    return new Date(this._createdAt);
  }

  /**
   * Provides the last update timestamp as a Date object.
   * @returns The last update Date object.
   */
  get updatedAtDate(): Date {
    return new Date(this._updatedAt);
  }

  // --- Instance Methods ---

  /**
   * Creates a plain data object representation of the Wallet instance.
   * Suitable for serialization or validation.
   * @returns A plain object conforming to the WalletDataType structure.
   */
  toObject(): WalletDataType {
    return {
      id: this._id,
      profileId: this._profileId,
      accountNo: this._accountNo,
      accountName: this._accountName,
      channel: this._channel,
      countryCode: this._countryCode,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }

  /**
   * Serializes the Wallet instance into a JSON string.
   * @returns A JSON string representation of the wallet data.
   */
  toJSON(): string {
    return JSON.stringify(this.toObject());
  }

  /**
   * Validates the Wallet instance's current data against the defined schema.
   * This includes checking the countryCode against ISO2CountryCodesSet.
   * @returns True if the current instance data is valid, otherwise false.
   */
  validate(): boolean {
    const result = Wallet.schema.safeParse(this.toObject());
    if (!result.success) {
      console.warn(
        "Wallet instance validation failed:",
        result.error.flatten(),
      );
    }
    return result.success;
  }

  // --- Static Factory Methods ---

  /**
   * Creates a Wallet instance from a JSON string.
   * Performs parsing and validation, including the countryCode runtime check.
   * @param jsonString - A JSON string containing wallet data.
   * @returns A new Wallet instance if parsing and validation succeed, otherwise undefined.
   */
  static fromJSON(jsonString: string): Wallet | undefined {
    try {
      const data = JSON.parse(jsonString);
      return Wallet.from(data);
    } catch (error) {
      console.error("Error parsing wallet JSON:", error);
      return undefined;
    }
  }

  /**
   * Creates a Wallet instance from a plain JavaScript object.
   * Validates the input object using the Wallet schema, including the countryCode runtime check.
   * @param data - An object potentially containing wallet data.
   * @returns A new Wallet instance if the object is valid, otherwise undefined.
   */
  // deno-lint-ignore no-explicit-any
  static from(data: any): Wallet | undefined {
    if (!data || typeof data !== "object") {
      console.error(
        "Invalid data provided to Wallet.from: Input must be an object.",
      );
      return undefined;
    }
    // Delegate validation (including refinement) and instantiation to 'create'
    return Wallet.create({
      id: data.id,
      profileId: data.profileId,
      accountNo: data.accountNo,
      accountName: data.accountName,
      channel: data.channel,
      countryCode: data.countryCode, // Pass countryCode string
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }

  /**
   * Type guard to check if an unknown object is structurally equivalent
   * to a Wallet instance (duck typing). Includes runtime check against ISO2CountryCodesSet.
   * @param obj - The object to check.
   * @returns True if the object resembles a Wallet instance, false otherwise.
   */
  static is(obj: unknown): obj is Wallet {
    if (!obj || typeof obj !== "object") {
      return false;
    }

    const maybeWallet = obj as Record<string, unknown>;

    return (
      typeof maybeWallet.id === "string" &&
      typeof maybeWallet.profileId === "string" &&
      typeof maybeWallet.accountNo === "string" &&
      typeof maybeWallet.accountName === "string" &&
      typeof maybeWallet.channel === "string" &&
      // Check if countryCode is a string and exists in the runtime Set
      typeof maybeWallet.countryCode === "string" &&
      ISO2CountryCodesSet.has(maybeWallet.countryCode) &&
      typeof maybeWallet.createdAt === "string" &&
      typeof maybeWallet.updatedAt === "string" &&
      typeof maybeWallet.toObject === "function" &&
      typeof maybeWallet.validate === "function"
    );
  }
}
