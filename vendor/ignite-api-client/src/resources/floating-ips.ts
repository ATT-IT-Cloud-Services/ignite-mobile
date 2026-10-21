import { ResourceClient } from "../resource-client.js";
import type { QueryParams } from "../types.js";
import type { FloatingIp, FloatingIpListResponse, FloatingIpOptionsResponse } from "../schemas/floating-ip.js";
import type { SuccessResponse } from "../schemas/common.js";

export class FloatingIpsResource extends ResourceClient {
  /**
   * List floating IPs.
   * @throws {import("../errors.js").ApiError} `unauthenticated`
   */
  list() {
    return this.get<FloatingIpListResponse>("/floating-ips");
  }

  /**
   * Get available floating IP order options.
   * @throws {import("../errors.js").ApiError} `unauthenticated`
   */
  options() {
    return this.get<FloatingIpOptionsResponse>("/floating-ips/options");
  }

  /**
   * Order a new floating IP.
   * @throws {import("../errors.js").ApiError} `insufficientBalance`, `invalidRequest`, `unauthenticated`
   */
  order(body: {
    locationId: string;
    ipVersion: 4 | 6;
    billingCycle: number;
    paymentMethod: string;
  }) {
    return this.post<SuccessResponse & { floatingIp?: FloatingIp; checkoutUrl?: string }>(
      "/floating-ips/order",
      body,
    );
  }

  /**
   * Assign a floating IP to a service.
   * @throws {import("../errors.js").ApiError} `serviceNotFound`, `unauthenticated`
   */
  assign(id: string, serviceId: string) {
    return this.post<SuccessResponse>(`/floating-ips/${encodeURIComponent(id)}/assign`, { serviceId });
  }

  /**
   * Unassign a floating IP from its service.
   * @throws {import("../errors.js").ApiError} `unauthenticated`
   */
  unassign(id: string) {
    return this.post<SuccessResponse>(`/floating-ips/${encodeURIComponent(id)}/unassign`, {});
  }

  /**
   * Schedule cancellation of a floating IP.
   * @throws {import("../errors.js").ApiError} `unauthenticated`
   */
  cancel(id: string) {
    return this.post<SuccessResponse>(`/floating-ips/${encodeURIComponent(id)}/cancel`, {});
  }

  // <generated-openapi>
  /**
   * @generated GET /floating-ips/[id]/targets
   */
  targets(id: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/floating-ips/${encodeURIComponent(id)}/targets`, query);
  }
  // </generated-openapi>
}
