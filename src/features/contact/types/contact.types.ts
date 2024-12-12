import { z } from "zod";

export const contactChannelSchema = z.enum(["Bank", "Mobile"]);

export const contactInputSchema = z.object({
  displayName: z.string(), // should comprise of atleast first and last names separated by space
  accountNo: z.string(), // for mobile: phone number, for bank: account number
  channel: z.string(), // for mobile: company name (e.g TZ-TIGO), for banks: swift codes (e.g CORUTZTZ)
  type: contactChannelSchema,
});

export const contactSchema = z.object({
  id: z.string(),
  profileId: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
}).merge(contactInputSchema);

export type Contact = z.infer<typeof contactSchema>;

export type ContactInput = z.infer<typeof contactInputSchema>;

export type ContactChannel = z.infer<typeof contactChannelSchema>;
