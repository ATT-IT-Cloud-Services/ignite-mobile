import { useCallback, useEffect, useState } from "react";
import { Globe2, Loader2, RefreshCw } from "lucide-react";

import { api } from "../../../lib/api";
import { useProviderT } from "../use-provider-t";
import type { ProviderWidgetProps } from "../types";

type DomainRow = { id: string; name: string; status?: string; storageUsedGb?: number };

/** Plesk/KeyHelp domains (mobile port of the web "plesk-domains" widget). */
export default function ProviderDomainsWidget({ slot, serviceId, context }: ProviderWidgetProps) {
  const t = useProviderT();
  const id = context?.server?.id ?? serviceId ?? "";
  const slug: "plesk" | "keyhelp" = slot.widget.startsWith("keyhelp") || context?.server?.providerType?.toUpperCase() === "KEYHELP" ? "keyhelp" : "plesk";
  const [domains, setDomains] = useState<DomainRow[]>([]);
  const [maxDomains, setMaxDomains] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await api.services.providerDomains(id, slug);
      setDomains(Array.isArray(res.domains) ? (res.domains as DomainRow[]) : []);
      setMaxDomains(Number(res.maxDomains) || 0);
    } catch {
      setDomains([]);
    } finally {
      setLoading(false);
    }
  }, [id, slug]);

  useEffect(() => {
    void load();
  }, [load]);

  const refresh = async () => {
    setRefreshing(true);
    try {
      await api.services.refreshProviderDomains(id, slug);
      await load();
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <section className="glass space-y-3 p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Globe2 className="size-5 text-(--text-muted)" />
          <h3 className="text-sm font-semibold text-(--text-primary)">{t("providerDomains")}</h3>
        </div>
        <button type="button" onClick={() => void refresh()} disabled={refreshing} className="glass rounded-xl p-2">
          {refreshing ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
        </button>
      </div>
      <p className="text-xs text-(--text-muted)">{domains.length} / {maxDomains}</p>
      {loading ? (
        <div className="flex h-16 items-center justify-center text-(--text-muted)"><Loader2 className="size-5 animate-spin" /></div>
      ) : domains.length === 0 ? (
        <p className="text-xs text-(--text-muted)">{t("providerWidgetUnavailable")}</p>
      ) : (
        <div className="space-y-1">
          {domains.map((domain) => (
            <div key={domain.id} className="flex items-center justify-between gap-2 rounded-lg bg-(--surface-soft) px-3 py-1.5 text-sm">
              <span className="truncate text-(--text-primary)">{domain.name}</span>
              <span className="text-[11px] text-(--text-muted)">{domain.status ?? ""}{domain.storageUsedGb != null ? ` · ${domain.storageUsedGb} GB` : ""}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
