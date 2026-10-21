import { useCallback, useEffect, useState } from "react";
import { Archive, Download, Loader2, Plus, RotateCcw, Trash2 } from "lucide-react";

import { api } from "../../../lib/api";
import { useToast } from "../../../components/Toast";
import { useProviderT } from "../use-provider-t";
import type { ProviderWidgetProps } from "../types";

type BackupEntry = { id: string; name: string | null; sizeGb: number | null; status: string; createdAt: string | null };

function normalize(raw: Record<string, unknown>): BackupEntry {
  const sizeGb = typeof raw.sizeGb === "number" ? raw.sizeGb : typeof raw.size === "number" && raw.size > 0 ? +(Number(raw.size) / 1024 ** 3).toFixed(2) : null;
  return {
    id: String(raw.id ?? ""),
    name: typeof raw.name === "string" && raw.name ? raw.name : null,
    sizeGb,
    status: typeof raw.status === "string" ? raw.status : "completed",
    createdAt: typeof raw.createdAt === "string" ? raw.createdAt : null,
  };
}

/** Mobile port of the web "backup-list" widget (snapshots + PBS). */
export default function BackupListWidget({ serviceId, context }: ProviderWidgetProps) {
  const t = useProviderT();
  const { show } = useToast();
  const id = context?.server?.id ?? serviceId ?? "";
  const [backups, setBackups] = useState<BackupEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await api.services.backups(id);
      setBackups(Array.isArray(res.backups) ? res.backups.map(normalize) : []);
    } catch {
      setBackups([]);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  const run = async (key: string, fn: () => Promise<{ success: boolean }>) => {
    setBusy(key);
    try {
      const res = await fn();
      if (res.success) {
        show(t("providerSettingsSaved"), "success");
        await load();
      } else {
        show(t("somethingWentWrong"), "error");
      }
    } catch {
      show(t("somethingWentWrong"), "error");
    } finally {
      setBusy(null);
    }
  };

  return (
    <section className="glass space-y-3 p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Archive className="size-5 text-(--text-muted)" />
          <h3 className="text-sm font-semibold text-(--text-primary)">{t("widgetBackupList")}</h3>
        </div>
        <button
          type="button"
          onClick={() => void run("create", () => api.services.createBackup(id))}
          disabled={busy !== null}
          className="btn-primary inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium disabled:opacity-50"
        >
          {busy === "create" ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
        </button>
      </div>

      {loading && backups.length === 0 ? (
        <div className="flex h-20 items-center justify-center text-(--text-muted)">
          <Loader2 className="size-5 animate-spin" />
        </div>
      ) : backups.length === 0 ? (
        <p className="text-xs text-(--text-muted)">{t("providerWidgetUnavailable")}</p>
      ) : (
        <div className="space-y-2">
          {backups.map((backup) => (
            <div key={backup.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-(--surface-soft) p-3">
              <div className="min-w-0">
                <p className="truncate text-sm text-(--text-primary)">{backup.name ?? backup.id.slice(0, 8)}</p>
                <p className="text-[11px] text-(--text-muted)">
                  {backup.createdAt ? new Date(backup.createdAt).toLocaleString() : ""}
                  {backup.sizeGb != null ? ` · ${backup.sizeGb} GB` : ""} · {backup.status}
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <IconButton label="download" onClick={() => void run(`dl-${backup.id}`, async () => {
                  const res = await api.services.downloadBackup(id, backup.id);
                  if (res.url) window.open(res.url, "_blank");
                  return { success: Boolean(res.url) };
                })}>
                  <Download className="size-4" />
                </IconButton>
                <IconButton label="restore" onClick={() => void run(`rs-${backup.id}`, () => api.services.restoreBackup(id, backup.id))}>
                  <RotateCcw className="size-4" />
                </IconButton>
                <IconButton label="delete" onClick={() => void run(`del-${backup.id}`, () => api.services.deleteBackup(id, backup.id))}>
                  <Trash2 className="size-4" />
                </IconButton>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function IconButton({ children, label, onClick }: { children: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button type="button" aria-label={label} onClick={onClick} className="rounded-lg border border-border p-2 text-(--text-secondary) hover:bg-(--surface-soft)">
      {children}
    </button>
  );
}
