import type { z } from "@npm/zod.ts";
import type { PayoutSchemas } from "@models/payout/schemas.ts";

export type PayoutInput = z.infer<typeof PayoutSchemas.input>;

export type Payout = z.infer<typeof PayoutSchemas.payout>;
