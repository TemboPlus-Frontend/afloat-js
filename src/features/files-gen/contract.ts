import { z } from "@npm/zod.ts";
import { initContract } from "@npm/ts_rest.ts";
import { STATEMENT_OUTPUT_TYPE } from "@models/wallet/enums.ts";

const responseSchema = z.object({
  file: z.string(),
  file_extension: z.string(),
  mime_type: z.string(),
});

export const contract = initContract().router({
  genStatementPDF: {
    method: "POST",
    path: "/statement",
    body: z.object({
      end_date: z.date(),
      start_date: z.date(),
      account_no: z.string().optional(),
      return_file_type: z.enum([
        STATEMENT_OUTPUT_TYPE.EXCEL,
        STATEMENT_OUTPUT_TYPE.PDF,
      ]),
    }),
    responses: {
      201: responseSchema,
      202: z.object({
        message: z.string(),
      }),
    },
  },
  genAccountDetailsPDF: {
    method: "POST",
    path: "/account_details",
    body: z.object({}),
    responses: {
      201: responseSchema,
    },
  },
});
