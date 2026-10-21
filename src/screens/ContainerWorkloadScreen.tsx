import { resolveCaughtApiError } from "../api/resolve-caught-error";
import { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import type { ContainerProjectAccess, ContainerWorkloadDetail } from "../api/container";
import { useAuth } from "../components/AuthProvider";
import { useRouter } from "../components/Router";
import { useToast } from "../components/Toast";
import { useI18n } from "../i18n";
import { api } from "../lib/api";

function isBusinessAccount(accountType?: string | null) {
  return ["business", "BUSINESS"].includes(accountType ?? "");
}

type Tab = "overview" | "logs" | "deploy";

export function ContainerWorkloadScreen({ projectId, workloadId }: { projectId: string; workloadId: string }) {
  const { t, lang } = useI18n();
  const { user, isLoading: authLoading } = useAuth();
  const { navigate } = useRouter();
  const { show } = useToast();

  const [workload, setWorkload] = useState<ContainerWorkloadDetail | null>(null);
  const [access, setAccess] = useState<ContainerProjectAccess>({ isOwner: false, permissions: [] });
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("overview");
  const [busy, setBusy] = useState(false);
  const [logs, setLogs] = useState("");

  const can = (permission: string) => access.isOwner || access.permissions.includes(permission);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const body = await api.container.getWorkload(workloadId);
      setWorkload(body.workload);
      setAccess(body.access ?? { isOwner: false, permissions: [] });
    } catch (err) {
      show(resolveCaughtApiError(err, t, "containerWorkloadMissing"), "error");
      setWorkload(null);
    } finally {
      setLoading(false);
    }
  }, [show, t, workloadId]);

  useEffect(() => {
    if (authLoading) return;
    if (!isBusinessAccount(user?.accountType)) {
      navigate({ name: "dashboard" });
      return;
    }
    void load();
  }, [authLoading, load, navigate, user?.accountType]);

  const runAction = async (action: "start" | "stop" | "deploy") => {
    setBusy(true);
    try {
      await api.container.workloadAction(workloadId, action);
      show(t("containerActionDone"), "success");
      await load();
    } catch (err) {
      show(resolveCaughtApiError(err, t, "containerActionFailed"), "error");
    } finally {
      setBusy(false);
    }
  };

  const loadLogs = async () => {
    setBusy(true);
    try {
      const body = await api.container.workloadLogs(workloadId);
      setLogs(body.logs || body.notice || t("containerNoLogs"));
    } catch (err) {
      setLogs(resolveCaughtApiError(err, t, "containerNoLogs"));
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (tab === "logs") void loadLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reload logs when the tab is opened
  }, [tab]);

  const tabs: Array<{ id: Tab; label: string }> = [
    { id: "overview", label: t("containerTabOverview") },
    { id: "logs", label: t("containerTabLogs") },
    ...(can("deploy") ? [{ id: "deploy" as const, label: t("containerTabDeploy") }] : []),
  ];

  const unbilled =
    workload && workload.unbilledEuros > 0
      ? new Intl.NumberFormat(lang === "de" ? "de-DE" : "en-GB", {
          style: "currency",
          currency: "EUR",
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(workload.unbilledEuros)
      : null;

  return (
    <div className="mx-auto w-full max-w-4xl space-y-4 py-4 page-fullwidth">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-semibold text-(--text-primary)">
            {workload?.name || t("containerWorkloads")}
          </h1>
          <p className="text-sm text-(--text-muted)">
            {workload ? `${workload.kind} · ${workload.status}` : t("containerLoading")}
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate({ name: "container-project", id: projectId })}
          className="btn-secondary shrink-0 rounded-xl px-3 py-2 text-sm"
        >
          {t("containerBackToPlan")}
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={
              tab === item.id
                ? "rounded-xl bg-primary/10 px-3 py-2 text-sm font-medium text-primary"
                : "rounded-xl px-3 py-2 text-sm text-(--text-secondary)"
            }
          >
            {item.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="glass h-40 animate-pulse" />
      ) : tab === "overview" ? (
        <section className="glass space-y-3 p-4">
          <p className="text-sm text-(--text-secondary)">
            {t("containerAppName")}: <span className="text-(--text-primary)">{workload?.appName || t("na")}</span>
          </p>
          {unbilled ? (
            <p className="text-sm text-(--text-secondary)">
              {t("containerUnbilled")}: <span className="text-(--text-primary)">{unbilled}</span>
            </p>
          ) : null}
          <div className="flex flex-wrap gap-2">
            {can("start") ? (
              <button
                type="button"
                disabled={busy}
                onClick={() => void runAction("start")}
                className="btn-primary min-h-11 rounded-xl px-4 text-sm disabled:opacity-50"
              >
                {busy ? <Loader2 className="size-4 animate-spin" /> : t("containerStart")}
              </button>
            ) : null}
            {can("stop") ? (
              <button
                type="button"
                disabled={busy}
                onClick={() => void runAction("stop")}
                className="btn-secondary min-h-11 rounded-xl px-4 text-sm disabled:opacity-50"
              >
                {t("containerStop")}
              </button>
            ) : null}
          </div>
        </section>
      ) : tab === "logs" ? (
        <pre className="glass max-h-[60vh] overflow-auto p-4 text-xs text-(--text-secondary)">
          {logs || t("containerNoLogs")}
        </pre>
      ) : (
        <section className="glass space-y-3 p-4">
          <p className="text-sm text-(--text-secondary)">{t("containerDeployHint")}</p>
          <button
            type="button"
            disabled={busy}
            onClick={() => void runAction("deploy")}
            className="btn-primary min-h-11 rounded-xl px-4 text-sm disabled:opacity-50"
          >
            {busy ? <Loader2 className="size-4 animate-spin" /> : t("containerDeploy")}
          </button>
        </section>
      )}
    </div>
  );
}
