// import { assertEquals } from "jsr:@std/assert";
// import { faker } from "https://esm.sh/@faker-js/faker@9.3.0";
// import type { PayoutData } from "@models/payout/schemas.ts";
// import {
//   PAYOUT_APPROVAL_STATUS,
//   PAYOUT_STATUS,
// } from "@models/payout/status.ts";
// import { Payout } from "@models/payout/index.ts";

// /**
//  * Helper function to create valid payout test data
//  */
// const validPayoutData: PayoutData = {
//   id: faker.string.uuid(),
//   profileId: faker.string.uuid(),
//   payeeName: faker.person.fullName(),
//   channel: "TZ-VODACOM-B2C",
//   msisdn: faker.phone.number({ style: "international" }),
//   amount: 1000,
//   description: "Test payout",
//   status: PAYOUT_STATUS.PENDING,
//   statusMessage: "Awaiting processing",
//   createdAt: new Date(),
//   updatedAt: new Date(),
//   approvalStatus: PAYOUT_APPROVAL_STATUS.PENDING,
// };

// Deno.test("Payout.is - validates Payout instances", async (t) => {
//   const validPayout = Payout.create(validPayoutData);

//   await t.step("returns true for valid Payout instances", () => {
//     assertEquals(Payout.is(validPayout), true);
//   });

//   await t.step("returns false for non-object values", () => {
//     assertEquals(Payout.is(null), false);
//     assertEquals(Payout.is(undefined), false);
//     assertEquals(Payout.is("string"), false);
//     assertEquals(Payout.is(123), false);
//   });

//   await t.step("returns false for objects without data property", () => {
//     assertEquals(Payout.is({}), false);
//     assertEquals(Payout.is({ id: "123" }), false);
//   });

//   await t.step("returns false for objects with invalid data", () => {
//     assertEquals(Payout.is({ data: {} }), false);
//     assertEquals(Payout.is({ data: { id: "123" } }), false);
//   });
// });

// Deno.test("Payout.canConstruct - validates payout data", async (t) => {
//   await t.step("returns true for valid payout data", () => {
//     assertEquals(Payout.canConstruct(validPayoutData), true);
//   });

//   await t.step("returns false for non-object values", () => {
//     assertEquals(Payout.canConstruct(null), false);
//     assertEquals(Payout.canConstruct(undefined), false);
//     assertEquals(Payout.canConstruct("string"), false);
//     assertEquals(Payout.canConstruct(123), false);
//   });

//   await t.step("returns false for invalid payout data", () => {
//     assertEquals(Payout.canConstruct({}), false);
//     assertEquals(Payout.canConstruct({ id: "123" }), false);
//     assertEquals(
//       Payout.canConstruct({
//         ...validPayoutData,
//         status: "INVALID_STATUS",
//       }),
//       false,
//     );
//   });

//   await t.step("returns false for missing required fields", () => {
//     const { id: _a, ...missingId } = validPayoutData;
//     assertEquals(Payout.canConstruct(missingId), false);

//     const { payeeName: _b, ...missingName } = validPayoutData;
//     assertEquals(Payout.canConstruct(missingName), false);

//     const { amount: _c, ...missingAmount } = validPayoutData;
//     assertEquals(Payout.canConstruct(missingAmount), false);
//   });
// });
