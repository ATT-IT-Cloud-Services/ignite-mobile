import { ResourceClient } from "../resource-client.js";
import type { QueryParams } from "../types.js";

/** Generated from apps/backend/app/openapi.generated.json. */
export class ThemeAssetsResource extends ResourceClient {
  /**
   * @generated GET /theme-assets/[slug]/[...file]
   */
  find(slug: string, file: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/theme-assets/${encodeURIComponent(slug)}/${file.replace(/^\//, "")}`, query);
  }
}
