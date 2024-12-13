import type { z } from "zod";
import type { contactSchema, contactInputSchema, contactChannelSchema } from "@models/contact/schemas.ts";

export type Contact = z.infer<typeof contactSchema>;

export type ContactInput = z.infer<typeof contactInputSchema>;

export type ContactChannel = z.infer<typeof contactChannelSchema>;
