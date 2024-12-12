import { z } from "zod";

export const profileSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  displayName: z.string(),
  phone: z.string(),
  accountNo: z.string(),
  email: z.string(),
});

export const userSchema = z.object({
  profile: profileSchema,
  token: z.string(),
  access: z.array(z.string()),
  resetPassword: z.boolean(),
});

export const identitySchema = z.object({
  name: z.string(),
  identity: z.string(),
});

export type Profile = z.infer<typeof profileSchema>;
export type UserIdentity = z.infer<typeof identitySchema>;
export type User = z.infer<typeof userSchema> & UserIdentity;
