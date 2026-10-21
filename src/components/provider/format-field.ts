import type { ResolvedField } from "./types";

type FieldLike = Pick<ResolvedField, "format" | "value" | "formatted" | "key">;

/** Same numeric thresholds as web formatSpecs (1000 → TB/TiB). */
function formatGbValue(n: number): string {
  if (n >= 1000) {
    const tb = n / 1000;
    return `${tb % 1 === 0 ? tb : tb.toFixed(1)} TB`;
  }
  return `${n} GB`;
}

function formatGibValue(n: number): string {
  if (n >= 1000) {
    const tib = n / 1000;
    return `${tib % 1 === 0 ? tib : tib.toFixed(1)} TiB`;
  }
  return `${n} GiB`;
}

function formatLargeNumber(n: number): string {
  return new Intl.NumberFormat("de-DE", { maximumFractionDigits: 0 }).format(Math.round(n));
}

/**
 * Display string for a resolved field.
 * Prefer API `formatted` when present; otherwise format like the web storefront
 * (limits, GB→TB for traffic/storage, Unbegrenzt for -1).
 */
export function formatResolvedFieldValue(
  field: FieldLike,
  t?: (key: string) => string,
): string | null {
  const formatted = field.formatted?.trim();
  if (formatted) return formatted;

  const { value, format, key } = field;
  if (value === undefined || value === null) return null;

  if (format === "boolean") {
    const bool = value === true || value === "true" || value === 1 || value === "1";
    if (t) return bool ? t("yes") : t("no");
    return String(bool);
  }

  if (format === "limit") {
    const n = Number(value);
    if (!Number.isFinite(n)) return null;
    if (n < 0) return t?.("couponUnlimited") ?? "Unbegrenzt";
    if (key === "maxTrafficGb") return formatGbValue(n);
    return formatLargeNumber(n);
  }

  if (format === "storage_gb" || format === "memory_gb") {
    const n = Number(value);
    if (!Number.isFinite(n)) return null;
    if (n < 0) return t?.("couponUnlimited") ?? "Unbegrenzt";
    return formatGbValue(n);
  }

  if (format === "storage_gib" || format === "memory_gib") {
    const n = Number(value);
    if (!Number.isFinite(n)) return null;
    if (n < 0) return t?.("couponUnlimited") ?? "Unbegrenzt";
    return formatGibValue(n);
  }

  if (format === "number") {
    const n = Number(value);
    if (!Number.isFinite(n)) return String(value);
    if (n < 0) return t?.("couponUnlimited") ?? "Unbegrenzt";
    return formatLargeNumber(n);
  }

  const text = String(value).trim();
  return text.length > 0 ? text : null;
}

/** Whether a resolved field has a user-visible value. */
export function hasResolvedFieldDisplayValue(field: FieldLike): boolean {
  if (field.format === "boolean") {
    const v = field.value;
    return v === true || v === "true" || v === 1 || v === "1";
  }
  if (field.format === "limit" || field.format === "number" || field.format === "storage_gb") {
    const n = Number(field.value);
    return Number.isFinite(n) && n >= -1;
  }
  return formatResolvedFieldValue(field) !== null;
}
