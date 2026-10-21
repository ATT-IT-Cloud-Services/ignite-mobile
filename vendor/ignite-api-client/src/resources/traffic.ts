import { ResourceClient } from "../resource-client.js";

/** Generated from apps/backend/app/openapi.generated.json. */
export class TrafficResource extends ResourceClient {
  /**
   * @generated POST /traffic/pricing-preview
   */
  pricingPreview(body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/traffic/pricing-preview`, body);
  }
}
