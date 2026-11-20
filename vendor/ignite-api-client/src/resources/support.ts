import { ResourceClient } from "../resource-client.js";
import type { QueryParams } from "../types.js";
import type {
  KnowledgeBaseResponse,
  TicketDetailResponse,
  TicketListResponse,
} from "../schemas/ticket.js";
import type { SuccessResponse } from "../schemas/common.js";

export class SupportResource extends ResourceClient {
  /**
   * List support tickets.
   * @throws {import("../errors.js").ApiError} `unauthenticated`
   */
  tickets(limit = 100, status?: string) {
    return this.get<TicketListResponse>("/tickets", {
      limit,
      ...(status ? { status } : {}),
    });
  }

  /**
   * Get a single ticket.
   * @throws {import("../errors.js").ApiError} `ticketNotFound`, `unauthenticated`
   */
  ticket(id: string) {
    return this.get<TicketDetailResponse>(`/tickets/${id}`);
  }

  /**
   * Create a support ticket.
   * @throws {import("../errors.js").ApiError} `invalidPriority`, `unauthenticated`
   */
  createTicket(body: { subject: string; message: string; priority: string }) {
    return this.post<SuccessResponse & { ticket?: unknown }>("/tickets", body);
  }

  /**
   * Reply to a ticket.
   * @throws {import("../errors.js").ApiError} `ticketNotFound`, `unauthenticated`
   */
  reply(ticketId: string, content: string) {
    return this.post<SuccessResponse>(`/tickets/${ticketId}/messages`, { content });
  }

  /**
   * Browse knowledge base articles.
   * @throws {import("../errors.js").ApiError} `internalError`
   */
  knowledgeBase(lang?: string) {
    return this.get<KnowledgeBaseResponse>("/knowledge-base", { lang });
  }

  /**
   * Review prompts the customer should see on the dashboard right now
   * (`GET /feedback/prompts`): `{ enabled, queue }`, newest object first and
   * capped by the theme's queue size.
   * @throws {import("../errors.js").ApiError} `unauthenticated`
   */
  reviewPrompts() {
    return this.get<SuccessResponse & { enabled?: boolean; queue?: unknown[] }>("/feedback/prompts");
  }

  /**
   * Never ask for a review of this object again (`POST /feedback/prompts/dismiss`).
   * Pass exactly one of `ticketId` / `serviceId`.
   * @throws {import("../errors.js").ApiError} `feedbackExactlyOneLink`, `ticketNotFoundOrNotOwnedByYou`, `serviceNotFoundOrDoesNotBelongToUser`, `unauthenticated`
   */
  dismissReviewPrompt(body: { ticketId?: string; serviceId?: string }) {
    return this.post<SuccessResponse>("/feedback/prompts/dismiss", body);
  }

  // <generated-openapi>
  /**
   * @generated GET /feedback
   */
  list(query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/feedback`, query);
  }

  /**
   * @generated POST /feedback
   */
  create(body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/feedback`, body);
  }

  /**
   * @generated PATCH /tickets/[id]
   */
  update(id: string, body?: Record<string, unknown>) {
    return this.patch<Record<string, unknown>>(`/tickets/${encodeURIComponent(id)}`, body);
  }

  /**
   * @generated POST /tickets/[id]
   */
  postCreate(id: string, body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/tickets/${encodeURIComponent(id)}`, body);
  }

  /**
   * @generated GET /tickets/[id]/export
   */
  export(id: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/tickets/${encodeURIComponent(id)}/export`, query);
  }

  /**
   * @generated GET /tickets/attachable-services
   */
  attachableServices(query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/tickets/attachable-services`, query);
  }

  /**
   * @generated GET /tickets/share-candidates
   */
  shareCandidates(query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/tickets/share-candidates`, query);
  }
  // </generated-openapi>
}
