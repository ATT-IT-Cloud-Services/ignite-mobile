import { useEffect, useState } from "react";
import { Capacitor } from "@capacitor/core";
import { Loader2 } from "lucide-react";

import { BrandFonts } from './components/BrandFonts';
import { CartProvider } from './components/cart/CartProvider';
import { AuthProvider, useAuth } from './components/AuthProvider';
import { LegalProvider } from './components/legal/LegalProvider';
import { CapabilityGuard } from './capabilities/CapabilityGuard';
import { BottomNav } from './components/shell/BottomNav';
import { Header } from './components/shell/Header';
import { Sidebar } from './components/shell/Sidebar';
import { RouterProvider, useRouter, useTab } from './components/Router';
import { ThemeProvider } from './components/ThemeProvider';
import { ToastProvider } from './components/Toast';
import { I18nProvider } from './i18n';
import { PlusStealthGuard } from './components/PlusStealthGuard';
import { HostedFlowBridge } from './components/HostedFlowBridge';
import { IdVerificationEnforcementGate } from './components/dashboard/IdVerificationEnforcementGate';
import { TenantTransferConsentGate } from './components/dashboard/TenantTransferConsentGate';
import { DobCollectionModal } from './components/dashboard/DobCollectionModal';
import { AffiliateScreen } from './screens/AffiliateScreen';
import { ByoipScreen } from './screens/ByoipScreen';
import { ByoasScreen } from './screens/ByoasScreen';
import { DocumentsScreen } from './screens/DocumentsScreen';
import { TeamScreen } from './screens/TeamScreen';
import { TeamInviteScreen } from './screens/TeamInviteScreen';
import { FloatingIpsScreen } from './screens/FloatingIpsScreen';
import { WalletScreen, InvoicePayScreen, InvoiceDetailScreen } from './features/billing';
import { BusinessScreen } from './screens/BusinessScreen';
import { ContainerScreen } from './screens/ContainerScreen';
import { ContainerProjectScreen } from './screens/ContainerProjectScreen';
import { ContainerWorkloadScreen } from './screens/ContainerWorkloadScreen';
import { ConsoleScreen } from './screens/ConsoleScreen';
import { DashboardScreen } from './screens/DashboardScreen';
import { PlusScreen } from './screens/PlusScreen';
import { HostedFlowScreen } from './screens/HostedFlowScreen';
import { SSHKeysScreen } from './screens/SSHKeysScreen';
import { SubdomainsScreen } from './screens/SubdomainsScreen';
import { DomainsScreen } from './screens/DomainsScreen';
import { FamilyScreen } from './screens/FamilyScreen';
import { FeedbackScreen } from './screens/FeedbackScreen';
import { InvoicesScreen } from './screens/InvoicesScreen';
import { IpManagerScreen } from './screens/IpManagerScreen';
import { MonthlyOffersScreen } from './screens/MonthlyOffersScreen';
import { AuthGateScreen } from './screens/AuthGateScreen';
import { VerifyAccountScreen } from './screens/VerifyAccountScreen';
import { PermissionAcceptScreen } from './screens/PermissionAcceptScreen';
import { ServerDetailScreen } from './screens/ServerDetailScreen';
import { ServersScreen } from './screens/ServersScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { ShopOverviewScreen } from './features/shop/ShopOverviewScreen';
import { ShopCategoryScreen } from './features/shop/ShopCategoryScreen';
import { ShopProductScreen } from './features/shop/ShopProductScreen';
import { ShopAudienceProvider } from './components/shop/ShopAudienceProvider';
import { ShopTaxCountryProvider } from './components/shop/ShopTaxCountryProvider';
import { CartScreen } from './screens/CartScreen';
import { CheckoutScreen } from './features/checkout';
import { StorageScreen } from './screens/StorageScreen';
import { SupportScreen } from './screens/SupportScreen';
import { BlogScreen } from './screens/BlogScreen';
import { BlogDetailScreen } from './screens/BlogDetailScreen';
import { VrouteScreen } from './screens/VrouteScreen';
import { getDesktopOS, getMobileOS, isDesktopClient, isElectron, isMobileNative } from './lib/platform';
import {
  reconcileMobilePushWithOsPermission,
  setPushNavigateHandler,
  syncMobilePushAfterAuth,
} from './lib/push-notifications';

import "./index.css";

