import { useMemo, useState } from "react";

import { useAuth } from "../AuthProvider";
import { canManageBilling, canPurchase } from "../../lib/platform";
import { isBusinessAccount } from "../../lib/shop-catalog";
import { useProviderT } from "./use-provider-t";
import { ProviderActionBar } from "./ProviderActionBar";
import { ProviderFieldGrid } from "./ProviderFieldGrid";
import { isRegisteredProviderWidget, ProviderWidgetHost } from "./ProviderWidgetHost";
import { ServiceBillingPanel } from "./ServiceBillingPanel";
import { ServicePermissionsPanel } from "./ServicePermissionsPanel";
import { ServiceSlaPanel } from "./ServiceSlaPanel";
import { hasResolvedFieldDisplayValue } from "./format-field";
import type {
  ActionDispatchResponse,
  ProviderView as ProviderViewModel,
  ProviderViewAccess,
  ProviderWidgetContext,
  SectionDef,
  TabDef,
  WidgetSlot,
} from "./types";

const ADVANCED_TAB_ID = "__advanced";
const BILLING_TAB_ID = "billing";
const UPGRADE_TAB_ID = "upgrade";
const PERMISSIONS_TAB_ID = "permissions";
const SLA_TAB_ID = "sla";
const SETTINGS_TAB_ID = "settings";

/** Tabs rendered by dedicated panels (not schema widgets). Available for every provider. */
const SPECIAL_CONTENT_TABS = new Set([
  BILLING_TAB_ID,
  PERMISSIONS_TAB_ID,
  SLA_TAB_ID,
  SETTINGS_TAB_ID,
]);

/** Providers with a concrete upgrade panel ported to this client. */
const UPGRADE_PANEL_PROVIDERS = new Set(["MAILCOW", "PROXMOX", "PTERODACTYL", "PLESK", "PLOI", "KEYHELP"]);

function isUpgradeWidget(widgetId: string): boolean {
  return widgetId === "upgrade" || widgetId.includes("upgrade");
}

function pickWidgets(defined: WidgetSlot[] | undefined, allowed: Map<string, WidgetSlot>): WidgetSlot[] {
  if (!defined) return [];
  const purchaseAllowed = canPurchase();
  return defined
    .map((slot) => allowed.get(slot.widget))
    .filter((slot): slot is WidgetSlot => Boolean(slot))
    .filter((slot) => isRegisteredProviderWidget(slot.widget))
    .filter((slot) => !(isUpgradeWidget(slot.widget) && !purchaseAllowed));
}

function resolveTabLabel(t: (key: string) => string, labelKey: string, tabId: string): string {
  const translated = t(labelKey);
  if (translated && translated !== labelKey) return translated;
  const byId = t(tabId);
  if (byId && byId !== tabId) return byId;
  const fallback: Record<string, string> = {
    overview: t("overview") !== "overview" ? t("overview") : "Overview",
    domains: t("domains") !== "domains" ? t("domains") : "Domains",
    mailboxes: t("mailboxes") !== "mailboxes" ? t("mailboxes") : "Mailboxes",
    aliases: t("aliases") !== "aliases" ? t("aliases") : "Aliases",
    upgrade: t("serverTabUpgrade") !== "serverTabUpgrade" ? t("serverTabUpgrade") : "Upgrade",
    billing: t("billing") !== "billing" ? t("billing") : "Billing",
    sla: t("serverTabSla") !== "serverTabSla" ? t("serverTabSla") : "SLA",
    settings: t("serverTabSettings") !== "serverTabSettings" ? t("serverTabSettings") : "Settings",
    permissions: t("permissions") !== "permissions" ? t("permissions") : "Permissions",
    serverTabOverview: "Overview",
    serverTabUpgrade: "Upgrade",
    serverTabSettings: "Settings",
    serverTabSla: "SLA",
    providerTabAdvanced: t("providerTabAdvanced") !== "providerTabAdvanced" ? t("providerTabAdvanced") : "Advanced",
  };
  return fallback[labelKey] || fallback[tabId] || tabId;
}

type Props = {
  view: ProviderViewModel;
  serviceId: string;
  resourceName?: string;
  access?: ProviderViewAccess | null;
  widgetContext?: ProviderWidgetContext;
  onActionCompleted?: (actionKey: string, result: ActionDispatchResponse) => void;
  onOpenBilling?: () => void;
  onRefresh?: () => void;
  onNavigateToInvoices?: () => void;
  onNavigateToInvoiceDetail?: (invoiceId: string) => void;
  onNavigateToInvoicePay?: (invoiceId: string) => void;
  onNavigateToCart?: () => void;
};

