export interface SshKey {
  id: string;
  name: string;
  fingerprint?: string;
  createdAt?: string;
  [key: string]: unknown;
}

export interface SshKeyListResponse {
  success: boolean;
  sshKeys: SshKey[];
  limitUsed: number;
  limitMax: number;
}

export interface SshKeyGenerateResponse {
  success: boolean;
  privateKey: string;
  publicKey: string;
}

export interface IpManagerEntry {
  id: string;
  address?: string;
  [key: string]: unknown;
}

export interface IpManagerListResponse {
  success: boolean;
  data?: IpManagerEntry[];
  subnets?: IpManagerEntry[];
}

export interface ProductCategory {
  id: string;
  name: string;
  products?: Record<string, unknown>[];
  [key: string]: unknown;
}

export interface ProductsResponse {
  success: boolean;
  categories?: ProductCategory[];
}

export interface CountriesResponse {
  success: boolean;
  countries: Array<{ countryCode: string; countryName: string; isDefault?: boolean }>;
}
