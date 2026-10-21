import { ResourceClient } from "./resource-client";
import type { IgniteClient } from "@ignite/api-client";

export type InvoiceListFilters = {
  status?: string;
  serviceId?: string;
  limit?: number;
  offset?: number;
};

export type InvoicePayBody = {
  paymentMethod: "mollie" | "mollie_saved" | "guthaben";
  savedMandateId?: string;
  amountFromBalance?: number;
  netPointsRedeemEur?: number;
};

export type InvoicePayResult = {
  success: boolean;
  alreadyPaid?: boolean;
  paymentId?: string;
  checkoutUrl?: string;
  processing?: boolean;
};

export type SavedPaymentMethod = {
  mandateId: string;
  label?: string | null;
  userLabel?: string | null;
  method?: string | null;
  brand?: string | null;
  last4?: string | null;
  isDefault?: boolean;
  createdAt?: string | null;
};

export type PaymentMethodsResult = {
  success: boolean;
  canManage: boolean;
  methods: SavedPaymentMethod[];
  defaultMandateId: string | null;
  maxMethods: number;
  canAddMore: boolean;
};

export class BillingResource extends ResourceClient {
  constructor(client: IgniteClient) {
    super(client);
  }

  invoices(limitOrFilters: number | InvoiceListFilters = 50) {
    return this.client.billing.invoices(limitOrFilters);
  }

  invoice(id: string) {
    return this.client.billing.invoice(id);
  }

  payInvoice(id: string, body: InvoicePayBody) {
    return this.client.billing.payInvoice(id, body);
  }

  netPointsPreview(orderTotal: number) {
    return this.client.billing.netPointsPreview(orderTotal);
  }

  subscriptions() {
    return this.client.billing.subscriptions();
  }

  paymentMethods() {
    return this.client.billing.paymentMethods();
  }

  addPaymentMethod() {
    return this.client.billing.addPaymentMethod();
  }

  setDefaultPaymentMethod(mandateId: string) {
    return this.client.billing.setDefaultPaymentMethod(mandateId);
  }

  updatePaymentMethodLabel(mandateId: string, userLabel: string, setDefault = false) {
    return this.client.billing.updatePaymentMethodLabel(mandateId, userLabel, setDefault);
  }

  deletePaymentMethod(mandateId: string) {
    return this.client.billing.deletePaymentMethod(mandateId);
  }

  disputeInvoice(id: string, reason: string) {
    return this.client.billing.dispute(id, { reason });
  }
}
