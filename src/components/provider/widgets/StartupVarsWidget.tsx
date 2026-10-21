import { useCallback, useEffect, useState } from "react";
import { Loader2, SlidersHorizontal } from "lucide-react";

import { api } from "../../../lib/api";
import { useToast } from "../../../components/Toast";
import { useProviderT } from "../use-provider-t";
import type { ProviderWidgetProps } from "../types";

type StartupVariable = {
  name: string;
  labels?: Record<string, string>;
  description?: string;
  envVariable?: string;
  defaultValue?: string;
  serverValue?: string | null;
  isEditable?: boolean;
};

/** Mobile port of the web "startup-vars" widget (Pterodactyl/game). */
export default function StartupVarsWidget({ serviceId, context }: ProviderWidgetProps) {
  const t = useProviderT();
  const { show } = useToast();
  const id = context?.server?.id ?? serviceId ?? "";
  const [variables, setVariables] = useState<StartupVariable[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await api.services.startupVariables(id);
      setVariables(Array.isArray(res.variables) ? (res.variables as StartupVariable[]) : []);
    } catch {
      setVariables([]);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  const save = async (variable: StartupVariable, value: string) => {
    setSaving(variable.envVariable ?? variable.name);
    try {
      await api.services.updateStartupVariable(id, { variable: variable.envVariable ?? variable.name, value });
      show(t("providerSettingsSaved"), "success");
      await load();
    } catch {
      show(t("somethingWentWrong"), "error");
    } finally {
      setSaving(null);
    }
  };

  return (
    <section className="glass space-y-3 p-4">
      <div className="flex items-center gap-2">
        <SlidersHorizontal className="size-5 text-(--text-muted)" />
        <h3 className="text-sm font-semibold text-(--text-primary)">{t("widgetStartupVars")}</h3>
      </div>
      {loading && variables.length === 0 ? (
        <div className="flex h-20 items-center justify-center text-(--text-muted)">
          <Loader2 className="size-5 animate-spin" />
        </div>
      ) : variables.length === 0 ? (
        <p className="text-xs text-(--text-muted)">{t("providerWidgetUnavailable")}</p>
      ) : (
        <div className="space-y-3">
          {variables.map((variable) => {
            const key = variable.envVariable ?? variable.name;
            const label = variable.labels?.de ?? variable.labels?.en ?? variable.name;
            const value = draft[key] ?? variable.serverValue ?? variable.defaultValue ?? "";
            return (
              <div key={key} className="space-y-1">
                <label className="text-xs font-medium text-(--text-secondary)">{label}</label>
                <div className="flex gap-2">
                  <input
                    value={value}
                    disabled={variable.isEditable === false}
                    onChange={(e) => setDraft((prev) => ({ ...prev, [key]: e.target.value }))}
                    className="w-full rounded-xl border border-border bg-(--bg-elevated) px-3 py-2 text-sm text-(--text-primary) disabled:opacity-50"
                  />
                  {variable.isEditable !== false && (
                    <button
                      type="button"
                      onClick={() => void save(variable, value)}
                      disabled={saving === key}
                      className="btn-primary shrink-0 rounded-xl px-3 py-2 text-xs font-medium disabled:opacity-50"
                    >
                      {saving === key ? <Loader2 className="size-4 animate-spin" /> : t("save")}
                    </button>
                  )}
                </div>
                {variable.description ? <p className="text-[11px] text-(--text-muted)">{variable.description}</p> : null}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
