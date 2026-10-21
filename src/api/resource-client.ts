import type { IgniteClient } from "@ignite/api-client";

/**
 * Base class for mobile API facades.
 *
 * Mobile facades are thin, typed adapters over the generated `@ignite/api-client`
 * (single source of truth for paths and HTTP semantics). They never define their
 * own routes — every call delegates to a generated resource method, so the two
 * layers cannot drift apart.
 */
export abstract class ResourceClient {
  protected readonly client: IgniteClient;

  constructor(client: IgniteClient) {
    this.client = client;
  }
}
