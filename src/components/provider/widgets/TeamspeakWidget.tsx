import { useCallback, useEffect, useState } from "react";
import { Loader2, Radio } from "lucide-react";

import { api } from "../../../lib/api";
import { useProviderT } from "../use-provider-t";
import type { ProviderWidgetProps } from "../types";

type Overview = {
  connection?: {
    address?: string | null;
    queryPort?: string | null;
    portFrom?: string | null;
    portTo?: string | null;
    username?: string | null;
    state?: string;
    slots?: number | null;
  };
  statistics?: { online?: number; maxClients?: number; channels?: number; history?: Array<{ online?: number }> } | null;
  degraded?: boolean;
};

/** Mobile port of the web teamspeak "instance" + "statistics" widgets. */
export default function TeamspeakWidget({ serviceId, context }: ProviderWidgetProps) {
  const t = useProviderT();
  const id = context?.server?.id ?? serviceId ?? "";
  const [data, setData] = useState<Overview>({});
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = (await api.services.teamspeak(id)) as unknown as Overview;
      setData(res ?? {});
    } catch {
      setData({});
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  const conn = data.connection ?? {};
  const ports = conn.portFrom && conn.portTo ? `${conn.portFrom}–${conn.portTo}` : conn.queryPort ?? "—";

  return (
    <section className="glass space-y-3 p-4">
      <div className="flex items-center gap-2">
        <Radio className="size-5 text-(--text-muted)" />
        <h3 className="text-sm font-semibold text-(--text-primary)">{t("teamspeakTitle")}</h3>
      </div>
      {loading ? (
        <div className="flex h-16 items-center justify-center text-(--text-muted)">
          <Loader2 className="size-5 animate-spin" />
        </div>
      ) : (
        <>
          {data.degraded ? (
            <p className="rounded-xl border border-(--warning)/40 bg-(--warning)/10 px-3 py-2 text-xs text-(--warning)">
              {t("providerWidgetUnavailable")}
            </p>
          ) : null}
          <dl className="grid grid-cols-1 gap-1 text-sm sm:grid-cols-2">
            <Row label={t("teamspeakAddress")} value={conn.address ?? "—"} />
            <Row label={t("teamspeakQueryPort")} value={ports} />
            <Row label={t("teamspeakSlots")} value={conn.slots != null ? String(conn.slots) : "—"} />
            {data.statistics?.online != null ? <Row label="Online" value={String(data.statistics.online)} /> : null}
          </dl>
        </>
      )}
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-lg bg-(--surface-soft) px-3 py-1.5">
      <dt className="text-xs text-(--text-muted)">{label}</dt>
      <dd className="truncate font-mono text-xs text-(--text-primary)">{value}</dd>
    </div>
  );
}
