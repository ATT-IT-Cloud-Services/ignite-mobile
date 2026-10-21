import { BarChart3 } from "lucide-react";

import { Progress } from "../../ui/progress";
import { useProviderT } from "../use-provider-t";
import type { ProviderWidgetProps } from "../types";

function clampPercent(used: number, max: number): number {
  if (max <= 0) return 0;
  return Math.min(100, Math.round((used / max) * 100));
}

function StatCell({
  label,
  value,
  percent,
}: {
  label: string;
  value: string;
  percent?: number;
}) {
  return (
    <div className="min-w-0 rounded-xl border border-border bg-white/5 px-3 py-3">
      <div className="text-xs text-(--text-muted)">{label}</div>
      <div className="mt-1 text-sm font-medium tabular-nums text-(--text-primary)">{value}</div>
      {typeof percent === "number" ? (
        <Progress className="mt-2 h-1.5" value={percent} tone="primary" />
      ) : null}
    </div>
  );
}

function MailcowUsage({ context }: ProviderWidgetProps) {
  const t = useProviderT();
  const stats = context?.server?.mailcowStats;
  if (!stats) {
    return <p className="text-sm text-(--text-muted)">{t("hostingUsageEmpty")}</p>;
  }

  const domainUsed = stats.usedDomains ?? 0;
  const domainMax = stats.maxDomains ?? 0;
  const mailboxUsed = stats.usedMailboxes ?? 0;
  const mailboxMax =
    domainMax > 0 && stats.maxMailboxesPerDomain > 0
      ? domainMax * stats.maxMailboxesPerDomain
      : 0;

  return (
    <div className="grid grid-cols-2 gap-3">
      <StatCell
        label={t("serverMailcowDomains")}
        value={`${domainUsed} / ${domainMax}`}
        percent={clampPercent(domainUsed, domainMax)}
      />
      <StatCell
        label={t("serverMailcowMailboxes")}
        value={`${mailboxUsed} / ${mailboxMax || "—"}`}
        percent={mailboxMax > 0 ? clampPercent(mailboxUsed, mailboxMax) : undefined}
      />
      <StatCell
        label={t("serverMailcowStoragePerMailbox")}
        value={`${stats.storagePerMailboxGb} GB`}
      />
      <StatCell
        label={t("serverMailcowAliasesPerDomain")}
        value={String(stats.maxAliasesPerDomain)}
      />
    </div>
  );
}

function PleskUsage({ context }: ProviderWidgetProps) {
  const t = useProviderT();
  const stats = context?.server?.pleskStats;
  if (!stats) {
    return <p className="text-sm text-(--text-muted)">{t("hostingUsageEmpty")}</p>;
  }

  const usedDomains = stats.usedDomains ?? 0;
  const maxDomains = stats.maxDomains ?? 0;
  const avgUsedGb = stats.avgStorageUsedGb ?? 0;
  const storagePerDomainGb = stats.storagePerDomainGb ?? 0;
  const usedMailboxes = stats.usedMailboxes ?? 0;
  const maxMailboxesPerDomain = stats.maxMailboxesPerDomain ?? -1;
  const mailEnabled = maxMailboxesPerDomain >= 0;
  const mailboxMax =
    mailEnabled && maxDomains > 0 && maxMailboxesPerDomain > 0
      ? maxDomains * maxMailboxesPerDomain
      : 0;

  return (
    <div className="grid grid-cols-2 gap-3">
      <StatCell
        label={t("pleskDomains")}
        value={`${usedDomains} / ${maxDomains || "—"}`}
        percent={clampPercent(usedDomains, maxDomains)}
      />
      <StatCell
        label={t("pleskAvgStorage")}
        value={`${avgUsedGb.toFixed(1)} / ${storagePerDomainGb || "—"} GB`}
        percent={clampPercent(avgUsedGb, storagePerDomainGb)}
      />
      <StatCell
        label={t("pleskMailboxes")}
        value={
          mailEnabled
            ? mailboxMax > 0
              ? `${usedMailboxes} / ${mailboxMax}`
              : String(usedMailboxes)
            : "—"
        }
        percent={mailEnabled && mailboxMax > 0 ? clampPercent(usedMailboxes, mailboxMax) : undefined}
      />
      <StatCell label={t("serverLocation")} value={stats.locationLabel?.trim() || "—"} />
    </div>
  );
}

/**
 * Overview usage for hosting providers (Mailcow / Plesk). Driven by schema
 * widget `hosting-usage` with optional `variant` prop.
 */
export default function HostingUsageWidget({ context, slot }: ProviderWidgetProps) {
  const t = useProviderT();
  const providerType = String(context?.server?.providerType || "").toUpperCase();
  const variant =
    (typeof slot?.props?.variant === "string" && slot.props.variant) ||
    (providerType === "MAILCOW" ? "mailcow" : "plesk");

  return (
    <section className="glass p-4">
      <div className="flex items-center gap-2">
        <BarChart3 className="size-5 shrink-0 text-(--text-muted)" />
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-(--text-primary)">{t("hostingUsageTitle")}</h3>
          <p className="text-xs text-(--text-muted)">{t("hostingUsageDesc")}</p>
        </div>
      </div>
      <div className="mt-3">
        {variant === "mailcow" ? (
          <MailcowUsage context={context} slot={slot} />
        ) : (
          <PleskUsage context={context} slot={slot} />
        )}
      </div>
    </section>
  );
}
