import { ResourceClient } from "../resource-client.js";
import type { QueryParams } from "../types.js";
import type { BusinessBillingResponse, BusinessFundStatusResponse } from "../schemas/business.js";
import type { SuccessResponse } from "../schemas/common.js";

export class BusinessResource extends ResourceClient {
  /**
   * Get business fund contract status.
   * @throws {import("../errors.js").ApiError} `unauthenticated`, `customerFeatureUnavailable`
   */
  fund() {
    return this.get<BusinessFundStatusResponse>("/business/fund");
  }

  /**
   * Request a new business fund contract.
   * @throws {import("../errors.js").ApiError} `amountAndBindingPeriodAreRequired`, `unauthenticated`, `clientPlatformNotAllowed`
   */
  requestFund(amount: number, bindingMonths: number) {
    return this.post<SuccessResponse & { contractId?: string }>("/business/fund", {
      amount,
      bindingMonths,
    });
  }

  /**
   * Accept a pending business fund offer.
   * @throws {import("../errors.js").ApiError} `insufficientBalance`, `clientPlatformNotAllowed`, `unauthenticated`
   */
  acceptFund(offerId: string, paymentMethod: "mollie" | "guthaben" = "mollie") {
    return this.post<SuccessResponse & { checkoutUrl?: string | null }>(
      `/business/fund/${encodeURIComponent(offerId)}/accept`,
      { paymentMethod },
    );
  }

  /**
   * Cancel an active business fund contract.
   * @throws {import("../errors.js").ApiError} `unauthenticated`, `clientPlatformNotAllowed`
   */
  cancelFund(contractId: string) {
    return this.post<SuccessResponse>(`/business/fund/${encodeURIComponent(contractId)}/cancel`, {});
  }

  /**
   * Get business billing configuration.
   * @throws {import("../errors.js").ApiError} `unauthenticated`, `customerFeatureUnavailable`
   */
  billing() {
    return this.get<BusinessBillingResponse>("/business/billing");
  }

  // <generated-openapi>
  /**
   * @generated DELETE /business/billing
   */
  deleteBilling(query?: QueryParams, body?: Record<string, unknown>) {
    return this.del<Record<string, unknown>>(`/business/billing`, query, body);
  }

  /**
   * @generated POST /business/billing
   */
  postBilling(body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/business/billing`, body);
  }

  /**
   * @generated GET /business/eligibility
   */
  eligibility(query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/business/eligibility`, query);
  }

  /**
   * @generated POST /business/fund/[id]/reject
   */
  fundReject(id: string, body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/business/fund/${encodeURIComponent(id)}/reject`, body);
  }

  /**
   * @generated GET /business/fund/special-termination
   */
  fundSpecialTermination(query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/business/fund/special-termination`, query);
  }

  /**
   * @generated POST /business/fund/special-termination
   */
  postFundSpecialTermination(body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/business/fund/special-termination`, body);
  }

  /**
   * @generated GET /business/verification
   */
  verification(query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/business/verification`, query);
  }

  /**
   * @generated POST /business/verification
   */
  postVerification(body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/business/verification`, body);
  }

  /**
   * @generated GET /business/verification/documents/[id]
   */
  verificationDocuments(id: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/business/verification/documents/${encodeURIComponent(id)}`, query);
  }
  // </generated-openapi>
}
