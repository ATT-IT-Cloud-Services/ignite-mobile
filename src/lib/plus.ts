import type { AuthUser } from "./types";
import { getPlusVisibility } from "./public-settings";

function isBusinessAccount(user: AuthUser | null | undefined): boolean {
  return (user?.accountType ?? "").toUpperCase() === "BUSINESS";
}

/** Kunden-Stealth oder Privatkonto: elizon+-Angebot/Nav ausgeblendet. */
export function hidePlusUi(user: AuthUser | null | undefined): boolean {
  if (user?.plusCustomerUiVisible === false) return true;
  if (user?.plusBlocked === true && !user?.plusActive) return true;
  const visibility = getPlusVisibility();
  if (!visibility) return !isBusinessAccount(user);
  return isBusinessAccount(user) ? visibility.availableBusiness === false : visibility.availablePrivate !== true;
}

export function isPlusCustomerUiVisible(user: AuthUser | null | undefined): boolean {
  return !hidePlusUi(user);
}

/** elizon+-Features (Storage, vRoute, BYOIP-Inhalt) nur bei aktivem Abo und sichtbarer UI. */
export function showPlusFeatures(user: AuthUser | null | undefined): boolean {
  return Boolean(user?.plusActive) && isPlusCustomerUiVisible(user);
}

/** Routen, die im Kunden-Stealth komplett ausgeblendet werden (wie Web-Dashboard). */
export const STEALTH_HIDDEN_ROUTES = new Set(["plus", "byoip", "byoas"]);

/** Routen, die ein aktives elizon+-Abo und sichtbare UI erfordern. */
export const PLUS_FEATURE_ROUTES = new Set(["storage", "vroute", "byoip", "byoas"]);

/**
 * Plus-Features, die ohne Abo auf das Plus-Angebot führen statt zur Übersicht —
 * wie die Webseite, die /dashboard/byoip ohne Abo auf /dashboard/plus umleitet.
 */
export const PLUS_UPGRADE_ROUTES = new Set(["byoip", "byoas"]);

export type StealthRouteName = "plus" | "byoip" | "byoas" | "storage" | "vroute";

export function isStealthHiddenRoute(routeName: string): routeName is StealthRouteName {
  return STEALTH_HIDDEN_ROUTES.has(routeName) || PLUS_FEATURE_ROUTES.has(routeName);
}

export function isRouteVisibleInStealth(routeName: string, user: AuthUser | null | undefined): boolean {
  const inUse =
    (routeName === "byoip" && user?.byoipInUse === true) ||
    (routeName === "byoas" && user?.byoasInUse === true);
  if (hidePlusUi(user) && STEALTH_HIDDEN_ROUTES.has(routeName) && !inUse) return false;
  if (PLUS_FEATURE_ROUTES.has(routeName) && !showPlusFeatures(user) && !inUse) return false;
  return true;
}

export function shouldShowTrafficPoolingUi(user: AuthUser | null | undefined): boolean {
  return isPlusCustomerUiVisible(user);
}
