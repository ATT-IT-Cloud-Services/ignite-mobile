import { ResourceClient } from "../resource-client.js";
import type { QueryParams } from "../types.js";
import type { CountriesResponse, ProductsResponse } from "../schemas/shop.js";

export class ShopResource extends ResourceClient {
  /**
   * List product catalog.
   * @throws {import("../errors.js").ApiError} `internalError`
   */
  products(lang?: string) {
    return this.get<ProductsResponse>("/products", { lang });
  }

  /**
   * List available billing countries.
   * @throws {import("../errors.js").ApiError} `failedToFetchCountries`
   */
  countries() {
    return this.get<CountriesResponse>("/public/countries");
  }

  // <generated-openapi>
  /**
   * @generated GET /categories/[id]/upgrade-config
   */
  upgradeConfig(id: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/categories/${encodeURIComponent(id)}/upgrade-config`, query);
  }

  /**
   * @generated GET /products/[category]
   */
  find(category: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/products/${encodeURIComponent(category)}`, query);
  }

  /**
   * @generated GET /products/[category]/[product]
   */
  getFind(category: string, product: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/products/${encodeURIComponent(category)}/${encodeURIComponent(product)}`, query);
  }

  /**
   * @generated GET /products/[category]/[product]/view
   */
  view(category: string, product: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/products/${encodeURIComponent(category)}/${encodeURIComponent(product)}/view`, query);
  }

  /**
   * @generated GET /products/[category]/view
   */
  getView(category: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/products/${encodeURIComponent(category)}/view`, query);
  }

  /**
   * @generated GET /products/by-slug/[slug]
   */
  bySlug(slug: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/products/by-slug/${encodeURIComponent(slug)}`, query);
  }

  /**
   * @generated GET /products/locations
   */
  locations(query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/products/locations`, query);
  }

  /**
   * @generated POST /products/proxmox-slot-preview
   */
  proxmoxSlotPreview(body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/products/proxmox-slot-preview`, body);
  }

  /**
   * @generated GET /products/templates
   */
  templates(query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/products/templates`, query);
  }
  // </generated-openapi>
}
