import { ResourceClient } from "./resource-client";
import type { IgniteClient } from "@ignite/api-client";

export class SubdomainsResource extends ResourceClient {
  constructor(client: IgniteClient) {
    super(client);
  }

  list() {
    return this.client.subdomains.list() as Promise<{
      success: boolean;
      data: unknown[];
      limitUsed: number;
      limitMax: number;
    }>;
  }

  allowedDomains() {
    return this.client.subdomains.allowedDomains() as Promise<{ success: boolean; data: unknown[] }>;
  }

  create(body: Record<string, unknown>) {
    return this.client.subdomains.create(body) as Promise<{ success: boolean; error?: string }>;
  }

  remove(id: string) {
    return this.client.subdomains.delete(id) as Promise<{ success: boolean }>;
  }
}
