import { ResourceClient } from "./resource-client";
import type { IgniteClient } from "@ignite/api-client";

export class SupportResource extends ResourceClient {
  constructor(client: IgniteClient) {
    super(client);
  }

  tickets(limit = 100, status?: string) {
    return this.client.support.tickets(limit, status) as Promise<{
      success: boolean;
      tickets: unknown[];
      stats?: unknown;
      pagination?: { total: number };
    }>;
  }

  ticket(id: string) {
    return this.client.support.ticket(id) as Promise<{ success: boolean; ticket: unknown }>;
  }

  createTicket(body: {
    subject: string;
    message: string;
    priority?: string;
    serviceId?: string;
    shareWithUserIds?: string[];
  }) {
    return this.client.support.createTicket(
      body as { subject: string; message: string; priority: string },
    ) as Promise<{ success: boolean; ticket?: unknown; error?: string }>;
  }

  reply(ticketId: string, content: string) {
    return this.client.support.postCreate(ticketId, { message: content }) as Promise<{
      success: boolean;
      error?: string;
    }>;
  }

  attachableServices() {
    return this.client.support.attachableServices() as Promise<{
      success: boolean;
      services: Array<{ id: string; name: string; owned: boolean }>;
    }>;
  }

  shareCandidates(serviceId: string) {
    return this.client.support.shareCandidates({ serviceId }) as Promise<{
      success: boolean;
      candidates: Array<{ id: string; displayName: string; email: string }>;
    }>;
  }

  knowledgeBase(lang?: string) {
    return this.client.support.knowledgeBase(lang) as Promise<{ success: boolean; articles: unknown[] }>;
  }
}
