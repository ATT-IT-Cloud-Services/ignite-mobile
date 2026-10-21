import { useState } from "react";
import { Loader2, Play } from "lucide-react";

import { api } from "../../../lib/api";
import { useToast } from "../../../components/Toast";
import { useProviderT } from "../use-provider-t";
import type { ProviderWidgetProps } from "../types";

/** Generic Ploi action widget (deploy/env/ssl/cron/queue/wordpress/fastcgi/nginx). */
export default function PloiActionsWidget({ slot, serviceId, context }: ProviderWidgetProps) {
  const t = useProviderT();
  const { show } = useToast();
  const id = context?.server?.id ?? serviceId ?? "";
  const actionKey = slot.widget.replace(/^ploi-/, "");
  const label = typeof slot.props?.label === "string" ? slot.props.label : actionKey;
  const needsInput = ["env", "cron", "nginx", "fastcgi", "wordpress"].includes(actionKey);
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const run = async () => {
    setBusy(true);
    setResult(null);
    try {
      const res = (await api.services.action(id, actionKey, value ? { content: value, value } : {})) as unknown as {
        success?: boolean;
        message?: string;
        data?: { content?: unknown; message?: string };
      };
      const msg = res.message ?? res.data?.message ?? (typeof res.data?.content === "string" ? res.data.content : null);
      setResult(msg ?? t("providerSettingsSaved"));
      show(res.success === false ? t("somethingWentWrong") : t("providerSettingsSaved"), res.success === false ? "error" : "success");
      context?.onRefresh?.();
    } catch {
      show(t("somethingWentWrong"), "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="glass space-y-3 p-4">
      <h3 className="text-sm font-semibold text-(--text-primary)">{label}</h3>
      {needsInput ? (
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          rows={4}
          className="w-full rounded-xl border border-border bg-(--bg-elevated) px-3 py-2 font-mono text-xs text-(--text-primary)"
        />
      ) : null}
      <button type="button" onClick={() => void run()} disabled={busy} className="btn-primary inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm disabled:opacity-50">
        {busy ? <Loader2 className="size-4 animate-spin" /> : <Play className="size-4" />} {label}
      </button>
      {result ? <pre className="max-h-40 overflow-auto rounded-xl bg-black/20 p-3 text-[11px] text-(--text-secondary)">{result}</pre> : null}
    </section>
  );
}
