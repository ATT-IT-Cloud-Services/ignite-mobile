import { ResourceClient } from "./resource-client";
import type { IgniteClient } from "@ignite/api-client";

export type BusinessFundContract = {
  id: string;
  commitmentAmount: number;
  price: number;
  overchargeFeePercent: number;
  bindingMonths: number;
  bindingEndDate: string | null;
  cancelScheduledAt?: string | null;
  minTermEnded?: boolean;
  inUse?: boolean;
  status: string;
  currentUsage: number;
  currentOvercharge: number;
  lastResetAt: string | null;
};

export type BusinessFundOffer = {
  id: string;
  commitmentAmount: number;
  price: number;
  overchargeFeePercent: number;
  bindingMonths: number;
  adminNote: string | null;
  offeredAt: string;
};

export type BusinessFundStatusResponse = {
  success: boolean;
  contract: BusinessFundContract | null;
  pendingOffer: BusinessFundOffer | null;
};

export type BusinessVerificationRecord = {
  id: string;
  status: "NONE" | "PENDING" | "VERIFIED" | "REJECTED" | string;
  adminComment: string | null;
  verifiedAt?: string | null;
  rejectedAt?: string | null;
  createdAt?: string;
};

export type BusinessVerificationResponse = {
  success: boolean;
  verification: BusinessVerificationRecord | null;
};

export type BusinessEligibilityResponse = {
  success: boolean;
  eligible: boolean;
  verified: boolean;
  reason?: string;
  invoiceEnabled?: boolean;
  invoiceAndFundAllowed?: boolean;
  countryMatchesTaxRegion?: boolean;
  businessBillingOverride?: boolean;
};

export type BusinessBillingConfig = {
  invoiceEnabled?: boolean | number | string;
  hasActiveFund?: boolean | number | string;
  invoiceInUse?: boolean | number | string;
  fundInUse?: boolean | number | string;
  billingAnchorDay?: number | null;
  currentCycle?: { periodStart?: string | null; periodEnd?: string | null } | null;
  /** Open gross total (brutto). */
  openAmount?: number | null;
  /** Open net total (netto). */
  openNet?: number | null;
  /** Open gross total (brutto). */
  openGross?: number | null;
  nextInvoiceDate?: string | null;
};

export type BusinessBillingResponse = {
  success: boolean;
  config: BusinessBillingConfig | null;
};

export class BusinessResource extends ResourceClient {
  constructor(client: IgniteClient) {
    super(client);
  }

  eligibility() {
    return this.client.business.eligibility() as Promise<BusinessEligibilityResponse>;
  }

  verification() {
    return this.client.business.verification() as Promise<BusinessVerificationResponse>;
  }

  fund() {
    return this.client.business.fund() as Promise<BusinessFundStatusResponse>;
  }

  requestFund(amount: number, bindingMonths: number) {
    return this.client.business.requestFund(amount, bindingMonths) as Promise<{
      success: boolean;
      contractId?: string;
      error?: string;
    }>;
  }

  /** `offerId` is the pending offer id. `guthaben` pays the first amount from balance. */
  acceptFund(offerId: string, paymentMethod: "mollie" | "guthaben" = "mollie") {
    return this.client.business.acceptFund(offerId, paymentMethod) as Promise<{
      success: boolean;
      checkoutUrl?: string | null;
    }>;
  }

  cancelFund(contractId: string, action: "cancel" | "unschedule" = "cancel") {
    return this.client.business.cancelFund(contractId) as Promise<{
      success: boolean;
      scheduledFor?: string | null;
    }>;
  }

  billing() {
    return this.client.business.billing() as Promise<BusinessBillingResponse>;
  }

  enableInvoiceBilling(anchorDay: number) {
    return this.client.business.postBilling({ anchorDay }) as Promise<{ success: boolean; error?: string }>;
  }

  disableInvoiceBilling() {
    return this.client.business.deleteBilling() as Promise<{ success: boolean; error?: string }>;
  }

  rejectFund(offerId: string) {
    return this.client.business.fundReject(offerId, {}) as Promise<{ success: boolean; error?: string }>;
  }

  submitVerification(formData: FormData) {
    return this.client.business.postVerification(formData as unknown as Record<string, unknown>) as Promise<{ success: boolean }>;
  }
}
