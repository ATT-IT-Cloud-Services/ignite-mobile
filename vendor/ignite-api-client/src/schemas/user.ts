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
