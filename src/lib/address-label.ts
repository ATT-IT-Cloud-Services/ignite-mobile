/**
 * Address labels inside the mobile app.
 *
 * Ignite creates addresses itself (the registration address) and stores a
 * locale-neutral marker instead of copy, so the stored value must never be
 * printed raw — it is translated through `addressLabelRegistration`.
 * Mirrors packages/shared/src/addresses.ts (mobile is a standalone project and
 * cannot import the workspace package).
 */

export const ADDRESS_SYSTEM_LABEL_REGISTRATION = "system:registrationAddress";

export function isAddressSystemLabel(label?: string | null): boolean {
  return label === ADDRESS_SYSTEM_LABEL_REGISTRATION;
}

/**
 * Display text for a stored label: customer text unchanged, system markers via
 * the already translated registration label, otherwise `fallback` (street).
 */
export function resolveAddressLabel(
  label: string | null | undefined,
  registrationLabel: string,
  fallback = "",
): string {
  if (!label) return fallback;
  if (isAddressSystemLabel(label)) return registrationLabel || fallback;
  return label;
}
