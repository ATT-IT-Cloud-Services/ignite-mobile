import { ResourceClient } from "../resource-client.js";
import type { QueryParams } from "../types.js";

/** Generated from apps/backend/app/openapi.generated.json. */
export class McpResource extends ResourceClient {
  /**
   * @generated DELETE /mcp
   */
  remove(query?: QueryParams, body?: Record<string, unknown>) {
    return this.del<Record<string, unknown>>(`/mcp`, query, body);
  }

  /**
   * @generated GET /mcp
   */
  list(query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/mcp`, query);
  }

  /**
   * @generated POST /mcp
   */
  create(body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/mcp`, body);
  }
}
