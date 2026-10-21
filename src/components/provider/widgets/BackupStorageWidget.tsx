import { useCallback, useEffect, useState } from "react";
import { Database, Loader2 } from "lucide-react";

import { api } from "../../../lib/api";
import { useProviderT } from "../use-provider-t";
import type { ProviderWidgetProps } from "../types";

function rowsFrom(value: unknown): Array<[string, string]> {
  if (!value || typeof value !== "object") return [];
  return Object.entries(value as Record<string, unknown>)
    .filter(([, v]) => v != null && typeof v !== "object")
    .slice(0, 12)
    .map(([k, v]) => [k, String(v)]);
}

/** Proxmox Backup Server overview + namespaces (mobile port of web widgets). */
export default function BackupStorageWidget({ slot, serviceId, context }: ProviderWidgetProps) {
  const t = useProviderT();
  const id = context?.server?.id ?? serviceId ?? "";
  const showNamespaces = slot.widget === "backup-namespaces";
  const [info, setInfo] = useState<Record<string, unknown> | null>(null);
  const [namespaces, setNamespaces] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = (await api.services.backupStorage(id)) as Record<string, unknown>;
      setInfo(res.enabled ? ((res.info as Record<string, unknown>) ?? null) : null);
      setNamespaces(Array.isArray(res.namespaces) ? (res.namespaces as string[]) : []);
    } catch {
      setInfo(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <section className="glass space-y-3 p-4">
      <div className="flex items-center gap-2">
        <Database className="size-5 text-(--text-muted)" />
        <h3 className="text-sm font-semibold text-(--text-primary)">{showNamespaces ? t("widgetBackupNamespaces") : t("widgetBackupStorage")}</h3>
      </div>
      {loading ? (
        <div className="flex h-16 items-center justify-center text-(--text-muted)"><Loader2 className="size-5 animate-spin" /></div>
      ) : showNamespaces ? (
        namespaces.length === 0 ? (
          <p className="text-xs text-(--text-muted)">{t("providerWidgetUnavailable")}</p>
        ) : (
          <ul className="space-y-1 text-sm">
            {namespaces.map((ns) => (
              <li key={ns} className="rounded-lg bg-(--surface-soft) px-3 py-1.5 font-mono text-xs text-(--text-primary)">{ns}</li>
            ))}
          </ul>
        )
      ) : info ? (
        <dl className="grid grid-cols-1 gap-1 text-sm">
          {rowsFrom(info).map(([k, v]) => (
            <div key={k} className="flex justify-between gap-2 rounded-lg bg-(--surface-soft) px-3 py-1.5">
              <dt className="text-xs text-(--text-muted)">{k}</dt>
              <dd className="truncate text-xs text-(--text-primary)">{v}</dd>
            </div>
          ))}
        </dl>
      ) : (
        <p className="text-xs text-(--text-muted)">{t("providerWidgetUnavailable")}</p>
      )}
    </section>
  );
}
