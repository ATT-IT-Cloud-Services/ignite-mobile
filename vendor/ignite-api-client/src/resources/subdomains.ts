import { ResourceClient } from "../resource-client.js";
import type { SubdomainListResponse } from "../schemas/domain.js";
import type { SuccessResponse } from "../schemas/common.js";

export class SubdomainsResource extends ResourceClient {
  /**
   * List subdomains.
   * @throws {import("../errors.js").ApiError} `unauthenticated`
   */
  list() {
    return this.get<SubdomainListResponse>("/subdomains");
  }

  /**
   * List domains eligible for subdomain creation.
   * @throws {import("../errors.js").ApiError} `unauthenticated`
   */
  allowedDomains() {
    return this.get<SuccessResponse & { data: unknown[] }>("/subdomains/domains");
  }

  /**
   * Create a subdomain.
   * @throws {import("../errors.js").ApiError} `invalidRequest`, `unauthenticated`
   */
  create(body: Record<string, unknown>) {
    return this.post<SuccessResponse>("/subdomains", body);
  }

  /**
   * Delete a subdomain.
   * @throws {import("../errors.js").ApiError} `unauthenticated`, `accessDenied`
   */
  delete(id: string) {
    return this.del<SuccessResponse>(`/subdomains/${id}`);
  }

  // <generated-openapi>
  /**
   * @generated PATCH /subdomains/[id]
   */
  update(id: string, body?: Record<string, unknown>) {
    return this.patch<Record<string, unknown>>(`/subdomains/${encodeURIComponent(id)}`, body);
  }
  // </generated-openapi>
}
