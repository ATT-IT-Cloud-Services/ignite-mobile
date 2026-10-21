import { useCallback, useEffect, useState } from "react";
import { Loader2, RotateCcw } from "lucide-react";

import { api } from "../../../lib/api";
import { useToast } from "../../../components/Toast";
import { AppModal } from "../../../components/ui/AppModal";
import { useProviderT } from "../use-provider-t";
import type { ProviderWidgetProps } from "../types";

type Template = { template?: string; name?: string; label?: string; os?: string };

/** Mobile port of the web "reinstall-wizard" (Proxmox/Pterodactyl). */
export default function ReinstallWizardWidget({ serviceId, context }: ProviderWidgetProps) {
  const t = useProviderT();
  const { show } = useToast();
  const id = context?.server?.id ?? serviceId ?? "";
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selected, setSelected] = useState("");
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await api.services.reinstallTemplates(id);
      setTemplates(Array.isArray(res.templates) ? (res.templates as Template[]) : []);
    } catch {
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  const reinstall = async () => {
    setBusy(true);
    try {
      await api.services.reinstall(id, { template: selected });
      show(t("providerSettingsSaved"), "success");
      setOpen(false);
    } catch {
      show(t("somethingWentWrong"), "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="glass space-y-3 p-4">
      <div className="flex items-center gap-2">
        <RotateCcw className="size-5 text-(--text-muted)" />
        <h3 className="text-sm font-semibold text-(--text-primary)">{t("widgetReinstall")}</h3>
      </div>
      {loading ? (
        <div className="flex h-16 items-center justify-center text-(--text-muted)"><Loader2 className="size-5 animate-spin" /></div>
      ) : templates.length === 0 ? (
        <p className="text-xs text-(--text-muted)">{t("providerWidgetUnavailable")}</p>
      ) : (
        <button type="button" onClick={() => setOpen(true)} className="rounded-xl border border-(--error)/40 px-4 py-2 text-xs font-medium text-(--error)">
          {t("widgetReinstall")}
        </button>
      )}

      <AppModal open={open} onClose={() => setOpen(false)} closeAriaLabel={t("cancel")}>
        <h3 className="mb-3 text-lg font-semibold text-(--text-primary)">{t("widgetReinstall")}</h3>
        <select value={selected} onChange={(e) => setSelected(e.target.value)} className="w-full rounded-xl border border-border bg-(--bg-elevated) px-3 py-2 text-sm">
          <option value="">—</option>
          {templates.map((tpl) => {
            const value = tpl.template ?? tpl.name ?? tpl.label ?? "";
            return (
              <option key={value} value={value}>
                {tpl.label ?? tpl.name ?? tpl.os ?? value}
              </option>
            );
          })}
        </select>
        <div className="mt-4 flex justify-end gap-2">
          <button type="button" onClick={() => setOpen(false)} className="glass rounded-xl px-4 py-2 text-sm">{t("cancel")}</button>
          <button type="button" disabled={busy || !selected} onClick={() => void reinstall()} className="btn-primary rounded-xl px-4 py-2 text-sm disabled:opacity-50">
            {busy ? <Loader2 className="size-4 animate-spin" /> : t("widgetReinstall")}
          </button>
        </div>
      </AppModal>
    </section>
  );
}
