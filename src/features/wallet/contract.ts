import { z } from "@npm/zod.ts";
import { initContract } from "../../npm/ts-rest.ts";
import { WalletSchemas } from "@models/wallet/index.ts";

export const contract = initContract().router({
  getWallets: {
    method: "GET",
    path: "/",
    responses: {
      200: z.array(WalletSchemas.wallet),
    },
  },
  getBalance: {
    method: "POST",
    path: "/balance",
    body: z.object({}),
    responses: {
      201: z.object({
        availableBalance: z.number(),
      }),
    },
  },
  getStatement: {
    method: "POST",
    path: "/statement",
    summary: "Get Wallet Statement",
    body: z.object({
      endDate: z.date(),
      startDate: z.date(),
      accountNo: z.string().optional(),
    }),
    responses: {
      201: z.array(WalletSchemas.statementEntry),
    },
  },
});