/**
 * Mobile schema-driven provider surface. Renders header (Tier-1) actions,
 * Ebene-1 sections, an Ebene-2 tab rail and Ebene-3 behind an "Erweitert" tab
 * (AGENTS.md §3.1). Only tabs with real content appear in the rail.
 */
export function ProviderView({
  view,
  serviceId,
  resourceName,
  access,
  widgetContext,
  onActionCompleted,
  onOpenBilling,
  onRefresh,
  onNavigateToInvoices,
  onNavigateToInvoiceDetail,
  onNavigateToInvoicePay,
  onNavigateToCart,
}: Props) {
  const t = useProviderT();
  const { user } = useAuth();
  const { layout } = view;

  const billingAllowed = canManageBilling() && access?.canManageBilling !== false;
  const purchaseAllowed = canPurchase();
  const slaAllowed = isBusinessAccount(user?.accountType);

  const allowedWidgets = useMemo(() => {
    const map = new Map<string, WidgetSlot>();
    for (const slot of view.widgets) {
      if (!isRegisteredProviderWidget(slot.widget)) continue;
      if (isUpgradeWidget(slot.widget) && !purchaseAllowed) continue;
      if (!map.has(slot.widget)) map.set(slot.widget, slot);
    }
    return map;
  }, [view.widgets, purchaseAllowed]);

  const actionsByKey = useMemo(() => new Map(view.actions.map((a) => [a.key, a])), [view.actions]);
  const fieldsByKey = useMemo(() => new Map(view.fields.map((f) => [f.key, f])), [view.fields]);

  const headerActions = useMemo(() => {
    const keys = (layout.header ?? []).flatMap((slot) => slot.actions ?? []);
    return keys.map((key) => actionsByKey.get(key)).filter((a): a is NonNullable<typeof a> => Boolean(a));
  }, [layout.header, actionsByKey]);

  const mergedWidgetContext = useMemo<ProviderWidgetContext>(
    () => ({
      ...widgetContext,
      access: widgetContext?.access ?? access ?? null,
      onNavigateToCart: onNavigateToCart ?? widgetContext?.onNavigateToCart,
    }),
    [widgetContext, access, onNavigateToCart],
  );

  const visibleTabs = useMemo(() => {
    const providerType = String(view.providerType || "").toUpperCase();
    const tabs = (view.tabs ?? []).filter((tab) => {
      if (tab.id === BILLING_TAB_ID) return billingAllowed;
      if (tab.id === UPGRADE_TAB_ID) {
        return purchaseAllowed && UPGRADE_PANEL_PROVIDERS.has(providerType);
      }
      // SLA: Geschäftskonten only (parity with BUSINESS_OWNER_OR_ADMIN).
      if (tab.id === SLA_TAB_ID) return slaAllowed;
      // Freigaben / Einstellungen: schema-gated, content for every provider.
      if (SPECIAL_CONTENT_TABS.has(tab.id)) return true;

      const hasFields = (tab.fields?.length ?? 0) > 0;
      const hasActions = (tab.actions?.length ?? 0) > 0;
      const tabWidgets = pickWidgets(tab.widgets, allowedWidgets);
      const sectionWidgets = pickWidgets(
        (layout.sections ?? [])
          .filter((s) => s.id === tab.id)
          .flatMap((s) => [...(s.widgets ?? []), ...(s.slots ?? []).flatMap((sl) => sl.widgets ?? [])]),
        allowedWidgets,
      );

      return tabWidgets.length > 0 || sectionWidgets.length > 0 || hasFields || hasActions;
    });

    if ((layout.advanced?.length ?? 0) > 0) {
      tabs.push({ id: ADVANCED_TAB_ID, labelKey: "providerTabAdvanced", tier: 3 });
    }
    return tabs;
  }, [view.tabs, view.providerType, layout.advanced, layout.sections, allowedWidgets, billingAllowed, purchaseAllowed, slaAllowed]);

  const [activeKey, setActiveKey] = useState<string>("");
  const activeTab = visibleTabs.find((tab) => tab.id === activeKey) ?? visibleTabs[0];

  const renderSection = (section: SectionDef) => {
    const sectionFields = (section.fields ?? [])
      .map((key) => fieldsByKey.get(key))
      .filter((f): f is NonNullable<typeof f> => Boolean(f))
      .filter((f) => hasResolvedFieldDisplayValue(f));
    const sectionWidgets = pickWidgets(
      [...(section.widgets ?? []), ...(section.slots ?? []).flatMap((s) => s.widgets ?? [])],
      allowedWidgets,
    );

    if (sectionFields.length === 0 && sectionWidgets.length === 0) return null;

    return (
      <section key={section.id} className="space-y-3">
        {section.labelKey ? (
          <h2 className="text-sm font-semibold text-(--text-primary)">
            {resolveTabLabel(t, section.labelKey, section.id)}
          </h2>
        ) : null}
        {sectionFields.length > 0 ? <ProviderFieldGrid fields={sectionFields} /> : null}
        {sectionWidgets.length > 0 ? (
          <ProviderWidgetHost slots={sectionWidgets} serviceId={serviceId} context={mergedWidgetContext} />
        ) : null}
      </section>
    );
  };

  const renderTabBody = (tab: TabDef) => {
    if (tab.id === BILLING_TAB_ID) {
      return (
        <ServiceBillingPanel
          serviceId={serviceId}
          serviceName={resourceName ?? serviceId}
          onRefresh={onRefresh}
          onNavigateToInvoices={onNavigateToInvoices ?? onOpenBilling}
          onNavigateToInvoiceDetail={onNavigateToInvoiceDetail}
          onNavigateToInvoicePay={onNavigateToInvoicePay}
        />
      );
    }

    if (tab.id === PERMISSIONS_TAB_ID) {
      return <ServicePermissionsPanel serviceId={serviceId} />;
    }

    if (tab.id === SLA_TAB_ID) {
      return <ServiceSlaPanel serviceId={serviceId} />;
    }

    if (tab.id === SETTINGS_TAB_ID) {
      const settingsSlots = pickWidgets(tab.widgets, allowedWidgets);
      const slots =
        settingsSlots.length > 0
          ? settingsSlots
          : ([{ widget: "settings-panel" }] as WidgetSlot[]);
      return (
        <div className="space-y-4">
          <ProviderWidgetHost slots={slots} serviceId={serviceId} context={mergedWidgetContext} />
        </div>
      );
    }

    if (tab.id === ADVANCED_TAB_ID) {
      return <div className="space-y-4">{(layout.advanced ?? []).map((section) => renderSection(section))}</div>;
    }

    const matchingSections = (layout.sections ?? []).filter((s) => s.id === tab.id);
    const tabFields = (tab.fields ?? [])
      .map((key) => fieldsByKey.get(key))
      .filter((f): f is NonNullable<typeof f> => Boolean(f));
    const tabActions = (tab.actions ?? [])
      .map((key) => actionsByKey.get(key))
      .filter((a): a is NonNullable<typeof a> => Boolean(a));
    const tabWidgets = pickWidgets(tab.widgets, allowedWidgets);

    const hasContent =
      matchingSections.length > 0 || tabFields.length > 0 || tabActions.length > 0 || tabWidgets.length > 0;

    if (!hasContent) {
      return <div className="glass p-6 text-sm text-(--text-muted)">{t("providerTabEmpty")}</div>;
    }

    return (
      <div className="space-y-4">
        {matchingSections.map((section) => renderSection(section))}
        {matchingSections.length === 0 && tabFields.length > 0 ? <ProviderFieldGrid fields={tabFields} /> : null}
        {tabActions.length > 0 ? (
          <ProviderActionBar
            serviceId={serviceId}
            actions={tabActions}
            resourceName={resourceName}
            onCompleted={onActionCompleted}
          />
        ) : null}
        {tabWidgets.length > 0 ? (
          <ProviderWidgetHost slots={tabWidgets} serviceId={serviceId} context={mergedWidgetContext} />
        ) : null}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {headerActions.length > 0 ? (
        <ProviderActionBar
          serviceId={serviceId}
          actions={headerActions}
          resourceName={resourceName}
          onCompleted={onActionCompleted}
        />
      ) : null}

      {visibleTabs.length > 1 && activeTab ? (
        <div className="scrollbar-thin -mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
          {visibleTabs.map((tab) => {
            const active = activeTab.id === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveKey(tab.id)}
                className={`min-h-9 shrink-0 whitespace-nowrap rounded-xl px-3.5 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-(--brand-primary) text-white"
                    : "glass text-(--text-secondary) hover:text-(--text-primary)"
                }`}
              >
                {resolveTabLabel(t, tab.labelKey, tab.id)}
              </button>
            );
          })}
        </div>
      ) : null}

      {activeTab ? (
        renderTabBody(activeTab)
      ) : (
        <div className="space-y-4">{(layout.sections ?? []).map((section) => renderSection(section))}</div>
      )}
    </div>
  );
}
