import { ResourceClient } from "../resource-client.js";
import type { QueryParams } from "../types.js";

/** Generated from apps/backend/app/openapi.generated.json. */
export class OpenApiResource extends ResourceClient {
  /**
   * @generated GET /openapi
   */
  list(query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/openapi`, query);
  }
}
