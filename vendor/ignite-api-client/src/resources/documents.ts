import { ResourceClient } from "../resource-client.js";
import type { QueryParams } from "../types.js";

/** Generated from apps/backend/app/openapi.generated.json. */
export class DocumentsResource extends ResourceClient {
  /**
   * @generated GET /documents
   */
  list(query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/documents`, query);
  }

  /**
   * @generated GET /documents/[id]
   */
  find(id: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/documents/${encodeURIComponent(id)}`, query);
  }

  /**
   * @generated GET /documents/[id]/pdf
   */
  pdf(id: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/documents/${encodeURIComponent(id)}/pdf`, query);
  }

  /**
   * @generated POST /documents/[id]/respond
   */
  respond(id: string, body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/documents/${encodeURIComponent(id)}/respond`, body);
  }

  /**
   * @generated GET /documents/contracts
   */
  contracts(query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/documents/contracts`, query);
  }

  /**
   * @generated GET /documents/contracts/[id]/versions/[version]/files/[filename]
   */
  contractsVersionsFiles(id: string, version: string, filename: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/documents/contracts/${encodeURIComponent(id)}/versions/${encodeURIComponent(version)}/files/${encodeURIComponent(filename)}`, query);
  }

  /**
   * @generated POST /documents/contracts/[id]/versions/[version]/respond
   */
  contractsVersionsRespond(id: string, version: string, body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/documents/contracts/${encodeURIComponent(id)}/versions/${encodeURIComponent(version)}/respond`, body);
  }
}
