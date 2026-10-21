import { ResourceClient } from "./resource-client";
import type { IgniteClient } from "@ignite/api-client";

export type PlusPool = {
  key: string;
  categoryId: string;
  categoryName?: string;
  locationId: string;
  locationName?: string;
  memberCount: number;
  includedTb: number;
  usedTb: number;
  remainingTb: number;
};

export type PlusStatusResponse = {
  success?: boolean;
  plusActive: boolean;
  isAdminGrant?: boolean;
  subscription: {
    status: string;
    basePriceGross: number;
    currentPeriodStart: string | null;
    currentPeriodEnd: string | null;
    cancelAtPeriodEnd: boolean;
    canceledAt: string | null;
    failedAttempts: number;
    isAdminGrant: boolean;
  } | null;
  pooling?: {
    enabled: boolean;
    mode: "THROTTLE";
    pools: PlusPool[];
  };
  forecast?: Array<{
    key: string;
    projectedRemainingTb: number;
    projectedPeriodEndUsageTb: number;
    last24hUsageTb: number;
  }>;
  savings?: {
    currentPeriodGross: number;
    lifetimeGross: number;
    pooledCostGross: number;
    unpooledCostGross: number;
  };
};

export type PlusSubscribeResponse = {
  success: boolean;
  checkoutUrl?: string;
  paidWithBalance?: boolean;
  error?: string;
};

export type PlusSimpleResponse = {
  success: boolean;
  error?: string;
};

/**
 * Mobile-facing Plus facade.
 *
 * Every call delegates to the generated `client.plus.*` resource — no raw paths
 * here, so the mobile layer cannot drift from the OpenAPI spec.
 */
export class PlusResource extends ResourceClient {
  constructor(client: IgniteClient) {
    super(client);
  }

  status() {
    return this.client.plus.status().then((r) => r as unknown as PlusStatusResponse);
  }

  subscribe(paymentMethod: "mollie" | "guthaben" = "mollie") {
    return this.client.plus
      .subscribe({ paymentMethod, planVariant: "TEAMS" })
      .then((r) => r as unknown as PlusSubscribeResponse);
  }

  cancel() {
    return this.client.plus.cancel().then((r) => r as unknown as PlusSimpleResponse);
  }

  reactivate() {
    return this.client.plus.reactivate().then((r) => r as unknown as PlusSimpleResponse);
  }

  updatePooling(enabled: boolean) {
    return this.client.plus
      .replacePooling({ enabled, mode: "THROTTLE" })
      .then((r) => r as unknown as PlusSimpleResponse);
  }
}
