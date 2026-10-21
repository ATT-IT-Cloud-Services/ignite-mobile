import { ResourceClient } from "./resource-client";
import type { IgniteClient } from "@ignite/api-client";

export type DomainContactRole = "owner" | "admin" | "tech" | "zone";

export type DomainStoredContact = {
  handleId: string;
  firstName: string;
  lastName: string;
  email: string;
  companyName?: string | null;
  street: string;
  zip: string;
  city: string;
  countryCode: string;
  phone: string;
};

export type DomainRegistrationByService = {
  id: string;
  domain: string;
  status: string;
  registrar?: string;
  autoRenew?: boolean;
  whoisPrivacyEnabled?: boolean;
  nameserverMode?: string;
  nameserversJson?: string | null;
  metadataJson?: string | null;
  expiresAt?: string | null;
  restoreEligibleUntil?: string | null;
  dnssec?: {
    enabled: boolean;
    statusCode?: number | null;
    algorithm?: number | null;
    publicKey?: string | null;
    dnskey?: string | null;
    keyTag?: number | null;
    source?: string;
  } | null;
  domainOrder?: {
    id?: string;
    provider?: string | null;
    registrantJson?: string | null;
  };
};

export type LiveRegistryStatus = {
  source: "whois" | "domain-robot" | "whois+domain-robot" | "none";
  fetchedAt: string;
  statuses: string[];
  transferLock?: boolean | null;
  error?: string | null;
  fromCache?: boolean;
};

export class DomainsResource extends ResourceClient {
  constructor(client: IgniteClient) {
    super(client);
  }

  list() {
    return this.client.domains.list() as unknown as Promise<{
      success: boolean;
      data: Array<{ id: string; domain: string; [key: string]: unknown }>;
    }>;
  }

  add(domain: string) {
    return this.client.domains.add(domain) as Promise<{ success: boolean; error?: string }>;
  }

  records(domainId: string) {
    return this.client.domains.records(domainId) as Promise<{ success: boolean; data: unknown[] }>;
  }

  createRecord(domainId: string, body: Record<string, unknown>) {
    return this.client.domains.createRecord(domainId, body) as Promise<{ success: boolean }>;
  }

  deleteRecord(domainId: string, recordId: string) {
    return this.client.domains.deleteRecord(domainId, recordId) as Promise<{ success: boolean }>;
  }

  registrationByService(serviceId: string) {
    return this.client.domains.registrationsByService(serviceId) as Promise<{
      success: boolean;
      registration?: DomainRegistrationByService;
      liveRegistryStatus?: LiveRegistryStatus | null;
      error?: string;
    }>;
  }

  registrationAction(
    registrationId: string,
    body: {
      action: "set_contact" | "set_nameservers" | "set_whois_privacy" | "set_auto_renew";
      role?: DomainContactRole;
      contact?: Partial<DomainStoredContact>;
      nameservers?: string[];
      whoisPrivacyEnabled?: boolean;
      autoRenew?: boolean;
      dnssecEnabled?: boolean;
      dnssecAlgorithm?: number | null;
      dnssecPublicKey?: string | null;
      dnssecKeyTag?: number | null;
    },
  ) {
    return this.client.domains.registrationsActions(registrationId, body) as Promise<{
      success: boolean;
      error?: string;
      role?: DomainContactRole;
      contact?: DomainStoredContact;
      message?: string | null;
    }>;
  }
}
