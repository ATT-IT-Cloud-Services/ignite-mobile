import { useCallback, useEffect, useState } from "react";
import { Loader2, Scissors } from "lucide-react";

import { api } from "../../../lib/api";
import { useToast } from "../../../components/Toast";
import { useProviderT } from "../use-provider-t";
import type { ProviderWidgetProps } from "../types";

/** Proxmox Backup Server prune widget (mobile port). */
export default function BackupPruneWidget({ serviceId, context }: ProviderWidgetProps) {
  const t = useProviderT();
  const { show } = useToast();
  const id = context?.server?.id ?? serviceId ?? "";
  const [jobs, setJobs] = useState<Array<Record<string, unknown>>>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await api.services.backupPruneJobs(id);
      setJobs(Array.isArray(res.jobs) ? res.jobs : []);
    } catch {
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  const start = async () => {
    setBusy(true);
    try {
      await api.services.startBackupPrune(id, {});
      show(t("providerSettingsSaved"), "success");
      await load();
    } catch {
      show(t("somethingWentWrong"), "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="glass space-y-3 p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Scissors className="size-5 text-(--text-muted)" />
          <h3 className="text-sm font-semibold text-(--text-primary)">{t("widgetBackupPrune")}</h3>
        </div>
        <button type="button" onClick={() => void start()} disabled={busy} className="btn-primary inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs disabled:opacity-50">
          {busy ? <Loader2 className="size-4 animate-spin" /> : null}
        </button>
      </div>
      {loading ? (
        <div className="flex h-16 items-center justify-center text-(--text-muted)"><Loader2 className="size-5 animate-spin" /></div>
      ) : jobs.length === 0 ? (
        <p className="text-xs text-(--text-muted)">{t("providerWidgetUnavailable")}</p>
      ) : (
        <ul className="space-y-1 text-xs">
          {jobs.map((job, i) => (
            <li key={i} className="rounded-lg bg-(--surface-soft) px-3 py-1.5 text-(--text-secondary)">{String(job.status ?? job.id ?? "job")}</li>
          ))}
        </ul>
      )}
    </section>
  );
}
