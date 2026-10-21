export interface SuccessResponse {
  success: boolean;
}

export interface Pagination {
  total: number;
  hasMore?: boolean;
  offset?: number;
  limit?: number;
}

export interface Country {
  countryCode: string;
  countryName: string;
  taxRate?: number;
  taxName?: string;
  isDefault?: boolean;
}
