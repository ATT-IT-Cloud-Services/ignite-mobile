import { ResourceClient } from "./resource-client";
import type { IgniteClient } from "@ignite/api-client";

export type CheckoutAddress = {
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
};

export type CheckoutCountry = {
  countryCode: string;
  countryName: string;
  taxRate?: number;
  taxName?: string;
  isDefault?: boolean;
};

export type CheckoutBootstrap = {
  success: boolean;
  addresses: CheckoutAddress[];
  countries: CheckoutCountry[];
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
    adoptionDeadlineEnforced?: boolean;
    accountLocked?: boolean;
  } | null;
  savedPaymentMethods: {
    hasValid: boolean;
    defaultLabel: string | null;
    defaultMandateId: string | null;
  } | null;
};

/** Positions-Payload für validate/calculate/submit. */
export type CheckoutCartLine = {
  lineId: string;
  productId: string;
  productName: string;
  quantity: number;
  billingCycle: number;
  itemType: "new" | "renewal" | "upgrade" | "domain";
  serviceId?: string;
  subscriptionId?: string;
  daysExtension?: number;
  billingMode?: "PREPAID" | "CONTRACT";
  contractTermMonths?: number;
  customization?: { vcores?: number; memory?: number; storage?: number };
  locationId?: string;
  domainName?: string;
  domainYears?: number;
  domainOrderId?: string;
  domainRegistrantPhone?: string;
  whoisPrivacyEnabled?: boolean;
  renewalPrice?: number;
};

export type CartValidateResponse = {
  success: boolean;
  unavailable?: Array<{ lineId: string; productName: string }>;
};

export type CalculatePayload = {
  items: Array<Record<string, unknown>>;
  countryCode?: string;
  hasVatId?: boolean;
  vatNumber?: string;
  lang?: string;
};

export type CartCalculateResponse = {
  success: boolean;
  items?: Array<{
    productId: string;
    productName: string;
    total: number;
    quantity?: number;
    preorderEnabled?: boolean;
    preorderEarliestAt?: string | null;
    preorderLatestAt?: string | null;
    preorderApproxMonth?: string | null;
  }>;
  subtotal?: number;
  tax?: number;
  total?: number;
  firstMonthAmount?: number;
  taxName?: string;
  taxRatePercent?: number;
  isVatFree?: boolean;
};

export type CheckoutPaymentMethod =
  | "mollie"
  | "mollie_saved"
  | "sepa"
  | "guthaben"
  | "invoice"
  | "businessfund"
  | "family_wallet";

export type CheckoutSubmitPayload = {
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
  offerToken?: string;
  lang?: string;
};

export type CheckoutSubmitResponse = {
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
};

export class CheckoutResource extends ResourceClient {
  constructor(client: IgniteClient) {
    super(client);
  }

  bootstrap() {
    return this.client.checkout.bootstrap() as Promise<CheckoutBootstrap>;
  }

  countries() {
    return this.client.checkout.countries() as Promise<{ success: boolean; countries: CheckoutCountry[] }>;
  }

  validate(items: Array<Record<string, unknown>>) {
    return this.client.checkout.validate(items) as Promise<CartValidateResponse>;
  }

  calculate(payload: CalculatePayload) {
    return this.client.checkout.calculate(payload) as Promise<CartCalculateResponse>;
  }

  submit(payload: CheckoutSubmitPayload) {
    return this.client.checkout.submit(payload) as Promise<CheckoutSubmitResponse>;
  }
}
