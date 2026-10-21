import { useCallback, useEffect, useRef, useState } from "react";
import { CheckCircle2, FileDown, Loader2 } from "lucide-react";

import { useAuth } from "../AuthProvider";
import { ConfirmModal } from "../ui/ConfirmModal";
import { Button } from "../ui/button";
import { useToast } from "../Toast";
import { useI18n } from "../../i18n";
import { resolveApiError } from "../../api/resolve-error";
import { api } from "../../lib/api";
import type { UserAddress } from "../../api/settings";
import { resolveApiUrl, openExternalUrl } from "../../features/billing/lib";

/** Typed i18n key maps per offer kind (companyTransfer* vs tenantTransfer*). */
const TENANT_KEYS = {
  Title: "tenantTransferTitle",
  From: "tenantTransferFrom",
  To: "tenantTransferTo",
  Deadline: "tenantTransferDeadline",
  CoversAll: "tenantTransferCoversAll",
  SameTenantHint: "tenantTransferSameTenantHint",
  DeclineConsequence: "tenantTransferDeclineConsequence",
  DeclinedCanAccept: "tenantTransferDeclinedCanAccept",
  DeclinedAcceptConsequence: "tenantTransferDeclinedAcceptConsequence",
  NewContractSameTerms: "tenantTransferNewContractSameTerms",
  SpecialTermination: "tenantTransferSpecialTermination",
  WithdrawalCheckbox: "tenantTransferWithdrawalCheckbox",
  LegalDocsDownload: "tenantTransferLegalDocsDownload",
  NewAavDownload: "tenantTransferNewAavDownload",
  WelcomeTitle: "tenantTransferWelcomeTitle",
  WelcomeSub: "tenantTransferWelcomeSub",
  WelcomeDocsHint: "tenantTransferWelcomeDocsHint",
  Accept: "tenantTransferAccept",
  Decline: "tenantTransferDecline",
  DeclineConfirmTitle: "tenantTransferDeclineConfirmTitle",
  DeclineConfirmMessage: "tenantTransferDeclineConfirmMessage",
  DeclineConfirmCheckbox: "tenantTransferDeclineConfirmCheckbox",
  SignerName: "tenantTransferSignerName",
  SignerNamePlaceholder: "tenantTransferSignerNamePlaceholder",
  AddressLabel: "tenantTransferAddressLabel",
  NoAddressHint: "tenantTransferNoAddressHint",
  DeclineSuccess: "tenantTransferDeclineSuccess",
  Error: "tenantTransferError",
} as const;

const COMPANY_KEYS = {
  Title: "companyTransferTitle",
  From: "companyTransferFrom",
  To: "companyTransferTo",
  Deadline: "companyTransferDeadline",
  CoversAll: "companyTransferCoversAll",
  SameTenantHint: "companyTransferSameTenantHint",
  DeclineConsequence: "companyTransferDeclineConsequence",
  DeclinedCanAccept: "companyTransferDeclinedCanAccept",
  DeclinedAcceptConsequence: "companyTransferDeclinedAcceptConsequence",
  NewContractSameTerms: "companyTransferNewContractSameTerms",
  SpecialTermination: "companyTransferSpecialTermination",
  WithdrawalCheckbox: "companyTransferWithdrawalCheckbox",
  LegalDocsDownload: "companyTransferLegalDocsDownload",
  NewAavDownload: "companyTransferNewAavDownload",
  WelcomeTitle: "companyTransferWelcomeTitle",
  WelcomeSub: "companyTransferWelcomeSub",
  WelcomeDocsHint: "companyTransferWelcomeDocsHint",
  Accept: "companyTransferAccept",
  Decline: "companyTransferDecline",
  DeclineConfirmTitle: "companyTransferDeclineConfirmTitle",
  DeclineConfirmMessage: "companyTransferDeclineConfirmMessage",
  DeclineConfirmCheckbox: "companyTransferDeclineConfirmCheckbox",
  SignerName: "companyTransferSignerName",
  SignerNamePlaceholder: "companyTransferSignerNamePlaceholder",
  AddressLabel: "companyTransferAddressLabel",
  NoAddressHint: "companyTransferNoAddressHint",
  DeclineSuccess: "companyTransferDeclineSuccess",
  Error: "companyTransferError",
} as const satisfies Record<keyof typeof TENANT_KEYS, string>;

