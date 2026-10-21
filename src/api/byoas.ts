import { ResourceClient } from "./resource-client";
import type { IgniteClient } from "@ignite/api-client";

export type ByoasApplication = {
  id: string;
  userId: string;
  asn: string;
  status: "PENDING_REVIEW" | "LEGAL_PENDING" | "APPROVED" | "REJECTED";
  signerName?: string | null;
  signatureMethod?: "TYPED" | "DRAWN" | null;
  legalAcceptedAt?: string | null;
  locationId?: string | null;
  rejectedReason?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ByoasNetwork = {
  id: string;
  applicationId: string;
  prefix: string;
  prefixVersion: "IPV4" | "IPV6";
  status: "PENDING" | "APPROVED" | "ANNOUNCED" | "REJECTED";
  locationId?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ByoasPolicy = { enabled: boolean; requireIdent: boolean; routingAsn: string };

/** Thin typed adapter over the generated `client.byoas` resource. */
export class ByoasResource extends ResourceClient {
  constructor(client: IgniteClient) {
    super(client);
  }

  status() {
    return this.client.byoas.status() as unknown as Promise<{
      success: boolean;
      policy: ByoasPolicy;
      applications: ByoasApplication[];
      networks: ByoasNetwork[];
    }>;
  }

  apply(asn: string) {
    return this.client.byoas.apply({ asn }) as unknown as Promise<{
      success: boolean;
      application: ByoasApplication;
    }>;
  }

  legal(id: string, signerName: string, signatureMethod: "TYPED" | "DRAWN") {
    return this.client.byoas.legal(id, { signerName, signatureMethod }) as unknown as Promise<{
      success: boolean;
      application: ByoasApplication;
    }>;
  }

  networks(id: string) {
    return this.client.byoas.networks(id) as unknown as Promise<{
      success: boolean;
      networks: ByoasNetwork[];
    }>;
  }

  submitNetwork(id: string, prefix: string, loa?: { filename?: string; contentType?: string; dataBase64?: string }) {
    return this.client.byoas.postNetworks(id, {
      prefix,
      loaFilename: loa?.filename,
      loaContentType: loa?.contentType,
      loaDataBase64: loa?.dataBase64,
    }) as unknown as Promise<{ success: boolean; network: ByoasNetwork }>;
  }
}
