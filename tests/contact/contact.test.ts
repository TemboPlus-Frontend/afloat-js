import { assertEquals } from "jsr:@std/assert";
import { faker } from "https://esm.sh/@faker-js/faker@9.3.0";
import { Contact } from "@models/contact/index.ts";
import type { ContactData } from "@models/contact/schemas.ts";

// Valid contact data
const validContactData: ContactData = {
  id: faker.string.uuid(),
  profileId: faker.string.uuid(),
  displayName: faker.person.fullName(),
  type: "Mobile",
  accountNo: "+255713345678",
  channel: "MPESA",
  createdAt: new Date(),
  updatedAt: new Date(),
};

Deno.test("Contact.is - validates Contact instances", async (t) => {
  const validContact = Contact.create(validContactData);

  await t.step("returns true for valid Contact instances", () => {
    assertEquals(Contact.is(validContact), true);
  });

  await t.step("returns false for non-object values", () => {
    assertEquals(Contact.is(null), false);
    assertEquals(Contact.is(undefined), false);
    assertEquals(Contact.is("string"), false);
    assertEquals(Contact.is(123), false);
  });

  await t.step("returns false for objects without data property", () => {
    assertEquals(Contact.is({}), false);
    assertEquals(Contact.is({ id: "123" }), false);
  });

  await t.step("returns false for objects with invalid data", () => {
    assertEquals(Contact.is({ data: {} }), false);
    assertEquals(Contact.is({ data: { id: "123" } }), false);
  });
});

Deno.test("Contact.canConstruct - validates contact data", async (t) => {
  await t.step("returns true for valid contact data", () => {
    assertEquals(Contact.canConstruct(validContactData), true);
  });

  await t.step("returns false for non-object values", () => {
    assertEquals(Contact.canConstruct(null), false);
    assertEquals(Contact.canConstruct(undefined), false);
    assertEquals(Contact.canConstruct("string"), false);
    assertEquals(Contact.canConstruct(123), false);
  });

  await t.step("returns false for invalid contact data", () => {
    assertEquals(Contact.canConstruct({}), false);
    assertEquals(Contact.canConstruct({ id: "123" }), false);
    assertEquals(
      Contact.canConstruct({
        ...validContactData,
        type: "InvalidType",
      }),
      false,
    );
  });

  await t.step("returns false for missing required fields", () => {
    const { id: _a, ...missingId } = validContactData;
    assertEquals(Contact.canConstruct(missingId), false);

    const { displayName: _b, ...missingName } = validContactData;
    assertEquals(Contact.canConstruct(missingName), false);
  });
});
