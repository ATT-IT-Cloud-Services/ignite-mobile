import { ResourceClient } from "../resource-client.js";
import type { QueryParams } from "../types.js";

/** Generated from apps/backend/app/openapi.generated.json. */
export class PreordersResource extends ResourceClient {
  /**
   * @generated GET /preorders
   */
  list(query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/preorders`, query);
  }

  /**
   * @generated POST /preorders/[id]/withdraw
   */
  withdraw(id: string, body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/preorders/${encodeURIComponent(id)}/withdraw`, body);
  }
}
