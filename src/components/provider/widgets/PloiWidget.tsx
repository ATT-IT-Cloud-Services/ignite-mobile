import { useCallback, useEffect, useState } from "react";
import { Loader2, Network } from "lucide-react";

import { api } from "../../../lib/api";
import { useProviderT } from "../use-provider-t";
import type { ProviderWidgetProps } from "../types";

/** Ploi storage-history + DNS (mobile port). */
export default function PloiWidget({ slot, serviceId, context }: ProviderWidgetProps) {
  const t = useProviderT();
  const id = context?.server?.id ?? serviceId ?? "";
  const isDns = slot.widget === "ploi-dns";
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [points, setPoints] = useState<Array<Record<string, unknown>>>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      if (isDns) {
        setData((await api.services.ploiDns(id)) as Record<string, unknown>);
      } else {
        const res = await api.services.ploiStorageHistory(id, 72);
        setPoints(Array.isArray(res.points) ? res.points : []);
      }
    } catch {
      setData(null);
      setPoints([]);
    } finally {
      setLoading(false);
    }
  }, [id, isDns]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <section className="glass space-y-3 p-4">
      <div className="flex items-center gap-2">
        <Network className="size-5 text-(--text-muted)" />
        <h3 className="text-sm font-semibold text-(--text-primary)">{isDns ? t("widgetPloiDns") : t("widgetPloiStorage")}</h3>
      </div>
      {loading ? (
        <div className="flex h-16 items-center justify-center text-(--text-muted)"><Loader2 className="size-5 animate-spin" /></div>
      ) : isDns ? (
        data ? (
          <pre className="max-h-48 overflow-auto rounded-xl bg-black/20 p-3 text-[11px] text-(--text-secondary)">{JSON.stringify(data, null, 2)}</pre>
        ) : (
          <p className="text-xs text-(--text-muted)">{t("providerWidgetUnavailable")}</p>
        )
      ) : points.length === 0 ? (
        <p className="text-xs text-(--text-muted)">{t("providerWidgetUnavailable")}</p>
      ) : (
        <p className="text-xs text-(--text-muted)">{points.length} {t("widgetPloiPoints")}</p>
      )}
    </section>
  );
}
