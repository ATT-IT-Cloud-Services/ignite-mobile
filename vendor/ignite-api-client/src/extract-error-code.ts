import { ALL_API_ERROR_CODES, type ApiErrorCode } from "./error-codes.js";

const KNOWN_CODES = new Set<string>(ALL_API_ERROR_CODES);

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

/**
 * Extracts a machine-readable error code from an API error payload.
 * Does not produce localized messages.
 */
export function extractErrorCode(data: unknown): ApiErrorCode | null {
  if (!isRecord(data)) return null;

  if (typeof data.errorCode === "string" && data.errorCode.trim()) {
    const code = data.errorCode.trim();
    if (KNOWN_CODES.has(code)) return code as ApiErrorCode;
    return code as ApiErrorCode;
  }

  if (typeof data.error === "string" && KNOWN_CODES.has(data.error.trim())) {
    return data.error.trim() as ApiErrorCode;
  }

  if (typeof data.message === "string") {
    const msg = data.message.trim();
    if (msg === "unauthenticated") return "unauthenticated" as ApiErrorCode;
    if (KNOWN_CODES.has(msg)) return msg as ApiErrorCode;
  }

  return null;
}
