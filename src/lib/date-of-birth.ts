/**
 * Hard lower bound for date-of-birth input: 150 years.
 *
 * Mirrors `packages/server/src/utils/dateOfBirth.ts` (the API rejects older
 * dates); the mobile bundle does not import workspace packages, so the value
 * lives here as well. Keep both in sync.
 */
export const MAX_DATE_OF_BIRTH_AGE_YEARS = 150;

/** `YYYY-MM-DD` of the earliest accepted date of birth, for `<input min>`. */
export function earliestDateOfBirthIso(referenceDate: Date = new Date()): string {
  const earliest = new Date(
    Date.UTC(referenceDate.getUTCFullYear(), referenceDate.getUTCMonth(), referenceDate.getUTCDate())
  );
  earliest.setUTCFullYear(earliest.getUTCFullYear() - MAX_DATE_OF_BIRTH_AGE_YEARS);
  return earliest.toISOString().slice(0, 10);
}

/** True only for a parsable date that lies before the 150-year window. */
export function isDateOfBirthTooOld(
  value: Date | string | null | undefined,
  referenceDate: Date = new Date()
): boolean {
  if (!value) return false;
  const dob = value instanceof Date ? value : new Date(value);
  if (!Number.isFinite(dob.getTime())) return false;
  return dob.toISOString().slice(0, 10) < earliestDateOfBirthIso(referenceDate);
}
