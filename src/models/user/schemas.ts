import { z } from "zod";

type ProfileType = z.ZodObject<{
  id: z.ZodString;
  firstName: z.ZodString;
  lastName: z.ZodString;
  displayName: z.ZodString;
  phone: z.ZodString;
  accountNo: z.ZodString;
  email: z.ZodString;
}>;
export const profileSchema: ProfileType = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  displayName: z.string(),
  phone: z.string(),
  accountNo: z.string(),
  email: z.string(),
});

type userType = z.ZodObject<{
  profile: ProfileType;
  token: z.ZodString;
  access: z.ZodArray<z.ZodString>;
  resetPassword: z.ZodBoolean;
}>;
export const coreUserSchema: userType = z.object({
  profile: profileSchema,
  token: z.string(),
  access: z.array(z.string()),
  resetPassword: z.boolean(),
});

type IdentityType = z.ZodObject<{
  name: z.ZodString;
  identity: z.ZodString;
}>;
export const identitySchema: IdentityType = z.object({
  name: z.string(),
  identity: z.string(),
});
