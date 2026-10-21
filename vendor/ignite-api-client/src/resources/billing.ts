import { ResourceClient } from "../resource-client.js";
import type { QueryParams } from "../types.js";
import type {
  InvoiceDetailResponse,
  InvoiceListResponse,
  InvoicePayBody,
  InvoicePayResult,
  NetPointsPreviewResponse,
  PaymentMethodsResult,
  SubscriptionsResponse,
} from "../schemas/invoice.js";
import type { SuccessResponse } from "../schemas/common.js";

export type InvoiceListFilters = {
  status?: string;
  serviceId?: string;
  limit?: number;
  offset?: number;
};

export class BillingResource extends ResourceClient {
  /**
   * List invoices with optional filters.
   * @throws {import("../errors.js").ApiError} `unauthenticated`
   */
  invoices(limitOrFilters: number | InvoiceListFilters = 50) {
    const query: QueryParams =
      typeof limitOrFilters === "number"
        ? { limit: limitOrFilters }
        : {
            limit: limitOrFilters.limit ?? 50,
            offset: limitOrFilters.offset,
            status: limitOrFilters.status,
            serviceId: limitOrFilters.serviceId,
          };
    return this.get<InvoiceListResponse>("/invoices", query);
  }

  /**
   * Get a single invoice by ID.
   * @throws {import("../errors.js").ApiError} `invoiceNotFound`, `unauthenticated`
   */
  invoice(id: string) {
    return this.get<InvoiceDetailResponse>(`/invoices/${id}`);
  }

  /**
   * Pay an open invoice.
   * @throws {import("../errors.js").ApiError} `invoiceNotFound`, `insufficientBalance`, `invalidPaymentMethod`, `clientPlatformNotAllowed`
   */
  payInvoice(id: string, body: InvoicePayBody) {
    return this.post<InvoicePayResult>(`/invoices/${id}/pay`, body);
  }

  /**
   * Preview net points redemption for an order total.
   * @throws {import("../errors.js").ApiError} `unauthenticated`, `invalidAmount`
   */
  netPointsPreview(orderTotal: number) {
    return this.post<NetPointsPreviewResponse>("/netpoints/preview", { orderTotal });
  }

  /**
   * List active subscriptions.
   * @throws {import("../errors.js").ApiError} `unauthenticated`
   */
  subscriptions() {
    return this.get<SubscriptionsResponse>("/user/subscriptions");
  }

  /**
   * List saved payment methods.
   * @throws {import("../errors.js").ApiError} `unauthenticated`
   */
  paymentMethods() {
    return this.get<PaymentMethodsResult>("/account/payment-methods");
  }

  /**
   * Start adding a new payment method (returns checkout URL).
   * @throws {import("../errors.js").ApiError} `unauthenticated`, `clientPlatformNotAllowed`
   */
  addPaymentMethod() {
    return this.post<SuccessResponse & { checkoutUrl?: string }>("/account/payment-methods");
  }

  /**
   * Set the default payment method.
   * @throws {import("../errors.js").ApiError} `unauthenticated`, `invalidRequest`
   */
  setDefaultPaymentMethod(mandateId: string) {
    return this.patch<SuccessResponse>("/account/payment-methods", { mandateId });
  }

  /**
   * Update a payment method label.
   * @throws {import("../errors.js").ApiError} `unauthenticated`, `invalidRequest`
   */
  updatePaymentMethodLabel(mandateId: string, userLabel: string, setDefault = false) {
    return this.patch<SuccessResponse>("/account/payment-methods", {
      mandateId,
      userLabel,
      setDefault,
    });
  }

  /**
   * Remove a saved payment method.
   * @throws {import("../errors.js").ApiError} `unauthenticated`, `invalidRequest`
   */
  deletePaymentMethod(mandateId: string) {
    return this.del<SuccessResponse>(`/account/payment-methods/${encodeURIComponent(mandateId)}`);
  }

  // <generated-openapi>
  /**
   * @generated GET /account/company-transfer
   */
  companyTransfer(query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/account/company-transfer`, query);
  }

  /**
   * @generated POST /account/company-transfer
   */
  postCompanyTransfer(body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/account/company-transfer`, body);
  }

  /**
   * @generated GET /account/contract-partner
   */
  contractPartner(query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/account/contract-partner`, query);
  }

  /**
   * @generated GET /account/legal-documents
   */
  legalDocuments(query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/account/legal-documents`, query);
  }

  /**
   * @generated GET /account/tenant-transfer
   */
  tenantTransfer(query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/account/tenant-transfer`, query);
  }

  /**
   * @generated POST /account/tenant-transfer
   */
  postTenantTransfer(body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/account/tenant-transfer`, body);
  }

  /**
   * @generated POST /invoices
   */
  create(body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/invoices`, body);
  }

  /**
   * @generated GET /invoices/[id]/credit-note-document
   */
  creditNoteDocument(id: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/invoices/${encodeURIComponent(id)}/credit-note-document`, query);
  }

  /**
   * @generated POST /invoices/[id]/dispute
   */
  dispute(id: string, body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/invoices/${encodeURIComponent(id)}/dispute`, body);
  }

  /**
   * @generated GET /invoices/[id]/document
   */
  document(id: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/invoices/${encodeURIComponent(id)}/document`, query);
  }

  /**
   * @generated GET /invoices/[id]/documents
   */
  documents(id: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/invoices/${encodeURIComponent(id)}/documents`, query);
  }

  /**
   * @generated GET /invoices/[id]/dunning-document
   */
  dunningDocument(id: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/invoices/${encodeURIComponent(id)}/dunning-document`, query);
  }

  /**
   * @generated POST /invoices/[id]/pay/cancel
   */
  payCancel(id: string, body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/invoices/${encodeURIComponent(id)}/pay/cancel`, body);
  }

  /**
   * @generated POST /invoices/[id]/withdraw
   */
  withdraw(id: string, body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/invoices/${encodeURIComponent(id)}/withdraw`, body);
  }

  /**
   * @generated GET /invoices/download-all
   */
  downloadAll(query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/invoices/download-all`, query);
  }

  /**
   * @generated GET /netpoints
   */
  list(query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/netpoints`, query);
  }
  // </generated-openapi>
}
