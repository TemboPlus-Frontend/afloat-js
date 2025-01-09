import { contract } from "@features/files-gen/contract.ts";
import { BaseRepository } from "@shared/index.ts";
import { APIError } from "@errors/api_error.ts";
import type {
  ClientInferRequest,
  ClientInferResponseBody,
} from "../../npm/ts-rest.ts";
import type { StatementFile } from "@models/wallet/index.ts";

/**
 * Type definition for statement generation input parameters.
 * Inferred from the contract's genStatementPDF endpoint request body.
 * @typedef {ClientInferRequest<typeof contract.genStatementPDF>["body"]} GenStatementInput
 */
type GenStatementInput = ClientInferRequest<
  typeof contract.genStatementPDF
>["body"];

/**
 * Type definition for account details response.
 * Inferred from the contract's genAccountDetailsPDF endpoint response body.
 * @typedef {ClientInferResponseBody<typeof contract.genAccountDetailsPDF>} GenAccountDetailsResponse
 */
type GenAccountDetailsResponse = ClientInferResponseBody<
  typeof contract.genAccountDetailsPDF
>;

/**
 * Repository class for managing file generation operations including
 * statement PDFs and account details documents.
 * @extends {BaseRepository<typeof contract>}
 */
export class AfloatFilesRepo extends BaseRepository<typeof contract> {
  /**
   * Creates an instance of AfloatFilesRepo initialized with the files generation contract.
   * Configures the repository with the PDF maker service endpoint.
   */
  constructor() {
    super("wallet", contract, {
      root: "https://api.afloat.money/pdf-maker/afloat",
    });
  }

  /**
   * Generates and downloads a statement PDF based on the provided parameters.
   * @param {GenStatementInput} body - The statement generation parameters
   * @param {Date} body.start_date - Start date for the statement period
   * @param {Date} body.end_date - End date for the statement period
   * @param {string} body.return_file_type - Desired file format for the statement
   * @param {string} [body.account_no] - Optional account number to generate statement for
   * @throws {APIError} If the statement generation operation fails
   * @returns {Promise<StatementFile>} The generated statement file
   */
  async downloadStatement(
    body: GenStatementInput,
  ): Promise<StatementFile> {
    const result = await this.client.genStatementPDF({ body });

    if (result.status === 201) {
      return result.body;
    }

    throw APIError.unknown("An error occurred while generating statement PDF");
  }

  /**
   * Generates a PDF containing detailed account information.
   * @throws {APIError} If the PDF generation operation fails
   * @returns {Promise<GenAccountDetailsResponse>} The generated account details PDF
   */
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
