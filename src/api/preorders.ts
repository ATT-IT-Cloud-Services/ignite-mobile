import { api } from "../lib/api";

export type PreorderListItem = {
  id: string;
  serviceId: string | null;
  productId: string;
  productName: string;
  orderedAt: string;
  deliveryLabel: string;
  capacityDisclaimer: string;
  canWithdraw: boolean;
  fulfillmentStatus: string;
};

export async function fetchPreorders(): Promise<PreorderListItem[]> {
  const res = await api.client.preorders.list();
  return Array.isArray(res?.preorders) ? res.preorders : [];
}

export async function withdrawPreorderRequest(subscriptionId: string): Promise<{
  success: boolean;
  amount?: number;
  error?: string;
}> {
  try {
    const res = await api.client.preorders.withdraw(subscriptionId);
    return { success: Boolean(res?.success), amount: res?.amount as number | undefined };
  } catch (err) {
    const message =
      err && typeof err === "object" && "message" in err
        ? String((err as { message: string }).message)
        : "Widerruf fehlgeschlagen.";
    return { success: false, error: message };
  }
}
