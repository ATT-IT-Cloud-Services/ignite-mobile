import type { Pagination } from "./common.js";

export interface Invoice {
  id: string;
  number?: string;
  status: string;
  total: number;
  currency?: string;
  dueAt?: string | null;
  paidAt?: string | null;
  [key: string]: unknown;
}

export interface InvoiceListResponse {
  success: boolean;
  invoices: Invoice[];
  pagination?: Pagination;
}

export interface InvoiceDetailResponse {
  success: boolean;
  invoice: Invoice;
}

export type InvoicePaymentMethod = "mollie" | "mollie_saved" | "guthaben";

export interface InvoicePayBody {
  paymentMethod: InvoicePaymentMethod;
  savedMandateId?: string;
  amountFromBalance?: number;
  netPointsRedeemEur?: number;
}

export interface InvoicePayResult {
  success: boolean;
  alreadyPaid?: boolean;
  paymentId?: string;
  checkoutUrl?: string;
  processing?: boolean;
}

export interface SavedPaymentMethod {
  mandateId: string;
  label?: string | null;
  userLabel?: string | null;
  method?: string | null;
  brand?: string | null;
  last4?: string | null;
  isDefault?: boolean;
  createdAt?: string | null;
}

export interface PaymentMethodsResult {
  success: boolean;
  canManage: boolean;
  methods: SavedPaymentMethod[];
  defaultMandateId: string | null;
  maxMethods: number;
  canAddMore: boolean;
}

export interface Subscription {
  id: string;
  status: string;
  [key: string]: unknown;
}

export interface SubscriptionsResponse {
  success: boolean;
  subscriptions: Subscription[];
}

export interface NetPointsPreviewResponse {
  success: boolean;
  maxEur: number;
  maxPoints: number;
  currentBalance: number;
}
