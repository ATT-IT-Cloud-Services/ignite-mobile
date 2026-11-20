import { resolveCaughtApiError } from "../api/resolve-caught-error";
import { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import type { ContainerPod, ContainerProjectAccess } from "../api/pods";
import { useAuth } from "../components/AuthProvider";
import { useRouter } from "../components/Router";
import { useToast } from "../components/Toast";
import { useI18n } from "../i18n";
import { api } from "../lib/api";
import { cn } from "../lib/utils";

function isBusinessAccount(accountType?: string | null) {
  return ["business", "BUSINESS"].includes(accountType ?? "");
}

type Tab = "overview" | "logs" | "limits";

/**
 * One pod: live state, the power actions the caller may run, the log tail and
 * the resource limits. Revisions, traffic split and the file manager stay on the
 * web console — this screen is the on-call surface.
 */
export function ContainerPodScreen({ projectId, podId }: { projectId: string; podId: string }) {
  const { t } = useI18n();
  const { user, isLoading: authLoading } = useAuth();
  const { navigate } = useRouter();
  const { show } = useToast();

  const [pod, setPod] = useState<ContainerPod | null>(null);
  const [access, setAccess] = useState<ContainerProjectAccess>({ isOwner: false, permissions: [] });
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("overview");
  const [busy, setBusy] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const can = (permission: string) => access.isOwner || access.permissions.includes(permission);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const body = await api.pods.getPod(podId);
      setPod(body.pod);
      setAccess(body.access ?? { isOwner: false, permissions: [] });
    } catch (err) {
      show(resolveCaughtApiError(err, t, "containerWorkloadMissing"), "error");
      setPod(null);
    } finally {
      setLoading(false);
    }
  }, [show, t, podId]);

  useEffect(() => {
    if (authLoading) return;
    if (!isBusinessAccount(user?.accountType)) {
      navigate({ name: "dashboard" });
      return;
    }
    void load();
  }, [authLoading, load, navigate, user?.accountType]);

  const runAction = async (action: "start" | "stop" | "restart" | "reinstall") => {
    setBusy(true);
    try {
      await api.pods.podAction(podId, action);
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
      const body = await api.pods.podLogs(podId);
      setLogs(body.lines ?? []);
    } catch (err) {
      setLogs([resolveCaughtApiError(err, t, "containerNoLogs")]);
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (tab === "logs") void loadLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reload when the tab opens
  }, [tab]);

  const tabs: Array<{ id: Tab; label: string }> = [
    { id: "overview", label: t("containerTabOverview") },
    { id: "logs", label: t("containerTabLogs") },
    { id: "limits", label: t("containerLimits") },
  ];

  return (
    <div className="mx-auto w-full max-w-4xl space-y-4 py-4 page-fullwidth">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-semibold text-(--text-primary)">
            {pod?.name || t("containerPods")}
          </h1>
          <p className="text-sm text-(--text-muted)">
            {pod
              ? `${pod.templateSlug ?? pod.image ?? "—"} · ${pod.state}`
              : t("containerLoading")}
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
            className={cn(
              "min-h-11 shrink-0 rounded-xl px-3 py-2 text-sm",
              tab === item.id
                ? "bg-primary/10 font-medium text-primary"
                : "text-(--text-secondary)",
            )}
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
            {t("containerStatus")}:{" "}
            <span className="text-(--text-primary)">{pod?.state ?? t("na")}</span>
          </p>
          {pod?.suspended ? (
            <p className="text-xs text-amber-500">{t("containerWalletNegative")}</p>
          ) : null}
          {pod?.lastError ? <p className="text-xs text-red-500">{pod.lastError}</p> : null}
          <div className="flex flex-wrap gap-2">
            {can("start") ? (
              <button
                type="button"
                disabled={busy}
                onClick={() => void runAction("start")}
                className="btn-primary inline-flex min-h-11 items-center rounded-xl px-4 text-sm disabled:opacity-50"
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
            {can("restart") ? (
              <button
                type="button"
                disabled={busy}
                onClick={() => void runAction("restart")}
                className="btn-secondary min-h-11 rounded-xl px-4 text-sm disabled:opacity-50"
              >
                {t("containerRestart")}
              </button>
            ) : null}
            {can("pods_lifecycle") ? (
              <button
                type="button"
                disabled={busy}
                onClick={() => void runAction("reinstall")}
                className="btn-secondary min-h-11 rounded-xl px-4 text-sm disabled:opacity-50"
              >
                {t("containerRedeploy")}
              </button>
            ) : null}
          </div>
        </section>
      ) : tab === "logs" ? (
        <pre className="glass max-h-[60vh] overflow-auto p-4 text-xs text-(--text-secondary)">
          {logs.length > 0 ? logs.join("\n") : t("containerNoLogs")}
        </pre>
      ) : (
        <section className="glass space-y-2 p-4">
          {/* 0 = no own limit (see createPod): say so instead of "0 MB". */}
          <LimitRow
            label={t("containerCpu")}
            value={
              (pod?.limits.cpuMillis ?? 0) > 0 ? `${pod?.limits.cpuMillis} mCPU` : t("containerNoLimit")
            }
          />
          <LimitRow
            label={t("containerMemory")}
            value={
              (pod?.limits.memoryMb ?? 0) > 0 ? `${pod?.limits.memoryMb} MB` : t("containerNoLimit")
            }
          />
          <LimitRow
            label={t("containerDisk")}
            value={(pod?.limits.diskMb ?? 0) > 0 ? `${pod?.limits.diskMb} MB` : t("containerNoLimit")}
          />
          <LimitRow label="swap" value={`${pod?.limits.swapMb ?? 0} MB`} />
          <LimitRow label="io_weight" value={String(pod?.limits.ioWeight ?? 0)} />
          <LimitRow label="pids_limit" value={String(pod?.limits.pidsLimit ?? 0)} />
        </section>
      )}
    </div>
  );
}

function LimitRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2 text-sm">
      <span className="text-(--text-muted)">{label}</span>
      <span className="text-(--text-primary)">{value}</span>
    </div>
  );
}
