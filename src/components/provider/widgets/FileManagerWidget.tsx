import { useCallback, useEffect, useState } from "react";
import { File as FileIcon, Folder, Loader2 } from "lucide-react";

import { api } from "../../../lib/api";
import { useProviderT } from "../use-provider-t";
import type { ProviderWidgetProps } from "../types";

type FileEntry = { name: string; size?: number; isFile?: boolean; isSymlink?: boolean; modifiedAt?: string };

/** Mobile port of the web "file-manager" widget (Pterodactyl) — read/browse. */
export default function FileManagerWidget({ serviceId, context }: ProviderWidgetProps) {
  const t = useProviderT();
  const id = context?.server?.id ?? serviceId ?? "";
  const [dir, setDir] = useState("/");
  const [entries, setEntries] = useState<FileEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState<{ path: string; text: string } | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await api.services.files(id, dir);
      const list = Array.isArray(res.files) ? (res.files as FileEntry[]) : [];
      setEntries([...list].sort((a, b) => Number(a.isFile) - Number(b.isFile) || a.name.localeCompare(b.name)));
    } catch {
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, [id, dir]);

  useEffect(() => {
    void load();
  }, [load]);

  const open = async (entry: FileEntry) => {
    const path = `${dir.replace(/\/$/, "")}/${entry.name}`;
    if (!entry.isFile) {
      setDir(path || "/");
      return;
    }
    try {
      const res = await api.services.readFile(id, path);
      setContent({ path, text: res.content ?? "" });
    } catch {
      /* ignore */
    }
  };

  const parent = dir !== "/" ? dir.split("/").slice(0, -1).join("/") || "/" : "/";

  return (
    <section className="glass space-y-3 p-4">
      <div className="flex items-center gap-2">
        <Folder className="size-5 text-(--text-muted)" />
        <h3 className="text-sm font-semibold text-(--text-primary)">{t("widgetFiles")}</h3>
      </div>
      <div className="flex items-center gap-2 text-xs">
        <button type="button" onClick={() => setDir(parent)} className="rounded-lg border border-border px-2 py-1">..</button>
        <span className="truncate font-mono text-(--text-muted)">{dir}</span>
      </div>
      {loading ? (
        <div className="flex h-16 items-center justify-center text-(--text-muted)"><Loader2 className="size-5 animate-spin" /></div>
      ) : entries.length === 0 ? (
        <p className="text-xs text-(--text-muted)">{t("providerWidgetUnavailable")}</p>
      ) : (
        <div className="space-y-1">
          {entries.map((entry) => (
            <button key={entry.name} type="button" onClick={() => void open(entry)} className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-(--surface-soft)">
              {entry.isFile ? <FileIcon className="size-4 text-(--text-muted)" /> : <Folder className="size-4 text-(--primary)" />}
              <span className="min-w-0 flex-1 truncate text-(--text-primary)">{entry.name}</span>
              {entry.size != null ? <span className="text-[11px] text-(--text-muted)">{Math.round(entry.size / 1024)} KB</span> : null}
            </button>
          ))}
        </div>
      )}
      {content ? (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="truncate font-mono text-(--text-muted)">{content.path}</span>
            <button type="button" onClick={() => setContent(null)} className="text-(--text-muted)">×</button>
          </div>
          <pre className="max-h-64 overflow-auto rounded-xl bg-black/30 p-3 text-[11px] text-(--text-primary)">{content.text}</pre>
        </div>
      ) : null}
    </section>
  );
}
