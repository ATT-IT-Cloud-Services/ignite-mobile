import { ResourceClient } from "../resource-client.js";
import type { QueryParams } from "../types.js";

/** Generated from apps/backend/app/openapi.generated.json. */
export class PublicApiResource extends ResourceClient {
  /**
   * @generated POST /public/abuse
   */
  abuse(body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/public/abuse`, body);
  }

  /**
   * @generated GET /public/appearance
   */
  appearance(query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/public/appearance`, query);
  }

  /**
   * @generated GET /public/appearance/assets/[key]
   */
  appearanceAssets(key: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/public/appearance/assets/${encodeURIComponent(key)}`, query);
  }

  /**
   * @generated GET /public/blog
   */
  blog(query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/public/blog`, query);
  }

  /**
   * @generated GET /public/blog/[slug]
   */
  getBlog(slug: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/public/blog/${encodeURIComponent(slug)}`, query);
  }

  /**
   * @generated POST /public/cancellation
   */
  cancellation(body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/public/cancellation`, body);
  }

  /**
   * @generated POST /public/case-objection
   */
  caseObjection(body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/public/case-objection`, body);
  }

  /**
   * @generated POST /public/case-report
   */
  caseReport(body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/public/case-report`, body);
  }

  /**
   * @generated GET /public/case-status
   */
  caseStatus(query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/public/case-status`, query);
  }

  /**
   * @generated POST /public/domains/starting-price
   */
  domainsStartingPrice(body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/public/domains/starting-price`, body);
  }

  /**
   * @generated GET /public/footer-proxy/status-availability
   */
  footerProxyStatusAvailability(query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/public/footer-proxy/status-availability`, query);
  }

  /**
   * @generated GET /public/footer-proxy/status-pulse
   */
  footerProxyStatusPulse(query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/public/footer-proxy/status-pulse`, query);
  }

  /**
   * @generated GET /public/legal/[doc]
   */
  legal(doc: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/public/legal/${encodeURIComponent(doc)}`, query);
  }

  /**
   * @generated GET /public/navigation
   */
  navigation(query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/public/navigation`, query);
  }

  /**
   * @generated GET /public/providers/[id]/catalog
   */
  providersCatalog(id: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/public/providers/${encodeURIComponent(id)}/catalog`, query);
  }

  /**
   * @generated GET /public/registration-status
   */
  registrationStatus(query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/public/registration-status`, query);
  }

  /**
   * @generated POST /public/report-minor
   */
  reportMinor(body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/public/report-minor`, body);
  }

  /**
   * @generated GET /public/reviews
   */
  reviews(query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/public/reviews`, query);
  }

  /**
   * @generated GET /public/setup
   */
  setup(query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/public/setup`, query);
  }

  /**
   * @generated PATCH /public/setup
   */
  updateSetup(body?: Record<string, unknown>) {
    return this.patch<Record<string, unknown>>(`/public/setup`, body);
  }

  /**
   * @generated GET /public/setup-status
   */
  setupStatus(query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/public/setup-status`, query);
  }

  /**
   * @generated GET /public/setup/admin
   */
  setupAdmin(query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/public/setup/admin`, query);
  }

  /**
   * @generated POST /public/setup/admin
   */
  postSetupAdmin(body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/public/setup/admin`, body);
  }

  /**
   * @generated POST /public/setup/assets
   */
  setupAssets(body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/public/setup/assets`, body);
  }

  /**
   * @generated POST /public/setup/complete
   */
  setupComplete(body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/public/setup/complete`, body);
  }

  /**
   * @generated GET /public/setup/legal
   */
  setupLegal(query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/public/setup/legal`, query);
  }

  /**
   * @generated PUT /public/setup/legal
   */
  replaceSetupLegal(body?: Record<string, unknown>) {
    return this.put<Record<string, unknown>>(`/public/setup/legal`, body);
  }

  /**
   * @generated GET /public/support-hours
   */
  supportHours(query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/public/support-hours`, query);
  }

  /**
   * @generated GET /public/support-stats
   */
  supportStats(query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/public/support-stats`, query);
  }

  /**
   * @generated POST /public/takedown
   */
  takedown(body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/public/takedown`, body);
  }

  /**
   * @generated GET /public/tenant
   */
  tenant(query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/public/tenant`, query);
  }
}
