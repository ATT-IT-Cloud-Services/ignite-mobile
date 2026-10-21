import { ResourceClient } from "../resource-client.js";
import type {
  CalculatePayload,
  CartCalculateResponse,
  CartValidateResponse,
  CheckoutBootstrap,
  CheckoutSubmitPayload,
  CheckoutSubmitResponse,
} from "../schemas/checkout.js";
import type { CountriesResponse } from "../schemas/shop.js";

export class CheckoutResource extends ResourceClient {
  /**
   * Load checkout bootstrap data (addresses, countries, billing config).
   * @throws {import("../errors.js").ApiError} `unauthenticated`
   */
  bootstrap() {
    return this.get<CheckoutBootstrap>("/checkout/bootstrap");
  }

  /**
   * List available billing countries.
   * @throws {import("../errors.js").ApiError} `failedToFetchCountries`
   */
  countries() {
    return this.get<CountriesResponse>("/public/countries");
  }

  /**
   * Validate cart items before checkout.
   * @throws {import("../errors.js").ApiError} `cartEmpty`, `catalogStockExhausted`, `checkoutValidationFailed`
   */
  validate(items: Array<Record<string, unknown>>) {
    return this.post<CartValidateResponse>("/cart/validate", { items });
  }

  /**
   * Calculate cart totals including tax.
   * @throws {import("../errors.js").ApiError} `calculationFailed`, `invalidRequest`
   */
  calculate(payload: CalculatePayload) {
    return this.post<CartCalculateResponse>("/cart/calculate", payload);
  }

  /**
   * Submit checkout and create order/subscription.
   * @throws {import("../errors.js").ApiError} `checkoutFailed`, `insufficientBalance`, `clientPlatformNotAllowed`, `familyBudgetExhausted`
   */
  submit(payload: CheckoutSubmitPayload) {
    return this.post<CheckoutSubmitResponse>("/checkout", payload);
  }

  // <generated-openapi>
  /**
   * @generated POST /cart/upgrade
   */
  upgrade(body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/cart/upgrade`, body);
  }

  /**
   * @generated POST /checkout/offers/validate
   */
  offersValidate(body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/checkout/offers/validate`, body);
  }
  // </generated-openapi>
}
