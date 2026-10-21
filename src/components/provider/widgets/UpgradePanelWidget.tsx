import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, Loader2 } from "lucide-react";

import { api } from "../../../lib/api";
import { resolveCaughtApiError } from "../../../api/resolve-caught-error";
import { computePeriodPrice } from "../../../lib/billing";
import { cartService, type CartItem } from "../../../lib/cart-service";
import { canPurchase } from "../../../lib/platform";
import { useI18n } from "../../../i18n";
import { useToast } from "../../Toast";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { ConfirmModal } from "../../ui/ConfirmModal";
import { useProviderT } from "../use-provider-t";
import ResourceUpgradeWidget from "./ResourceUpgradeWidget";
import type { ProviderWidgetProps } from "../types";

type MailcowLimitKey =
  | "maxDomains"
  | "maxMailboxesPerDomain"
  | "storagePerMailboxGb"
  | "maxAliasesPerDomain";

const FIELD_ORDER: MailcowLimitKey[] = [
  "maxDomains",
  "maxMailboxesPerDomain",
  "storagePerMailboxGb",
  "maxAliasesPerDomain",
];

/**
 * Mailcow limit upgrade/downgrade → cart. Shown only when purchases are allowed
 * on this client (see canPurchase).
 */
export default function UpgradePanelWidget({ slot, serviceId, context }: ProviderWidgetProps) {
  const { t: tTyped } = useI18n();
  const t = useProviderT();
  const { show } = useToast();
  const server = context?.server;
  const id = serviceId || server?.id || "";
  const provider = String(server?.providerType || "").toUpperCase();

  const [adding, setAdding] = useState(false);
  const isResourceProvider = ["PROXMOX", "PTERODACTYL", "PLESK", "PLOI", "KEYHELP"].includes(provider);
  if (isResourceProvider && provider !== "MAILCOW") {
    return <ResourceUpgradeWidget slot={slot} serviceId={serviceId} context={context} />;
  }
  const [pendingDowngrade, setPendingDowngrade] = useState<{
    cartItem: CartItem;
    daysExtension: number;
    creditAmount: number;
  } | null>(null);

  const stats = server?.mailcowStats;
  const pricing = server?.upgradePricing ?? {};

  const current: Record<MailcowLimitKey, number> = useMemo(
    () => ({
      maxDomains: stats?.maxDomains ?? 1,
      maxMailboxesPerDomain: stats?.maxMailboxesPerDomain ?? 1,
      storagePerMailboxGb: stats?.storagePerMailboxGb ?? 1,
      maxAliasesPerDomain: stats?.maxAliasesPerDomain ?? 1,
    }),
    [stats],
  );

  const base: Record<MailcowLimitKey, number> = useMemo(
    () => ({
      maxDomains: stats?.baseLimits?.maxDomains ?? 1,
      maxMailboxesPerDomain: stats?.baseLimits?.maxMailboxesPerDomain ?? 1,
      storagePerMailboxGb: stats?.baseLimits?.storagePerMailboxGb ?? 1,
      maxAliasesPerDomain: stats?.baseLimits?.maxAliasesPerDomain ?? 1,
    }),
    [stats],
  );

  const used: Record<MailcowLimitKey, number> = useMemo(
    () => ({
      maxDomains: stats?.usedDomains ?? 0,
      maxMailboxesPerDomain: stats?.maxMailboxesUsedPerDomain ?? 0,
      storagePerMailboxGb: stats?.maxQuotaUsedGb ?? 0,
      maxAliasesPerDomain: 0,
    }),
    [stats],
  );

  const isContractBilling = (server?.billing?.billingMode ?? "").toUpperCase() === "CONTRACT";

  const minPerField: Record<MailcowLimitKey, number> = useMemo(
    () =>
      isContractBilling
        ? { ...current }
        : {
            maxDomains: Math.max(base.maxDomains, used.maxDomains, 1),
            maxMailboxesPerDomain: Math.max(base.maxMailboxesPerDomain, used.maxMailboxesPerDomain, 1),
            storagePerMailboxGb: Math.max(1, base.storagePerMailboxGb),
            maxAliasesPerDomain: Math.max(base.maxAliasesPerDomain, used.maxAliasesPerDomain, 1),
          },
    [base, used, current, isContractBilling],
  );

  const visible: Record<MailcowLimitKey, boolean> = useMemo(
    () => ({
      maxDomains:
        pricing.maxDomains?.upgradePrice != null || pricing.maxDomains?.allowDowngrade === true,
      maxMailboxesPerDomain:
        pricing.maxMailboxesPerDomain?.upgradePrice != null ||
        pricing.maxMailboxesPerDomain?.allowDowngrade === true,
      storagePerMailboxGb:
        pricing.storagePerMailboxGb?.upgradePrice != null ||
        pricing.storagePerMailboxGb?.allowDowngrade === true,
      maxAliasesPerDomain:
        pricing.maxAliasesPerDomain?.upgradePrice != null ||
        pricing.maxAliasesPerDomain?.allowDowngrade === true,
    }),
    [pricing],
  );

  const [target, setTarget] = useState(current);
  useEffect(() => {
    setTarget(current);
  }, [current]);

  const fieldLabels: Record<MailcowLimitKey, string> = {
    maxDomains: t("mailcowLimitDomainsLabel"),
    maxMailboxesPerDomain: t("mailcowLimitMailboxesPerDomainLabel"),
    storagePerMailboxGb: t("mailcowLimitStoragePerMailboxLabel"),
    maxAliasesPerDomain: t("mailcowLimitAliasesPerDomainLabel"),
  };

  if (!canPurchase()) {
    return (
      <section className="glass p-4">
        <p className="text-sm text-(--text-muted)">{t("capabilityPurchaseDesktopOnly")}</p>
      </section>
    );
  }

  if (provider !== "MAILCOW" || !stats) {
    return (
      <section className="glass p-4">
        <p className="text-sm text-(--text-muted)">{t("providerTabEmpty")}</p>
      </section>
    );
  }

  const hasChanges = FIELD_ORDER.some((key) => target[key] !== current[key]);

  const billingCycleDays = server?.billing?.billingCycleDays ?? 30;
  const periodEndDate = server?.billing?.currentPeriodEnd
    ? new Date(server.billing.currentPeriodEnd)
    : null;
  const daysRemaining = periodEndDate
    ? Math.max(1, Math.ceil((periodEndDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : billingCycleDays;
  const billingOptions = {
    billingDiscountPerMonth: server?.productOptions?.billingDiscountPerMonth ?? 1,
    billingSurcharge7d: server?.productOptions?.billingSurcharge7d ?? 1,
    billingSurcharge14d: server?.productOptions?.billingSurcharge14d ?? 0.5,
  };

  const monthlyDelta = FIELD_ORDER.reduce((sum, key) => {
    const delta = target[key] - current[key];
    if (delta > 0) return sum + delta * (pricing[key]?.upgradePrice ?? 0);
    return sum;
  }, 0);
  const periodDelta =
    monthlyDelta <= 0
      ? 0
      : Math.round(
          ((computePeriodPrice(monthlyDelta, billingCycleDays, billingOptions) * daysRemaining) /
            Math.max(1, billingCycleDays)) *
            100,
        ) / 100;

  const handleSubmit = async () => {
    if (!hasChanges) {
      show(t("noChanges"), "warning");
      return;
    }
    setAdding(true);
    try {
      const resourceChanges: Partial<Record<MailcowLimitKey, number>> = {};
      for (const key of FIELD_ORDER) {
        if (target[key] !== current[key]) resourceChanges[key] = target[key];
      }
      const data = (await api.client.checkout.upgrade({ serviceId: id, resourceChanges })) as unknown as {
        itemType?: string;
        cartItem?: CartItem;
        daysExtension?: number;
        creditAmount?: number;
        details?: unknown;
        errorKey?: string;
      };

      if (data.itemType === "downgrade" && data.cartItem) {
        setPendingDowngrade({
          cartItem: data.cartItem,
          daysExtension: Number(data.daysExtension ?? 0),
          creditAmount: Number(data.creditAmount ?? 0),
        });
        return;
      }
      if (data.cartItem) {
        cartService.addItem(data.cartItem as Omit<CartItem, "lineId">);
        show(t("upgradeAddedToCart"), "success");
        context?.onNavigateToCart?.();
        context?.onRefresh?.();
      }
    } catch (err) {
      show(resolveCaughtApiError(err, tTyped, "error"), "error");
    } finally {
      setAdding(false);
    }
  };

  return (
    <section className="glass space-y-4 p-4">
      <div className="flex items-center gap-2">
        <ArrowUpRight className="size-5 shrink-0 text-(--text-muted)" />
        <div>
          <h3 className="text-sm font-semibold text-(--text-primary)">{t("mailcowUpgradeTitle")}</h3>
          <p className="text-xs text-(--text-muted)">
            {isContractBilling ? t("productContractNoDowngradeHint") : t("mailcowUpgradeDescription")}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {FIELD_ORDER.map((key) => {
          if (!visible[key]) return null;
          const min = minPerField[key];
          return (
            <div key={key}>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="text-(--text-muted)">{fieldLabels[key]}</span>
                <span className="text-(--text-secondary)">
                  {t("mailcowUpgradeCurrent")}: {current[key]}
                  {used[key] > 0 ? ` · ${t("mailcowUpgradeInUse")}: ${used[key]}` : ""}
                </span>
              </div>
              <Input
                type="number"
                min={min}
                value={target[key]}
                onChange={(e) => {
                  const n = Math.max(min, Math.round(Number(e.target.value) || min));
                  setTarget((prev) => ({ ...prev, [key]: n }));
                }}
                className="min-h-11"
              />
            </div>
          );
        })}
      </div>

      <div className="rounded-xl border border-border bg-white/5 px-3 py-2 text-sm">
        {monthlyDelta > 0 ? (
          <p className="text-(--text-primary)">
            {t("mailcowUpgradeSummaryUpgrade")}: +{periodDelta.toFixed(2)} € ({t("mailcowUpgradeProrated")})
          </p>
        ) : hasChanges ? (
          <p className="text-(--text-muted)">{t("mailcowUpgradeSummaryDowngrade")}</p>
        ) : (
          <p className="text-(--text-muted)">{t("mailcowUpgradeSummaryNoChange")}</p>
        )}
      </div>

      <Button
        type="button"
        onClick={() => void handleSubmit()}
        disabled={adding || !hasChanges}
        className="btn-primary min-h-11 w-full rounded-xl"
      >
        {adding ? <Loader2 className="size-4 animate-spin" /> : t("shopAddToCart")}
      </Button>

      <ConfirmModal
        open={pendingDowngrade !== null}
        title={t("mailcowDowngradeConfirmTitle")}
        description={t("mailcowDowngradeConfirmBody")
          .replace("{days}", String(pendingDowngrade?.daysExtension ?? 0))
          .replace("{credit}", (pendingDowngrade?.creditAmount ?? 0).toFixed(2))}
        confirmLabel={t("mailcowDowngradeAddToCart")}
        cancelLabel={t("cancel")}
        onConfirm={() => {
          if (!pendingDowngrade) return;
          cartService.addItem(pendingDowngrade.cartItem as Omit<CartItem, "lineId">);
          show(t("mailcowDowngradeQueuedInCart"), "success");
          setPendingDowngrade(null);
          context?.onNavigateToCart?.();
          context?.onRefresh?.();
        }}
        onCancel={() => setPendingDowngrade(null)}
      />
    </section>
  );
}
