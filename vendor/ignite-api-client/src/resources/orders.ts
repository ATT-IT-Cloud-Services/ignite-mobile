import { ResourceClient } from "../resource-client.js";
import type { QueryParams } from "../types.js";

/** Generated from apps/backend/app/openapi.generated.json. */
export class OrdersResource extends ResourceClient {
  /**
   * @generated GET /orders
   */
  list(query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/orders`, query);
  }

  /**
   * @generated GET /orders/[id]
   */
  find(id: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/orders/${encodeURIComponent(id)}`, query);
  }

  /**
   * @generated POST /orders/[id]/choice
   */
  choice(id: string, body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/orders/${encodeURIComponent(id)}/choice`, body);
  }

  /**
   * @generated GET /orders/[id]/credit-notes/[creditNoteId]/document
   */
  creditNotesDocument(id: string, creditNoteId: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/orders/${encodeURIComponent(id)}/credit-notes/${encodeURIComponent(creditNoteId)}/document`, query);
  }
}
