import { useCallback, useEffect, useState } from "react";
import { Loader2, Wand2 } from "lucide-react";

import { api } from "../../../lib/api";
import { useToast } from "../../../components/Toast";
import { useProviderT } from "../use-provider-t";
import type { ProviderWidgetProps } from "../types";

type OwnedDomain = { id: string; name: string };

/** Plesk/KeyHelp setup wizard (mobile port). */
export default function ProviderSetupWidget({ slot, serviceId, context }: ProviderWidgetProps) {
  const t = useProviderT();
  const { show } = useToast();
  const id = context?.server?.id ?? serviceId ?? "";
  const slug: "plesk" | "keyhelp" = slot.widget.startsWith("keyhelp") || context?.server?.providerType?.toUpperCase() === "KEYHELP" ? "keyhelp" : "plesk";
  const [loading, setLoading] = useState(true);
  const [complete, setComplete] = useState(false);
  const [clientReady, setClientReady] = useState(false);
  const [owned, setOwned] = useState<OwnedDomain[]>([]);
  const [mode, setMode] = useState<"owned" | "external">("external");
  const [domainId, setDomainId] = useState("");
  const [external, setExternal] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = (await api.services.providerSetup(id, slug)) as Record<string, unknown>;
      setComplete(res.setupComplete === true);
      setClientReady(res.clientReady === true);
      const list = Array.isArray(res.ownedDomains) ? (res.ownedDomains as OwnedDomain[]) : [];
      setOwned(list);
      if (list.length > 0 && list[0]) {
        setMode("owned");
        setDomainId(list[0].id);
      }
    } catch {
      setComplete(false);
    } finally {
      setLoading(false);
    }
  }, [id, slug]);

  useEffect(() => {
    void load();
  }, [load]);

  const submit = async () => {
    setBusy(true);
    try {
      await api.services.postProviderSetup(id, slug, mode === "owned" ? { mode: "owned", domainId } : { mode: "external", domain: external.trim().toLowerCase() });
      show(t("providerSetupSuccess"), "success");
      await load();
      context?.onRefresh?.();
    } catch {
      show(t("somethingWentWrong"), "error");
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <section className="glass h-24 animate-pulse p-4" />;
  if (complete) return null;

  return (
    <section className="glass space-y-3 p-4">
      <div className="flex items-center gap-2">
        <Wand2 className="size-5 text-(--text-muted)" />
        <h3 className="text-sm font-semibold text-(--text-primary)">{t("providerSetup")}</h3>
      </div>
      {owned.length > 0 ? (
        <select value={mode === "owned" ? domainId : ""} onChange={(e) => { setMode("owned"); setDomainId(e.target.value); }} className="w-full rounded-xl border border-border bg-(--bg-elevated) px-3 py-2 text-sm">
          {owned.map((d) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
      ) : null}
      <input placeholder="domain.tld" value={external} onChange={(e) => { setMode("external"); setExternal(e.target.value); }} className="w-full rounded-xl border border-border bg-(--bg-elevated) px-3 py-2 text-sm" />
      <button type="button" disabled={busy || !clientReady || (mode === "external" && !external.trim())} onClick={() => void submit()} className="btn-primary rounded-xl px-4 py-2 text-sm disabled:opacity-50">
        {busy ? <Loader2 className="size-4 animate-spin" /> : t("providerSetup")}
      </button>
    </section>
  );
}
