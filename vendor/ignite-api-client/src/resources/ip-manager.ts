import { ResourceClient } from "../resource-client.js";
import type { IpManagerListResponse } from "../schemas/shop.js";
import type { SuccessResponse } from "../schemas/common.js";

export class IpManagerResource extends ResourceClient {
  /**
   * List IP manager entries and subnets.
   * @throws {import("../errors.js").ApiError} `unauthenticated`
   */
  list() {
    return this.get<IpManagerListResponse>("/ip-manager");
  }

  /**
   * Update an IP manager entry.
   * @throws {import("../errors.js").ApiError} `invalidRequest`, `unauthenticated`
   */
  update(id: string, body: Record<string, unknown>) {
    return this.patch<SuccessResponse>(`/ip-manager/${id}`, body);
  }

  /**
   * Delete an IP manager entry.
   * @throws {import("../errors.js").ApiError} `unauthenticated`, `accessDenied`
   */
  delete(id: string) {
    return this.del<SuccessResponse>(`/ip-manager/${id}`);
  }

  /**
   * Add an IPv6 address to a service.
   * @throws {import("../errors.js").ApiError} `invalidRequest`, `serviceNotFound`, `unauthenticated`
   */
  addIpv6(body: { serviceId: string; ipv6Address: string }) {
    return this.post<SuccessResponse>("/ip-manager", body);
  }
}
