import { ResourceClient } from "./resource-client";
import type { IgniteClient } from "@ignite/api-client";

export const ENJYN_LINK_SESSION_TTL_MS = 60 * 60 * 1000;

export type IdVerificationAddress = {
  id: string;
  label: string | null;
  isDefault: boolean;
  firstName: string | null;
  lastName: string | null;
  street: string;
  zip: string;
  city: string;
  countryCode: string;
  country: string;
};

export type IdVerificationDocumentType = {
  id: string;
  label: string;
  documentType: string;
  enjynEnabled: boolean;
};

export type IdVerificationCountry = {
  countryCode: string;
  label: string;
  documentTypes: IdVerificationDocumentType[];
};

export type IdVerificationRecord = {
  id: string;
  method: string;
  status: string;
  requestedByAdminId: string | null;
  relatedCaseReportId?: string | null;
  consentGiven?: boolean;
  verificationFirstName: string;
  verificationLastName: string;
  submittedDateOfBirth: string;
  addressStreet: string;
  addressZip: string;
  addressCity: string;
  addressCountryCode: string;
  enjynCallbackPayload?: {
    countryCode?: string;
    documentTypeId?: string;
    documentType?: string;
    verifyUrl?: string;
    qrUrl?: string;
    enjynToken?: string;
    enjynStatus?: string;
    enjynSessionCreatedAt?: string;
    enjynSessionStartError?: string;
  } | null;
  selfieDataEnc?: string | null;
  hasImages?: boolean;
  createdAt?: string;
};

export type IdVerificationStatusResponse = {
  success?: boolean;
  user: {
    identVerified: boolean;
    dobCorrectionUsedAt: string | null;
    firstName: string | null;
    lastName: string | null;
    dateOfBirth: string | null;
  } | null;
  pending: IdVerificationRecord | null;
  verified: IdVerificationRecord | null;
  verificationCountries: IdVerificationCountry[];
  dobCorrectionAvailable: boolean;
};

export type IdVerificationEnjynCallbackResponse = IdVerificationStatusResponse & {
  outcome?: "verified" | "failed" | "expired" | "processing" | "pending" | "none";
};

export type IdVerificationEnforcementStatus = {
  success?: boolean;
  required: boolean;
  deadlineAt: string | null;
  relatedCaseReportId: string | null;
  verificationId: string | null;
  canRefuse: boolean;
};

export class IdVerificationResource extends ResourceClient {
  constructor(client: IgniteClient) {
    super(client);
  }

  status() {
    return this.client.user.idVerificationStatus() as Promise<IdVerificationStatusResponse>;
  }

  enforcementStatus() {
    return this.client.user.idVerificationEnforcementStatus() as Promise<IdVerificationEnforcementStatus>;
  }

  refuseEnforcement(verificationId: string) {
    return this.client.user.idVerificationRefuse(verificationId) as Promise<{ success: boolean }>;
  }

  enjynCallback(sessionId?: string) {
    return this.client.user.idVerificationEnjynCallback({
      sessionId: sessionId || undefined,
    }) as Promise<IdVerificationEnjynCallbackResponse>;
  }

  start(body: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    addressId: string;
    addressStreet: string;
    addressZip: string;
    addressCity: string;
    addressCountryCode: string;
    explicitConsent: boolean;
  }) {
    return this.client.user.idVerificationStart(body) as Promise<{
      success: boolean;
      verification: { id: string };
    }>;
  }

  selectMethod(
    verificationId: string,
    body: { countryCode: string; documentTypeId: string; explicitConsent?: boolean },
  ) {
    return this.client.user.idVerificationMethod(verificationId, body) as Promise<{
      success: boolean;
      verification: { method: string };
    }>;
  }

  enjynStart(verificationId: string, body?: { explicitConsent?: boolean }) {
    return this.client.user.idVerificationEnjynStart(verificationId, body ?? {}) as Promise<{ success: boolean }>;
  }

  enjynRestart(verificationId: string, body?: { explicitConsent?: boolean }) {
    return this.client.user.idVerificationEnjynRestart(verificationId, body ?? {}) as Promise<{ success: boolean }>;
  }

  upload(verificationId: string, formData: FormData) {
    return this.client.user.idVerificationUpload(
      verificationId,
      formData as unknown as Record<string, unknown>,
    ) as Promise<{ success: boolean }>;
  }

  decline(verificationId: string) {
    return this.client.user.idVerificationDecline(verificationId) as Promise<{ success: boolean }>;
  }
}
