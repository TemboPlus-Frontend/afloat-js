import { z } from "zod";
import { PhoneNumber } from "@temboplus/frontend-core";

/**
 * Type definition for profile schema using Zod.
 * This type helper ensures type safety when implementing the actual schema.
 */
type ProfileZodSchemaType = z.ZodObject<{
  id: z.ZodString;
  firstName: z.ZodNullable<z.ZodOptional<z.ZodString>>;
  lastName: z.ZodNullable<z.ZodOptional<z.ZodString>>;
  displayName: z.ZodString;
  phone: z.ZodNullable<z.ZodOptional<z.ZodString>>;
  accountNo: z.ZodString;
  email: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}>;

/**
 * Zod schema for validating user profile data.
 * Defines validation rules and constraints for each profile field.
 *
 * @const {ProfileType}
 *
 * @property {string} id - Unique identifier for the profile
 * @property {string | null | undefined} firstName - User's first name, can be null or undefined
 * @property {string | null | undefined} lastName - User's last name, can be null or undefined
 * @property {string} displayName - User's display name
 * @property {string | null | undefined} phone - User's contact phone number, can be null or undefined
 * @property {string} accountNo - User's account number
 * @property {string | null | undefined} email - User's email address, can be null or undefined
 */
export const profileSchema: ProfileZodSchemaType = z.object({
  id: z.string(),
  firstName: z.string().optional().nullable(),
  lastName: z.string().optional().nullable(),
  displayName: z.string(),
  phone: z.string().optional().nullable(),
  accountNo: z.string().min(1),
  email: z.string().email().optional().nullable(),
});

/**
 * TypeScript type representing a validated user profile.
 * Use this type for profile instances that have been validated against the schema.
 */
export type ProfileType = z.infer<typeof profileSchema>;

/**
 * Represents a user profile in the system.
 *
 * This class provides methods for creating, validating, and manipulating user profile data.
 * It integrates with the Zod schema validation for data integrity.
 */
export class Profile {
  /** Unique identifier for the profile */
  private _id: string;
  /** User's first name */
  private _firstName?: string | null;
  /** User's last name */
  private _lastName?: string | null;
  /** User's display name, can be used for presentation */
  private _displayName: string;
  /** User's phone number, stored as a PhoneNumber object */
  private _phone?: PhoneNumber | null;
  /** User's account number */
  private _accountNo: string;
  /** User's email address */
  private _email?: string | null;

  /**
   * Gets the profile schema used for validation.
   */
  static get schema() {
    return profileSchema;
  }

  /**
   * Creates a new Profile instance with the provided data.
   *
   * Private constructor to enforce use of static factory methods.
   *
   * @param data - Object containing profile information
   */
  private constructor(data: {
    id: string;
    firstName?: string | null;
    lastName?: string | null;
    displayName: string;
    phone?: PhoneNumber | null;
    accountNo: string;
    email?: string | null;
  }) {
    this._id = data.id;
    this._firstName = data.firstName;
    this._lastName = data.lastName;
    this._displayName = data.displayName;
    this._phone = data.phone;
    this._accountNo = data.accountNo;
    this._email = data.email;
  }

  /**
   * Creates a new Profile instance with the provided data.
   *
   * @param data - Object containing profile information.
   */
  static create(data: {
    id: string;
    firstName?: string | null;
    lastName?: string | null;
    displayName: string;
    phone?: string | null;
    accountNo: string;
    email?: string | null;
  }): Profile | undefined {
    let phoneObj: PhoneNumber | null | undefined = undefined;

    if (data.phone !== undefined && data.phone !== null) {
      let phoneString = data.phone ?? "";
      if (!phoneString.startsWith("+")) phoneString = "+" + phoneString;
      phoneObj = PhoneNumber.from(phoneString);
      if (!phoneObj) {
        console.error("Failed to parse phone number:", data.phone);
        return undefined;
      }
    } else {
      phoneObj = data.phone; // Preserve null or undefined
    }

    return new Profile({
      id: data.id,
      firstName: data.firstName,
      lastName: data.lastName,
      displayName: data.displayName,
      phone: phoneObj,
      accountNo: data.accountNo,
      email: data.email,
    });
  }

  /**
   * Gets the profile's unique identifier.
   */
  get id(): string {
    return this._id;
  }

  /**
   * Gets the user's first name.
   */
  get firstName(): string | null | undefined {
    return this._firstName;
  }

  /**
   * Gets the user's last name.
   */
  get lastName(): string | null | undefined {
    return this._lastName;
  }

  /**
   * Gets the user's display name.
   */
  get displayName(): string {
    return this._displayName;
  }

