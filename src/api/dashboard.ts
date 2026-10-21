import { ResourceClient } from "./resource-client";
import type { IgniteClient } from "@ignite/api-client";

export class DashboardResource extends ResourceClient {
  constructor(client: IgniteClient) {
    super(client);
  }

  services(limit = 50) {
    return this.client.dashboard.services(limit);
  }

  tickets(status = "open", limit = 1) {
    return this.client.dashboard.tickets(status, limit);
  }

  totalBandwidth() {
    return this.client.dashboard.totalBandwidth();
  }

  maintenanceNotifications() {
    return this.client.dashboard.maintenanceNotifications();
  }

  trafficSources() {
    return this.client.dashboard.trafficSources();
  }

  monthlyOffers() {
    return this.client.dashboard.monthlyOffers();
  }

  contractPaymentAlert() {
    return this.client.dashboard.contractPaymentAlert() as Promise<{
      success: boolean;
      alert?: { hasOverdue?: boolean };
    }>;
  }
}
