export interface AuditLogEntry {
  id: string;
  action: string;
  createdAt: string;
  [key: string]: unknown;
}

export interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  createdAt: string;
  lastUsedAt?: string | null;
  [key: string]: unknown;
}

export interface SupportPinResponse {
  success?: boolean;
  pin: string | null;
  expiresAt: string | null;
}

export interface McpRequestingIp {
  ip: string;
  firstSeenAt: string;
  lastSeenAt: string;
  hitCount: number;
  [key: string]: unknown;
}

export interface McpCredential {
  id: string;
  name: string;
  tokenPrefix: string;
  scopes: string[];
  lastUsedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
  requestCount: number;
  requestingIps: McpRequestingIp[];
  ipCount: number;
  /** Only present in the create response — shown once. */
  token?: string;
  [key: string]: unknown;
}
