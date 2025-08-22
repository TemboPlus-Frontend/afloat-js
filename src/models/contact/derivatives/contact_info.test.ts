// import { assertEquals } from "jsr:@std/assert";
// import {
//   BankContactInfo,
//   MobileContactInfo,
// } from "@models/contact/derivatives/contact_info.ts";
// import { Bank, TZPhoneNumber } from "@temboplus/frontend-core";

// Deno.test("MobileContactInfo.is", async (t) => {
//   // Valid inputs with string phone number
//   await t.step("accepts valid object with string phone number", () => {
//     assertEquals(
//       MobileContactInfo.is({
//         name: "John Doe",
//         phoneNumber: "+255712345678",
//       }),
//       true,
//     );

//     assertEquals(
//       MobileContactInfo.is({
//         name: "Jane Doe",
//         phoneNumber: "0712345678",
//       }),
//       true,
//     );
//   });

//   // Valid inputs with PhoneNumber object
//   await t.step("accepts valid object with PhoneNumber instance", () => {
//     const phoneNumber = TZPhoneNumber.from("+255712345678");
//     assertEquals(
//       MobileContactInfo.is({
//         name: "John Doe",
//         phoneNumber,
//       }),
//       true,
//     );
//   });

//   // Invalid inputs - not an object
//   await t.step("rejects non-object inputs", () => {
//     assertEquals(MobileContactInfo.is(undefined), false);
//     assertEquals(MobileContactInfo.is(null), false);
//     assertEquals(MobileContactInfo.is(""), false);
//     assertEquals(MobileContactInfo.is(123), false);
//     assertEquals(MobileContactInfo.is(true), false);
//   });

//   // Invalid inputs - missing properties
//   await t.step("rejects objects with missing properties", () => {
//     assertEquals(MobileContactInfo.is({}), false);
//     assertEquals(MobileContactInfo.is({ name: "John Doe" }), false);
//     assertEquals(MobileContactInfo.is({ phoneNumber: "+255712345678" }), false);
//   });

//   // Invalid inputs - empty name
//   await t.step("rejects empty name", () => {
//     assertEquals(
//       MobileContactInfo.is({
//         name: "",
//         phoneNumber: "+255712345678",
//       }),
//       false,
//     );

//     assertEquals(
//       MobileContactInfo.is({
//         name: "   ",
//         phoneNumber: "+255712345678",
//       }),
//       false,
//     );
//   });

//   // Invalid inputs - wrong property types
//   await t.step("rejects invalid property types", () => {
//     assertEquals(
//       MobileContactInfo.is({
//         name: 123,
//         phoneNumber: "+255712345678",
//       }),
//       false,
//     );

//     assertEquals(
//       MobileContactInfo.is({
//         name: true,
//         phoneNumber: "+255712345678",
//       }),
//       false,
//     );

//     assertEquals(
//       MobileContactInfo.is({
//         name: {},
//         phoneNumber: "+255712345678",
//       }),
//       false,
//     );

//     assertEquals(
//       MobileContactInfo.is({
//         name: [],
//         phoneNumber: "+255712345678",
//       }),
//       false,
//     );
//   });

//   // Invalid inputs - invalid phone numbers
//   await t.step("rejects invalid phone numbers", () => {
//     assertEquals(
//       MobileContactInfo.is({
//         name: "John Doe",
//         phoneNumber: "invalid",
//       }),
//       false,
//     );

//     assertEquals(
//       MobileContactInfo.is({
//         name: "John Doe",
//         phoneNumber: "12345", // Too short
//       }),
//       false,
//     );

//     assertEquals(
//       MobileContactInfo.is({
//         name: "John Doe",
//         phoneNumber: "+255999999999", // Invalid prefix
//       }),
//       false,
//     );

//     assertEquals(
//       MobileContactInfo.is({
//         name: "John Doe",
//         phoneNumber: {}, // Empty object
//       }),
//       false,
//     );

//     assertEquals(
//       MobileContactInfo.is({
//         name: "John Doe",
//         phoneNumber: { invalid: "object" }, // Invalid phone number object
//       }),
//       false,
//     );
//   });

//   // Edge cases
//   await t.step("handles edge cases correctly", () => {
//     // Extra properties should not affect validation
//     assertEquals(
//       MobileContactInfo.is({
//         name: "John Doe",
//         phoneNumber: "+255712345678",
//         extraProp: "something",
//       }),
//       true,
//     );

//     // Name with special characters should be valid
//     assertEquals(
//       MobileContactInfo.is({
//         name: "John-Doe O'Connor",
//         phoneNumber: "+255712345678",
//       }),
//       true,
//     );

