import { ResourceClient } from "./resource-client";
import type { IgniteClient } from "@ignite/api-client";

export type AutoTopupConfig = {
  id: string;
  isActive: boolean;
  amount: number;
  dayOfMonth: number;
  lastChargedAt?: string | null;
  nextChargeAt?: string | null;
  mandateVerifiedAt?: string | null;
  autoRedeemVoucher?: boolean;
  createdAt?: string | null;
};

export type AutoTopupCreateBody = {
  amount: number;
  dayOfMonth: number;
  autoRedeemVoucher?: boolean;
  acceptTerms?: boolean;
  acceptPrivacy?: boolean;
  acceptExpiry?: boolean;
};

export type WalletVoucher = {
  id: string;
  paidAmount: number;
  faceValue: number;
  redeemCreditAmount: number;
  status: string;
  issuedAt?: string | null;
  expiresAt?: string | null;
  redeemedAt?: string | null;
  source?: string | null;
  promoPercent?: number | null;
  invoiceId?: string | null;
  paymentId?: string | null;
  canWithdraw?: boolean;
  withdrawUntil?: string | null;
};

export type WalletBonusEvent = {
  name: string;
  percentExtra: number;
  applyAt: string;
};

export class WalletResource extends ResourceClient {
  constructor(client: IgniteClient) {
    super(client);
  }

  bonusEvent() {
    return this.client.wallet.bonusEvent() as Promise<{ success: boolean; event: WalletBonusEvent | null }>;
  }

  autoTopupList() {
    return this.client.wallet.autoTopupList() as Promise<{ success: boolean; configs: AutoTopupConfig[] }>;
  }

  autoTopupCreate(body: AutoTopupCreateBody) {
    return this.client.wallet.autoTopupCreate(body) as Promise<{
      success: boolean;
      config?: AutoTopupConfig;
      verificationCheckoutUrl?: string;
      verificationRequired?: boolean;
      deferredFirstCharge?: boolean;
      firstChargeOn?: string;
    }>;
  }

  autoTopupUpdate(id: string, body: { isActive?: boolean; amount?: number }) {
    return this.client.wallet.autoTopupUpdate(id, body) as Promise<{
      success: boolean;
      config?: AutoTopupConfig;
    }>;
  }

  autoTopupDelete(id: string) {
    return this.client.wallet.autoTopupDelete(id) as Promise<{ success: boolean }>;
  }

  vouchers(limit = 10, offset = 0) {
    return this.client.wallet.vouchers(limit, offset) as unknown as Promise<{
      success: boolean;
      vouchers: WalletVoucher[];
      total: number;
    }>;
  }

  redeemVoucher(code: string) {
    return this.client.wallet.redeemVoucher(code) as Promise<{
      success: boolean;
      creditAmount?: number;
      newBalance?: number;
      voucherId?: string;
    }>;
  }

  voucherCode(id: string) {
    return this.client.wallet.vouchersCode(id) as Promise<{ success: boolean; code?: string }>;
  }

  withdrawVoucher(id: string) {
    return this.client.wallet.vouchersWithdraw(id) as Promise<{
      success: boolean;
      refundedAmount?: number;
      mollieRefundId?: string;
    }>;
  }

  purchaseVoucherFromBalance(body: { amount: number; acceptTerms?: boolean; acceptPrivacy?: boolean; acceptExpiry?: boolean; acceptVoucherTerms?: boolean }) {
    return this.client.wallet.vouchersPurchaseFromBalance(body) as unknown as Promise<{ success: boolean; voucherId?: string; errorCode?: string }>;
  }

  purchaseVoucherWithMollie(body: { amount: number; acceptTerms?: boolean; acceptPrivacy?: boolean; acceptExpiry?: boolean; acceptVoucherTerms?: boolean }) {
    return this.client.wallet.vouchersPurchaseWithMollie(body) as unknown as Promise<{ success: boolean; checkoutUrl?: string; paymentId?: string; errorCode?: string }>;
  }

  purchaseVoucherWithMandate(body: { amount: number; acceptTerms?: boolean; acceptPrivacy?: boolean; acceptExpiry?: boolean; acceptVoucherTerms?: boolean }) {
    return this.client.wallet.vouchersPurchaseWithMandate(body) as unknown as Promise<{ success: boolean; checkoutUrl?: string; paymentId?: string; errorCode?: string }>;
  }

  voucherPurchaseStatus(query: { paymentId?: string; voucherId?: string }) {
    return this.client.wallet.vouchersPurchaseStatus(query) as unknown as Promise<{ success: boolean; status?: string; voucherId?: string }>;
  }

  /** GET /wallet/payout-request — Auszahlungs-Option (Policy) */
  payoutPolicy() {
    return this.client.wallet.payoutRequest() as unknown as Promise<{ success: boolean; policy: { enabled: boolean; minAmount: number } }>;
  }

  /** POST /wallet/payout-request — SEPA-Auszahlung des Guthabens beantragen */
  requestPayout(iban: string) {
    return this.client.wallet.postPayoutRequest({ iban }) as unknown as Promise<{ success: boolean; request?: { id: string; amount: number; status: string }; errorCode?: string }>;
  }
}
