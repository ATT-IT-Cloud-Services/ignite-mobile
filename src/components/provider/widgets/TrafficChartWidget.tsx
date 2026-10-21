import { useCallback, useEffect, useMemo, useState } from "react";
import { BarChart3, Loader2 } from "lucide-react";

import { api } from "../../../lib/api";
import { useProviderT } from "../use-provider-t";
import type { ProviderWidgetProps } from "../types";

type Range = "hour" | "day" | "week" | "month";
const RANGES: Range[] = ["hour", "day", "week", "month"];

type Point = { t: number; inBps: number; outBps: number };

/**
 * Mobile port of the web "traffic-chart" widget. Uses the provider traffic
 * series via `GET /services/:id/traffic` and renders a dependency-free SVG
 * line chart with a range switcher.
 */
export default function TrafficChartWidget({ serviceId, context }: ProviderWidgetProps) {
  const t = useProviderT();
  const id = context?.server?.id ?? serviceId ?? "";
  const [range, setRange] = useState<Range>("day");
  const [points, setPoints] = useState<Point[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = (await api.services.traffic(id, range)) as {
        success?: boolean;
        data?: { time?: number[]; netin?: number[]; netout?: number[] } | Array<{ timestamp?: string; networkInRate?: number; networkOutRate?: number }>;
      };
      const data = res?.data;
      let next: Point[] = [];
      if (data && !Array.isArray(data) && Array.isArray(data.time)) {
        next = data.time.map((t, i) => ({ t: Number(t), inBps: Number(data.netin?.[i] ?? 0), outBps: Number(data.netout?.[i] ?? 0) }));
      } else if (Array.isArray(data)) {
        next = data.map((p) => ({ t: new Date(p.timestamp ?? 0).getTime() / 1000, inBps: Number(p.networkInRate ?? 0), outBps: Number(p.networkOutRate ?? 0) }));
      }
      setPoints(next);
    } catch {
      setPoints([]);
    } finally {
      setLoading(false);
    }
  }, [id, range]);

  useEffect(() => {
    void load();
  }, [load]);

  const max = useMemo(() => Math.max(1, ...points.map((p) => Math.max(p.inBps, p.outBps))), [points]);

  return (
    <section className="glass space-y-3 p-4">
      <div className="flex items-center gap-2">
        <BarChart3 className="size-5 text-(--text-muted)" />
        <h3 className="text-sm font-semibold text-(--text-primary)">{t("widgetTrafficChart")}</h3>
      </div>

      <div className="flex gap-1">
        {RANGES.map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRange(r)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium ${range === r ? "bg-(--primary)/20 text-(--primary)" : "bg-(--surface-soft) text-(--text-muted)"}`}
          >
            {r === "hour" ? "1h" : r === "day" ? "24h" : r === "week" ? "7d" : "30d"}
          </button>
        ))}
      </div>

      {loading && points.length === 0 ? (
        <div className="flex h-32 items-center justify-center text-(--text-muted)">
          <Loader2 className="size-5 animate-spin" />
        </div>
      ) : points.length === 0 ? (
        <p className="text-xs text-(--text-muted)">{t("providerWidgetUnavailable")}</p>
      ) : (
        <TrafficSvg points={points} max={max} />
      )}
    </section>
  );
}

function TrafficSvg({ points, max }: { points: Point[]; max: number }) {
  const W = 100;
  const H = 32;
  const step = points.length > 1 ? W / (points.length - 1) : W;
  const toPoly = (key: "inBps" | "outBps") =>
    points.map((p, i) => `${(i * step).toFixed(2)},${(H - (p[key] / max) * H).toFixed(2)}`).join(" ");
  return (
    <div className="space-y-2">
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="h-32 w-full">
        <polyline points={toPoly("inBps")} fill="none" stroke="var(--primary)" strokeWidth="0.8" vectorEffect="non-scaling-stroke" />
        <polyline points={toPoly("outBps")} fill="none" stroke="var(--accent)" strokeWidth="0.8" strokeDasharray="2 1" vectorEffect="non-scaling-stroke" />
      </svg>
      <div className="flex gap-4 text-xs text-(--text-muted)">
        <span className="inline-flex items-center gap-1">
          <span className="inline-block size-2 rounded-full bg-(--primary)" /> In
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="inline-block size-2 rounded-full bg-(--accent)" /> Out
        </span>
      </div>
    </div>
  );
}
