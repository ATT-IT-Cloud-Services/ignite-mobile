import { useEffect, useState } from "react";
import { ArrowLeft, Loader2, ThumbsDown, ThumbsUp } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { useI18n } from "../i18n";
import { api } from "../lib/api";
import type { BlogDetail } from "../api/blog";
import { useRouter } from "../components/Router";
import { useToast } from "../components/Toast";
import { cn } from "../lib/utils";

function formatDate(value: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("de-DE", { year: "numeric", month: "long", day: "numeric" });
}

export function BlogDetailScreen({ slug }: { slug: string }) {
  const { t, lang } = useI18n();
  const { back } = useRouter();
  const { show } = useToast();

  const [post, setPost] = useState<BlogDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showOriginal, setShowOriginal] = useState(false);
  const [userVote, setUserVote] = useState<"like" | "dislike" | null>(null);
  const [voting, setVoting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await api.blog.detail(slug, lang);
        if (cancelled) return;
        if (data.success && data.post) {
          setPost(data.post);
          setUserVote(data.post.userVote ?? null);
        } else {
          setError(t("unknownError"));
        }
      } catch {
        if (!cancelled) setError(t("networkError"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug, lang, t]);

  async function vote(value: "like" | "dislike") {
    if (!post?.authenticated || voting) return;
    setVoting(true);
    try {
      const nextValue = userVote === value ? null : value;
      const data = await api.blog.vote(slug, nextValue);
      if (data.success) setUserVote(data.vote ?? null);
      else show(t("unknownError"), "error");
    } catch {
      show(t("networkError"), "error");
    } finally {
      setVoting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center py-12">
        <Loader2 className="size-6 animate-spin" style={{ color: "var(--primary)" }} />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-8">
        <button type="button" onClick={back} className="mb-4 inline-flex items-center gap-2 text-sm text-(--text-secondary)">
          <ArrowLeft className="size-4" />
          {t("back")}
        </button>
        <p className="text-sm text-(--text-muted)">{error ?? t("unknownError")}</p>
      </div>
    );
  }

  const isTranslated = post.isAutomatic && post.original && post.language !== post.original.language;
  const title = showOriginal && post.original ? post.original.title : post.title;
  const content = showOriginal && post.original ? post.original.content : post.content;
  const hasCover = Boolean(post.coverImage);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col page-fullwidth">
      <style>{`
        .blog-content h1, .blog-content h2, .blog-content h3 {
          color: var(--text-primary);
          margin: 1.25rem 0 0.5rem;
          font-weight: 600;
          line-height: 1.3;
        }
        .blog-content h1 { font-size: 1.5rem; }
        .blog-content h2 { font-size: 1.25rem; }
        .blog-content h3 { font-size: 1.1rem; }
        .blog-content p { margin: 0.5rem 0; }
        .blog-content a { color: var(--primary); }
        .blog-content ul, .blog-content ol { padding-left: 1.25rem; margin: 0.5rem 0; }
        .blog-content ul { list-style: disc; }
        .blog-content ol { list-style: decimal; }
        .blog-content code {
          font-family: monospace;
          background: rgba(255, 255, 255, 0.08);
          padding: 0.1rem 0.3rem;
          border-radius: 0.25rem;
        }
        .blog-content pre {
          background: var(--bg-elevated);
          border: 1px solid var(--border);
          padding: 0.75rem;
          border-radius: 0.5rem;
          overflow-x: auto;
        }
        .blog-content img { max-width: 100%; height: auto; border-radius: 0.5rem; }
        .blog-content blockquote {
          border-left: 3px solid var(--border);
          padding-left: 0.75rem;
          color: var(--text-muted);
        }
        .blog-content table { border-collapse: collapse; width: 100%; }
        .blog-content th, .blog-content td { border: 1px solid var(--border); padding: 0.4rem 0.6rem; text-align: left; }
      `}</style>

      <div className="safe-x safe-top flex items-center gap-3 px-4 py-3">
        <button type="button" onClick={back} className="rounded-lg p-1.5 text-(--text-secondary) hover:bg-(--bg-elevated)">
          <ArrowLeft className="size-5" />
        </button>
        {!hasCover ? <h1 className="truncate text-base font-semibold text-(--text-primary)">{title}</h1> : null}
      </div>

      <main className="safe-x safe-bottom flex-1 overflow-y-auto pb-4">
        {hasCover ? (
          <div className="relative aspect-video w-full">
            <img src={post.coverImage ?? undefined} alt="" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-linear-to-t from-black/75 via-black/25 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-4">
              {post.publishedAt ? (
                <p className="mb-1 text-xs uppercase tracking-wide text-white/75">{formatDate(post.publishedAt)}</p>
              ) : null}
              <h1 className="text-2xl font-bold tracking-tight text-white">{title}</h1>
            </div>
          </div>
        ) : null}

        <div className="px-4">
          {!hasCover && post.publishedAt ? (
            <p className="text-xs uppercase tracking-wide text-(--text-muted)">{formatDate(post.publishedAt)}</p>
          ) : null}

          <div className="blog-content mt-3 text-sm leading-relaxed text-(--text-secondary)">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
          </div>

        <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-border pt-4">
          <span className="text-sm text-(--text-secondary)">{t("blogVoteHelpful")}</span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => vote("like")}
              disabled={voting || !post.authenticated}
              aria-pressed={userVote === "like"}
              aria-label={t("blogLike")}
              className={cn(
                "grid h-11 w-11 place-items-center rounded-control border border-border p-2 transition-colors hover:border-(--border-hover) disabled:opacity-50",
              )}
            >
              <ThumbsUp className={cn("size-5", userVote === "like" ? "text-primary" : "text-(--text-secondary)")} />
            </button>
            <button
              type="button"
              onClick={() => vote("dislike")}
              disabled={voting || !post.authenticated}
              aria-pressed={userVote === "dislike"}
              aria-label={t("blogDislike")}
              className="grid h-11 w-11 place-items-center rounded-control border border-border p-2 transition-colors hover:border-(--border-hover) disabled:opacity-50"
            >
              <ThumbsDown className={cn("size-5", userVote === "dislike" ? "text-primary" : "text-(--text-secondary)")} />
            </button>
          </div>
          {!post.authenticated ? (
            <span className="text-xs text-(--text-muted)">{t("blogLoginToVote")}</span>
          ) : null}
        </div>

        {isTranslated ? (
          <div className="mt-6 rounded-surface border border-border bg-(--bg-card) p-4">
            <p className="text-xs text-(--text-muted)">{t("blogAutoTranslated")}</p>
            <button
              type="button"
              onClick={() => setShowOriginal((value) => !value)}
              className="mt-2 text-xs font-medium text-primary hover:underline"
            >
              {showOriginal ? t("blogShowTranslation") : t("blogShowOriginal")}
            </button>
          </div>
        ) : null}
        </div>
      </main>
    </div>
  );
}
