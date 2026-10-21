export interface AutoTopupConfig {
  id: string;
  isActive: boolean;
  amount: number;
  dayOfMonth: number;
  lastChargedAt?: string | null;
  nextChargeAt?: string | null;
  mandateVerifiedAt?: string | null;
  autoRedeemVoucher?: boolean;
  createdAt?: string | null;
}

export interface AutoTopupCreateBody {
  amount: number;
  dayOfMonth: number;
  autoRedeemVoucher?: boolean;
  acceptTerms?: boolean;
  acceptPrivacy?: boolean;
  acceptExpiry?: boolean;
}

export interface WalletVoucher {
  id: string;
  amount: number;
  status: string;
  code?: string | null;
  createdAt?: string | null;
  redeemedAt?: string | null;
}

export interface AutoTopupListResponse {
  success: boolean;
  configs: AutoTopupConfig[];
}

export interface VoucherListResponse {
  success: boolean;
  vouchers: WalletVoucher[];
  total: number;
}
