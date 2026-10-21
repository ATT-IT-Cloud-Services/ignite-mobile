import { ResourceClient } from "../resource-client.js";
import type { QueryParams } from "../types.js";

/** Generated from apps/backend/app/openapi.generated.json. */
export class EventsResource extends ResourceClient {
  /**
   * @generated GET /events
   */
  list(query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/events`, query);
  }

  /**
   * @generated POST /events/collect
   */
  collect(body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/events/collect`, body);
  }
}
