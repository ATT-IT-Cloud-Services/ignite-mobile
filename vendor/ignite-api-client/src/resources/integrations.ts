import { ResourceClient } from "../resource-client.js";
import type { QueryParams } from "../types.js";

/** Generated from apps/backend/app/openapi.generated.json. */
export class IntegrationsResource extends ResourceClient {
  /**
   * @generated DELETE /integrations/modrinth/account
   */
  deleteModrinthAccount(query?: QueryParams, body?: Record<string, unknown>) {
    return this.del<Record<string, unknown>>(`/integrations/modrinth/account`, query, body);
  }

  /**
   * @generated GET /integrations/modrinth/account
   */
  modrinthAccount(query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/integrations/modrinth/account`, query);
  }

  /**
   * @generated GET /integrations/modrinth/callback
   */
  modrinthCallback(query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/integrations/modrinth/callback`, query);
  }

  /**
   * @generated GET /integrations/modrinth/connect
   */
  modrinthConnect(query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/integrations/modrinth/connect`, query);
  }
}
