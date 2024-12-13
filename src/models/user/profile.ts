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

/**
 * User Afloat profile
 */
export type Profile = z.infer<typeof profileSchema>;
