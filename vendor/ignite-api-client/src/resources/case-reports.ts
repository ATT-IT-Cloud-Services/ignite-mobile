import { ResourceClient } from "../resource-client.js";
import type { QueryParams } from "../types.js";

/** Generated from apps/backend/app/openapi.generated.json. */
export class CaseReportsResource extends ResourceClient {
  /**
   * @generated POST /case-reports/damage
   */
  damage(body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/case-reports/damage`, body);
  }

  /**
   * @generated GET /case-reports/damage/bootstrap
   */
  damageBootstrap(query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/case-reports/damage/bootstrap`, query);
  }
}
