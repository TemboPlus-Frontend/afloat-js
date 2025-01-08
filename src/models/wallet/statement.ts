/**
 * Enum representing the supported output formats for statement generation.
 * Used to specify the desired file format when requesting statement downloads.
 *
 * @enum {string}
 */
export enum STATEMENT_OUTPUT_TYPE {
  /** Generate statement as a PDF document */
  PDF = "PDF",
  /** Generate statement as an Excel spreadsheet */
  EXCEL = "EXCEL",
}

/**
 * Interface defining the structure of a generated statement file.
 * Contains metadata about the file and its content type.
 *
 * @interface StatementFile
 * @property {string} file - Base64 encoded string of the file content or file path
 * @property {string} file_extension - File extension (e.g., "pdf", "xlsx") without the dot
 * @property {string} mime_type - MIME type of the file (e.g., "application/pdf", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
 */
export interface StatementFile {
  file: string;
  file_extension: string;
  mime_type: string;
}
