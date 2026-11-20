import { resolveCaughtApiError } from "../api/resolve-caught-error";
import { useCallback, useEffect, useState } from "react";
import { Loader2, Plus } from "lucide-react";

import type {
  ContainerAccess,
  ContainerProjectSummary,
  ContainerRegion,
  ContainerSettlementMode,
} from "../api/pods";
import { useAuth } from "../components/AuthProvider";
import { useRouter } from "../components/Router";
import { useToast } from "../components/Toast";
import { IconContainer } from "../components/dashboard/dashboard-icons";
import { AppModal } from "../components/ui/AppModal";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useI18n } from "../i18n";
import { api } from "../lib/api";
import { cn } from "../lib/utils";

function isBusinessAccount(accountType?: string | null) {
  return ["business", "BUSINESS"].includes(accountType ?? "");
}

function formatTokens(value: number, lang: string) {
  return new Intl.NumberFormat(lang === "de" ? "de-DE" : "en-GB", {
    maximumFractionDigits: 2,
  }).format(value);
}

const SETTLEMENT_MODES: ContainerSettlementMode[] = [
  "balance",
  "invoice",
  "business_fund",
  "token_wallet",
];

export function ContainerScreen() {
  const { t, lang } = useI18n();
  const { user, isLoading: authLoading } = useAuth();
  const { navigate } = useRouter();
  const { show } = useToast();

  const [access, setAccess] = useState<ContainerAccess | null>(null);
  const [projects, setProjects] = useState<ContainerProjectSummary[]>([]);
  const [regions, setRegions] = useState<ContainerRegion[]>([]);
  const [loading, setLoading] = useState(true);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [providerId, setProviderId] = useState("");
  const [settlementMode, setSettlementMode] = useState<ContainerSettlementMode | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const accessRes = await api.pods.access();
      const nextAccess = accessRes.access;
      setAccess(nextAccess);
      if (!nextAccess.canRead && !nextAccess.allowed) {
        setProjects([]);
        return;
      }
      const [projectRes, regionRes] = await Promise.all([
        api.pods.listProjects(),
        api.pods.regions().catch(() => ({ success: true, regions: [] as ContainerRegion[] })),
      ]);
      setProjects(projectRes.projects ?? []);
      const list = regionRes.regions ?? [];
      setRegions(list);
      setProviderId((current) => current || list[0]?.providerId || "");
    } catch (err) {
      show(resolveCaughtApiError(err, t), "error");
    } finally {
      setLoading(false);
    }
  }, [show, t]);

  useEffect(() => {
    if (authLoading) return;
    if (!isBusinessAccount(user?.accountType)) {
      navigate({ name: "dashboard" });
      return;
    }
    void load();
  }, [authLoading, load, navigate, user?.accountType]);

  /** Preselect the settlement system the account already uses. */
  const availableModes: ContainerSettlementMode[] = access
    ? SETTLEMENT_MODES.filter((mode) =>
        mode === "invoice"
          ? access.invoiceEnabled
          : mode === "business_fund"
            ? access.hasActiveFund
            : access.hasTokenWallet,
      )
    : [];

  useEffect(() => {
    if (!availableModes.length) return;
    const first = availableModes[0] ?? null;
    setSettlementMode((current) => (current && availableModes.includes(current) ? current : first));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-run when availability changes
  }, [access?.invoiceEnabled, access?.hasActiveFund, access?.hasTokenWallet]);

  const canCreate = Boolean(access?.canCreate);

  const settlementLabel = (mode: ContainerSettlementMode) =>
    mode === "balance"
      ? t("containerSettlementBalance")
      : mode === "invoice"
        ? t("containerSettlementInvoice")
        : mode === "business_fund"
          ? t("containerSettlementFund")
          : t("containerSettlementWallet");

  const createProject = async () => {
    if (!settlementMode) return;
    setSubmitting(true);
    try {
      const res = await api.pods.createProject({
        name: name.trim(),
        description: description.trim() || undefined,
        providerId: providerId || undefined,
        settlementMode,
      });
      const id = res.project?.id;
      setWizardOpen(false);
      setName("");
      setDescription("");
      if (id) navigate({ name: "container-project", id });
      else void load();
    } catch (err) {
      show(resolveCaughtApiError(err, t, "containerCreateProject"), "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || (!isBusinessAccount(user?.accountType) && !loading)) {
    return null;
  }

  const wallet = access?.wallet ?? null;

  return (
    <div className="mx-auto w-full max-w-4xl space-y-4 py-4 page-fullwidth">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-(--text-primary)">{t("containerTitle")}</h1>
          <p className="text-sm text-(--text-muted)">{t("containerIntro")}</p>
        </div>
        {canCreate && availableModes.length > 0 ? (
          <button
            type="button"
            onClick={() => setWizardOpen(true)}
            disabled={loading}
            className="btn-primary inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold disabled:opacity-50"
          >
            <Plus className="size-4" />
            {t("containerCreateProject")}
          </button>
        ) : null}
      </div>

      {wallet ? (
        <div className="glass space-y-1 p-4">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs uppercase tracking-wider text-(--text-muted)">
              {t("containerTokenWallet")}
            </p>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider",
                wallet.exhausted
                  ? "bg-red-500/10 text-red-500"
                  : wallet.negative
                    ? "bg-amber-500/10 text-amber-500"
                    : "bg-emerald-500/10 text-emerald-500",
              )}
            >
              {wallet.exhausted
                ? t("containerWalletExhausted")
                : wallet.negative
                  ? t("containerWalletNegative")
                  : t("containerWalletHealthy")}
            </span>
          </div>
          <p className="text-lg font-semibold text-(--text-primary)">
            {formatTokens(wallet.balanceTokens, lang)}{" "}
            <span className="text-xs font-normal text-(--text-muted)">{t("containerTokens")}</span>
          </p>
          <p className="text-xs text-(--text-muted)">
            {t("containerCreditLimit")}: {formatTokens(wallet.creditLimitTokens, lang)} ·{" "}
            {t("containerRemaining")}: {formatTokens(wallet.remainingTokens, lang)}
          </p>
        </div>
      ) : null}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="glass h-24 animate-pulse" />
          ))}
        </div>
      ) : access && !access.canRead && !access.allowed ? (
        <BillingGate onOpenBusiness={() => navigate({ name: "business" })} />
      ) : (
        <div className="space-y-3">
          {!canCreate ? <BillingGate onOpenBusiness={() => navigate({ name: "business" })} /> : null}
          {projects.length === 0 && canCreate ? (
            <div className="glass p-6 text-center text-sm text-(--text-muted)">
              {t("containerNoProjects")}
            </div>
          ) : (
            projects.map((project) => (
              <button
                key={project.id}
                type="button"
                onClick={() => navigate({ name: "container-project", id: project.id })}
                className="glass glass-hover flex w-full items-start gap-3 p-4 text-left"
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-(--surface-soft) text-(--brand-primary)">
                  <IconContainer className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-semibold text-(--text-primary)">{project.name}</p>
                    {project.isShared ? (
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-primary">
                        {t("containerShared")}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-xs text-(--text-muted)">
                    {project.workloadCount} {t("containerPods")} · {project.networkCount}{" "}
                    {t("containerNetworks")} · {project.volumeCount} {t("containerVolumes")} ·{" "}
                    {project.ipCount} {t("containerAddresses")}
                  </p>
                  <p className="mt-0.5 text-[10px] uppercase tracking-wider text-(--text-muted)">
                    {settlementLabel(project.settlementMode)}
                    {project.regionCode ? ` · ${project.regionCode}` : ""}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      )}

      <AppModal
        open={wizardOpen}
        onClose={() => setWizardOpen(false)}
        closeAriaLabel={t("containerCancel")}
        closeDisabled={submitting}
        maxWidthClassName="max-w-md"
        className="space-y-4 overflow-y-auto p-4"
      >
        <h3 className="text-base font-semibold text-(--text-primary)">{t("containerCreateProject")}</h3>
        <div className="space-y-1.5">
          <Label className="text-xs text-(--text-muted)">{t("containerProjectName")} *</Label>
          <Input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder={t("containerProjectNamePh")}
            className="h-10 rounded-xl"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-(--text-muted)">{t("containerDescription")}</Label>
          <Input
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="h-10 rounded-xl"
          />
        </div>
        <fieldset className="space-y-2">
          <legend className="text-xs font-medium text-(--text-secondary)">{t("containerRegion")} *</legend>
          {regions.length === 0 ? (
            <p className="text-sm text-(--text-muted)">{t("containerNoRegions")}</p>
          ) : (
            regions.map((region) => (
              <button
                key={region.providerId}
                type="button"
                onClick={() => setProviderId(region.providerId)}
                className={cn(
                  "flex min-h-11 w-full items-center rounded-xl border px-3 py-2 text-left text-sm",
                  providerId === region.providerId
                    ? "border-(--brand-primary) bg-(--brand-primary)/10 text-(--brand-primary)"
                    : "border-border text-(--text-secondary)",
                )}
              >
                {region.label}
              </button>
            ))
          )}
        </fieldset>
        <fieldset className="space-y-2">
          <legend className="text-xs font-medium text-(--text-secondary)">{t("containerSettlement")} *</legend>
          {availableModes.map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setSettlementMode(mode)}
              className={cn(
                "flex min-h-11 w-full flex-col items-start rounded-xl border px-3 py-2 text-left text-sm",
                settlementMode === mode
                  ? "border-(--brand-primary) bg-(--brand-primary)/10 text-(--brand-primary)"
                  : "border-border text-(--text-secondary)",
              )}
            >
              <span>{settlementLabel(mode)}</span>
              <span className="text-[10px] text-(--text-muted)">
                {mode === "balance"
                  ? t("containerSettlementBalanceHint")
                  : mode === "token_wallet"
                    ? t("containerSettlementWalletHint")
                    : mode === "business_fund"
                      ? t("containerSettlementFundHint")
                      : t("containerSettlementInvoiceHint")}
              </span>
            </button>
          ))}
          {availableModes.length === 0 ? (
            <p className="text-sm text-(--text-muted)">{t("containerNoSettlementMode")}</p>
          ) : null}
        </fieldset>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setWizardOpen(false)}
            className="glass glass-hover rounded-xl px-4 py-2 text-sm text-(--text-secondary)"
          >
            {t("containerCancel")}
          </button>
          <button
            type="button"
            onClick={() => void createProject()}
            disabled={submitting || !name.trim() || !settlementMode}
            className="btn-primary inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold disabled:opacity-50"
          >
            {submitting ? <Loader2 className="size-4 animate-spin" /> : null}
            {t("containerCreate")}
          </button>
        </div>
      </AppModal>
    </div>
  );
}

function BillingGate({ onOpenBusiness }: { onOpenBusiness: () => void }) {
  const { t } = useI18n();
  return (
    <div className="glass space-y-3 p-6">
      <p className="text-sm text-(--text-secondary)">{t("containerBillingRequired")}</p>
      <button
        type="button"
        onClick={onOpenBusiness}
        className="btn-primary inline-flex rounded-xl px-4 py-2 text-sm font-semibold"
      >
        {t("containerOpenBusiness")}
      </button>
    </div>
  );
}
