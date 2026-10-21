import { computeContractMonthlyPrice } from "../../lib/product-pricing";
import { displayShopPrice } from "../../features/shop/shop-pricing";
import type { ShopBusinessPricing } from "../../lib/shop-catalog";

export type ContractTermOption = {
  termMonths: number;
  discountPercent: number;
};

type ContractBillingSectionProps = {
  billingMode: "PREPAID" | "CONTRACT";
  onBillingModeChange: (mode: "PREPAID" | "CONTRACT") => void;
  contractTermMonths: number;
  onContractTermMonthsChange: (months: number) => void;
  priceMonthly: number;
  billingModeAvailability: string;
  contractTerms: ContractTermOption[];
  earlyTerminationFeePercent: number;
  contractNoticeDays: number;
  contractEligibility?: { eligible: boolean; reason?: string };
  lang: string;
  isBusiness: boolean;
  businessPricing?: ShopBusinessPricing | null;
  t: (key: keyof import("../../i18n/en").Dict) => string;
};

export function ContractBillingSection({
  billingMode,
  onBillingModeChange,
  contractTermMonths,
  onContractTermMonthsChange,
  priceMonthly,
  billingModeAvailability,
  contractTerms,
  earlyTerminationFeePercent,
  contractNoticeDays,
  contractEligibility,
  lang,
  isBusiness,
  businessPricing,
  t,
}: ContractBillingSectionProps) {
  const availability = (billingModeAvailability || "PREPAID").toUpperCase();
  const showPrepaid = availability === "PREPAID" || availability === "BOTH";
  const showContract = availability === "CONTRACT" || availability === "BOTH";
  const canSelectContract =
    showContract && contractTerms.length > 0 && contractEligibility?.eligible === true;
  const needsKyc = contractEligibility?.reason === "kyc_required";
  const under18 =
    contractEligibility?.reason === "under_18" || contractEligibility?.reason === "missing_dob";
  const adminDisabled = contractEligibility?.reason === "admin_disabled";

  const selectedTerm =
    contractTerms.find((term) => term.termMonths === contractTermMonths) ?? contractTerms[0];
  const discount = selectedTerm?.discountPercent ?? 0;
  const monthlyPrice = computeContractMonthlyPrice(priceMonthly, discount);

  if (!showPrepaid && !showContract) return null;

  return (
    <section className="glass space-y-4 rounded-2xl p-4">
      <h3 className="text-lg font-medium text-(--text-primary)">{t("productBillingModeTitle")}</h3>

      <div className="flex flex-wrap gap-2">
        {showPrepaid ? (
          <button
            type="button"
            className={`btn-secondary rounded-xl px-4 py-2 text-sm ${
              billingMode === "PREPAID" ? "ring-2 ring-primary" : ""
            }`}
            onClick={() => onBillingModeChange("PREPAID")}
          >
            {t("productBillingModePrepaid")}
          </button>
        ) : null}
        {showContract && !under18 && !adminDisabled ? (
          <button
            type="button"
            disabled={!canSelectContract && !needsKyc}
            className={`btn-secondary rounded-xl px-4 py-2 text-sm ${
              billingMode === "CONTRACT" ? "ring-2 ring-primary" : ""
            } ${!canSelectContract && !needsKyc ? "opacity-50" : ""}`}
            onClick={() => canSelectContract && onBillingModeChange("CONTRACT")}
          >
            {t("productBillingModeContract")}
          </button>
        ) : null}
      </div>

      {under18 && showContract ? (
        <p className="text-sm text-(--text-muted)">{t("productContractUnder18Hint")}</p>
      ) : null}

      {adminDisabled && showContract ? (
        <p className="text-sm text-(--text-muted)">{t("productContractAdminDisabledHint")}</p>
      ) : null}

      {needsKyc && showContract && !adminDisabled ? (
        <p className="text-sm text-(--text-secondary)">{t("productContractKycHint")}</p>
      ) : null}

      {billingMode === "CONTRACT" && canSelectContract ? (
        <div className="space-y-3 rounded-xl border border-border p-4">
          <p className="text-sm font-medium text-(--text-primary)">{t("productContractTermsTitle")}</p>

          <div className="grid gap-2 sm:grid-cols-2">
            {contractTerms.map((term) => (
              <button
                key={term.termMonths}
                type="button"
                className={`rounded-xl border px-3 py-2 text-left text-sm ${
                  contractTermMonths === term.termMonths
                    ? "border-primary bg-primary/10"
                    : "border-border"
                }`}
                onClick={() => onContractTermMonthsChange(term.termMonths)}
              >
                <span className="font-medium">
                  {term.termMonths} {t("productContractMonths")}
                </span>
                <span className="block text-(--text-muted)">
                  −{term.discountPercent}% ·{" "}
                  {displayShopPrice(
                    computeContractMonthlyPrice(priceMonthly, term.discountPercent),
                    lang,
                    isBusiness,
                    businessPricing,
                  )}
                  /{t("monthShort")}
                </span>
              </button>
            ))}
          </div>

          <div className="rounded-xl border border-border p-3">
            <p className="text-sm font-medium text-(--text-primary)">
              {t("productContractMonthlyPrice")}
            </p>
            <p className="text-2xl font-semibold tabular-nums text-(--brand-primary)">
              {displayShopPrice(monthlyPrice, lang, isBusiness, businessPricing)}
              <span className="text-sm font-normal text-(--text-muted)">/{t("monthShort")}</span>
            </p>
            <p className="mt-1 text-sm text-(--text-secondary)">
              {t("productContractMinimumTerm").replace(
                "{months}",
                String(selectedTerm?.termMonths ?? contractTermMonths),
              )}
            </p>
            <p className="mt-1 text-sm text-(--text-muted)">{t("productContractPostpaidHint")}</p>
          </div>

          <ul className="list-disc space-y-1 pl-5 text-sm text-(--text-muted)">
            <li>{t("productContractNoticeDays").replace("{days}", String(contractNoticeDays))}</li>
            <li>
              {t("productContractEarlyTerminationFee").replace(
                "{percent}",
                String(earlyTerminationFeePercent),
              )}
            </li>
            <li>{t("productContractNoDowngradeHint")}</li>
          </ul>
        </div>
      ) : null}
    </section>
  );
}
