import { ResourceClient } from "../resource-client.js";

/** Generated from apps/backend/app/openapi.generated.json. */
export class CouponsResource extends ResourceClient {
  /**
   * @generated POST /coupons/preview
   */
  preview(body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/coupons/preview`, body);
  }
}
