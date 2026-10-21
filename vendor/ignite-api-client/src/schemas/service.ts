export interface Service {
  id: string;
  name: string;
  status?: string | null;
  productName?: string | null;
  [key: string]: unknown;
}

export interface ProviderViewIdentity {
  name: string;
  displayName: string | null;
  status: string | null;
  primaryIpv4: string | null;
  primaryIpv6: string | null;
  productName: string | null;
  node: string | null;
  region: string | null;
}

export interface ProviderViewResponse {
  success: boolean;
  enabled?: boolean;
  providerType?: string;
  layout?: Record<string, unknown>;
  tabs?: Record<string, unknown>[];
  fields?: Record<string, unknown>[];
  overviewFields?: Record<string, unknown>[];
  actions?: Record<string, unknown>[];
  widgets?: Record<string, unknown>[];
  identity?: ProviderViewIdentity | null;
}

export interface ActionDispatchResponse {
  success: boolean;
  status?: string | null;
  data?: Record<string, unknown>;
}

export interface ServiceListResponse {
  success: boolean;
  servers?: Service[];
  services?: Service[];
  pagination?: { total: number };
}

export interface ServiceDetailResponse {
  success: boolean;
  server?: Service;
}

export interface StatusBatchResponse {
  success: boolean;
  statuses: Record<string, Record<string, unknown>>;
}
