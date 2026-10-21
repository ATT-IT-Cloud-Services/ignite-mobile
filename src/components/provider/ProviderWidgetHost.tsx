import type { ComponentType } from "react";
import { Puzzle } from "lucide-react";

import { canPurchase } from "../../lib/platform";
import { useProviderT } from "./use-provider-t";
import ResourceUsageWidget from "./widgets/ResourceUsageWidget";
import IpAddressesWidget from "./widgets/IpAddressesWidget";
import ConsoleWidget from "./widgets/ConsoleWidget";
import HostingUsageWidget from "./widgets/HostingUsageWidget";
import MailcowDomainsWidget from "./widgets/MailcowDomainsWidget";
import MailcowMailboxesWidget from "./widgets/MailcowMailboxesWidget";
import MailcowAliasesWidget from "./widgets/MailcowAliasesWidget";
import SettingsPanelWidget from "./widgets/SettingsPanelWidget";
import UpgradePanelWidget from "./widgets/UpgradePanelWidget";
import FeatureTabsWidget from "./widgets/FeatureTabsWidget";
import TrafficChartWidget from "./widgets/TrafficChartWidget";
import StartupVarsWidget from "./widgets/StartupVarsWidget";
import BackupListWidget from "./widgets/BackupListWidget";
import TeamspeakWidget from "./widgets/TeamspeakWidget";
import FirewallTableWidget from "./widgets/FirewallTableWidget";
import FileManagerWidget from "./widgets/FileManagerWidget";
import ProviderCredentialsWidget from "./widgets/ProviderCredentialsWidget";
import ProviderDomainsWidget from "./widgets/ProviderDomainsWidget";
import BackupStorageWidget from "./widgets/BackupStorageWidget";
import PloiWidget from "./widgets/PloiWidget";
import ReinstallWizardWidget from "./widgets/ReinstallWizardWidget";
import ProviderSetupWidget from "./widgets/ProviderSetupWidget";
import BackupPruneWidget from "./widgets/BackupPruneWidget";
import GameEulaWidget from "./widgets/GameEulaWidget";
import MonitoringWidget from "./widgets/MonitoringWidget";
import PloiActionsWidget from "./widgets/PloiActionsWidget";
import PackageSwitchWidget from "./widgets/PackageSwitchWidget";
import type { ProviderWidgetContext, ProviderWidgetProps, WidgetSlot } from "./types";

/**
 * Mobile widget component map. Schema-driven layout only renders widgets that
 * are registered here — unknown slots are skipped (no raw widget-id stubs).
 */
const WIDGET_COMPONENTS: Record<string, ComponentType<ProviderWidgetProps>> = {
  "resource-usage": ResourceUsageWidget,
  "ip-addresses": IpAddressesWidget,
  "game-network": IpAddressesWidget,
  "console-vnc": ConsoleWidget,
  "console-terminal": ConsoleWidget,
  "hosting-usage": HostingUsageWidget,
  "mailcow-domains": MailcowDomainsWidget,
  "mailcow-mailboxes": MailcowMailboxesWidget,
  "mailcow-aliases": MailcowAliasesWidget,
  "settings-panel": SettingsPanelWidget,
  "upgrade-panel": UpgradePanelWidget,
  "feature-tabs": FeatureTabsWidget,
  "traffic-chart": TrafficChartWidget,
  "traffic": TrafficChartWidget,
  "startup-vars": StartupVarsWidget,
  "backup-list": BackupListWidget,
  "teamspeak-instance": TeamspeakWidget,
  "teamspeak-statistics": TeamspeakWidget,
  "firewall-table": FirewallTableWidget,
  "file-manager": FileManagerWidget,
  "plesk-credentials": ProviderCredentialsWidget,
  "keyhelp-credentials": ProviderCredentialsWidget,
  "plesk-domains": ProviderDomainsWidget,
  "keyhelp-domains": ProviderDomainsWidget,
  "backup-storage-overview": BackupStorageWidget,
  "backup-namespaces": BackupStorageWidget,
  "ploi-storage": PloiWidget,
  "ploi-dns": PloiWidget,
  "reinstall-wizard": ReinstallWizardWidget,
  "plesk-setup-wizard": ProviderSetupWidget,
  "keyhelp-setup-wizard": ProviderSetupWidget,
  "backup-prune": BackupPruneWidget,
  "game-eula": GameEulaWidget,
  "monitoring": MonitoringWidget,
  "ploi-deploy": PloiActionsWidget,
  "ploi-env": PloiActionsWidget,
  "ploi-ssl": PloiActionsWidget,
  "ploi-cron": PloiActionsWidget,
  "ploi-queue": PloiActionsWidget,
  "ploi-wordpress": PloiActionsWidget,
  "ploi-fastcgi": PloiActionsWidget,
  "ploi-nginx": PloiActionsWidget,
  "package-switch-panel": PackageSwitchWidget,
};

export function isRegisteredProviderWidget(widgetId: string): boolean {
  return Object.prototype.hasOwnProperty.call(WIDGET_COMPONENTS, widgetId);
}

function isUpgradeWidget(widgetId: string): boolean {
  return widgetId === "upgrade" || widgetId.includes("upgrade");
}

function UnavailableWidget({ title }: { title: string }) {
  const t = useProviderT();
  return (
    <section className="glass p-4">
      <div className="flex items-center gap-2">
        <Puzzle className="size-5 shrink-0 text-(--text-muted)" />
        <h3 className="text-sm font-medium text-(--text-primary)">{title}</h3>
      </div>
      <p className="mt-1.5 text-xs text-(--text-muted)">{t("providerWidgetUnavailable")}</p>
    </section>
  );
}

export function ProviderWidgetHost({
  slots,
  serviceId,
  context,
  className,
}: {
  slots: WidgetSlot[];
  serviceId?: string;
  context?: ProviderWidgetContext;
  className?: string;
}) {
  const t = useProviderT();
  const purchaseAllowed = canPurchase();
  const visibleSlots = slots.filter((slot) => {
    if (!isRegisteredProviderWidget(slot.widget)) return false;
    if (isUpgradeWidget(slot.widget) && !purchaseAllowed) return false;
    return true;
  });
  if (visibleSlots.length === 0) return null;

  return (
    <div className={`space-y-4 ${className ?? ""}`}>
      {visibleSlots.map((slot, index) => {
        const Widget = WIDGET_COMPONENTS[slot.widget];
        const key = `${slot.widget}-${index}`;
        if (!Widget) {
          return <UnavailableWidget key={key} title={t("providerTabEmpty")} />;
        }
        return <Widget key={key} slot={slot} serviceId={serviceId} context={context} />;
      })}
    </div>
  );
}
