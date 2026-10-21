import { useEffect, useState } from "react";

import { useAuth } from "../AuthProvider";
import { useI18n } from "../../i18n";
import { api } from "../../lib/api";
import {
  TenantTransferConsentModal,
  type TransferOffer,
} from "./TenantTransferConsentModal";

function partnerName(
  partner: { name: string | null; legalName: string | null; brandName: string | null } | null | undefined,
): string {
  return partner?.legalName || partner?.name || partner?.brandName || "";
}

/**
 * Forced consent gate for the contract-takeover (tenant) and company-change
 * (same tenant) flows. Renders nothing unless the backend reports a PENDING
 * or DECLINED offer for this user. A tenant takeover wins over a company
 * change when both exist.
 */
export function TenantTransferConsentGate() {
  const { isAuthenticated, user } = useAuth();
  const { t } = useI18n();
  const [offer, setOffer] = useState<TransferOffer | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      setOffer(null);
      return;
    }

    let cancelled = false;
    void (async () => {
      try {
        const [tenantRes, companyRes] = await Promise.all([
          api.tenantTransfer.tenantStatus(),
          api.tenantTransfer.companyStatus(),
        ]);
        if (cancelled) return;

        let pending: TransferOffer | null = null;
        if (tenantRes.success && tenantRes.transfer) {
          const tr = tenantRes.transfer;
          if (tr.decisionStatus === "PENDING" || tr.decisionStatus === "DECLINED") {
            pending = {
              kind: "tenant",
              transferId: tr.transferId,
              deadlineAt: tr.deadlineAt,
              decisionStatus: tr.decisionStatus,
              fromName: partnerName(tr.fromTenant),
              toName: partnerName(tr.toTenant) || t("appName"),
            };
          }
        }
        if (!pending && companyRes.success && companyRes.transfer) {
          const tr = companyRes.transfer;
          if (tr.decisionStatus === "PENDING" || tr.decisionStatus === "DECLINED") {
            pending = {
              kind: "company",
              transferId: tr.transferId,
              deadlineAt: tr.deadlineAt,
              decisionStatus: tr.decisionStatus,
              fromName: partnerName(tr.fromCompany),
              toName: partnerName(tr.toCompany) || t("appName"),
            };
          }
        }
        setOffer(pending);
      } catch {
        if (!cancelled) setOffer(null);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, user?.id]);

  if (!offer) return null;

  return <TenantTransferConsentModal offer={offer} onClose={() => setOffer(null)} />;
}
