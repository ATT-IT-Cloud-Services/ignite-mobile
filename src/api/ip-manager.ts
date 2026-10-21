import { ResourceClient } from "./resource-client";
import type { IgniteClient } from "@ignite/api-client";

export class IpManagerResource extends ResourceClient {
  constructor(client: IgniteClient) {
    super(client);
  }

  list() {
    return this.client.ipManager.list() as Promise<{
      success: boolean;
      data?: unknown[];
      subnets?: unknown[];
      error?: string;
    }>;
  }

  update(id: string, body: Record<string, unknown>) {
    return this.client.ipManager.update(id, body) as Promise<{ success: boolean }>;
  }

  remove(id: string) {
    return this.client.ipManager.delete(id) as Promise<{ success: boolean }>;
  }

  addIpv6(body: { serviceId: string; ipv6Address: string }) {
    return this.client.ipManager.addIpv6(body) as Promise<{ success: boolean; error?: string }>;
  }
}
