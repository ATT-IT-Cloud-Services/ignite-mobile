import { useEffect } from "react";

import { useAuth } from "./AuthProvider";
import { CustomerFeatureUnavailable } from "./CustomerFeatureUnavailable";
import { useRouter } from "./Router";
import type { Route } from "./Router";
import {
  hidePlusUi,
  isRouteVisibleInStealth,
  PLUS_FEATURE_ROUTES,
  PLUS_UPGRADE_ROUTES,
  STEALTH_HIDDEN_ROUTES,
} from "../lib/plus";

type PlusStealthGuardProps = {
  routeName: Route["name"];
  children: React.ReactNode;
};

/**
 * Blockiert elizon+-Flächen im Kunden-Stealth wie im Web-Dashboard.
 * Stealth-Routen zeigen „Funktion nicht verfügbar“, Plus-Routen leiten um.
 */
export function PlusStealthGuard({ routeName, children }: PlusStealthGuardProps) {
  const { user, isLoading } = useAuth();
  const { navigate } = useRouter();

  const isStealthRoute = STEALTH_HIDDEN_ROUTES.has(routeName);
  const isPlusRoute = PLUS_FEATURE_ROUTES.has(routeName);
  const guarded = isStealthRoute || isPlusRoute;
  const visible = isRouteVisibleInStealth(routeName, user);

  useEffect(() => {
    if (isLoading || !guarded || visible) return;
    if (hidePlusUi(user) && isStealthRoute) return;
    if (isPlusRoute) {
      // Without a subscription a direct hit on a bring-your-own feature lands
      // on the Plus offer (like the web dashboard); when the Plus UI is hidden
      // there is no offer to show, so the customer goes back to the overview.
      if (!hidePlusUi(user) && PLUS_UPGRADE_ROUTES.has(routeName)) {
        navigate({ name: "plus" });
      } else {
        navigate({ name: "dashboard" });
      }
    }
  }, [guarded, isLoading, isPlusRoute, isStealthRoute, navigate, routeName, user, visible]);

  if (!guarded) return <>{children}</>;
  if (isLoading) return null;

  if (!visible) {
    // Stealth hides the Plus offer entirely — state it instead of redirecting.
    // Running BYOIP/BYOAS usage stays visible (see isRouteVisibleInStealth).
    if (hidePlusUi(user) && isStealthRoute) {
      return <CustomerFeatureUnavailable />;
    }
    return null;
  }

  return <>{children}</>;
}
