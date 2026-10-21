import { ResourceClient } from "../resource-client.js";

/** Generated from apps/backend/app/openapi.generated.json. */
export class BlogPostsResource extends ResourceClient {
  /**
   * @generated POST /blog-posts/[slug]/vote
   */
  vote(slug: string, body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/blog-posts/${encodeURIComponent(slug)}/vote`, body);
  }
}
