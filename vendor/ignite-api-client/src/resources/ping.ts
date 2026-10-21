import { ResourceClient } from "../resource-client.js";
import type { QueryParams } from "../types.js";

/** Generated from apps/backend/app/openapi.generated.json. */
export class PingResource extends ResourceClient {
  /**
   * @generated GET /ping
   */
  list(query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/ping`, query);
  }
}