//     // Minimum valid name length
//     assertEquals(
//       MobileContactInfo.is({
//         name: "J",
//         phoneNumber: "+255712345678",
//       }),
//       true,
//     );
//   });
// });

// Deno.test("BankContactInfo.is", async (t) => {
//   // Setup valid bank object for tests
//   const validBank = Bank.fromSWIFTCode("CORUTZTZ")

//   // Valid cases with all properties correct
//   await t.step("accepts valid object with all correct properties", () => {
//     assertEquals(
//       BankContactInfo.is({
//         accName: "John Doe",
//         accNumber: "1234567890",
//         bank: validBank,
//       }),
//       true,
//     );
//   });

//   // Invalid inputs - not an object
//   await t.step("rejects non-object inputs", () => {
//     assertEquals(BankContactInfo.is(undefined), false);
//     assertEquals(BankContactInfo.is(null), false);
//     assertEquals(BankContactInfo.is(""), false);
//     assertEquals(BankContactInfo.is(123), false);
//     assertEquals(BankContactInfo.is(true), false);
//   });

//   // Invalid inputs - missing properties
//   await t.step("rejects objects with missing properties", () => {
//     assertEquals(BankContactInfo.is({}), false);
//     assertEquals(
//       BankContactInfo.is({
//         accName: "John Doe",
//       }),
//       false,
//     );
//     assertEquals(
//       BankContactInfo.is({
//         accName: "John Doe",
//         accNumber: "1234567890",
//       }),
//       false,
//     );
//     assertEquals(
//       BankContactInfo.is({
//         accNumber: "1234567890",
//         bank: validBank,
//       }),
//       false,
//     );
//     assertEquals(
//       BankContactInfo.is({
//         accName: "John Doe",
//         bank: validBank,
//       }),
//       false,
//     );
//   });

//   // Invalid inputs - wrong property types
//   await t.step("rejects invalid property types", () => {
//     assertEquals(
//       BankContactInfo.is({
//         accName: 123,
//         accNumber: "1234567890",
//         bank: validBank,
//       }),
//       false,
//     );

//     assertEquals(
//       BankContactInfo.is({
//         accName: "John Doe",
//         accNumber: 1234567890,
//         bank: validBank,
//       }),
//       false,
//     );

//     assertEquals(
//       BankContactInfo.is({
//         accName: "John Doe",
//         accNumber: "1234567890",
//         bank: "CRDB", // bank should be object
//       }),
//       false,
//     );
//   });

//   // Invalid inputs - empty or invalid strings
//   await t.step("rejects invalid string values", () => {
//     assertEquals(
//       BankContactInfo.is({
//         accName: "",
//         accNumber: "1234567890",
//         bank: validBank,
//       }),
//       false,
//     );

//     assertEquals(
//       BankContactInfo.is({
//         accName: "John Doe",
//         accNumber: "",
//         bank: validBank,
//       }),
//       false,
//     );

//     assertEquals(
//       BankContactInfo.is({
//         accName: "   ",
//         accNumber: "1234567890",
//         bank: validBank,
//       }),
//       false,
//     );
//   });

//   // Invalid inputs - invalid bank object
//   await t.step("rejects invalid bank object", () => {
//     assertEquals(
//       BankContactInfo.is({
//         accName: "John Doe",
//         accNumber: "1234567890",
//         bank: {},
//       }),
//       false,
//     );

//     assertEquals(
//       BankContactInfo.is({
//         accName: "John Doe",
//         accNumber: "1234567890",
//         bank: { name: "CRDB" }, // incomplete bank object
//       }),
//       false,
//     );

//     assertEquals(
//       BankContactInfo.is({
//         accName: "John Doe",
//         accNumber: "1234567890",
//         bank: { invalid: "object" },
//       }),
//       false,
//     );
//   });

//   // Edge cases
//   await t.step("handles edge cases correctly", () => {
//     // Extra properties should not affect validation
//     assertEquals(
//       BankContactInfo.is({
//         accName: "John Doe",
//         accNumber: "1234567890",
//         bank: validBank,
//         extraProp: "something",
//       }),
//       true,
//     );

//     // Account name with special characters (assuming validateAccName allows them)
//     assertEquals(
//       BankContactInfo.is({
//         accName: "John-Doe O'Connor",
//         accNumber: "1234567890",
//         bank: validBank,
//       }),
//       true,
//     );

//     // Account number with special formatting (assuming validateBankAccNo handles it)
//     assertEquals(
//       BankContactInfo.is({
//         accName: "John Doe",
//         accNumber: "1234-5678-90",
//         bank: validBank,
//       }),
//       false,
//     );
//   });
// });
