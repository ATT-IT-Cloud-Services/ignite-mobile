import { useCallback, useEffect, useState } from "react";
import { Eye, KeyRound, Loader2, RotateCw } from "lucide-react";

import { api } from "../../../lib/api";
import { useProviderT } from "../use-provider-t";
import type { ProviderWidgetProps } from "../types";

type Creds = { username?: string | null; password?: string | null; loginUrl?: string | null; serverUrl?: string | null };

/** Plesk/KeyHelp credentials (mobile port of the web "plesk-credentials" widget). */
export default function ProviderCredentialsWidget({ slot, serviceId, context }: ProviderWidgetProps) {
  const t = useProviderT();
  const id = context?.server?.id ?? serviceId ?? "";
  const slug: "plesk" | "keyhelp" = slot.widget.startsWith("keyhelp") || context?.server?.providerType?.toUpperCase() === "KEYHELP" ? "keyhelp" : "plesk";
  const [creds, setCreds] = useState<Creds>({});
  const [revealed, setRevealed] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await api.services.providerCredentials(id, slug);
      setCreds({ username: (res.username as string) ?? null, loginUrl: (res.loginUrl as string) ?? null, serverUrl: (res.serverUrl as string) ?? null });
    } catch {
      setCreds({});
    } finally {
      setLoading(false);
    }
  }, [id, slug]);

  useEffect(() => {
    void load();
  }, [load]);

  const reveal = async () => {
    setBusy(true);
    try {
      const res = await api.services.providerCredentials(id, slug, true);
      setRevealed(typeof res.password === "string" ? res.password : null);
    } catch {
      setRevealed(null);
    } finally {
      setBusy(false);
    }
  };

  const rotate = async () => {
    setBusy(true);
    try {
      const res = await api.services.rotateProviderCredentials(id, slug);
      setRevealed(typeof res.password === "string" ? res.password : null);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="glass space-y-3 p-4">
      <div className="flex items-center gap-2">
        <KeyRound className="size-5 text-(--text-muted)" />
        <h3 className="text-sm font-semibold text-(--text-primary)">{t("providerCredentials")}</h3>
      </div>
      {loading ? (
        <div className="flex h-16 items-center justify-center text-(--text-muted)"><Loader2 className="size-5 animate-spin" /></div>
      ) : (
        <dl className="grid grid-cols-1 gap-1 text-sm">
          <Row label={t("providerUsername")} value={creds.username ?? "—"} />
          <Row label={t("providerPassword")} value={revealed ?? "••••••••"} />
          {(creds.loginUrl ?? creds.serverUrl) ? <Row label={t("providerLoginUrl")} value={(creds.loginUrl ?? creds.serverUrl) as string} /> : null}
        </dl>
      )}
      <div className="flex gap-2">
        <button type="button" onClick={() => void reveal()} disabled={busy} className="glass inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs">
          {busy ? <Loader2 className="size-4 animate-spin" /> : <Eye className="size-4" />} {t("providerReveal")}
        </button>
        <button type="button" onClick={() => void rotate()} disabled={busy} className="glass inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs">
          <RotateCw className="size-4" /> {t("providerRotate")}
        </button>
      </div>
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
