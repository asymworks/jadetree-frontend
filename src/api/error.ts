/** Flask-Smorest Validation Error List */
export type ValidationErrors = {
  json?: { [field: string]: string[] };
  query?: { [field: string]: string[] };
  path?: { [field: string]: string[] };
  form?: { [field: string]: string[] };
  headers?: { [field: string]: string[] };
  cookies?: { [field: string]: string[] };
  files?: { [field: string]: string[] };
}

/** Jade Tree API Error Schema */
export type ApiErrorSchema = {
  code: number;
  message: string;
  status?: string;
  errors?: ValidationErrors;
  class?: string;
}

/** Jade Tree API Error */
export class ApiError extends Error {
  /** HTTP Response Code */
  public readonly code: number;

  /** HTTP Response Status */
  public readonly status?: string;

  /** Validation Error List */
  public readonly errors?: ValidationErrors;

  /** Jade Tree Exception Class */
  public readonly class?: string;

  constructor(data: ApiErrorSchema) {
    super(data.message || data.status);

    this.code = data.code;
    this.status = data.status;
    this.errors = data.errors || {};
    this.class = data.class;
  }
}
