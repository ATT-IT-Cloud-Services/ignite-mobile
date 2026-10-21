export interface Domain {
  id: string;
  name: string;
  status?: string;
  [key: string]: unknown;
}

export interface DnsRecord {
  id: string;
  type: string;
  name: string;
  content: string;
  ttl?: number;
  [key: string]: unknown;
}

export interface DomainListResponse {
  success: boolean;
  data: Domain[];
}

export interface DnsRecordListResponse {
  success: boolean;
  data: DnsRecord[];
}

export interface Subdomain {
  id: string;
  subdomain: string;
  domain: string;
  [key: string]: unknown;
}

export interface SubdomainListResponse {
  success: boolean;
  data: Subdomain[];
  limitUsed: number;
  limitMax: number;
}
