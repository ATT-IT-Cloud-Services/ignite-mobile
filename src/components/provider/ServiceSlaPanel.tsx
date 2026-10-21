import { useCallback, useEffect, useState } from "react";
import { Loader2, Shield } from "lucide-react";

import { api } from "../../lib/api";
import { resolveCaughtApiError } from "../../api/resolve-caught-error";
import { isBusinessAccount } from "../../lib/shop-catalog";
import { useAuth } from "../AuthProvider";
import { useI18n } from "../../i18n";
import { useToast } from "../Toast";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { useProviderT } from "./use-provider-t";

type ResponseTimeHours = "" | "1" | "3" | "6";

type SlaAgreement = {
  id: string;
  contractNumber: string;
  status: string;
  support247: boolean;
  responseTimeHours: number | null;
  contractualPenalty: boolean;
  minAvailabilityPercent: number;
  recoveryHours: number;
  monthlyTotalNet: number | null;
};

export function ServiceSlaPanel({ serviceId }: { serviceId: string }) {
  const { t: tTyped } = useI18n();
  const t = useProviderT();
  const { user } = useAuth();
  const { show } = useToast();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [agreement, setAgreement] = useState<SlaAgreement | null>(null);
  const [support247, setSupport247] = useState(false);
  const [responseTimeHours, setResponseTimeHours] = useState<ResponseTimeHours>("");
  const [contractualPenalty, setContractualPenalty] = useState(false);
  const [availability, setAvailability] = useState("99.9");
  const [recoveryHours, setRecoveryHours] = useState("4");
  const [signerName, setSignerName] = useState("");

  const allowed = isBusinessAccount(user?.accountType);
  const load = useCallback(async () => {
    if (!allowed) {
      setLoading(false);
      setAgreement(null);
      return;
    }
    setLoading(true);
    try {
      const data = (await api.client.services.sla(serviceId)) as unknown as {
        success?: boolean;
        agreement?: SlaAgreement | null;
      };
      const next = data.agreement ?? null;
      setAgreement(next);
      if (next) {
        setSupport247(Boolean(next.support247));
        setResponseTimeHours(
          next.responseTimeHours === 1 || next.responseTimeHours === 3 || next.responseTimeHours === 6
            ? (String(next.responseTimeHours) as ResponseTimeHours)
            : "",
        );
        setContractualPenalty(Boolean(next.contractualPenalty));
        setAvailability(String(next.minAvailabilityPercent ?? 99.9));
        setRecoveryHours(String(next.recoveryHours ?? 4));
      }
    } catch {
      setAgreement(null);
    } finally {
      setLoading(false);
    }
  }, [serviceId, allowed]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleRequest = async () => {
    if (!allowed) return;
    if (!signerName.trim()) {
      show(t("slaSignerRequired"), "warning");
      return;
    }
    setSubmitting(true);
    try {
      await api.client.services.postSla(serviceId, {
        support247,
        responseTimeHours: responseTimeHours ? Number(responseTimeHours) : null,
        contractualPenalty,
        minAvailabilityPercent: Number(availability) || 99.9,
        recoveryHours: Number(recoveryHours) || 4,
        signerName: signerName.trim(),
      });
      show(t("slaRequestSent"), "success");
      await load();
    } catch (err) {
      show(resolveCaughtApiError(err, tTyped, "error"), "error");
    } finally {
      setSubmitting(false);
    }
  };

  const runAction = async (fn: () => Promise<unknown>) => {
    setSubmitting(true);
    try {
      await fn();
      show(t("providerSettingsSaved"), "success");
      await load();
    } catch (err) {
      show(resolveCaughtApiError(err, tTyped, "error"), "error");
    } finally {
      setSubmitting(false);
    }
  };

  const status = (agreement?.status ?? "").toUpperCase();
  const lifecycleActions: Array<{ key: string; label: string; run: () => Promise<unknown> }> = [];
  if (status === "PENDING" || status === "OFFERED" || status === "REQUESTED") {
    lifecycleActions.push({ key: "accept", label: t("slaAccept"), run: () => api.client.services.slaAccept(serviceId, {}) });
    lifecycleActions.push({ key: "decline", label: t("slaDecline"), run: () => api.client.services.slaDecline(serviceId, {}) });
    lifecycleActions.push({ key: "withdraw", label: t("slaWithdraw"), run: () => api.client.services.slaWithdraw(serviceId, {}) });
  } else if (status === "ACTIVE" || status === "SUSPENDED") {
    lifecycleActions.push({ key: "cancel", label: t("slaScheduleCancel"), run: () => api.client.services.slaCancel(serviceId, {}) });
    lifecycleActions.push({ key: "withdraw", label: t("slaWithdraw"), run: () => api.client.services.slaWithdraw(serviceId, {}) });
  } else if (status === "CANCEL_SCHEDULED") {
    lifecycleActions.push({ key: "revoke", label: t("slaRevokeCancel"), run: () => api.client.services.slaRevokeCancel(serviceId, {}) });
  }

  if (!allowed) {
    return null;
  }

  if (loading) {
    return <div className="glass h-40 animate-pulse" />;
  }

  const active = agreement && ["ACTIVE", "CANCEL_SCHEDULED", "SUSPENDED"].includes(agreement.status);

  return (
    <section className="glass space-y-4 p-4">
      <div className="flex items-center gap-2">
        <Shield className="size-5 shrink-0 text-(--text-muted)" />
        <h3 className="text-sm font-semibold text-(--text-primary)">{t("serverTabSla")}</h3>
        {agreement ? <Badge variant="outline">{agreement.status}</Badge> : null}
      </div>

      {active && agreement ? (
        <div className="space-y-2 text-sm">
          <p className="text-(--text-muted)">
            {t("slaContractNumber")}:{" "}
            <span className="font-medium text-(--text-primary)">{agreement.contractNumber}</span>
          </p>
          <p className="text-(--text-muted)">
            {t("slaAvailability")}:{" "}
            <span className="font-medium text-(--text-primary)">{agreement.minAvailabilityPercent}%</span>
          </p>
          <p className="text-(--text-muted)">
            {t("slaRecoveryHours")}:{" "}
            <span className="font-medium text-(--text-primary)">{agreement.recoveryHours} h</span>
          </p>
          {agreement.monthlyTotalNet != null ? (
            <p className="text-(--text-muted)">
              {t("slaMonthlyNet")}:{" "}
              <span className="font-medium text-(--text-primary)">
                {agreement.monthlyTotalNet.toFixed(2)} €
              </span>
            </p>
          ) : null}
        </div>
      ) : null}

      {agreement && lifecycleActions.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {lifecycleActions.map((action) => (
            <Button
              key={action.key}
              type="button"
              variant="outline"
              disabled={submitting}
              onClick={() => void runAction(action.run)}
              className="min-h-11 rounded-xl text-xs"
            >
              {action.label}
            </Button>
          ))}
        </div>
      ) : null}

      {!active ? (
        <>
          <p className="text-xs text-(--text-muted)">{t("slaRequestHint")}</p>
          <label className="flex items-center gap-2 text-sm text-(--text-secondary)">
            <input
              type="checkbox"
              checked={support247}
              onChange={(e) => setSupport247(e.target.checked)}
              className="h-4 w-4"
            />
            {t("slaSupport247")}
          </label>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-(--text-muted)">
              {t("slaResponseTime")}
            </label>
            <select
              value={responseTimeHours}
              onChange={(e) => setResponseTimeHours(e.target.value as ResponseTimeHours)}
              className="min-h-11 w-full rounded-(--radius-control) border border-border bg-(--bg-elevated) px-3 text-sm text-(--text-primary)"
            >
              <option value="">{t("slaResponseTimeNone")}</option>
              <option value="1">1 h</option>
              <option value="3">3 h</option>
              <option value="6">6 h</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-(--text-muted)">
                {t("slaAvailability")}
              </label>
              <Input value={availability} onChange={(e) => setAvailability(e.target.value)} className="min-h-11" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-(--text-muted)">
                {t("slaRecoveryHours")}
              </label>
              <Input value={recoveryHours} onChange={(e) => setRecoveryHours(e.target.value)} className="min-h-11" />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-(--text-secondary)">
            <input
              type="checkbox"
              checked={contractualPenalty}
              onChange={(e) => setContractualPenalty(e.target.checked)}
              className="h-4 w-4"
            />
            {t("slaContractualPenalty")}
          </label>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-(--text-muted)">
              {t("slaSignerName")} *
            </label>
            <Input value={signerName} onChange={(e) => setSignerName(e.target.value)} className="min-h-11" />
          </div>
          <Button
            type="button"
            onClick={() => void handleRequest()}
            disabled={submitting}
            className="btn-primary min-h-11 w-full rounded-xl"
          >
            {submitting ? <Loader2 className="size-4 animate-spin" /> : t("slaSubmitRequest")}
          </Button>
        </>
      ) : null}
    </section>
  );
}
