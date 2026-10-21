import { ResourceClient } from "../resource-client.js";
import type { QueryParams } from "../types.js";

/** Generated from apps/backend/app/openapi.generated.json. */
export class ByoasResource extends ResourceClient {
  /**
   * @generated POST /byoas/[id]/legal
   */
  legal(id: string, body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/byoas/${encodeURIComponent(id)}/legal`, body);
  }

  /**
   * @generated GET /byoas/[id]/networks
   */
  networks(id: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/byoas/${encodeURIComponent(id)}/networks`, query);
  }

  /**
   * @generated POST /byoas/[id]/networks
   */
  postNetworks(id: string, body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/byoas/${encodeURIComponent(id)}/networks`, body);
  }

  /**
   * @generated POST /byoas/apply
   */
  apply(body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/byoas/apply`, body);
  }

  /**
   * @generated GET /byoas/status
   */
  status(query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/byoas/status`, query);
  }
}
