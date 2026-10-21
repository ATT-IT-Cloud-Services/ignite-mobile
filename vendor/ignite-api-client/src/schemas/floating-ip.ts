export interface FloatingIp {
  id: string;
  address: string;
  ipVersion: number;
  status: string;
  locationId: string;
  locationName: string;
  assignedServiceId: string | null;
  assignedServiceName: string | null;
  monthlyPrice: number;
  nextBillingAt: string | null;
  subscriptionStatus: string | null;
  cancelAtPeriodEnd: boolean;
  createdAt: string;
}

export interface FloatingIpLocationOffer {
  id: string;
  name: string;
  city?: string;
  countryCode?: string;
  ipv4?: { monthlyPrice: number; available: boolean } | null;
  ipv6?: { monthlyPrice: number; available: boolean } | null;
}

export interface FloatingIpListResponse {
  success: boolean;
  floatingIps: FloatingIp[];
}

export interface FloatingIpOptionsResponse {
  success: boolean;
  locations: FloatingIpLocationOffer[];
}
