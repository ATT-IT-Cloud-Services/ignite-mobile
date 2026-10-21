import { ResourceClient } from "../resource-client.js";
import type { QueryParams } from "../types.js";

/** Generated from apps/backend/app/openapi.generated.json. */
export class AddressesResource extends ResourceClient {
  /**
   * @generated DELETE /addresses
   */
  remove(query?: QueryParams, body?: Record<string, unknown>) {
    return this.del<Record<string, unknown>>(`/addresses`, query, body);
  }

  /**
   * @generated GET /addresses
   */
  list(query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/addresses`, query);
  }

  /**
   * @generated POST /addresses
   */
  create(body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/addresses`, body);
  }

  /**
   * @generated PUT /addresses
   */
  replace(body?: Record<string, unknown>) {
    return this.put<Record<string, unknown>>(`/addresses`, body);
  }
}
