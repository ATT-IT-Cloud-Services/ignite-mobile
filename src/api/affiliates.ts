import { ResourceClient } from "./resource-client";
import type { IgniteClient } from "@ignite/api-client";

export class AffiliatesResource extends ResourceClient {
  constructor(client: IgniteClient) {
    super(client);
  }

  me() {
    return this.client.affiliates.me() as Promise<{ success: boolean }>;
  }

  validate(code: string) {
    return this.client.affiliates.validate({ code }) as Promise<{
      success: boolean;
      affiliate?: { code: string; name: string };
    }>;
  }

  commissions(limit = 50) {
    return this.client.affiliates.commissions(limit) as Promise<{
      success: boolean;
      commissions?: unknown[];
    }>;
  }

  payoutRequests(limit = 20, offset = 0) {
    return this.client.affiliates.payoutRequests(limit, offset) as Promise<{
      success: boolean;
      requests: unknown[];
      total: number;
    }>;
  }

  taxInfo() {
    return this.client.affiliates.taxInfo() as Promise<{
      success: boolean;
      taxInfo: unknown | null;
      profile?: unknown;
    }>;
  }
}
