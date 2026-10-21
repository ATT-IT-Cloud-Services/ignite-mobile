import { useCallback, useEffect, useState } from "react";
import { History, Loader2 } from "lucide-react";

import { api } from "../../lib/api";
import { useI18n } from "../../i18n";

type ActivityRow = { id?: string; action?: string; description?: string | null; createdAt?: string | null };

/** Support/activity log for a service (mobile port). Read-only. */
export function SupportActivityPanel({ serviceId }: { serviceId: string }) {
  const { t } = useI18n();
  const [rows, setRows] = useState<ActivityRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = (await api.get(`/services/${encodeURIComponent(serviceId)}/activity`)) as unknown as {
        success?: boolean;
        activities?: ActivityRow[];
        activity?: ActivityRow[];
      };
      setRows(Array.isArray(res.activities) ? res.activities : Array.isArray(res.activity) ? res.activity : []);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [serviceId]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <section className="glass space-y-3 p-4">
      <div className="flex items-center gap-2">
        <History className="size-5 text-(--text-muted)" />
        <h3 className="text-sm font-semibold text-(--text-primary)">{t("supportActivityTitle")}</h3>
      </div>
      {loading ? (
        <div className="flex h-16 items-center justify-center text-(--text-muted)"><Loader2 className="size-5 animate-spin" /></div>
      ) : rows.length === 0 ? (
        <p className="text-xs text-(--text-muted)">{t("providerWidgetUnavailable")}</p>
      ) : (
        <ul className="space-y-1 text-sm">
          {rows.slice(0, 30).map((row, i) => (
            <li key={row.id ?? i} className="rounded-lg bg-(--surface-soft) px-3 py-1.5">
              <span className="block text-(--text-primary)">{row.description ?? row.action ?? ""}</span>
              {row.createdAt ? <span className="block text-[11px] text-(--text-muted)">{new Date(row.createdAt).toLocaleString()}</span> : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
