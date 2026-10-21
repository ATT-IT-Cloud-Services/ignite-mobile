export interface ByoipAssignment {
  id: string;
  assignedPrefix: string;
  isPrimary: boolean;
  service: { id: string; name: string } | null;
}

export interface ByoipNetwork {
  id: string;
  prefix: string;
  prefixVersion: number;
  asnNumber: string | null;
  description: string | null;
  status: string;
  locationId: string | null;
  setupFeeGross: number;
  monthlyFeeGross: number;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  ddosProtectionProvider: string;
  tbWalletBalanceTb: number;
  tbWalletUsedTb: number;
  createdAt: string;
  assignments: ByoipAssignment[];
}

export interface ByoipStatusResponse {
  success: boolean;
  networks: ByoipNetwork[];
  allowedLocationIds: string[];
  walletPricePerTbGross: number;
}
