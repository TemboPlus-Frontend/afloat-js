import type { z } from "zod";
import type {
  contactChannelSchema,
  contactInputSchema,
  contactSchema,
} from "@models/contact/schemas.ts";

/**
 * Contact Model
 */
export type Contact = z.infer<typeof contactSchema>;

/**
 * Contact-Input Model
 */
export type ContactInput = z.infer<typeof contactInputSchema>;

/**
 * Contact-Channel Enumeration
 */
export type ContactChannel = z.infer<typeof contactChannelSchema>;
