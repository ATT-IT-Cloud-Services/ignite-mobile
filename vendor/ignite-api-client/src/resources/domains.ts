import { ResourceClient } from "../resource-client.js";
import type { QueryParams } from "../types.js";
import type { DnsRecordListResponse, DomainListResponse } from "../schemas/domain.js";
import type { SuccessResponse } from "../schemas/common.js";

export class DomainsResource extends ResourceClient {
  /**
   * List registered domains.
   * @throws {import("../errors.js").ApiError} `unauthenticated`
   */
  list() {
    return this.get<DomainListResponse>("/domains");
  }

  /**
   * Add a domain to the account.
   * @throws {import("../errors.js").ApiError} `domainCurrentlyUnavailable`, `unauthenticated`
   */
  add(domain: string) {
    return this.post<SuccessResponse>("/domains/add", { domain });
  }

  /**
   * List DNS records for a domain.
   * @throws {import("../errors.js").ApiError} `unauthenticated`, `accessDenied`
   */
  records(domainId: string) {
    return this.get<DnsRecordListResponse>(`/domains/${domainId}/records`);
  }

  /**
   * Create a DNS record.
   * @throws {import("../errors.js").ApiError} `invalidRequest`, `unauthenticated`
   */
  createRecord(domainId: string, body: Record<string, unknown>) {
    return this.post<SuccessResponse>(`/domains/${domainId}/records`, body);
  }

  /**
   * Delete a DNS record.
   * @throws {import("../errors.js").ApiError} `unauthenticated`, `accessDenied`
   */
  deleteRecord(domainId: string, recordId: string) {
    return this.del<SuccessResponse>(`/domains/${domainId}/records/${recordId}`);
  }

  // <generated-openapi>
  /**
   * @generated DELETE /domains/[domainId]/delete
   */
  deleteDelete(domainId: string, query?: QueryParams, body?: Record<string, unknown>) {
    return this.del<Record<string, unknown>>(`/domains/${encodeURIComponent(domainId)}/delete`, query, body);
  }

  /**
   * @generated GET /domains/[domainId]/export
   */
  export(domainId: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/domains/${encodeURIComponent(domainId)}/export`, query);
  }

  /**
   * @generated POST /domains/[domainId]/import/text
   */
  importText(domainId: string, body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/domains/${encodeURIComponent(domainId)}/import/text`, body);
  }

  /**
   * @generated PATCH /domains/[domainId]/records/[recordId]
   */
  updateRecords(domainId: string, recordId: string, body?: Record<string, unknown>) {
    return this.patch<Record<string, unknown>>(`/domains/${encodeURIComponent(domainId)}/records/${encodeURIComponent(recordId)}`, body);
  }

  /**
   * @generated GET /domains/nameservers
   */
  nameservers(query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/domains/nameservers`, query);
  }

  /**
   * @generated POST /domains/order
   */
  order(body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/domains/order`, body);
  }

  /**
   * @generated PATCH /domains/order/[id]
   */
  updateOrder(id: string, body?: Record<string, unknown>) {
    return this.patch<Record<string, unknown>>(`/domains/order/${encodeURIComponent(id)}`, body);
  }

  /**
   * @generated POST /domains/quote
   */
  quote(body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/domains/quote`, body);
  }

  /**
   * @generated GET /domains/registrations
   */
  registrations(query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/domains/registrations`, query);
  }

  /**
   * @generated GET /domains/registrations/[id]
   */
  getRegistrations(id: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/domains/registrations/${encodeURIComponent(id)}`, query);
  }

  /**
   * @generated POST /domains/registrations/[id]/actions
   */
  registrationsActions(id: string, body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/domains/registrations/${encodeURIComponent(id)}/actions`, body);
  }

  /**
   * @generated GET /domains/registrations/by-service/[serviceId]
   */
  registrationsByService(serviceId: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/domains/registrations/by-service/${encodeURIComponent(serviceId)}`, query);
  }

  /**
   * @generated POST /domains/suggest
   */
  suggest(body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/domains/suggest`, body);
  }

  /**
   * @generated POST /domains/tld-prices
   */
  tldPrices(body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/domains/tld-prices`, body);
  }

  /**
   * @generated POST /domains/transfer-quote
   */
  transferQuote(body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/domains/transfer-quote`, body);
  }

  /**
   * @generated GET /domains/whois
   */
  whois(query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/domains/whois`, query);
  }
  // </generated-openapi>
}
