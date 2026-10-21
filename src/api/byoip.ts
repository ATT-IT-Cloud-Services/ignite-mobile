import { ResourceClient } from "./resource-client";
import type { IgniteClient } from "@ignite/api-client";

export type ByoipAssignment = {
  id: string;
  assignedPrefix: string;
  prefixVersion?: number;
  isPrimary: boolean;
  note?: string | null;
  createdAt?: string;
  service: { id: string; name: string } | null;
};

export type ByoipNetwork = {
  id: string;
  prefix: string;
  prefixVersion: number;
  asnNumber: string | null;
  description: string | null;
  status: string;
  locationId: string | null;
  setupFeeGross: number;
  monthlyFeeGross: number;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  isAdminGrant?: boolean;
  ddosProtectionProvider: string;
  ddosMigrationRequestedAt?: string | null;
  ddosMigrationRequestedProvider?: string | null;
  tbWalletBalanceTb: number;
  tbWalletUsedTb: number;
  createdAt: string;
  assignments: ByoipAssignment[];
};

export type ByoipDdosMarketing = {
  standardProviderName: string;
  premiumDisplayName: string;
  premiumProviderKey: string;
  premiumVisible: boolean;
};

export type ByoipStatusResponse = {
  success: boolean;
  networks: ByoipNetwork[];
  allowedLocationIds: string[];
  walletPricePerTbGross: number;
  ddosMarketing?: ByoipDdosMarketing;
};

export class ByoipResource extends ResourceClient {
  constructor(client: IgniteClient) {
    super(client);
  }

  status() {
    return this.client.byoip.status() as Promise<ByoipStatusResponse>;
  }

  apply(formData: FormData) {
    return this.client.byoip.apply(formData as unknown as Record<string, unknown>) as Promise<{ success: boolean }>;
  }

  assign(body: { networkId: string; serviceId: string; prefix: string; isPrimary?: boolean; note?: string }) {
    return this.client.byoip.assign(body) as Promise<{ success: boolean }>;
  }

  unassign(assignmentId: string) {
    return this.client.byoip.unassign(assignmentId) as Promise<{ success: boolean }>;
  }

  subscribe(networkId: string, paymentMethod?: "guthaben" | "mollie") {
    return this.client.byoip.subscribe({ networkId, paymentMethod }) as Promise<{
      success: boolean;
      checkoutUrl?: string;
      paidWithBalance?: boolean;
    }>;
  }

  cancel(networkId: string) {
    return this.client.byoip.cancel(networkId) as Promise<{ success: boolean }>;
  }

  walletTopup(networkId: string, tb: number, paymentMethod: "guthaben" | "mollie" = "guthaben") {
    return this.client.byoip.postWallet({ networkId, tb, paymentMethod }) as Promise<{ success: boolean }>;
  }

  requestPremiumDdosMigration(networkId: string) {
    return this.client.byoip.migrationRequest({ networkId }) as Promise<{ success: boolean }>;
  }

  requestDeannouncement(networkId: string) {
    return this.client.byoip.deannouncementRequest({ networkId }) as Promise<{
      success: boolean;
      alreadyRequested?: boolean;
    }>;
  }
}
