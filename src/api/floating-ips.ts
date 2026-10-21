import { ResourceClient } from "./resource-client";
import type { IgniteClient } from "@ignite/api-client";

export type FloatingIp = {
  id: string;
  address: string;
  ipVersion: number;
  status: string;
  locationId: string;
  locationName: string;
  assignedServiceId: string | null;
  assignedServiceName: string | null;
  monthlyPrice: number;
  nextBillingAt: string | null;
  subscriptionStatus: string | null;
  cancelAtPeriodEnd: boolean;
  createdAt: string;
};

export type FloatingIpLocationOffer = {
  id: string;
  name: string;
  city?: string;
  countryCode?: string;
  ipv4?: { monthlyPrice: number; available: boolean } | null;
  ipv6?: { monthlyPrice: number; available: boolean } | null;
};

export class FloatingIpsResource extends ResourceClient {
  constructor(client: IgniteClient) {
    super(client);
  }

  list() {
    return this.client.floatingIps.list() as Promise<{ success: boolean; floatingIps: FloatingIp[] }>;
  }

  options() {
    return this.client.floatingIps.options() as Promise<{
      success: boolean;
      locations: FloatingIpLocationOffer[];
    }>;
  }

  order(body: {
    locationId: string;
    ipVersion: 4 | 6;
    billingCycle: number;
    paymentMethod: string;
  }) {
    return this.client.floatingIps.order(body) as Promise<{
      success: boolean;
      floatingIp?: FloatingIp;
      checkoutUrl?: string;
    }>;
  }

  assign(id: string, serviceId: string) {
    return this.client.floatingIps.assign(id, serviceId) as Promise<{ success: boolean }>;
  }

  unassign(id: string) {
    return this.client.floatingIps.unassign(id) as Promise<{ success: boolean }>;
  }

  cancel(id: string) {
    return this.client.floatingIps.cancel(id) as Promise<{ success: boolean }>;
  }
}
