import { useCallback, useEffect, useState } from "react";
import { Check, FileText, Loader2, X } from "lucide-react";

import { useToast } from "../components/Toast";
import { useI18n } from "../i18n";
import { api } from "../lib/api";
import type { CustomerDocument } from "../api/documents";

/** Customer documents archive (mobile port of /dashboard/documents). */
export function DocumentsScreen() {
  const { t } = useI18n();
  const { show } = useToast();
  const [documents, setDocuments] = useState<CustomerDocument[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.documents.list();
      setDocuments(Array.isArray(res.documents) ? res.documents : []);
    } catch {
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const open = async (doc: CustomerDocument) => {
    try {
      await api.documents.find(doc.id);
      setDocuments((prev) => prev.map((d) => (d.id === doc.id ? { ...d, status: "READ" } : d)));
    } catch {
      /* ignore */
    }
  };

  const respond = async (doc: CustomerDocument, response: "ACCEPT" | "DECLINE") => {
    try {
      await api.documents.respond(doc.id, response);
      show(t("documentsResponded"), "success");
      await load();
    } catch {
      show(t("somethingWentWrong"), "error");
    }
  };

  return (
    <div className="mx-auto w-full max-w-3xl space-y-4 py-4">
      <h1 className="text-2xl font-semibold text-(--text-primary)">{t("documentsTitle")}</h1>
      {loading && documents.length === 0 ? (
        <div className="flex h-24 items-center justify-center text-(--text-muted)"><Loader2 className="size-5 animate-spin" /></div>
      ) : documents.length === 0 ? (
        <p className="text-sm text-(--text-muted)">{t("providerWidgetUnavailable")}</p>
      ) : (
        <div className="space-y-2">
          {documents.map((doc) => (
            <div key={doc.id} className="glass space-y-2 rounded-xl p-4">
              <button type="button" onClick={() => void open(doc)} className="flex w-full items-center gap-3 text-left">
                <FileText className="size-5 shrink-0 text-(--text-muted)" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-(--text-primary)">{doc.title ?? doc.kind ?? doc.id}</span>
                  <span className="block text-[11px] text-(--text-muted)">
                    {doc.status ?? ""}{doc.createdAt ? ` · ${new Date(doc.createdAt).toLocaleDateString()}` : ""}
                  </span>
                </span>
              </button>
              {(doc.kind ?? "").toUpperCase().includes("OFFER") && !doc.response ? (
                <div className="flex gap-2">
                  <button type="button" onClick={() => void respond(doc, "ACCEPT")} className="btn-primary inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs">
                    <Check className="size-4" /> {t("accept")}
                  </button>
                  <button type="button" onClick={() => void respond(doc, "DECLINE")} className="glass inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs">
                    <X className="size-4" /> {t("decline")}
                  </button>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
