import { ResourceClient } from "../resource-client.js";
import type { QueryParams } from "../types.js";

/** Generated from apps/backend/app/openapi.generated.json. */
export class PermissionsResource extends ResourceClient {
  /**
   * @generated DELETE /permissions
   */
  remove(query?: QueryParams, body?: Record<string, unknown>) {
    return this.del<Record<string, unknown>>(`/permissions`, query, body);
  }

  /**
   * @generated GET /permissions
   */
  list(query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/permissions`, query);
  }

  /**
   * @generated POST /permissions
   */
  create(body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/permissions`, body);
  }

  /**
   * @generated DELETE /permissions/[id]
   */
  deleteRemove(id: string, query?: QueryParams, body?: Record<string, unknown>) {
    return this.del<Record<string, unknown>>(`/permissions/${encodeURIComponent(id)}`, query, body);
  }

  /**
   * @generated PATCH /permissions/[id]
   */
  update(id: string, body?: Record<string, unknown>) {
    return this.patch<Record<string, unknown>>(`/permissions/${encodeURIComponent(id)}`, body);
  }

  /**
   * @generated GET /permissions/[id]/details
   */
  details(id: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/permissions/${encodeURIComponent(id)}/details`, query);
  }

  /**
   * @generated POST /permissions/accept
   */
  accept(body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/permissions/accept`, body);
  }

  /**
   * @generated POST /permissions/decline
   */
  decline(body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/permissions/decline`, body);
  }

  /**
   * @generated GET /permissions/me
   */
  me(query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/permissions/me`, query);
  }
}
