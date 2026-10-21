import { useCallback, useEffect, useState } from "react";
import { ArrowLeftRight, Loader2 } from "lucide-react";

import { api } from "../../../lib/api";
import { resolveCaughtApiError } from "../../../api/resolve-caught-error";
import { useI18n } from "../../../i18n";
import { useToast } from "../../Toast";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { AppModal } from "../../ui/AppModal";
import { ConfirmModal } from "../../ui/ConfirmModal";
import { Badge } from "../../ui/badge";
import { useProviderT } from "../use-provider-t";
import type { ProviderWidgetProps } from "../types";

type AliasEntry = {
  id: number;
  address: string;
  goto: string;
  domain: string;
  active: number;
};

export default function MailcowAliasesWidget({ serviceId, context }: ProviderWidgetProps) {
  const { t: tTyped } = useI18n();
  const t = useProviderT();
  const { show } = useToast();
  const id = serviceId || context?.server?.id || "";

  const [domains, setDomains] = useState<string[]>([]);
  const [selectedDomain, setSelectedDomain] = useState("");
  const [aliases, setAliases] = useState<AliasEntry[]>([]);
  const [loadingDomains, setLoadingDomains] = useState(true);
  const [loadingAliases, setLoadingAliases] = useState(false);

  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ address: "", goto: "" });
  const [adding, setAdding] = useState(false);
  const [deleteAliasId, setDeleteAliasId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoadingDomains(true);
    api.services
      .mailDomains(id)
      .then((data) => {
        if (cancelled) return;
        const names = Array.isArray(data.domains) ? data.domains.map((d) => d.name) : [];
        setDomains(names);
        if (names.length > 0) {
          setSelectedDomain((prev) => prev || names[0] || "");
        }
      })
      .catch(() => {
        if (!cancelled) setDomains([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingDomains(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const loadAliases = useCallback(async () => {
    if (!id || !selectedDomain) {
      setAliases([]);
      return;
    }
    setLoadingAliases(true);
    try {
      const data = await api.services.mailAliases(id, selectedDomain);
      setAliases(Array.isArray(data.aliases) ? data.aliases : []);
    } catch {
      setAliases([]);
    } finally {
      setLoadingAliases(false);
    }
  }, [id, selectedDomain]);

  useEffect(() => {
    void loadAliases();
  }, [loadAliases]);

  const handleAdd = async () => {
    if (!form.address || !form.goto) return;
    setAdding(true);
    try {
      await api.services.mailAliasesCreate(id, form);
      show(t("aliasCreated"), "success");
      setForm({ address: "", goto: "" });
      setShowAdd(false);
      await loadAliases();
    } catch (err) {
      show(resolveCaughtApiError(err, tTyped, "error"), "error");
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async () => {
    if (deleteAliasId === null) return;
    setDeleting(true);
    try {
      await api.services.mailAliasesDelete(id, deleteAliasId);
      show(t("aliasRemoved"), "success");
      setDeleteAliasId(null);
      await loadAliases();
    } catch (err) {
      show(resolveCaughtApiError(err, tTyped, "error"), "error");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <section className="glass p-4">
      <div className="flex items-center gap-2">
        <ArrowLeftRight className="size-5 shrink-0 text-(--text-muted)" />
        <h3 className="text-sm font-semibold text-(--text-primary)">{t("widgetMailcowAliases")}</h3>
      </div>

      <div className="mb-4 mt-3 flex min-h-9 flex-wrap items-center justify-between gap-3">
        <select
          value={selectedDomain}
          onChange={(e) => setSelectedDomain(e.target.value)}
          disabled={loadingDomains || domains.length === 0}
          className="min-h-11 rounded-(--radius-control) border border-border bg-(--bg-elevated) px-3 text-sm text-(--text-primary) disabled:opacity-50"
        >
          <option value="">{loadingDomains ? "…" : t("selectDomain")}</option>
          {domains.map((domain) => (
            <option key={domain} value={domain}>
              {domain}
            </option>
          ))}
        </select>
        <Button
          type="button"
          onClick={() => {
            setForm({ address: selectedDomain ? `@${selectedDomain}` : "", goto: "" });
            setShowAdd(true);
          }}
          disabled={!selectedDomain}
          className="btn-primary min-h-11 shrink-0 rounded-xl px-4"
        >
          {t("addAlias")}
        </Button>
      </div>

      {!selectedDomain && !loadingDomains ? (
        <p className="py-8 text-center text-sm text-(--text-muted)">
          {domains.length === 0 ? t("connectDomainFirst") : t("selectDomainToViewAliases")}
        </p>
      ) : loadingAliases || loadingDomains ? (
        <div className="space-y-3" aria-hidden>
          {[1, 2].map((i) => (
            <div key={i} className="h-14 animate-pulse rounded-xl bg-white/5" />
          ))}
        </div>
      ) : aliases.length > 0 ? (
        <div className="space-y-3">
          {aliases.map((alias) => (
            <div key={alias.id} className="rounded-xl bg-white/5 p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="truncate font-medium text-(--text-primary)">{alias.address}</div>
                  <div className="truncate text-xs text-(--text-muted)">→ {alias.goto}</div>
                </div>
                <Badge variant={alias.active === 1 ? "success" : "warning"}>
                  {alias.active === 1 ? t("active") : t("inactive")}
                </Badge>
              </div>
              <div className="mt-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setDeleteAliasId(alias.id)}
                  className="min-h-11 rounded-xl px-3 text-sm text-(--error)"
                >
                  {t("delete")}
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="py-8 text-center text-sm text-(--text-muted)">{t("noAliasesYet")}</p>
      )}

      <AppModal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        closeAriaLabel={t("close")}
        closeDisabled={adding}
        className="space-y-4 p-5"
      >
        <h2 className="text-lg font-semibold text-(--text-primary)">{t("addAlias")}</h2>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-(--text-muted)">
            {t("aliasAddress")} *
          </label>
          <Input
            value={form.address}
            onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
            placeholder={`info@${selectedDomain || "example.com"}`}
            className="min-h-11"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-(--text-muted)">
            {t("destinationAddress")} *
          </label>
          <Input
            value={form.goto}
            onChange={(e) => setForm((f) => ({ ...f, goto: e.target.value }))}
            className="min-h-11"
          />
        </div>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={() => setShowAdd(false)} disabled={adding} className="rounded-xl">
            {t("cancel")}
          </Button>
          <Button
            onClick={() => void handleAdd()}
            disabled={adding || !form.address || !form.goto}
            className="btn-primary justify-center rounded-xl"
          >
            {adding ? <Loader2 className="size-4 animate-spin" /> : t("add")}
          </Button>
        </div>
      </AppModal>

      <ConfirmModal
        open={deleteAliasId !== null}
        title={t("deleteAlias")}
        description={t("deleteAliasConfirm")}
        confirmLabel={t("delete")}
        cancelLabel={t("cancel")}
        onConfirm={() => void handleDelete()}
        onCancel={() => setDeleteAliasId(null)}
        destructive
        isLoading={deleting}
      />
    </section>
  );
}
