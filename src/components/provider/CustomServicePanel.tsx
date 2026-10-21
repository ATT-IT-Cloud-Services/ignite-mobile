import { useCallback, useEffect, useState } from "react";
import { Loader2, Receipt } from "lucide-react";

import { api } from "../../lib/api";
import { useI18n } from "../../i18n";
import { formatMoney } from "../../features/billing/lib";

type CustomLineItem = { id: string; name: string; description?: string | null; amount: number; quantity: number; recurring?: boolean };

/** Minimal detail for a bespoke ("custom") service: free-text billing positions. */
export function CustomServicePanel({ serviceId }: { serviceId: string }) {
  const { t, lang } = useI18n();
  const [items, setItems] = useState<CustomLineItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = (await api.client.services.subscription(serviceId)) as unknown as {
        success?: boolean;
        subscription?: { lineItems?: CustomLineItem[] };
      };
      setItems(Array.isArray(res.subscription?.lineItems) ? (res.subscription?.lineItems as CustomLineItem[]) : []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [serviceId]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <section className="glass space-y-3 p-4">
      <div className="flex items-center gap-2">
        <Receipt className="size-5 text-(--text-muted)" />
        <h3 className="text-sm font-semibold text-(--text-primary)">{t("customServiceTitle")}</h3>
      </div>
      {loading ? (
        <div className="flex h-16 items-center justify-center text-(--text-muted)"><Loader2 className="size-5 animate-spin" /></div>
      ) : items.length === 0 ? (
        <p className="text-xs text-(--text-muted)">{t("providerWidgetUnavailable")}</p>
      ) : (
        <ul className="space-y-1 text-sm">
          {items.map((item) => (
            <li key={item.id} className="flex items-center justify-between gap-2 rounded-lg bg-(--surface-soft) px-3 py-2">
              <span className="min-w-0">
                <span className="block truncate text-(--text-primary)">{item.name}</span>
                {item.description ? <span className="block text-[11px] text-(--text-muted)">{item.description}</span> : null}
              </span>
              <span className="shrink-0 tabular-nums text-(--text-secondary)">{formatMoney(item.amount * (item.quantity || 1), lang)}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
