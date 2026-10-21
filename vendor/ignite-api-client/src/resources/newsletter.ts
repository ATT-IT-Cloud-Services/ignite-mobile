import { ResourceClient } from "../resource-client.js";
import type { QueryParams } from "../types.js";

/** Generated from apps/backend/app/openapi.generated.json. */
export class NewsletterResource extends ResourceClient {
  /**
   * @generated GET /newsletter/unsubscribe
   */
  unsubscribe(query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/newsletter/unsubscribe`, query);
  }

  /**
   * @generated GET /newsletter/verify
   */
  verify(query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/newsletter/verify`, query);
  }
}
