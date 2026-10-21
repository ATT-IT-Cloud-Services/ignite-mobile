import { useCallback, useEffect, useState } from "react";
import { Loader2, Plus, ShieldCheck, Trash2 } from "lucide-react";

import { api } from "../../../lib/api";
import { useToast } from "../../../components/Toast";
import { AppModal } from "../../../components/ui/AppModal";
import { useProviderT } from "../use-provider-t";
import type { ProviderWidgetProps } from "../types";

type Rule = { id: string; direction?: string; action?: string; protocol?: string; port?: string; source?: string; description?: string | null };

/** Mobile port of the web "firewall-table" widget (Proxmox). */
export default function FirewallTableWidget({ serviceId, context }: ProviderWidgetProps) {
  const t = useProviderT();
  const { show } = useToast();
  const id = context?.server?.id ?? serviceId ?? "";
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);
  const [openAdd, setOpenAdd] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ direction: "INGRESS", protocol: "TCP", port: "", source: "", action: "ALLOW", description: "" });

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await api.services.firewallRules(id);
      setRules(Array.isArray(res.rules) ? (res.rules as Rule[]) : []);
    } catch {
      setRules([]);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  const add = async () => {
    setBusy(true);
    try {
      await api.services.addFirewallRule(id, {
        direction: form.direction,
        protocol: form.protocol,
        port: form.port || "*",
        source: form.source || "0.0.0.0/0",
        action: form.action,
        description: form.description || undefined,
      });
      show(t("providerSettingsSaved"), "success");
      setOpenAdd(false);
      await load();
    } catch {
      show(t("somethingWentWrong"), "error");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (ruleId: string) => {
    try {
      await api.services.deleteFirewallRule(id, ruleId);
      await load();
    } catch {
      show(t("somethingWentWrong"), "error");
    }
  };

  return (
    <section className="glass space-y-3 p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-5 text-(--text-muted)" />
          <h3 className="text-sm font-semibold text-(--text-primary)">{t("firewallTitle")}</h3>
        </div>
        <button type="button" onClick={() => setOpenAdd(true)} className="btn-primary inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium">
          <Plus className="size-4" />
        </button>
      </div>
      {loading && rules.length === 0 ? (
        <div className="flex h-16 items-center justify-center text-(--text-muted)"><Loader2 className="size-5 animate-spin" /></div>
      ) : rules.length === 0 ? (
        <p className="text-xs text-(--text-muted)">{t("providerWidgetUnavailable")}</p>
      ) : (
        <div className="space-y-2">
          {rules.map((rule) => (
            <div key={rule.id} className="flex items-center justify-between gap-2 rounded-xl bg-(--surface-soft) p-3 text-sm">
              <div className="min-w-0">
                <p className="truncate text-(--text-primary)">
                  {rule.action} {rule.protocol} {rule.port} ← {rule.source}
                </p>
                <p className="text-[11px] text-(--text-muted)">{rule.direction}{rule.description ? ` · ${rule.description}` : ""}</p>
              </div>
              <button type="button" aria-label="delete" onClick={() => void remove(rule.id)} className="rounded-lg border border-border p-2 text-(--error)">
                <Trash2 className="size-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <AppModal open={openAdd} onClose={() => setOpenAdd(false)} closeAriaLabel={t("cancel")}>
        <h3 className="mb-3 text-lg font-semibold text-(--text-primary)">{t("firewallTitle")}</h3>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <select value={form.direction} onChange={(e) => setForm({ ...form, direction: e.target.value })} className="rounded-xl border border-border bg-(--bg-elevated) px-3 py-2 text-sm">
              <option value="INGRESS">INGRESS</option>
              <option value="EGRESS">EGRESS</option>
            </select>
            <select value={form.protocol} onChange={(e) => setForm({ ...form, protocol: e.target.value })} className="rounded-xl border border-border bg-(--bg-elevated) px-3 py-2 text-sm">
              <option value="TCP">TCP</option>
              <option value="UDP">UDP</option>
              <option value="ICMP">ICMP</option>
            </select>
          </div>
          <input placeholder="Port (z. B. 22, 80:443, *)" value={form.port} onChange={(e) => setForm({ ...form, port: e.target.value })} className="w-full rounded-xl border border-border bg-(--bg-elevated) px-3 py-2 text-sm" />
          <input placeholder="Quelle (z. B. 0.0.0.0/0)" value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} className="w-full rounded-xl border border-border bg-(--bg-elevated) px-3 py-2 text-sm" />
          <select value={form.action} onChange={(e) => setForm({ ...form, action: e.target.value })} className="w-full rounded-xl border border-border bg-(--bg-elevated) px-3 py-2 text-sm">
            <option value="ALLOW">ALLOW</option>
            <option value="DENY">DENY</option>
          </select>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setOpenAdd(false)} className="glass rounded-xl px-4 py-2 text-sm">{t("cancel")}</button>
            <button type="button" onClick={() => void add()} disabled={busy} className="btn-primary rounded-xl px-4 py-2 text-sm disabled:opacity-50">{t("save")}</button>
          </div>
        </div>
      </AppModal>
    </section>
  );
}
