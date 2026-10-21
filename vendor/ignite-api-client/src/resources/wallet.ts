import { ResourceClient } from "../resource-client.js";
import type { QueryParams } from "../types.js";
import type {
  AutoTopupConfig,
  AutoTopupCreateBody,
  AutoTopupListResponse,
  VoucherListResponse,
} from "../schemas/wallet.js";
import type { SuccessResponse } from "../schemas/common.js";

export class WalletResource extends ResourceClient {
  /**
   * Check wallet bonus event eligibility.
   * @throws {import("../errors.js").ApiError} `unauthenticated`
   */
  bonusEvent() {
    return this.get<SuccessResponse>("/wallet/bonus-event");
  }

  /**
   * List auto top-up configurations.
   * @throws {import("../errors.js").ApiError} `unauthenticated`
   */
  autoTopupList() {
    return this.get<AutoTopupListResponse>("/balance/auto-topup");
  }

  /**
   * Create an auto top-up configuration.
   * @throws {import("../errors.js").ApiError} `anAutoTopUpForThisDayAlreadyExists`, `amountOutOfRange`, `unauthenticated`
   */
  autoTopupCreate(body: AutoTopupCreateBody) {
    return this.post<
      SuccessResponse & {
        config?: AutoTopupConfig;
        verificationCheckoutUrl?: string;
        verificationRequired?: boolean;
        deferredFirstCharge?: boolean;
        firstChargeOn?: string;
      }
    >("/balance/auto-topup", body);
  }

  /**
   * Update an auto top-up configuration.
   * @throws {import("../errors.js").ApiError} `activeAutoTopUpsMustBeRecreatedToChangeTheAmount`, `unauthenticated`
   */
  autoTopupUpdate(id: string, body: { isActive?: boolean; amount?: number }) {
    return this.patch<SuccessResponse & { config?: AutoTopupConfig }>(
      `/balance/auto-topup/${encodeURIComponent(id)}`,
      body,
    );
  }

  /**
   * Delete an auto top-up configuration.
   * @throws {import("../errors.js").ApiError} `unauthenticated`
   */
  autoTopupDelete(id: string) {
    return this.del<SuccessResponse>(`/balance/auto-topup/${encodeURIComponent(id)}`);
  }

  /**
   * List wallet vouchers.
   * @throws {import("../errors.js").ApiError} `unauthenticated`
   */
  vouchers(limit = 10, offset = 0) {
    return this.get<VoucherListResponse>("/wallet/vouchers", { limit, offset });
  }

  /**
   * Redeem a voucher code.
   * @throws {import("../errors.js").ApiError} `codeHasExpired`, `codeHasAlreadyBeenUsed`, `unauthenticated`
   */
  redeemVoucher(code: string) {
    return this.post<SuccessResponse & { amount?: number }>("/wallet/vouchers/redeem", { code });
  }

  // <generated-openapi>
  /**
   * @generated GET /wallet/payout-request
   */
  payoutRequest(query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/wallet/payout-request`, query);
  }

  /**
   * @generated POST /wallet/payout-request
   */
  postPayoutRequest(body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/wallet/payout-request`, body);
  }

  /**
   * @generated GET /wallet/vouchers/[id]/certificate.pdf
   */
  vouchersCertificatePdf(id: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/wallet/vouchers/${encodeURIComponent(id)}/certificate.pdf`, query);
  }

  /**
   * @generated GET /wallet/vouchers/[id]/code
   */
  vouchersCode(id: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/wallet/vouchers/${encodeURIComponent(id)}/code`, query);
  }

  /**
   * @generated POST /wallet/vouchers/[id]/withdraw
   */
  vouchersWithdraw(id: string, body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/wallet/vouchers/${encodeURIComponent(id)}/withdraw`, body);
  }

  /**
   * @generated POST /wallet/vouchers/purchase-from-balance
   */
  vouchersPurchaseFromBalance(body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/wallet/vouchers/purchase-from-balance`, body);
  }

  /**
   * @generated GET /wallet/vouchers/purchase-status
   */
  vouchersPurchaseStatus(query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/wallet/vouchers/purchase-status`, query);
  }

  /**
   * @generated POST /wallet/vouchers/purchase-with-mandate
   */
  vouchersPurchaseWithMandate(body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/wallet/vouchers/purchase-with-mandate`, body);
  }

  /**
   * @generated POST /wallet/vouchers/purchase-with-mollie
   */
  vouchersPurchaseWithMollie(body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/wallet/vouchers/purchase-with-mollie`, body);
  }
  // </generated-openapi>
}
