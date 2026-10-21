import { useState } from "react";
import { Loader2, TrendingUp } from "lucide-react";

import { api } from "../../../lib/api";
import { cartService, type CartItem } from "../../../lib/cart-service";
import { useToast } from "../../../components/Toast";
import { useProviderT } from "../use-provider-t";
import type { ProviderWidgetProps } from "../types";

/** Generic CPU/RAM/disk upgrade for resource providers (Proxmox/Pterodactyl). */
export default function ResourceUpgradeWidget({ serviceId, context }: ProviderWidgetProps) {
  const t = useProviderT();
  const { show } = useToast();
  const id = context?.server?.id ?? serviceId ?? "";
  const server = context?.server;
  const provider = String(context?.server?.providerType ?? "").toUpperCase();
  const usesPercentCpu = provider === "PTERODACTYL";
  const cpuLabel = usesPercentCpu ? "CPU (%)" : "CPU (vCores)";

  const [cpu, setCpu] = useState(String(Math.max(1, Math.round(server?.cpu?.total ?? 1))));
  const [ram, setRam] = useState(String(Math.max(1, Math.round(server?.ram?.total ?? 1))));
  const [disk, setDisk] = useState(String(Math.max(1, Math.round(server?.disk?.total ?? 20))));
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!id) return;
    setBusy(true);
    try {
      const resourceChanges: Record<string, unknown> = {
        vcores: Number(cpu) || undefined,
        memory: Number(ram) || undefined,
        storage: Number(disk) || undefined,
      };
      const res = (await api.services.cartUpgradeResources(id, resourceChanges)) as { cartItem?: CartItem; itemType?: string };
      if (res.itemType === "downgrade") {
        show(t("upgradeDowngradeHint"), "info");
        return;
      }
      if (res.cartItem) {
        cartService.addItem(res.cartItem);
        show(t("upgradeAdded"), "success");
        context?.onRefresh?.();
      } else {
        show(t("somethingWentWrong"), "error");
      }
    } catch {
      show(t("somethingWentWrong"), "error");
    } finally {
      setBusy(false);
    }
  };

  const inputCls = "min-h-11 w-full rounded-xl border border-border bg-(--bg-elevated) px-3 text-sm text-(--text-primary)";

  return (
    <section className="glass space-y-3 p-4">
      <div className="flex items-center gap-2">
        <TrendingUp className="size-5 text-(--text-muted)" />
        <h3 className="text-sm font-semibold text-(--text-primary)">{t("widgetUpgrade")}</h3>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <label className="space-y-1 text-xs text-(--text-muted)">
          <span>{cpuLabel}</span>
          <input type="number" min={1} value={cpu} onChange={(e) => setCpu(e.target.value)} className={inputCls} />
        </label>
        <label className="space-y-1 text-xs text-(--text-muted)">
          <span>RAM (GB)</span>
          <input type="number" min={1} value={ram} onChange={(e) => setRam(e.target.value)} className={inputCls} />
        </label>
        <label className="space-y-1 text-xs text-(--text-muted)">
          <span>Disk (GB)</span>
          <input type="number" min={1} value={disk} onChange={(e) => setDisk(e.target.value)} className={inputCls} />
        </label>
      </div>
      <button type="button" onClick={() => void submit()} disabled={busy} className="btn-primary rounded-xl px-4 py-2 text-sm disabled:opacity-50">
        {busy ? <Loader2 className="size-4 animate-spin" /> : t("widgetUpgrade")}
      </button>
    </section>
  );
}
