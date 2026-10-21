import { ResourceClient } from "../resource-client.js";
import type { QueryParams } from "../types.js";

/** Generated from apps/backend/app/openapi.generated.json. */
export class PublicSettingsResource extends ResourceClient {
  /**
   * @generated GET /public-settings
   */
  list(query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/public-settings`, query);
  }
}
