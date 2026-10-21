/**
 * True only when `value` is a complete ISO date (YYYY-MM-DD) and age is under 16.
 * Incomplete / invalid values return false (no warning by default).
 */
export function isCompleteUnder16DateOfBirth(
  value: string | null | undefined,
  referenceDate: Date = new Date()
): boolean {
  if (!value || typeof value !== "string") return false;
  const trimmed = value.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return false;

  const [ys, ms, ds] = trimmed.split("-");
  const y = Number(ys);
  const m = Number(ms);
  const d = Number(ds);
  if (!Number.isInteger(y) || !Number.isInteger(m) || !Number.isInteger(d)) return false;
  if (m < 1 || m > 12 || d < 1 || d > 31) return false;

  const dob = new Date(y, m - 1, d);
  if (dob.getFullYear() !== y || dob.getMonth() !== m - 1 || dob.getDate() !== d) return false;
  if (dob.getTime() > referenceDate.getTime()) return false;

  let age = referenceDate.getFullYear() - y;
  const monthDiff = referenceDate.getMonth() - (m - 1);
  if (monthDiff < 0 || (monthDiff === 0 && referenceDate.getDate() < d)) {
    age -= 1;
  }
  return age >= 0 && age < 16;
}