export type TransferOffer = {
  kind: "tenant" | "company";
  transferId: string;
  deadlineAt: string | null;
  decisionStatus: string;
  fromName: string;
  toName: string;
};

const WELCOME_SHOW_MS = 4200;

function formatDeadline(iso: string | null, lang: "de" | "en"): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString(lang === "de" ? "de-DE" : "en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

type TenantTransferConsentModalProps = {
  offer: TransferOffer;
  onClose: () => void;
};

/**
 * Consent modal for the tenant takeover and the company change. Layout:
 * documents (left/top) and decision with mandatory withdrawal checkbox.
 * After acceptance a short welcome banner is shown, then the modal closes.
 */
export function TenantTransferConsentModal({ offer, onClose }: TenantTransferConsentModalProps) {
  const { t, lang } = useI18n();
  const { show } = useToast();
  const { user } = useAuth();

  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [signerName, setSignerName] = useState("");
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [withdrawalConsent, setWithdrawalConsent] = useState(false);
  const [declineConfirmOpen, setDeclineConfirmOpen] = useState(false);
  const [declineConfirmed, setDeclineConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState<"accept" | "decline" | null>(null);
  const [accepted, setAccepted] = useState<{ toName: string; newDpaDocumentId: string | null } | null>(null);
  const [welcomeLeaving, setWelcomeLeaving] = useState(false);
  const welcomeTimer = useRef<number | null>(null);

  const isBusiness = user?.accountType === "BUSINESS";
  const hasAddress = addresses.length > 0;
  const acceptDisabled =
    submitting !== null ||
    !withdrawalConsent ||
    (isBusiness && (!signerName.trim() || !selectedAddressId));

  const k = useCallback(
    (suffix: keyof typeof TENANT_KEYS) => (offer.kind === "company" ? COMPANY_KEYS[suffix] : TENANT_KEYS[suffix]),
    [offer.kind],
  );

  useEffect(() => {
    if (!isBusiness) return;
    let cancelled = false;
    void api.settings
      .addresses()
      .then((data) => {
        if (cancelled) return;
        const list = Array.isArray(data.addresses) ? data.addresses : [];
        setAddresses(list);
        const def = list.find((entry) => entry.isDefault);
        setSelectedAddressId(def?.id || list[0]?.id || "");
      })
      .catch(() => {
        if (!cancelled) setAddresses([]);
      });
    return () => {
      cancelled = true;
    };
  }, [isBusiness]);

  useEffect(() => {
    if (!isBusiness) return;
    setSignerName(
      [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim(),
    );
  }, [isBusiness, user?.firstName, user?.lastName]);

  // Clear the welcome timer on unmount.
  useEffect(() => {
    return () => {
      if (welcomeTimer.current !== null) window.clearTimeout(welcomeTimer.current);
    };
  }, []);

  const openDocument = useCallback((path: string, title: string) => {
    const url = resolveApiUrl(path);
    if (!url) return;
    openExternalUrl(url, { title });
  }, []);

  const showError = useCallback(
    (data: unknown) => {
      show(resolveApiError(data, t, { fallbackKey: k("Error") }), "error");
    },
    [show, t, k],
  );

  const handleAccept = async () => {
    if (!offer) return;
    setSubmitting("accept");
    try {
      const data =
        offer.kind === "company"
          ? await api.tenantTransfer.companyDecide({
              transferId: offer.transferId,
              decision: "accept",
              signerName: isBusiness ? signerName.trim() : null,
              addressId: isBusiness ? selectedAddressId : null,
            })
          : await api.tenantTransfer.tenantDecide({
              transferId: offer.transferId,
              decision: "accept",
              signerName: isBusiness ? signerName.trim() : null,
              addressId: isBusiness ? selectedAddressId : null,
            });
      if (!data.success) {
        showError(data);
        return;
      }
      setAccepted({
        toName: offer.toName,
        newDpaDocumentId: typeof data.newDpaDocumentId === "string" ? data.newDpaDocumentId : null,
      });
      welcomeTimer.current = window.setTimeout(() => {
        setWelcomeLeaving(true);
        window.setTimeout(() => {
          setAccepted(null);
          onClose();
        }, 600);
      }, WELCOME_SHOW_MS);
    } catch {
      show(t(k("Error")), "error");
    } finally {
      setSubmitting(null);
    }
  };

  const handleDecline = async () => {
    if (!offer) return;
    setSubmitting("decline");
    try {
      const data =
        offer.kind === "company"
          ? await api.tenantTransfer.companyDecide({ transferId: offer.transferId, decision: "decline" })
          : await api.tenantTransfer.tenantDecide({ transferId: offer.transferId, decision: "decline" });
      if (!data.success) {
        showError(data);
        return;
      }
      show(t(k("DeclineSuccess")), "success");
      setDeclineConfirmOpen(false);
      onClose();
    } catch {
      show(t(k("Error")), "error");
    } finally {
      setSubmitting(null);
    }
  };

  // ── Welcome banner after acceptance ─────────────────────────────────────
  if (accepted) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div
          className={`glass w-full max-w-md rounded-2xl p-8 text-center shadow-2xl ${
            welcomeLeaving ? "animate-welcome-out" : "animate-welcome-in"
          }`}
        >
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-(--success)/15">
            <CheckCircle2 className="h-8 w-8 text-(--success)" aria-hidden />
          </div>
          <h2 className="mt-4 text-2xl font-semibold text-(--text-primary)">
            {t(k("WelcomeTitle"))} <span className="font-bold">{accepted.toName}</span>
          </h2>
          <p className="mt-2 text-sm text-(--text-secondary)">{t(k("WelcomeSub"))}</p>

          <p className="mt-6 text-xs font-medium uppercase tracking-wide text-(--text-muted)">
            {t(k("WelcomeDocsHint"))}
          </p>
          <div className="mt-3 space-y-2">
            {accepted.newDpaDocumentId && (
              <button
                type="button"
                onClick={() =>
                  openDocument(
                    `/api/user/dpa/documents/${accepted.newDpaDocumentId}`,
                    t(k("NewAavDownload")),
                  )
                }
                className="glass glass-hover flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm text-(--text-primary)"
              >
                <FileDown className="h-4 w-4" aria-hidden />
                {t(k("NewAavDownload"))}
              </button>
            )}
            <button
              type="button"
              onClick={() => openDocument("/api/account/legal-documents", t(k("LegalDocsDownload")))}
              className="glass glass-hover flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm text-(--text-primary)"
            >
              <FileDown className="h-4 w-4" aria-hidden />
              {t(k("LegalDocsDownload"))}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const deadlineLabel = formatDeadline(offer.deadlineAt, lang);
  const isDeclined = offer.decisionStatus === "DECLINED";
  const fromName = offer.fromName ?? "";
  const declineNeedsCheckbox = offer.kind !== "company";

  return (
    <>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className="glass max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl p-6 shadow-2xl sm:p-8">
          <h2 className="text-xl font-semibold text-(--text-primary)">{t(k("Title"))}</h2>
          {offer.kind === "company" && (
            <p className="mt-1 text-sm text-(--text-secondary)">{t(k("SameTenantHint"))}</p>
          )}
          {isDeclined && (
            <p className="mt-1 text-sm text-(--text-secondary)">{t(k("DeclinedCanAccept"))}</p>
          )}

          <div className="mt-5 space-y-4 text-sm text-(--text-secondary)">
            <div className="rounded-xl border border-(--border) bg-white/5 p-4">
              <div className="space-y-1.5">
                {offer.fromName && (
                  <div className="flex flex-wrap gap-x-2">
                    <span className="text-(--text-muted)">{t(k("From"))}:</span>
                    <span className="font-medium text-(--text-primary)">{offer.fromName}</span>
                  </div>
                )}
                <div className="flex flex-wrap gap-x-2">
                  <span className="text-(--text-muted)">{t(k("To"))}:</span>
                  <span className="font-medium text-(--text-primary)">{offer.toName}</span>
                </div>
                {offer.deadlineAt && (
                  <div className="flex flex-wrap gap-x-2">
                    <span className="text-(--text-muted)">{t(k("Deadline"))}:</span>
                    <span className="font-medium text-(--text-primary)">{deadlineLabel}</span>
                  </div>
                )}
              </div>
            </div>

            <p>{t(k("CoversAll"))}</p>

            <p className="text-xs text-(--text-muted)">
              {isDeclined ? t(k("DeclinedAcceptConsequence")) : t(k("DeclineConsequence"))}
            </p>

            <div className="rounded-xl border border-(--border) bg-white/5 p-3 text-xs text-(--text-muted)">
              {t(k("SpecialTermination"))}
            </div>

            <div className="rounded-xl border border-(--border) bg-white/5 p-3 text-xs text-(--text-muted)">
              {t(k("NewContractSameTerms"))}
            </div>

            {isBusiness && (
              <div className="space-y-3">
                <div>
                  <label className="mb-1.5 block text-sm text-(--text-muted)">{t(k("SignerName"))}</label>
                  <input
                    type="text"
                    value={signerName}
                    onChange={(event) => setSignerName(event.target.value)}
                    placeholder={t(k("SignerNamePlaceholder"))}
                    className="w-full rounded-xl border border-(--border) bg-white/5 px-4 py-2.5 text-sm text-(--text-primary) focus:border-(--primary) focus:outline-none focus:ring-1 focus:ring-(--primary)"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm text-(--text-muted)">{t(k("AddressLabel"))}</label>
                  {hasAddress ? (
                    <select
                      value={selectedAddressId}
                      onChange={(event) => setSelectedAddressId(event.target.value)}
                      className="w-full rounded-xl border border-(--border) bg-white/5 px-4 py-2.5 text-sm text-(--text-primary) focus:border-(--primary) focus:outline-none focus:ring-1 focus:ring-(--primary)"
                    >
                      {addresses.map((address) => (
                        <option key={address.id} value={address.id} className="bg-(--bg-base)">
                          {[
                            address.companyName,
                            [address.firstName, address.lastName].filter(Boolean).join(" "),
                            `${address.street}, ${address.zip} ${address.city}`,
                          ]
                            .filter(Boolean)
                            .join(" - ")}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-3 py-2.5 text-xs text-(--text-secondary)">
                      {t(k("NoAddressHint"))}
                    </div>
                  )}
                </div>
              </div>
            )}

            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-(--border) bg-white/5 p-3">
              <input
                type="checkbox"
                checked={withdrawalConsent}
                onChange={(event) => setWithdrawalConsent(event.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 accent-(--primary)"
              />
              <span className="text-xs text-(--text-secondary)">{t(k("WithdrawalCheckbox"))}</span>
            </label>

            <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row">
              {!isDeclined && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setDeclineConfirmed(false);
                    setDeclineConfirmOpen(true);
                  }}
                  disabled={submitting !== null}
                  className="w-full rounded-xl border-(--error)/40 text-(--error) sm:w-auto"
                >
                  {t(k("Decline"))}
                </Button>
              )}
              <Button
                onClick={() => void handleAccept()}
                disabled={acceptDisabled}
                className="w-full rounded-xl sm:w-auto"
              >
                {submitting === "accept" ? <Loader2 className="size-4 animate-spin" /> : t(k("Accept"))}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        open={declineConfirmOpen}
        title={t(k("DeclineConfirmTitle"))}
        description={
          <div className="space-y-3">
            <p>
              {fromName
                ? t(k("DeclineConfirmMessage")).replace("{from}", fromName)
                : t(k("DeclineConfirmMessage"))}
            </p>
            {declineNeedsCheckbox && (
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-(--border) bg-white/5 p-3">
                <input
                  type="checkbox"
                  checked={declineConfirmed}
                  onChange={(event) => setDeclineConfirmed(event.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-(--error)"
                />
                <span className="text-xs text-(--text-secondary)">
                  {fromName
                    ? t(k("DeclineConfirmCheckbox")).replace("{from}", fromName)
                    : t(k("DeclineConfirmCheckbox"))}
                </span>
              </label>
            )}
          </div>
        }
        confirmLabel={t(k("Decline"))}
        cancelLabel={t("cancel")}
        onConfirm={() => void handleDecline()}
        onCancel={() => setDeclineConfirmOpen(false)}
        isLoading={submitting === "decline"}
        destructive
        confirmDisabled={declineNeedsCheckbox && !declineConfirmed}
      />
    </>
  );
}
