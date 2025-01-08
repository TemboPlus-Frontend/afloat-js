import { contract } from "@features/files-gen/contract.ts";
import { BaseRepository } from "@shared/index.ts";
import { APIError } from "@errors/api_error.ts";
import type {
  ClientInferRequest,
  ClientInferResponseBody,
} from "../../npm/ts-rest.ts";
import type { StatementFile } from "@models/wallet/index.ts";

type GenStatementInput = ClientInferRequest<
  typeof contract.genStatementPDF
>["body"];

type GenAccountDetailsResponse = ClientInferResponseBody<
  typeof contract.genAccountDetailsPDF
>;

export class AfloatFilesRepo extends BaseRepository<typeof contract> {
  /**
   * Creates an instance of `PayoutRepository` using the contact contract.
   */
  constructor() {
    super("wallet", contract, {
      root: "https://api.afloat.money/pdf-maker/afloat",
    });
  }

  async downloadStatement(
    body: GenStatementInput,
  ): Promise<StatementFile> {
    const result = await this.client.genStatementPDF({ body });

    if (result.status === 201) {
      return result.body;
    }

    throw APIError.unknown("An error occurred while generating statement PDF");
  }

  async genAccountDetailsPDF(): Promise<GenAccountDetailsResponse> {
    const result = await this.client.genAccountDetailsPDF();

    if (result.status === 201) {
      return result.body;
    }

    throw APIError.unknown(
      "An error occurred while generating account details PDF",
    );
  }
}
