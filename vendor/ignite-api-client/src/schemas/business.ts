export interface BusinessFundContract {
  id: string;
  commitmentAmount: number;
  price: number;
  overchargeFeePercent: number;
  bindingMonths: number;
  bindingEndDate: string | null;
  cancelScheduledAt?: string | null;
  minTermEnded?: boolean;
  inUse?: boolean;
  status: string;
  currentUsage: number;
  currentOvercharge: number;
  lastResetAt: string | null;
}

export interface BusinessFundOffer {
  id: string;
  commitmentAmount: number;
  price: number;
  overchargeFeePercent: number;
  bindingMonths: number;
  adminNote: string | null;
  offeredAt: string;
}

export interface BusinessFundStatusResponse {
  success: boolean;
  contract: BusinessFundContract | null;
  pendingOffer: BusinessFundOffer | null;
}

export interface BusinessBillingResponse {
  success: boolean;
  [key: string]: unknown;
}
