import { z } from "zod";
import { initContract } from "@ts-rest/core";
import { STATEMENT_OUTPUT_TYPE } from "@models/wallet/index.ts";

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
      201: z.object({
        file: z.string(),
        file_extension: z.string(),
        mime_type: z.string(),
      }),
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
      201: z.object({
        file: z.string(),
        file_extension: z.string(),
        mime_type: z.string(),
      }),
    },
  },
});
