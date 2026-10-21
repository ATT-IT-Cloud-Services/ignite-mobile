import { ResourceClient } from "../resource-client.js";

/** Generated from apps/backend/app/openapi.generated.json. */
export class WebhooksResource extends ResourceClient {
  /**
   * @generated POST /webhooks/stripe
   */
  stripe(body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/webhooks/stripe`, body);
  }
}
