import { ResourceClient } from "../resource-client.js";
import type { QueryParams } from "../types.js";

/** Generated from apps/backend/app/openapi.generated.json. */
export class StorageResource extends ResourceClient {
  /**
   * @generated GET /storage
   */
  list(query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/storage`, query);
  }

  /**
   * @generated POST /storage
   */
  create(body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/storage`, body);
  }

  /**
   * @generated DELETE /storage/[id]
   */
  remove(id: string, query?: QueryParams, body?: Record<string, unknown>) {
    return this.del<Record<string, unknown>>(`/storage/${encodeURIComponent(id)}`, query, body);
  }

  /**
   * @generated GET /storage/[id]
   */
  find(id: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/storage/${encodeURIComponent(id)}`, query);
  }

  /**
   * @generated PATCH /storage/[id]
   */
  update(id: string, body?: Record<string, unknown>) {
    return this.patch<Record<string, unknown>>(`/storage/${encodeURIComponent(id)}`, body);
  }

  /**
   * @generated POST /storage/[id]/cancel
   */
  cancel(id: string, body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/storage/${encodeURIComponent(id)}/cancel`, body);
  }

  /**
   * @generated POST /storage/add-to-cart
   */
  addToCart(body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/storage/add-to-cart`, body);
  }

  /**
   * @generated GET /storage/config
   */
  config(query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/storage/config`, query);
  }
}
