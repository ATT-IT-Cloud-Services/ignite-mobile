import type { ApiErrorCode } from "./error-codes.js";
import { extractErrorCode } from "./extract-error-code.js";

/**
 * Thrown when an ignite API request fails.
 * Contains only machine-readable data — no localized messages.
 */
export class ApiError extends Error {
  readonly code: ApiErrorCode;
  readonly status: number;
  readonly payload: unknown;

  constructor(code: ApiErrorCode, status: number, payload: unknown) {
    super(code);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
    this.payload = payload;
  }

  static fromResponse(status: number, payload: unknown): ApiError {
    const code = extractErrorCode(payload) ?? ("apiErrorUnknown" as ApiErrorCode);
    return new ApiError(code, status, payload);
  }
}
