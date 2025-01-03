import type { RuleObject } from "@npm/antd.ts";

/**
 * Regular expression to validate account names.
 *
 * Key Criteria:
 * 1. The name must consist of at least two words separated by one or more spaces.
 * 2. Each word can include only alphabetic characters (`a-z`, `A-Z`) and optional hyphens (`-`).
 * 3. Both words must have at least two characters.
 * 4. Allow additional whitespace between words but disallow trailing or leading spaces.
 * 5. Supports names with hyphens (e.g., "Anna-Marie Johnson" or "Jean-Luc Picard").
 *
 * Examples of valid names:
 * - "John Doe"
 * - "Anna-Marie Johnson"
 * - "Jean-Luc Picard"
 * - "Mary Ann"
 *
 * Examples of invalid names:
 * - "John" (only one name)
 * - "John D" (family name less than 2 characters)
 * - "John123 Doe" (contains numeric characters)
 * - " John Doe " (leading or trailing spaces)
 */
const ACCOUNT_NAME_REGEX =
  /^[A-Za-z]{2,}(-[A-Za-z]{2,})?( [A-Za-z]{2,}(-[A-Za-z]{2,})?)+$/;

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
  _: RuleObject,
  value: string,
): void => {
  if (!value) {
    throw new Error("Account number is required.");
  }

  if (!ACCOUNT_NUMBER_REGEX.test(value)) {
    throw new Error(
      "Account number must be 6 to 20 digits long and contain only letters and digits.",
    );
  }
};

/**
 * Validator for account name field.
 * Ensures the account name is at least 3 characters long and contains only letters and spaces.
 * @param {RuleObject} _ The rule object for validation (used by validation framework).
 * @param {string} value The value to validate.
 * @throws Will throw an error if validation fails.
 */
export const ACC_NAME_VALIDATOR = (
  _: RuleObject,
  value: string,
): void => {
  if (!value) {
    throw new Error("Account name is required.");
  }

  if (!ACCOUNT_NAME_REGEX.test(value)) {
    throw new Error(
      "Please enter a valid account name. For example: 'John Doe', 'Anna-Marie Smith'",
    );
  }
};

/**
 * Validates if the provided account name is valid.
 * @param {string} [name] The account name to validate.
 * @returns {boolean} `true` if valid, otherwise `false`.
 */
export const validateAccName = (name?: string): boolean => {
  return Boolean(name?.trim().length && ACCOUNT_NAME_REGEX.test(name.trim()));
};

/**
 * Validates if the provided account number is valid.
 * The account number must be numeric and between 8-12 digits.
 * @param {string} [accountNumber] The account number to validate.
 * @returns {boolean} `true` if valid, otherwise `false`.
 */
export const validateBankAccNo = (accountNumber?: string): boolean => {
  if (!accountNumber) return false;

  const normalizedNumber = accountNumber.trim();
  const hasNoSpaces = normalizedNumber.split(" ").length === 1;

  return (
    normalizedNumber.length >= 6 && // Ensures minimum length of 6
    normalizedNumber.length <= 20 && // Ensures maximum length of 20
    hasNoSpaces &&
    ACCOUNT_NUMBER_REGEX.test(normalizedNumber)
  );
};
