import type { RuleObject } from "@npm/antd.ts";

/**
 * Regex pattern to validate account names.
 * The account name must only contain letters and spaces, with a minimum length of 3 characters.
 * @constant {RegExp}
 */
export const ACCOUNT_NAME_REGEX = /^[A-Za-z\s]{3,}$/;

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
      "Account name must be at least 3 characters long and contain only letters and spaces.",
    );
  }
};

/**
 * Validates if the provided account name is valid.
 * @param {string} [name] The account name to validate.
 * @returns {boolean} `true` if valid, otherwise `false`.
 */
export const validateBankAccName = (name?: string): boolean => {
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
