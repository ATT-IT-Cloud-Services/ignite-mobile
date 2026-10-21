import { useMemo, useState } from "react";
import { ArrowRightLeft, Loader2 } from "lucide-react";

import { api } from "../../../lib/api";
import { cartService, type CartItem } from "../../../lib/cart-service";
import { useToast } from "../../../components/Toast";
import { useProviderT } from "../use-provider-t";
import type { ProviderWidgetProps } from "../types";

/** Package switch → cart (mobile port of the web "package-switch-panel"). */
export default function PackageSwitchWidget({ serviceId, context }: ProviderWidgetProps) {
  const t = useProviderT();
  const { show } = useToast();
  const id = context?.server?.id ?? serviceId ?? "";
  const products = context?.server?.switchableProducts ?? [];
  const currentPrice = Number(context?.server?.billing?.monthlyPrice ?? 0);
  const [selectedId, setSelectedId] = useState<string>("");
  const [busy, setBusy] = useState(false);

  const selected = useMemo(() => products.find((p) => p.id === selectedId) ?? null, [products, selectedId]);
  const delta = selected ? Number(selected.priceMonthly ?? 0) - currentPrice : 0;

  const prepare = async () => {
    if (!id || !selected) return;
    setBusy(true);
    try {
      const res = (await api.services.cartUpgrade(id, selected.id)) as { cartItem?: CartItem };
      if (!res.cartItem) {
        show(t("somethingWentWrong"), "error");
        return;
      }
      cartService.addItem(res.cartItem);
      show(t("packageSwitchAdded"), "success");
      context?.onRefresh?.();
    } catch {
      show(t("somethingWentWrong"), "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="glass space-y-3 p-4">
      <div className="flex items-center gap-2">
        <ArrowRightLeft className="size-5 text-(--text-muted)" />
        <h3 className="text-sm font-semibold text-(--text-primary)">{t("widgetPackageSwitch")}</h3>
      </div>
      {products.length === 0 ? (
        <p className="text-xs text-(--text-muted)">{t("providerWidgetUnavailable")}</p>
      ) : (
        <>
          <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)} className="w-full rounded-xl border border-border bg-(--bg-elevated) px-3 py-2 text-sm">
            <option value="">—</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name ?? p.id} · {Number(p.priceMonthly ?? 0).toFixed(2)} €
              </option>
            ))}
          </select>
          {selected ? (
            <p className="text-xs text-(--text-muted)">
              {delta >= 0 ? "+" : ""}{delta.toFixed(2)} €
            </p>
          ) : null}
          <button type="button" disabled={busy || !selected} onClick={() => void prepare()} className="btn-primary rounded-xl px-4 py-2 text-sm disabled:opacity-50">
            {busy ? <Loader2 className="size-4 animate-spin" /> : t("widgetPackageSwitch")}
          </button>
        </>
      )}
    </section>
  );
}
