import { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import { useI18n } from "../i18n";
import { api } from "../lib/api";
import type { BlogSummary } from "../api/blog";
import { useRouter } from "../components/Router";

function formatDate(value: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("de-DE", { year: "numeric", month: "long", day: "numeric" });
}

export function BlogScreen() {
  const { t, lang } = useI18n();
  const { navigate } = useRouter();
  const [posts, setPosts] = useState<BlogSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.blog.list(lang);
      if (data.success) setPosts(data.posts ?? []);
      else setError(t("unknownError"));
    } catch {
      setError(t("networkError"));
    } finally {
      setLoading(false);
    }
  }, [lang, t]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-6 lg:px-6 lg:py-8">
      <header className="mb-6">
        <h1 className="text-xl font-semibold text-(--text-primary)">{t("blogTitle")}</h1>
      </header>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="size-6 animate-spin" style={{ color: "var(--primary)" }} />
        </div>
      ) : error ? (
        <div className="text-sm text-(--text-muted)">{error}</div>
      ) : posts.length === 0 ? (
        <p className="text-sm text-(--text-muted)">{t("blogEmpty")}</p>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <button
              key={post.slug}
              type="button"
              onClick={() => navigate({ name: "blog-detail", slug: post.slug })}
              className="glass w-full rounded-surface border border-border p-4 text-left transition-colors hover:border-(--border-hover)"
            >
              {post.coverImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={post.coverImage}
                  alt=""
                  loading="lazy"
                  className="mb-3 aspect-video w-full rounded-control object-cover"
                />
              ) : null}
              <p className="text-xs text-(--text-muted)">{formatDate(post.publishedAt)}</p>
              <h2 className="mt-1 text-base font-medium text-(--text-primary)">{post.title}</h2>
              {post.excerpt ? (
                <p className="mt-1 line-clamp-2 text-sm text-(--text-secondary)">{post.excerpt}</p>
              ) : null}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
