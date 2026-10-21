/**
 * Cache for tenant public settings that affect formatting/visibility:
 * - plusVisibility (who may buy Plus)
 * - displayDecimals (per customer group, display only)
 *
 * Fed from `/public-settings` once at boot; falls back to the previous
 * behavior when unset so nothing regresses while loading.
 */
export type PlusVisibility = { availablePrivate?: boolean; availableBusiness?: boolean };
export type DisplayDecimals = { private?: number; business?: number };

let plusVisibility: PlusVisibility | null = null;
let displayDecimals: DisplayDecimals | null = null;
let activeAccountType: string | null = null;

export function setActiveAccountType(accountType: string | null | undefined): void {
  activeAccountType = accountType ?? null;
}

export function applyPublicSettings(settings: Record<string, unknown> | null | undefined): void {
  if (!settings) return;
  if (settings.plusVisibility && typeof settings.plusVisibility === "object") {
    plusVisibility = settings.plusVisibility as PlusVisibility;
  }
  if (settings.displayDecimals && typeof settings.displayDecimals === "object") {
    displayDecimals = settings.displayDecimals as DisplayDecimals;
  }
}

export function getPlusVisibility(): PlusVisibility | null {
  return plusVisibility;
}

function clampDecimals(value: unknown): number | undefined {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0 || n > 4) return undefined;
  return Math.floor(n);
}

/** Display-only decimals per customer group (private default 2, business 4). */
export function displayDecimalsForAccount(accountType?: string | null): number {
  const isBusiness = (accountType ?? activeAccountType ?? "").toUpperCase() === "BUSINESS";
  const override = clampDecimals(isBusiness ? displayDecimals?.business : displayDecimals?.private);
  if (override !== undefined) return override;
  return isBusiness ? 4 : 2;
}
