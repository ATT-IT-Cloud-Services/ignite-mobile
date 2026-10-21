import { ResourceClient } from "../resource-client.js";
import type { QueryParams } from "../types.js";
import type { ByoipStatusResponse } from "../schemas/byoip.js";
import type { SuccessResponse } from "../schemas/common.js";

export class ByoipResource extends ResourceClient {
  /**
   * Get BYOIP network status and assignments.
   * @throws {import("../errors.js").ApiError} `unauthenticated`
   */
  status() {
    return this.get<ByoipStatusResponse>("/byoip/status");
  }

  /**
   * Assign a BYOIP prefix to a service.
   * @throws {import("../errors.js").ApiError} `byoipInvalidAssignedPrefix`, `serviceNotOwned`, `unauthenticated`
   */
  assign(body: { networkId: string; serviceId: string; prefix: string; isPrimary?: boolean; note?: string }) {
    return this.post<SuccessResponse>("/byoip/assign", body);
  }

  /**
   * Remove a BYOIP assignment.
   * @throws {import("../errors.js").ApiError} `byoipAssignmentNotFound`, `unauthenticated`
   */
  unassign(assignmentId: string) {
    return this.del<SuccessResponse>(`/byoip/assign/${encodeURIComponent(assignmentId)}`);
  }

  /**
   * Schedule cancellation of a BYOIP network.
   * @throws {import("../errors.js").ApiError} `byoipNetworkNotOwned`, `unauthenticated`
   */
  cancel(networkId: string) {
    return this.post<SuccessResponse>("/byoip/cancel", { networkId });
  }

  // <generated-openapi>
  /**
   * @generated POST /byoip/apply
   */
  apply(body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/byoip/apply`, body);
  }

  /**
   * @generated GET /byoip/assign
   */
  getAssign(query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/byoip/assign`, query);
  }

  /**
   * @generated POST /byoip/deannouncement/request
   */
  deannouncementRequest(body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/byoip/deannouncement/request`, body);
  }

  /**
   * @generated POST /byoip/migration/request
   */
  migrationRequest(body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/byoip/migration/request`, body);
  }

  /**
   * @generated POST /byoip/subscribe
   */
  subscribe(body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/byoip/subscribe`, body);
  }

  /**
   * @generated GET /byoip/transfers
   */
  transfers(query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/byoip/transfers`, query);
  }

  /**
   * @generated POST /byoip/transfers
   */
  postTransfers(body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/byoip/transfers`, body);
  }

  /**
   * @generated GET /byoip/wallet
   */
  wallet(query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/byoip/wallet`, query);
  }

  /**
   * @generated POST /byoip/wallet
   */
  postWallet(body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/byoip/wallet`, body);
  }

  /**
   * @generated PUT /byoip/wallet
   */
  replaceWallet(body?: Record<string, unknown>) {
    return this.put<Record<string, unknown>>(`/byoip/wallet`, body);
  }
  // </generated-openapi>
}
