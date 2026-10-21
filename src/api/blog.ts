import { ResourceClient } from "./resource-client";
import type { IgniteClient } from "@ignite/api-client";

export type BlogSummary = {
  slug: string;
  title: string;
  excerpt: string | null;
  coverImage: string | null;
  publishedAt: string | null;
  language: string;
};

export type BlogDetail = {
  slug: string;
  coverImage: string | null;
  publishedAt: string | null;
  originalLanguage: string;
  language: string;
  title: string;
  excerpt: string | null;
  content: string;
  isAutomatic: boolean;
  authenticated: boolean;
  userVote: "like" | "dislike" | null;
  original: {
    language: string;
    title: string;
    excerpt: string | null;
    content: string;
  } | null;
};

export class BlogResource extends ResourceClient {
  constructor(client: IgniteClient) {
    super(client);
  }

  list(lang = "de") {
    return this.client.get<{ success: boolean; posts: BlogSummary[] }>(
      `/public/blog?lang=${encodeURIComponent(lang)}`,
    );
  }

  detail(slug: string, lang = "de") {
    return this.client.get<{ success: boolean; post: BlogDetail }>(
      `/public/blog/${encodeURIComponent(slug)}?lang=${encodeURIComponent(lang)}`,
    );
  }

  vote(slug: string, value: "like" | "dislike" | null) {
    return this.client.post<{ success: boolean; vote: "like" | "dislike" | null }>(
      `/blog-posts/${encodeURIComponent(slug)}/vote`,
      { value },
    );
  }
}