export function App() {
  useEffect(() => {
    const root = document.documentElement;
    const mobileNative = isMobileNative();
    const desktopClient = isDesktopClient();
    const desktopOS = getDesktopOS();
    const mobileOS = getMobileOS();

    root.classList.toggle("ios", mobileOS === "ios");
    root.classList.toggle("android", mobileOS === "android");
    root.classList.toggle("native", mobileNative);
    root.classList.toggle("electron", isElectron());
    root.classList.toggle("mobile-app", mobileNative);
    root.classList.toggle("desktop-client", desktopClient);
    root.classList.toggle("desktop-dashboard", desktopClient);
    root.classList.toggle("platform-darwin", desktopOS === "darwin");
    root.classList.toggle("platform-win32", desktopOS === "win32");
    root.classList.toggle("platform-linux", desktopOS === "linux");
    root.classList.toggle("platform-web", desktopOS === "web");
  }, []);

  return (
    <ThemeProvider>
      <BrandFonts />
      <I18nProvider>
        <ToastProvider>
          <AuthProvider>
            <CartProvider>
              <RouterProvider>
                <HostedFlowBridge />
                <Shell />
              </RouterProvider>
            </CartProvider>
          </AuthProvider>
        </ToastProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}

function Shell() {
  const { isLoading, isAuthenticated, user, pendingDevActivationCode } = useAuth();
  const { route } = useRouter();
  const needsEmailVerification = isAuthenticated && user != null && user.emailVerified === false;

  if (route.name === "hosted-flow") {
    return (
      <HostedFlowScreen
        url={route.url}
        title={route.title}
        fallbackRoute={route.fallbackRoute}
      />
    );
  }

  return (
    <>
      <div className="app-shell flex h-dvh min-h-0 flex-1 flex-col overflow-hidden">
        {isLoading ? (
          <BootScreen />
        ) : !isAuthenticated ? (
          <AuthGateScreen />
        ) : needsEmailVerification ? (
          <div className="relative flex h-full min-h-0 flex-1 flex-col overflow-y-auto bg-(--bg-base) px-4 py-8 sm:px-6">
            <VerifyAccountScreen initialDevCode={pendingDevActivationCode} />
          </div>
        ) : (
          <LegalProvider>
            <AuthenticatedShell />
          </LegalProvider>
        )}
      </div>
    </>
  );
}

function BackButtonHandler() {
  const { back, canGoBack, route, navigate } = useRouter();

  useEffect(() => {
    if (!isMobileNative()) return;

    const appPlugin = (Capacitor as any).Plugins?.App;
    if (!appPlugin?.addListener) return;

    const listener = appPlugin.addListener("backButton", () => {
      if (canGoBack) {
        back();
        return;
      }
      if (route.name !== "dashboard") {
        navigate({ name: "dashboard" });
        return;
      }
      appPlugin.exitApp?.();
    });

    return () => {
      listener.remove?.();
    };
  }, [back, canGoBack, navigate, route.name]);

  return null;
}

function AuthenticatedShell() {
  const { route, navigate } = useRouter();
  const { tab, setTab } = useTab();
  const { user } = useAuth();
  const mobileNative = isMobileNative();
  const [dobCollected, setDobCollected] = useState(false);
  const needsDob = !dobCollected && user != null && !user.dateOfBirth;

  useEffect(() => {
    void syncMobilePushAfterAuth();
  }, []);

  // Re-check after returning from system settings (esp. Android notification master switch).
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        void reconcileMobilePushWithOsPermission();
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
    };
  }, []);

  useEffect(() => {
    setPushNavigateHandler(({ serviceId }) => {
      if (serviceId) {
        navigate({ name: "server", id: serviceId });
        return;
      }
      navigate({ name: "dashboard" });
    });
    return () => setPushNavigateHandler(null);
  }, [navigate]);

  return (
    <>
      {/*
        On native, pin the authenticated shell to the visual viewport.
        Capacitor WebViews can pan the document even with overflow:hidden on html/body;
        a fixed shell keeps header + bottom nav from scrolling away.
      */}
      <div
        className={
          mobileNative
            ? "fixed inset-0 z-0 flex flex-col overflow-hidden bg-(--bg-base)"
            : "flex min-h-0 flex-1"
        }
      >
        {!mobileNative && <Sidebar routeName={route.name} navigate={navigate} />}
        <div
          className={`flex min-h-0 flex-1 flex-col overflow-hidden ${
            mobileNative ? "" : "lg:ml-64"
          }`}
        >
          <Header />
          <div className="app-main min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain px-4 pt-2 pb-4 lg:px-6 lg:py-6">
              {route.name === "dashboard" && <DashboardScreen />}
              {route.name === "servers" && <ServersScreen />}
              {route.name === "server" && <ServerDetailScreen id={route.id} />}
              {route.name === "billing" && (
                <CapabilityGuard capability="wallet">
                  <WalletScreen />
                </CapabilityGuard>
              )}
              {route.name === "plus" && (
                <PlusStealthGuard routeName="plus">
                  <PlusScreen />
                </PlusStealthGuard>
              )}
              {route.name === "invoices" && (
                <CapabilityGuard capability="billing">
                  <InvoicesScreen />
                </CapabilityGuard>
              )}
              {route.name === "invoice-detail" && (
                <CapabilityGuard capability="billing">
                  <InvoiceDetailScreen id={route.id} />
                </CapabilityGuard>
              )}
              {route.name === "invoice-pay" && (
                <CapabilityGuard capability="billing">
                  <InvoicePayScreen id={route.id} />
                </CapabilityGuard>
              )}
              {route.name === "permission-accept" && <PermissionAcceptScreen permissionId={route.permissionId} />}
              {route.name === "support" && <SupportScreen />}
              {route.name === "blog" && <BlogScreen />}
              {route.name === "blog-detail" && <BlogDetailScreen slug={route.slug} />}
              {route.name === "settings" && <SettingsScreen />}
              {route.name === "shop" && (
                <CapabilityGuard capability="purchase">
                  <ShopAudienceProvider>
                    <ShopTaxCountryProvider>
                      <ShopOverviewScreen />
                    </ShopTaxCountryProvider>
                  </ShopAudienceProvider>
                </CapabilityGuard>
              )}
              {route.name === "shop-category" && (
                <CapabilityGuard capability="purchase">
                  <ShopAudienceProvider>
                    <ShopTaxCountryProvider>
                      <ShopCategoryScreen categoryKey={route.categoryKey} />
                    </ShopTaxCountryProvider>
                  </ShopAudienceProvider>
                </CapabilityGuard>
              )}
              {route.name === "shop-product" && (
                <CapabilityGuard capability="purchase">
                  <ShopAudienceProvider>
                    <ShopTaxCountryProvider>
                      <ShopProductScreen categoryKey={route.categoryKey} productSlug={route.productSlug} />
                    </ShopTaxCountryProvider>
                  </ShopAudienceProvider>
                </CapabilityGuard>
              )}
              {route.name === "cart" && (
                <CapabilityGuard capability="purchase">
                  <CartScreen />
                </CapabilityGuard>
              )}
              {route.name === "checkout" && (
                <CapabilityGuard capability="purchase">
                  <CheckoutScreen />
                </CapabilityGuard>
              )}
              {route.name === "storage" && (
                <PlusStealthGuard routeName="storage">
                  <StorageScreen />
                </PlusStealthGuard>
              )}
              {route.name === "subdomains" && <SubdomainsScreen />}
              {route.name === "domains" && <DomainsScreen />}
              {route.name === "ip-manager" && <IpManagerScreen />}
              {route.name === "byoip" && (
                <PlusStealthGuard routeName="byoip">
                  <ByoipScreen />
                </PlusStealthGuard>
              )}
              {route.name === "byoas" && (
                <PlusStealthGuard routeName="byoas">
                  <ByoasScreen />
                </PlusStealthGuard>
              )}
              {route.name === "documents" && <DocumentsScreen />}
              {route.name === "team" && <TeamScreen />}
              {route.name === "team-invite" && <TeamInviteScreen token={route.token} />}
              {route.name === "floating-ips" && (
                <CapabilityGuard capability="floatingIps">
                  <FloatingIpsScreen />
                </CapabilityGuard>
              )}
              {route.name === "ssh-keys" && <SSHKeysScreen />}
              {route.name === "affiliate" && <AffiliateScreen />}
              {route.name === "feedback" && <FeedbackScreen />}
              {route.name === "business" && <BusinessScreen />}
              {route.name === "container" && <ContainerScreen />}
              {route.name === "container-project" && <ContainerProjectScreen id={route.id} />}
              {route.name === "container-workload" && (
                <ContainerWorkloadScreen projectId={route.projectId} workloadId={route.workloadId} />
              )}
              {route.name === "family" && <FamilyScreen />}
              {route.name === "vroute" && (
                <PlusStealthGuard routeName="vroute">
                  <VrouteScreen />
                </PlusStealthGuard>
              )}
              {route.name === "monthly-offers" && <MonthlyOffersScreen />}
              {route.name === "console" && <ConsoleScreen id={route.id} />}
          </div>
          {mobileNative && <BottomNav active={tab} onChange={setTab} />}
        </div>
      </div>
      {needsDob ? <DobCollectionModal onComplete={() => setDobCollected(true)} /> : null}
      <IdVerificationEnforcementGate />
      <TenantTransferConsentGate />
      {mobileNative && <BackButtonHandler />}
    </>
  );
}

function BootScreen() {
  return (
    <div className="flex flex-1 items-center justify-center">
      <Loader2 className="size-6 animate-spin" style={{ color: "var(--primary)" }} />
    </div>
  );
}

export default App;
