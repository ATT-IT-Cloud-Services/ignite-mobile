import { ResourceClient } from "../resource-client.js";
import type { SshKeyGenerateResponse, SshKeyListResponse } from "../schemas/shop.js";
import type { SuccessResponse } from "../schemas/common.js";

export class SshKeysResource extends ResourceClient {
  /**
   * List SSH keys.
   * @throws {import("../errors.js").ApiError} `unauthenticated`
   */
  list() {
    return this.get<SshKeyListResponse>("/ssh-keys");
  }

  /**
   * Add an SSH public key.
   * @throws {import("../errors.js").ApiError} `invalidRequest`, `unauthenticated`
   */
  create(body: { name: string; publicKey: string }) {
    return this.post<SuccessResponse>("/ssh-keys", body);
  }

  /**
   * Delete an SSH key.
   * @throws {import("../errors.js").ApiError} `unauthenticated`, `accessDenied`
   */
  delete(id: string) {
    return this.del<SuccessResponse>(`/ssh-keys/${id}`);
  }

  /**
   * Generate a new SSH key pair server-side.
   * @throws {import("../errors.js").ApiError} `invalidRequest`, `unauthenticated`
   */
  generate(body: { name: string; keyType: string; passphrase?: string }) {
    return this.post<SshKeyGenerateResponse>("/ssh-keys/generate", body);
  }

  // <generated-openapi>
  /**
   * @generated PATCH /ssh-keys/[id]
   */
  update(id: string, body?: Record<string, unknown>) {
    return this.patch<Record<string, unknown>>(`/ssh-keys/${encodeURIComponent(id)}`, body);
  }
  // </generated-openapi>
}
