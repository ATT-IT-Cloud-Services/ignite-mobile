import { useCallback, useEffect, useState } from "react";
import { Bolt, Loader2, XCircle } from "lucide-react";

import { api } from "../../lib/api";
import { useToast } from "../../components/Toast";
import { AppModal } from "../../components/ui/AppModal";
import { useProviderT } from "./use-provider-t";

const WAIT_SECONDS = 15;

/** Mobile port of the web DeploymentHoldPanel ("Wird bearbeitet"). */
export function DeploymentHoldPanel({ serviceId, onChanged, canAccelerate = true }: { serviceId: string; onChanged: () => void; canAccelerate?: boolean }) {
  const t = useProviderT();
  const { show } = useToast();
  const [remaining, setRemaining] = useState(WAIT_SECONDS);
  const [busy, setBusy] = useState<"withdraw" | "accelerate" | null>(null);
  const [confirm, setConfirm] = useState(false);

  useEffect(() => {
    if (remaining <= 0) return;
    const timer = setInterval(() => setRemaining((v) => (v > 0 ? v - 1 : 0)), 1000);
    return () => clearInterval(timer);
  }, [remaining]);

  const accelerate = useCallback(async () => {
    setBusy("accelerate");
    try {
      await api.services.subscriptionAccelerate(serviceId);
      show(t("deploymentAccelerated"), "success");
      onChanged();
    } catch {
      show(t("somethingWentWrong"), "error");
    } finally {
      setBusy(null);
    }
  }, [serviceId, show, t, onChanged]);

  const withdraw = useCallback(async () => {
    setBusy("withdraw");
    try {
      await api.services.subscriptionWithdraw(serviceId);
      setConfirm(false);
      show(t("deploymentWithdrawSuccess"), "success");
      onChanged();
    } catch {
      show(t("somethingWentWrong"), "error");
    } finally {
      setBusy(null);
    }
  }, [serviceId, show, t, onChanged]);

  return (
    <div className="flex flex-col items-center justify-center px-4 py-12">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-(--warning)/10">
        <Loader2 className="size-8 animate-spin text-(--warning)" />
      </div>
      <h2 className="text-center text-xl font-bold text-(--warning)">{t("deploymentProcessingTitle")}</h2>
      <p className="mt-2 max-w-sm text-center text-sm text-(--text-secondary)">{t("deploymentProcessingDesc")}</p>
      <p className="mt-3 text-center text-xs text-(--text-muted)">
        {!canAccelerate ? t("serviceStatusProvisioning") : remaining > 0 ? `${remaining}s` : t("deploymentProcessingQueued")}
      </p>

      <div className="mt-6 flex w-full max-w-md flex-col-reverse gap-2 sm:flex-row sm:justify-between">
        <button type="button" onClick={() => setConfirm(true)} disabled={busy !== null} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-(--error)/40 px-4 py-2.5 text-sm text-(--error) disabled:opacity-50">
          <XCircle className="size-5" /> {t("deploymentWithdraw")}
        </button>
        {canAccelerate && (
          <button type="button" onClick={() => void accelerate()} disabled={busy !== null || remaining <= 0} className="btn-primary inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm disabled:opacity-50">
            <Bolt className="size-5" /> {busy === "accelerate" ? t("loading") : t("deploymentAccelerate")}
          </button>
        )}
      </div>

      <AppModal open={confirm} onClose={() => !busy && setConfirm(false)} closeAriaLabel={t("cancel")}>
        <h3 className="mb-2 text-lg font-semibold text-(--text-primary)">{t("deploymentWithdrawConfirmTitle")}</h3>
        <p className="text-sm text-(--text-secondary)">{t("deploymentWithdrawConfirmBody")}</p>
        <div className="mt-4 flex justify-end gap-2">
          <button type="button" disabled={busy !== null} onClick={() => setConfirm(false)} className="glass rounded-xl px-4 py-2.5 text-sm disabled:opacity-50">{t("deploymentWithdrawCancel")}</button>
          <button type="button" disabled={busy !== null} onClick={() => void withdraw()} className="rounded-xl border border-(--error)/40 px-4 py-2.5 text-sm text-(--error) disabled:opacity-50">
            {busy === "withdraw" ? t("loading") : t("deploymentWithdrawConfirm")}
          </button>
        </div>
      </AppModal>
    </div>
  );
}
