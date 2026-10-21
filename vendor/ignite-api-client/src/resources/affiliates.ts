import { ResourceClient } from "../resource-client.js";
import type { QueryParams } from "../types.js";
import type {
  AffiliateCommissionsResponse,
  AffiliateMeResponse,
  PayoutRequestsResponse,
} from "../schemas/affiliate.js";

export class AffiliatesResource extends ResourceClient {
  /**
   * Get affiliate profile for the current user.
   * @throws {import("../errors.js").ApiError} `affiliateNotFound`, `unauthenticated`
   */
  me() {
    return this.get<AffiliateMeResponse>("/affiliates/me");
  }

  /**
   * List affiliate commissions.
   * @throws {import("../errors.js").ApiError} `affiliateNotFound`, `unauthenticated`
   */
  commissions(limit = 50) {
    return this.get<AffiliateCommissionsResponse>("/affiliates/me/commissions", { limit });
  }

  /**
   * List payout requests.
   * @throws {import("../errors.js").ApiError} `affiliateNotFound`, `unauthenticated`
   */
  payoutRequests(limit = 20, offset = 0) {
    return this.get<PayoutRequestsResponse>("/affiliates/me/payout-requests", { limit, offset });
  }

  /**
   * Get affiliate tax information.
   * @throws {import("../errors.js").ApiError} `affiliateNotFound`, `unauthenticated`
   */
  taxInfo() {
    return this.get<{ success: boolean; taxInfo: unknown | null; profile?: unknown }>(
      "/affiliates/me/tax-info",
    );
  }

  // <generated-openapi>
  /**
   * @generated POST /affiliates/me/convert-to-credit
   */
  meConvertToCredit(body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/affiliates/me/convert-to-credit`, body);
  }

  /**
   * @generated GET /affiliates/me/coupon-usage
   */
  meCouponUsage(query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/affiliates/me/coupon-usage`, query);
  }

  /**
   * @generated POST /affiliates/me/credit-note/[id]/confirm
   */
  meCreditNoteConfirm(id: string, body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/affiliates/me/credit-note/${encodeURIComponent(id)}/confirm`, body);
  }

  /**
   * @generated POST /affiliates/me/credit-note/preview
   */
  meCreditNotePreview(body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/affiliates/me/credit-note/preview`, body);
  }

  /**
   * @generated GET /affiliates/me/credit-notes
   */
  meCreditNotes(query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/affiliates/me/credit-notes`, query);
  }

  /**
   * @generated GET /affiliates/me/credit-notes/[id]/download
   */
  meCreditNotesDownload(id: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/affiliates/me/credit-notes/${encodeURIComponent(id)}/download`, query);
  }

  /**
   * @generated PATCH /affiliates/me/payout-method
   */
  updateMePayoutMethod(body?: Record<string, unknown>) {
    return this.patch<Record<string, unknown>>(`/affiliates/me/payout-method`, body);
  }

  /**
   * @generated POST /affiliates/me/payout-requests
   */
  mePayoutRequests(body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/affiliates/me/payout-requests`, body);
  }

  /**
   * @generated PUT /affiliates/me/tax-info
   */
  replaceMeTaxInfo(body?: Record<string, unknown>) {
    return this.put<Record<string, unknown>>(`/affiliates/me/tax-info`, body);
  }

  /**
   * @generated POST /affiliates/validate
   */
  validate(body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/affiliates/validate`, body);
  }
  // </generated-openapi>
}
