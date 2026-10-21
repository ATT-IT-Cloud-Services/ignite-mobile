import { ResourceClient } from "../resource-client.js";
import type { QueryParams } from "../types.js";

/** Generated from apps/backend/app/openapi.generated.json. */
export class HealthResource extends ResourceClient {
  /**
   * @generated GET /health
   */
  list(query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/health`, query);
  }
}
