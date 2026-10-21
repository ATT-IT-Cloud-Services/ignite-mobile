import type { ApiClient } from "../lib/api";

/**
 * Mobile facade for the contract-transfer consent flows:
 * - Tenant takeover (Vertragsübernahme, Mandant B -> C)
 * - Company change within the same tenant (Firmenwechsel)
 *
 * The endpoints are authenticated-only and derive the offer from the user's
 * own session; no tenant/company ids are ever sent by the client.
 */

export type TransferPartner = {
  id: string;
  name: string | null;
  legalName: string | null;
  brandName: string | null;
  token: string | null;
};

export type PendingTransfer = {
  transferId: string;
  status: string;
  deadlineAt: string | null;
  decisionStatus: string;
  fromTenant?: TransferPartner | null;
  toTenant?: TransferPartner | null;
  fromCompany?: TransferPartner | null;
  toCompany?: TransferPartner | null;
};

export type TransferStatusResponse = {
  success: boolean;
  transfer: PendingTransfer | null;
};

export type TransferDecideResponse = {
  success: boolean;
  decisionStatus: string;
  canceledContracts?: number;
  newDpaDocumentId?: string | null;
};

export class TenantTransferResource {
  private readonly request: ApiClient["request"];

  constructor(client: ApiClient) {
    this.request = client.request.bind(client);
  }

  /** Pending tenant takeover offer for the current user. */
  tenantStatus() {
    return this.request<TransferStatusResponse>("/account/tenant-transfer");
  }

  /** Accept or decline the tenant takeover. */
  tenantDecide(body: {
    transferId: string;
    decision: "accept" | "decline";
    signerName?: string | null;
    addressId?: string | null;
  }) {
    return this.request<TransferDecideResponse>("/account/tenant-transfer", {
      method: "POST",
      body,
    });
  }

  /** Pending company-change offer for the current user. */
  companyStatus() {
    return this.request<TransferStatusResponse>("/account/company-transfer");
  }

  /** Accept or decline the company change. */
  companyDecide(body: {
    transferId: string;
    decision: "accept" | "decline";
    signerName?: string | null;
    addressId?: string | null;
  }) {
    return this.request<TransferDecideResponse>("/account/company-transfer", {
      method: "POST",
      body,
    });
  }
}
