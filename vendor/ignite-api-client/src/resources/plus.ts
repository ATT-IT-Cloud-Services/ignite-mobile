import { ResourceClient } from "../resource-client.js";
import type { QueryParams } from "../types.js";

/** Generated from apps/backend/app/openapi.generated.json. */
export class PlusResource extends ResourceClient {
  /**
   * @generated POST /plus/cancel
   */
  cancel(body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/plus/cancel`, body);
  }

  /**
   * @generated GET /plus/forecast
   */
  forecast(query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/plus/forecast`, query);
  }

  /**
   * @generated GET /plus/invoices
   */
  invoices(query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/plus/invoices`, query);
  }

  /**
   * @generated GET /plus/pooling
   */
  pooling(query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/plus/pooling`, query);
  }

  /**
   * @generated PUT /plus/pooling
   */
  replacePooling(body?: Record<string, unknown>) {
    return this.put<Record<string, unknown>>(`/plus/pooling`, body);
  }

  /**
   * @generated POST /plus/pricing-preview
   */
  pricingPreview(body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/plus/pricing-preview`, body);
  }

  /**
   * @generated POST /plus/reactivate
   */
  reactivate(body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/plus/reactivate`, body);
  }

  /**
   * @generated POST /plus/security-plus
   */
  securityPlus(body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/plus/security-plus`, body);
  }

  /**
   * @generated GET /plus/status
   */
  status(query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/plus/status`, query);
  }

  /**
   * @generated POST /plus/subscribe
   */
  subscribe(body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/plus/subscribe`, body);
  }

  /**
   * @generated GET /plus/wallet
   */
  wallet(query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/plus/wallet`, query);
  }

  /**
   * @generated POST /plus/wallet
   */
  postWallet(body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/plus/wallet`, body);
  }
}
