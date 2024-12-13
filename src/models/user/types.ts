import type { z } from "zod";
import type { coreUserSchema, identitySchema, profileSchema } from "./schemas.ts";

export type Profile = z.infer<typeof profileSchema>;
export type UserIdentity = z.infer<typeof identitySchema>;
export type CoreUser = z.infer<typeof coreUserSchema>;