  /**
   * Gets the user's phone number object.
   */
  get phone(): PhoneNumber | null | undefined {
    return this._phone;
  }

  /**
   * Gets the user's account number.
   */
  get accountNo(): string {
    return this._accountNo;
  }

  /**
   * Gets the user's email address.
   */
  get email(): string | null | undefined {
    return this._email;
  }

  /**
   * Gets the user's formatted phone number in international format.
   */
  get formattedPhone(): string | null | undefined {
    if (this._phone === undefined) {
      return undefined;
    }
    return this._phone?.label ?? null;
  }

  /**
   * Gets the user's name for display purposes.
   * Returns the display name if it exists, otherwise returns the first and last name combined.
   */
  getName(): string {
    if (this._displayName && this._displayName.trim() !== "") {
      return this._displayName;
    }

    const firstName = this._firstName ?? "";
    const lastName = this._lastName ?? "";

    return `${firstName} ${lastName}`.trim();
  }

  /**
   * Creates a plain object representation of the profile for validation or serialization.
   *
   * @returns A plain object matching the ProfileType interface
   */
  toObject(): ProfileType {
    // Handle the phone specially to ensure we preserve undefined vs null
    let phoneString: string | null | undefined = undefined;
    if (this._phone !== undefined) {
      phoneString = this._phone?.label ?? null;
    }

    return {
      id: this._id,
      firstName: this._firstName,
      lastName: this._lastName,
      displayName: this._displayName,
      phone: phoneString,
      accountNo: this._accountNo,
      email: this._email,
    };
  }

  /**
   * Converts the profile to a JSON string.
   *
   * @returns A JSON string representation of the profile
   */
  toJSON(): string {
    return JSON.stringify(this.toObject());
  }

  /**
   * Validates the profile data against the Zod schema.
   *
   * @returns True if the profile is valid, false otherwise
   */
  validate(): boolean {
    try {
      const result = Profile.schema.safeParse(this.toObject());
      return result.success;
    } catch (error) {
      console.error("Profile validation error:", error);
      return false;
    }
  }

  /**
   * Creates a Profile instance from a JSON string.
   *
   * @param jsonString - JSON string containing profile data
   * @returns A new Profile instance, or undefined if parsing failed
   */
  static fromJSON(jsonString: string): Profile | undefined {
    try {
      const data = JSON.parse(jsonString);
      return Profile.from(data);
    } catch (error) {
      console.error("Error parsing profile JSON:", error);
      return undefined;
    }
  }

  /**
   * Creates a Profile instance from a plain object.
   *
   * @param data - Object containing profile data
   * @returns A new Profile instance, or undefined if parsing failed
   */
  // deno-lint-ignore no-explicit-any
  static from(data: any): Profile | undefined {
    try {
      if (!data) {
        console.error("Data is null or undefined");
        return undefined;
      }

      if (typeof data !== "object") {
        console.error("Data is not an object");
        return undefined;
      }

      if (!data.id || !data.accountNo || !data.displayName) {
        console.error("Missing required profile fields");
        return undefined;
      }

      return Profile.create({
        id: data.id,
        firstName: data.firstName,
        lastName: data.lastName,
        displayName: data.displayName,
        phone: data.phone,
        accountNo: data.accountNo,
        email: data.email,
      });
    } catch (error) {
      console.error("Error creating profile from object:", error);
      return undefined;
    }
  }

  /**
   * Type guard to check if an unknown object is a valid Profile instance.
   *
   * @param obj - The object to check
   * @returns Type predicate indicating if the object is a valid Profile
   */
  static is(obj: unknown): obj is Profile {
    if (!obj || typeof obj !== "object") return false;

    const maybeProfile = obj as Record<string, unknown>;

    // Check required properties
    if (
      typeof maybeProfile._id !== "string" ||
      typeof maybeProfile._displayName !== "string" ||
      typeof maybeProfile._accountNo !== "string"
    ) {
      return false;
    }

    // Check nullable/optional properties have the right type when present
    if (
      maybeProfile._firstName !== null &&
      maybeProfile._firstName !== undefined &&
      typeof maybeProfile._firstName !== "string"
    ) {
      return false;
    }

    if (
      maybeProfile._lastName !== null &&
      maybeProfile._lastName !== undefined &&
      typeof maybeProfile._lastName !== "string"
    ) {
      return false;
    }

    if (
      maybeProfile._email !== null &&
      maybeProfile._email !== undefined &&
      typeof maybeProfile._email !== "string"
    ) {
      return false;
    }

    // Check phone number
    const phone = maybeProfile._phone;
    if (
      phone !== null &&
      phone !== undefined &&
      !PhoneNumber.is(phone as unknown)
    ) {
      return false;
    }

    return true;
  }
}
