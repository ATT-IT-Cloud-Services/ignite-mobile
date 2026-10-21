import { ResourceClient } from "./resource-client";
import type { IgniteClient } from "@ignite/api-client";

export type CustomerDocument = {
  id: string;
  kind?: string;
  title?: string;
  status?: string;
  readAt?: string | null;
  createdAt?: string | null;
  response?: string | null;
};

/** Thin adapter over the generated `client.documents` resource. */
export class DocumentsResource extends ResourceClient {
  constructor(client: IgniteClient) {
    super(client);
  }

  list() {
    return this.client.documents.list() as unknown as Promise<{ success: boolean; documents?: CustomerDocument[] }>;
  }

  find(id: string) {
    return this.client.documents.find(id) as unknown as Promise<{ success: boolean; document?: CustomerDocument }>;
  }

  contracts() {
    return this.client.documents.contracts() as unknown as Promise<{ success: boolean; contracts?: Array<Record<string, unknown>> }>;
  }

  respond(id: string, response: "ACCEPT" | "DECLINE") {
    return this.client.documents.respond(id, { response }) as unknown as Promise<{ success: boolean }>;
  }
}
