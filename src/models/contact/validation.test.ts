import { assertEquals } from "jsr:@std/assert";
import {
  ACC_NAME_VALIDATOR,
  ACC_NUMBER_VALIDATOR,
  ACCOUNT_NUMBER_REGEX,
  validateAccName,
  validateBankAccNo,
} from "@models/contact/validation.ts";

// Tests for ACCOUNT_NUMBER_REGEX
Deno.test("ACCOUNT_NUMBER_REGEX - pattern matching", () => {
  const validCases = [
    "123456",
    "12345678901234567890",
    "ABC123DEF456",
    "123ABC456DEF",
  ];

  const invalidCases = [
    "12345", // too short
    "123456789012345678901", // too long
    "ABC-123", // invalid character
    "ABC@123", // invalid character
  ];

  validCases.forEach((value) => {
    assertEquals(
      ACCOUNT_NUMBER_REGEX.test(value),
      true,
      `Expected "${value}" to match ACCOUNT_NUMBER_REGEX`,
    );
  });

  invalidCases.forEach((value) => {
    assertEquals(
      ACCOUNT_NUMBER_REGEX.test(value),
      false,
      `Expected "${value}" to not match ACCOUNT_NUMBER_REGEX`,
    );
  });
});

// Tests for validateAccName
Deno.test("validateAccName - valid cases", () => {
  const validCases = [
    "John Doe",
    "Anna-Marie Johnson",
    "Jean-Luc Picard",
    "Mary Ann Wilson",
  ];

  validCases.forEach((name) => {
    assertEquals(
      validateAccName(name),
      true,
      `Expected "${name}" to be valid`,
    );
  });
});

Deno.test("validateAccName - invalid cases", () => {
  const invalidCases = [
    undefined,
    "",
    "John",
    "John123 Doe",
    "-John Doe",
    "John-",
    "John--Doe",
  ];

  invalidCases.forEach((name) => {
    assertEquals(
      validateAccName(name),
      false,
      `Expected "${name}" to be invalid`,
    );
  });
});

// Tests for validateBankAccNo
Deno.test("validateBankAccNo - valid cases", () => {
  const validCases = [
    "123456",
    "12345678901234567890",
    "ABC123DEF456",
    "ABCDEF123456",
    "123ABC",
    "123456  ", // should pass after space removal
  ];

  validCases.forEach((accNo) => {
    assertEquals(
      validateBankAccNo(accNo),
      true,
      `Expected "${accNo}" to be valid`,
    );
  });
});

Deno.test("validateBankAccNo - invalid cases", () => {
  const invalidCases = [
    undefined,
    "",
    "12345",
    "123456789012345678901",
    "@ABC123",
    "ABC-123",
  ];

  invalidCases.forEach((accNo) => {
    assertEquals(
      validateBankAccNo(accNo),
      false,
      `Expected "${accNo}" to be invalid`,
    );
  });
});

// Tests for ACC_NAME_VALIDATOR
Deno.test("ACC_NAME_VALIDATOR - valid cases", async () => {
  const validCases = [
    "John Doe",
    "Anna-Marie Johnson",
    "Jean-Luc Picard",
    "John  Doe", // multiple spaces should be normalized
  ];

  for (const name of validCases) {
    const result = await ACC_NAME_VALIDATOR({ required: true }, name);
    assertEquals(
      result,
      name.trim().replace(/\s+/g, " "),
      `Expected "${name}" to be valid and normalized`,
    );
  }
});

Deno.test("ACC_NAME_VALIDATOR - invalid cases", async () => {
  const invalidCases = [
    "John",
    "John123 Doe",
  ];

  for (const name of invalidCases) {
    try {
      await ACC_NAME_VALIDATOR({ required: true }, name);
      throw new Error(`Expected "${name}" to throw validation error`);
    } catch (error) {
      assertEquals(
        (error as Error).message,
        "Invalid account name. Examples: 'John Doe', 'Anna-Marie Smith'",
      );
    }
  }
});

Deno.test("ACC_NAME_VALIDATOR - required field validation", async () => {
  try {
    await ACC_NAME_VALIDATOR({ required: true }, "");
    throw new Error("Expected empty required field to throw error");
  } catch (error) {
    assertEquals((error as Error).message, "Account name is required.");
  }
});

Deno.test("ACC_NAME_VALIDATOR - optional field validation", async () => {
  const result = await ACC_NAME_VALIDATOR({ required: false }, "");
  assertEquals(result, undefined, "Expected empty optional field to be valid");
});

// Tests for ACC_NUMBER_VALIDATOR
Deno.test("ACC_NUMBER_VALIDATOR - valid cases", async () => {
  const validCases = [
    "123456",
    "12345678901234567890",
    "ABC123DEF456",
    "123456  ", // should pass after space removal
  ];

  for (const accNo of validCases) {
    const result = await ACC_NUMBER_VALIDATOR({ required: true }, accNo);
    assertEquals(
      result,
      accNo.replace(/\s+/g, ""),
      `Expected "${accNo}" to be valid and normalized`,
    );
  }
});

Deno.test("ACC_NUMBER_VALIDATOR - invalid cases", async () => {
  const invalidCases = [
    "12345",
    "123456789012345678901",
    "@ABC123",
    "ABC-123",
  ];

  for (const accNo of invalidCases) {
    try {
      await ACC_NUMBER_VALIDATOR({ required: true }, accNo);
      throw new Error(`Expected "${accNo}" to throw validation error`);
    } catch (error) {
      assertEquals((error as Error).message, "Invalid Account Number Format");
    }
  }
});

Deno.test("ACC_NUMBER_VALIDATOR - required field validation", async () => {
  try {
    await ACC_NUMBER_VALIDATOR({ required: true }, "");
    throw new Error("Expected empty required field to throw error");
  } catch (error) {
    assertEquals((error as Error).message, "Account number is required.");
  }
});

Deno.test("ACC_NUMBER_VALIDATOR - optional field validation", async () => {
  const result = await ACC_NUMBER_VALIDATOR({ required: false }, "");
  assertEquals(result, undefined, "Expected empty optional field to be valid");
});
