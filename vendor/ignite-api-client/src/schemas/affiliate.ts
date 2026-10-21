export interface AffiliateProfile {
  id: string;
  code: string;
  [key: string]: unknown;
}

export interface AffiliateCommission {
  id: string;
  amount: number;
  status: string;
  [key: string]: unknown;
}

export interface AffiliateMeResponse {
  success: boolean;
  profile?: AffiliateProfile;
}

export interface AffiliateCommissionsResponse {
  success: boolean;
  commissions?: AffiliateCommission[];
}

export interface PayoutRequest {
  id: string;
  amount: number;
  status: string;
  [key: string]: unknown;
}

export interface PayoutRequestsResponse {
  success: boolean;
  requests: PayoutRequest[];
  total: number;
}
