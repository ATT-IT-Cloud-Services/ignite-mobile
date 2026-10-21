import { useCallback, useEffect, useState } from "react";
import { Activity, Loader2 } from "lucide-react";

import { api } from "../../../lib/api";
import { useProviderT } from "../use-provider-t";
import type { ProviderWidgetProps } from "../types";

/** Monitoring (mobile port): targets + score from the monitoring endpoints. */
export default function MonitoringWidget({ serviceId, context }: ProviderWidgetProps) {
  const t = useProviderT();
  const id = context?.server?.id ?? serviceId ?? "";
  const [targets, setTargets] = useState<Array<Record<string, unknown>>>([]);
  const [score, setScore] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [targetsRes, scoreRes] = await Promise.all([
        api.services.monitoringTargets(id).catch(() => ({ success: false, targets: [] })),
        api.services.monitoringScore(id).catch(() => ({})),
      ]);
      setTargets(Array.isArray(targetsRes.targets) ? targetsRes.targets : []);
      setScore(scoreRes && typeof scoreRes === "object" ? (scoreRes as Record<string, unknown>) : null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  const scoreValue =
    score && (typeof score.score === "number" || typeof score.value === "number")
      ? String(score.score ?? score.value)
      : null;

  return (
    <section className="glass space-y-3 p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Activity className="size-5 text-(--text-muted)" />
          <h3 className="text-sm font-semibold text-(--text-primary)">{t("widgetMonitoring")}</h3>
        </div>
        {scoreValue ? <span className="rounded-full bg-(--primary)/15 px-2.5 py-1 text-xs text-(--primary)">{scoreValue}</span> : null}
      </div>
      {loading ? (
        <div className="flex h-16 items-center justify-center text-(--text-muted)"><Loader2 className="size-5 animate-spin" /></div>
      ) : targets.length === 0 ? (
        <p className="text-xs text-(--text-muted)">{t("providerWidgetUnavailable")}</p>
      ) : (
        <ul className="space-y-1 text-sm">
          {targets.map((target, i) => (
            <li key={String(target.id ?? i)} className="flex items-center justify-between gap-2 rounded-lg bg-(--surface-soft) px-3 py-1.5">
              <span className="truncate text-(--text-primary)">{String(target.name ?? target.url ?? target.host ?? target.id ?? "")}</span>
              <span className="text-[11px] text-(--text-muted)">{String(target.status ?? "")}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
