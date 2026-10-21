import { useState } from "react";
import { ChevronLeft, Loader2 } from "lucide-react";

import { api } from "../../../lib/api";
import { useI18n } from "../../../i18n";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";

type Status = "notFound" | "notPossible" | "alreadyCancelled" | "confirmed";

/** Public cancellation ("Kündigungsbutton") reachable from settings. */
export function CancellationSettingsView({ onBack }: { onBack: () => void }) {
  const { t } = useI18n();
  const [form, setForm] = useState({
    name: "", email: "", contractNumber: "", subscriptionId: "", serviceName: "", customerNumber: "",
    billingZip: "", billingCity: "", addressZip: "", addressStreet: "", fullName: "", dateOfBirth: "",
    identVerified: "" as "" | "true" | "false", accountType: "" as "" | "PRIVATE" | "BUSINESS",
  });
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<Status | null>(null);

  const set = (key: keyof typeof form, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  const submit = async () => {
    setSubmitting(true);
    setStatus(null);
    try {
      const body: Record<string, unknown> = { ...form };
      if (form.identVerified) body.identVerified = form.identVerified === "true";
      Object.keys(body).forEach((k) => body[k] === "" && delete body[k]);
      const res = await api.publicApi.cancellation(body);
      setStatus(res.status);
    } catch {
      setStatus("notFound");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="safe-x flex items-center gap-2">
        <Button variant="ghost" size="icon" aria-label={t("back")} onClick={onBack} className="h-10 w-10 rounded-full">
          <ChevronLeft className="size-5" />
        </Button>
        <h1 className="text-base font-semibold text-(--text-primary)">{t("cancellationTitle")}</h1>
      </div>

      <p className="text-sm text-(--text-muted)">{t("cancellationHint")}</p>

      {status ? <div className="glass rounded-xl p-3 text-sm text-(--text-primary)">{t(`cancellationStatus_${status}` as never)}</div> : null}

      <div className="space-y-2">
        <Input placeholder="Name" value={form.name} onChange={(e) => set("name", e.target.value)} className="min-h-11" />
        <Input placeholder="E-Mail" value={form.email} onChange={(e) => set("email", e.target.value)} className="min-h-11" />
        <Input placeholder={t("cancellationContractNumber")} value={form.contractNumber} onChange={(e) => set("contractNumber", e.target.value)} className="min-h-11" />
        <Input placeholder={t("cancellationSubscriptionId")} value={form.subscriptionId} onChange={(e) => set("subscriptionId", e.target.value)} className="min-h-11" />
        <Input placeholder={t("cancellationServiceName")} value={form.serviceName} onChange={(e) => set("serviceName", e.target.value)} className="min-h-11" />
        <Input placeholder={t("cancellationCustomerNumber")} value={form.customerNumber} onChange={(e) => set("customerNumber", e.target.value)} className="min-h-11" />
        <Input placeholder={t("cancellationBillingZip")} value={form.billingZip} onChange={(e) => set("billingZip", e.target.value)} className="min-h-11" />
        <Input placeholder={t("cancellationBillingCity")} value={form.billingCity} onChange={(e) => set("billingCity", e.target.value)} className="min-h-11" />
        <Input placeholder={t("cancellationAddressZip")} value={form.addressZip} onChange={(e) => set("addressZip", e.target.value)} className="min-h-11" />
        <Input placeholder={t("cancellationAddressStreet")} value={form.addressStreet} onChange={(e) => set("addressStreet", e.target.value)} className="min-h-11" />
        <Input placeholder={t("cancellationFullName")} value={form.fullName} onChange={(e) => set("fullName", e.target.value)} className="min-h-11" />
        <Input type="date" value={form.dateOfBirth} onChange={(e) => set("dateOfBirth", e.target.value)} className="min-h-11" />
        <select value={form.identVerified} onChange={(e) => set("identVerified", e.target.value)} className="min-h-11 w-full rounded-(--radius-control) border border-border bg-(--bg-elevated) px-3 text-sm">
          <option value="">{t("cancellationIdent")}</option>
          <option value="true">{t("yes")}</option>
          <option value="false">{t("no")}</option>
        </select>
        <select value={form.accountType} onChange={(e) => set("accountType", e.target.value)} className="min-h-11 w-full rounded-(--radius-control) border border-border bg-(--bg-elevated) px-3 text-sm">
          <option value="">Kontotyp</option>
          <option value="PRIVATE">{t("accountTypePrivate")}</option>
          <option value="BUSINESS">{t("accountTypeBusiness")}</option>
        </select>
      </div>

      <Button type="button" onClick={() => void submit()} disabled={submitting || !form.name || !form.email} className="btn-primary min-h-11 w-full rounded-xl">
        {submitting ? <Loader2 className="size-4 animate-spin" /> : t("cancellationSubmit")}
      </Button>
    </div>
  );
}
