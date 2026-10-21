import { useCallback, useEffect, useState } from "react";
import { FileCheck, Loader2 } from "lucide-react";

import { api } from "../../../lib/api";
import { useToast } from "../../../components/Toast";
import { AppModal } from "../../../components/ui/AppModal";
import { useProviderT } from "../use-provider-t";
import type { ProviderWidgetProps } from "../types";

/** Minecraft/game EULA acceptance (mobile port). */
export default function GameEulaWidget({ serviceId, context }: ProviderWidgetProps) {
  const t = useProviderT();
  const { show } = useToast();
  const id = context?.server?.id ?? serviceId ?? "";
  const [required, setRequired] = useState(false);
  const [accepted, setAccepted] = useState(true);
  const [text, setText] = useState("");
  const [checked, setChecked] = useState(false);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await api.services.gameEula(id);
      setRequired(res.required === true);
      setAccepted(res.accepted === true);
      setText(typeof res.text === "string" ? res.text : "");
    } catch {
      setRequired(false);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  const accept = async () => {
    setBusy(true);
    try {
      await api.services.acceptGameEula(id);
      show(t("providerSettingsSaved"), "success");
      setAccepted(true);
    } catch {
      show(t("somethingWentWrong"), "error");
    } finally {
      setBusy(false);
    }
  };

  if (loading || !required || accepted) return null;

  return (
    <>
      <section className="glass flex items-center gap-2 p-4 text-sm text-(--warning)">
        <FileCheck className="size-5" />
        <span>{t("gameEulaRequired")}</span>
      </section>
      <AppModal open onClose={() => undefined} closeAriaLabel={t("close")} closeDisabled>
        <h3 className="mb-3 text-lg font-semibold text-(--text-primary)">{t("gameEulaTitle")}</h3>
        <pre className="max-h-48 overflow-auto rounded-xl bg-black/20 p-3 text-[11px] text-(--text-secondary)">{text}</pre>
        <label className="mt-3 flex items-start gap-2 text-sm text-(--text-secondary)">
          <input type="checkbox" checked={checked} onChange={(e) => setChecked(e.target.checked)} className="mt-0.5" />
          {t("gameEulaAccept")}
        </label>
        <div className="mt-4 flex justify-end">
          <button type="button" disabled={busy || !checked} onClick={() => void accept()} className="btn-primary rounded-xl px-4 py-2 text-sm disabled:opacity-50">
            {busy ? <Loader2 className="size-4 animate-spin" /> : t("accept")}
          </button>
        </div>
      </AppModal>
    </>
  );
}
