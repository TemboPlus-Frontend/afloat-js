import type { RuleObject } from "antd/es/form";

/**
 * Regular expression to validate account names.
 *
 * Key Criteria:
 * 1. The name must consist of at least two words separated by one or more spaces.
 * 2. Each word can include alphabetic characters (a-z, A-Z) and special characters like
 *    hyphens (-), apostrophes ('), periods (.), and other Unicode letters.
 * 3. Both words must have at least two characters.
 * 4. Allow additional whitespace between words but disallow trailing or leading spaces.
 * 5. Supports names with special characters (e.g., "O'Connor", "St. John", "María-José")
 *
 * Examples of valid names:
 * - "John Doe"
 * - "Anna-Marie Johnson"
 * - "Jean-Luc Picard"
 * - "Mary O'Connor"
 * - "St. John Smith"
 * - "María José"
 * - "François d'Arc"
 *
 * Examples of invalid names:
 * - "John" (only one name)
 * - "John D" (family name less than 2 characters)
 * - "John123 Doe" (contains numeric characters)
 * - " John Doe " (leading or trailing spaces)
 */
const ACCOUNT_NAME_REGEX =
  /^[\p{L}]['\p{L}.-]{1,}(?: [\p{L}]['\p{L}.-]{1,})+$/u;

/**
 * Regex pattern to validate account numbers.
 * The account number must only contain letters and digits, between 6 and 20 characters long.
 * @constant {RegExp}
 */
export const ACCOUNT_NUMBER_REGEX = /^[a-zA-Z0-9]{6,20}$/; // Only letters and digits, 6-20 characters

/**
 * Validator for account number field.
 * Ensures the account number is between 8-12 digits and numeric.
 * @param {RuleObject} _ The rule object for validation (used by validation framework).
 * @param {string} value The value to validate.
 * @throws Will throw an error if validation fails.
 */
export const ACC_NUMBER_VALIDATOR = (
  rule: RuleObject,
  value: string | null | undefined,
): Promise<string | undefined> => {
  const accNoString = value?.toString().trim();

  // If field is empty/undefined/null
  if (!accNoString) {
    // Only throw if the field is required
    if (rule.required) {
      return Promise.reject(new Error("Account number is required."));
    }
    // If field is not required and empty, validation passes
    return Promise.resolve(undefined);
  }

  const accNo = removeSpaces(accNoString);
  const valid = validateBankAccNo(accNo);
  if (valid) return Promise.resolve(accNo);

  return Promise.reject(new Error("Invalid Account Number Format"));
};

/**
 * Validator for account name field.
 * Ensures the account name is at least 3 characters long and contains only letters and spaces.
 * @param {RuleObject} _ The rule object for validation (used by validation framework).
 * @param {string} value The value to validate.
 * @throws Will throw an error if validation fails.
 */
export const ACC_NAME_VALIDATOR = (
  rule: RuleObject,
  value: string,
): Promise<string | undefined> => {
  const accNameString = value?.toString().trim();

  // If field is empty/undefined/null
  if (!accNameString) {
    // Only throw if the field is required
    if (rule.required) {
      return Promise.reject(new Error("Account name is required."));
    }
    // If field is not required and empty, validation passes
    return Promise.resolve(undefined);
  }

  const accName = normalizeSpaces(accNameString);
  const valid = validateAccName(accName);
  if (valid) return Promise.resolve(accName);

  return Promise.reject(
    new Error("Invalid account name. Examples: 'John Doe', 'Anna-Marie Smith'"),
  );
};

/**
 * Validates if the provided account name is valid.
 * @param {string} [name] The account name to validate.
 * @returns {boolean} `true` if valid, otherwise `false`.
 */
export const validateAccName = (name?: string): boolean => {
  if (!name) return false;
  const accName = normalizeSpaces(name);
  return Boolean(accName.length && ACCOUNT_NAME_REGEX.test(accName));
};

/**
 * Validates if the provided account number is valid.
 * The account number must be numeric and between 8-12 digits.
 * @param {string} [accountNumber] The account number to validate.
 * @returns {boolean} `true` if valid, otherwise `false`.
 */
export const validateBankAccNo = (accountNumber?: string): boolean => {
  if (!accountNumber) return false;

  const normalizedNumber = removeSpaces(accountNumber);

  return (
    normalizedNumber.length >= 6 && // Ensures minimum length of 6
    normalizedNumber.length <= 20 && // Ensures maximum length of 20
    ACCOUNT_NUMBER_REGEX.test(normalizedNumber)
  );
};

/**
 * Normalizes spaces in a string by replacing multiple consecutive spaces
 * with a single space, ensuring names are properly formatted.
 *
 * @param {string} input - The input string (e.g., a name) to process.
 * @returns {string} A new string with multiple spaces replaced by a single space.
 *
 * @example
 * normalizeSpaces("John  Doe");        // Returns: "John Doe"
 * normalizeSpaces("John   M Doe");     // Returns: "John M Doe"
 * normalizeSpaces("  John   Doe  ");   // Returns: "John Doe" (trims leading and trailing spaces as well)
 */
function normalizeSpaces(input: string): string {
  return input.trim().replace(/\s+/g, " ");
}

/**
 * Removes all whitespace characters from the given string.
 *
 * This function replaces all occurrences of spaces, tabs, and other
 * whitespace characters (including multiple spaces) in the input string
 * with an empty string, effectively removing them.
 *
 * @param {string} input - The input string from which spaces should be removed.
 * @returns {string} A new string with all whitespace characters removed.
 *
 * @example
 * removeSpaces("  Hello   World  ");    // Returns: "HelloWorld"
 * removeSpaces("NoSpacesHere");         // Returns: "NoSpacesHere"
 * removeSpaces("   ");                  // Returns: ""
 */
function removeSpaces(input: string): string {
  return input.replace(/\s+/g, "");
}
