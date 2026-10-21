import type { ShopProductDetail, ShopUpgradeConfig } from "../lib/shop-product-detail";
import { ResourceClient } from "./resource-client";
import type { IgniteClient } from "@ignite/api-client";

export class ShopResource extends ResourceClient {
  constructor(client: IgniteClient) {
    super(client);
  }

  products(lang?: string) {
    return this.client.shop.products(lang) as Promise<{
      success: boolean;
      categories?: unknown[];
      businessPricing?: { upchargePercent: number; taxRatePercent: number } | null;
      defaultTaxName?: string;
    }>;
  }

  category(categoryKey: string, lang?: string) {
    return this.client.shop.find(categoryKey, { lang }) as Promise<{
      success: boolean;
      category?: unknown;
      businessPricing?: { upchargePercent: number; taxRatePercent: number } | null;
      defaultTaxName?: string;
    }>;
  }

  countries() {
    return this.client.shop.countries() as Promise<{
      success: boolean;
      countries: Array<{ countryCode: string; countryName: string; isDefault?: boolean }>;
    }>;
  }

  upgradeConfig(categoryId: string) {
    return this.client.shop.upgradeConfig(categoryId) as Promise<{
      success: boolean;
      config?: ShopUpgradeConfig | null;
    }>;
  }

  productDetail(categoryKey: string, productSlug: string, lang?: string) {
    return this.client.shop.getFind(categoryKey, productSlug, { lang }) as Promise<{
      success: boolean;
      product?: ShopProductDetail & { category?: unknown };
      category?: unknown;
      businessPricing?: { upchargePercent: number; taxRatePercent: number } | null;
      defaultTaxName?: string;
    }>;
  }

  productLocations(productId: string) {
    return this.client.shop.locations({ productIds: productId }) as Promise<{
      success: boolean;
      locations?: Array<{ id: string; name: string; city?: string; country?: string }>;
    }>;
  }

  productView(categoryKey: string, productSlug: string) {
    return this.client.shop.view(categoryKey, productSlug) as Promise<Record<string, unknown>>;
  }

  productTemplates(productId: string) {
    return this.client.shop.templates({ productId }) as Promise<{
      success: boolean;
      templates?: Array<{
        templateId: number;
        name: string;
        displayName: string;
        cloudInitSupport: boolean;
        cloudInitUsername?: string;
      }>;
    }>;
  }

  publicSettings() {
    return this.client.publicSettings.list() as Promise<{ success: boolean; settings?: Record<string, unknown> }>;
  }
}
