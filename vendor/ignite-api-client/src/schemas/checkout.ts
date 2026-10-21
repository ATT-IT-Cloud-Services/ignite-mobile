import type { Country } from "./common.js";

export interface CheckoutAddress {
  id: string;
  label?: string | null;
  companyName?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  street: string;
  zip: string;
  city: string;
  countryCode: string;
  country: string;
  phone?: string | null;
  vatId?: string | null;
  isDefault?: boolean;
}

export interface CheckoutBootstrap {
  success: boolean;
  addresses: CheckoutAddress[];
  countries: Country[];
  netPointsBalance: { points: number; eurValue: number } | null;
  businessBillingConfig: {
    invoiceEnabled: boolean;
    hasActiveFund: boolean;
    anchorDay: number | null;
  } | null;
  familyBillingConfig: {
    groupId: string;
    walletBalance: number;
    billingMode?: string;
    billingPriority?: string;
    requirePaymentApproval?: boolean;
    sharedBalance?: boolean;
    userRole?: string;
    userBillingMode?: string;
    accountLocked?: boolean;
  } | null;
  savedPaymentMethods: {
    hasValid: boolean;
    defaultLabel: string | null;
    defaultMandateId: string | null;
  } | null;
}

export interface CheckoutCartLine {
  lineId: string;
  productId: string;
  productName: string;
  quantity: number;
  billingCycle: number;
  itemType: "new";
  customization?: { vcores?: number; memory?: number; storage?: number };
  locationId?: string;
}

export interface CartValidateResponse {
  success: boolean;
  unavailable?: Array<{ lineId: string; productName: string }>;
}

export interface CalculatePayload {
  items: Array<Record<string, unknown>>;
  countryCode?: string;
  hasVatId?: boolean;
  vatNumber?: string;
  lang?: string;
}

export interface CartCalculateResponse {
  success: boolean;
  items?: Array<{ productId: string; productName: string; total: number; quantity?: number }>;
  subtotal?: number;
  tax?: number;
  total?: number;
  firstMonthAmount?: number;
  taxName?: string;
  taxRatePercent?: number;
  isVatFree?: boolean;
}

export type CheckoutPaymentMethod =
  | "mollie"
  | "mollie_saved"
  | "sepa"
  | "guthaben"
  | "invoice"
  | "businessfund"
  | "family_wallet";

export interface CheckoutSubmitPayload {
  items: Array<Record<string, unknown>>;
  paymentMethod: CheckoutPaymentMethod;
  savedMandateId?: string;
  couponCode?: string;
  affiliateCode?: string;
  netPointsRedeemEur?: number;
  billingAddressId?: string;
  billingAddress?: {
    label?: string;
    companyName?: string;
    firstName?: string;
    lastName?: string;
    street: string;
    zip: string;
    city: string;
    countryCode: string;
    country: string;
    phone?: string;
    vatId?: string;
    isDefault?: boolean;
  };
  newsletterOptIn?: boolean;
  lang?: string;
}

export interface CheckoutSubmitResponse {
  success: boolean;
  subscriptionIds?: string[];
  invoiceId?: string;
  redirectUrl?: string;
  processing?: boolean;
  orderId?: string;
  sepaDetails?: {
    iban: string;
    bic: string;
    bankName?: string;
    amount: number;
    reference: string;
  };
}
