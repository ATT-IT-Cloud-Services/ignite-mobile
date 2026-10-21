export interface Ticket {
  id: string;
  subject: string;
  status: string;
  priority: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface TicketListResponse {
  success: boolean;
  tickets: Ticket[];
  stats?: Record<string, unknown>;
  pagination?: { total: number };
}

export interface TicketDetailResponse {
  success: boolean;
  ticket: Ticket;
}

export interface KnowledgeBaseArticle {
  id: string;
  title: string;
  slug?: string;
  [key: string]: unknown;
}

export interface KnowledgeBaseResponse {
  success: boolean;
  articles: KnowledgeBaseArticle[];
}
