import { z } from "zod";

export const contactChannelSchema: z.ZodEnum<["Bank", "Mobile"]> = z.enum([
  "Bank",
  "Mobile",
]);

type _ContactInput = z.ZodObject<{
  displayName: z.ZodString;
  accountNo: z.ZodString;
  channel: z.ZodString;
  type: z.ZodEnum<["Bank", "Mobile"]>;
}>;

export const contactInputSchema: _ContactInput = z.object({
  displayName: z
    .string()
    .min(1, "Display name is required"),
  accountNo: z
    .string()
    .min(1, "Account number is required"),
  channel: z
    .string()
    .min(1, "Channel is required"),
  type: contactChannelSchema,
});

type _Contact = z.ZodObject<{
  displayName: z.ZodString;
  accountNo: z.ZodString;
  channel: z.ZodString;
  type: z.ZodEnum<["Bank", "Mobile"]>;

  id: z.ZodString;
  profileId: z.ZodString;
  createdAt: z.ZodDate;
  updatedAt: z.ZodDate;
}>;

export const contactSchema: _Contact = z.object({
  id: z.string().min(1, "Contact id is required"),
  profileId: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
}).merge(contactInputSchema);

export type Contact = z.infer<typeof contactSchema>;

export type ContactInput = z.infer<typeof contactInputSchema>;

export type ContactChannel = z.infer<typeof contactChannelSchema>;
