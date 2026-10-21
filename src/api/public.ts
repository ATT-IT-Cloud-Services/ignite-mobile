import { ResourceClient } from "./resource-client";
import type { IgniteClient } from "@ignite/api-client";

export class PublicResource extends ResourceClient {
  constructor(client: IgniteClient) {
    super(client);
  }

  registrationStatus() {
    return this.client.publicApi.registrationStatus() as Promise<{
      success: boolean;
      allowRegistration?: boolean;
      allowRegistrationPrivate?: boolean;
      allowRegistrationBusiness?: boolean;
    }>;
  }

  countries() {
    return this.client.shop.countries() as Promise<{
      success: boolean;
      countries?: Array<{
        countryCode: string;
        countryName: string;
        taxRate: number;
        taxName: string;
        isDefault: boolean;
      }>;
    }>;
  }

  /** POST /public/cancellation — öffentlicher Kündigungsbutton (ohne Login) */
  cancellation(body: Record<string, unknown>) {
    return this.client.publicApi.cancellation(body) as unknown as Promise<{
      success: boolean;
      status: "notFound" | "notPossible" | "alreadyCancelled" | "confirmed";
    }>;
  }

  supportStats() {
    return this.client.publicApi.supportStats() as Promise<{
      success: boolean;
      stats?: {
        avgFirstResponseMinutes: number | null;
        medianFirstResponseMinutes: number | null;
      };
    }>;
  }
}
