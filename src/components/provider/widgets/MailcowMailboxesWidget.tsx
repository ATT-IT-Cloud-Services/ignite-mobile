import { useCallback, useEffect, useState } from "react";
import { Loader2, Mail } from "lucide-react";

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

type MailboxEntry = {
  address: string;
  domain: string;
  name: string;
  quotaGb: number;
  active: boolean;
};

function generatePassword(): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*";
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => chars[b % chars.length]).join("");
}

export default function MailcowMailboxesWidget({ serviceId, context }: ProviderWidgetProps) {
  const { t: tTyped } = useI18n();
  const t = useProviderT();
  const { show } = useToast();
  const id = serviceId || context?.server?.id || "";

  const [mailboxes, setMailboxes] = useState<MailboxEntry[]>([]);
  const [domains, setDomains] = useState<string[]>([]);
  const [limits, setLimits] = useState({ maxPerDomain: 0, storagePerMailboxGb: 0 });
  const [loading, setLoading] = useState(true);

  const [domainFilter, setDomainFilter] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ localPart: "", domain: "", name: "", quotaGb: "" });
  const [adding, setAdding] = useState(false);
  const [deleteAddress, setDeleteAddress] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [resetAddress, setResetAddress] = useState<string | null>(null);
  const [resetting, setResetting] = useState(false);
  const [shownPassword, setShownPassword] = useState<{ address: string; password: string } | null>(
    null,
  );
  const [editingMailbox, setEditingMailbox] = useState<MailboxEntry | null>(null);
  const [editForm, setEditForm] = useState({ name: "", quotaGb: "", active: true });
  const [savingEdit, setSavingEdit] = useState(false);

  const loadData = useCallback(async () => {
    if (!id) return;
    try {
      const [mailboxData, domainData] = await Promise.all([
        api.services.mailMailboxes(id, domainFilter || undefined),
        api.services.mailDomains(id),
      ]);
      setMailboxes(Array.isArray(mailboxData.mailboxes) ? mailboxData.mailboxes : []);
      setLimits(mailboxData.limits || { maxPerDomain: 0, storagePerMailboxGb: 0 });
      if (Array.isArray(domainData.domains)) {
        setDomains(domainData.domains.map((d) => d.name));
      }
    } catch {
      // keep previous
    } finally {
      setLoading(false);
    }
  }, [id, domainFilter]);

  useEffect(() => {
    setLoading(true);
    void loadData();
  }, [loadData]);

  const handleAdd = async () => {
    if (!form.localPart || !form.domain || !form.name) return;
    const password = generatePassword();
    setAdding(true);
    try {
      await api.services.mailMailboxesCreate(id, {
        localPart: form.localPart,
        domain: form.domain,
        name: form.name,
        password,
        quotaGb: form.quotaGb ? Number(form.quotaGb) : undefined,
      });
      const address = `${form.localPart}@${form.domain}`;
      setForm({ localPart: "", domain: "", name: "", quotaGb: "" });
      setShowAdd(false);
      setShownPassword({ address, password });
      await loadData();
      context?.onRefresh?.();
    } catch (err) {
      show(resolveCaughtApiError(err, tTyped, "error"), "error");
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteAddress) return;
    setDeleting(true);
    try {
      await api.services.mailMailboxesDelete(id, deleteAddress);
      show(t("mailboxRemoved"), "success");
      setDeleteAddress(null);
      await loadData();
      context?.onRefresh?.();
    } catch (err) {
      show(resolveCaughtApiError(err, tTyped, "error"), "error");
    } finally {
      setDeleting(false);
    }
  };

  const handleEditMailbox = async () => {
    if (!editingMailbox) return;
    setSavingEdit(true);
    try {
      const updates: Record<string, unknown> = { address: editingMailbox.address };
      if (editForm.name) updates.name = editForm.name;
      if (editForm.quotaGb) updates.quotaGb = Number(editForm.quotaGb);
      updates.active = editForm.active;
      await api.services.mailMailboxesPatch(id, updates);
      show(t("mailboxUpdated"), "success");
      setEditingMailbox(null);
      await loadData();
      context?.onRefresh?.();
    } catch (err) {
      show(resolveCaughtApiError(err, tTyped, "error"), "error");
    } finally {
      setSavingEdit(false);
    }
  };

  const resetPasswordFor = async (address: string): Promise<boolean> => {
    const password = generatePassword();
    setResetting(true);
    try {
      await api.services.mailMailboxesPatch(id, { address, password });
      setShownPassword({ address, password });
      return true;
    } catch (err) {
      show(resolveCaughtApiError(err, tTyped, "error"), "error");
      return false;
    } finally {
      setResetting(false);
    }
  };

  const handleResetPassword = async () => {
    if (!resetAddress) return;
    await resetPasswordFor(resetAddress);
    setResetAddress(null);
  };

  const handleResetPasswordFromEdit = async () => {
    if (!editingMailbox) return;
    const ok = await resetPasswordFor(editingMailbox.address);
    if (ok) setEditingMailbox(null);
  };

  return (
    <section className="glass p-4">
      <div className="flex items-center gap-2">
        <Mail className="size-5 shrink-0 text-(--text-muted)" />
        <h3 className="text-sm font-semibold text-(--text-primary)">{t("widgetMailcowMailboxes")}</h3>
      </div>

      <div className="mb-4 mt-3 flex min-h-9 flex-wrap items-center justify-between gap-3">
        <select
          value={domainFilter}
          onChange={(e) => setDomainFilter(e.target.value)}
          disabled={loading && domains.length === 0}
          className="min-h-11 rounded-(--radius-control) border border-border bg-(--bg-elevated) px-3 text-sm text-(--text-primary) disabled:opacity-50"
        >
          <option value="">{t("allDomains")}</option>
          {domains.map((domain) => (
            <option key={domain} value={domain}>
              {domain}
            </option>
          ))}
        </select>
        <Button
          type="button"
          onClick={() => setShowAdd(true)}
          disabled={loading || domains.length === 0}
          className="btn-primary min-h-11 shrink-0 rounded-xl px-4"
          title={domains.length === 0 ? t("connectDomainFirst") : undefined}
        >
          {t("addMailbox")}
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3" aria-hidden>
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 animate-pulse rounded-xl bg-white/5" />
          ))}
        </div>
      ) : mailboxes.length > 0 ? (
        <div className="space-y-3">
          {mailboxes.map((mailbox) => (
            <div key={mailbox.address} className="rounded-xl bg-white/5 p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="truncate font-medium text-(--text-primary)">{mailbox.address}</div>
                  <div className="text-xs text-(--text-muted)">
                    {mailbox.name}
                    {mailbox.quotaGb > 0 ? ` · ${mailbox.quotaGb} GB` : ""}
                  </div>
                </div>
                <Badge variant={mailbox.active ? "success" : "warning"}>
                  {mailbox.active ? t("active") : t("inactive")}
                </Badge>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setEditingMailbox(mailbox);
                    setEditForm({
                      name: mailbox.name,
                      quotaGb: String(mailbox.quotaGb),
                      active: mailbox.active,
                    });
                  }}
                  className="min-h-11 rounded-xl px-3 text-sm"
                >
                  {t("edit")}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setResetAddress(mailbox.address)}
                  className="min-h-11 rounded-xl px-3 text-sm"
                >
                  {t("mailboxResetPassword")}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setDeleteAddress(mailbox.address)}
                  className="min-h-11 rounded-xl px-3 text-sm text-(--error)"
                >
                  {t("delete")}
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="py-8 text-center text-sm text-(--text-muted)">
          {domains.length === 0 ? t("connectDomainFirst") : t("noMailboxesYet")}
        </p>
      )}

      <AppModal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        closeAriaLabel={t("close")}
        closeDisabled={adding}
        className="space-y-4 p-5"
      >
        <h2 className="text-lg font-semibold text-(--text-primary)">{t("addMailbox")}</h2>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-(--text-muted)">
              {t("localPart")} *
            </label>
            <Input
              value={form.localPart}
              onChange={(e) => setForm((f) => ({ ...f, localPart: e.target.value }))}
              placeholder="info"
              className="min-h-11"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-(--text-muted)">
              {t("domainName")} *
            </label>
            <select
              value={form.domain}
              onChange={(e) => setForm((f) => ({ ...f, domain: e.target.value }))}
              className="min-h-11 w-full rounded-(--radius-control) border border-border bg-(--bg-elevated) px-3 text-sm text-(--text-primary)"
            >
              <option value="">{t("selectDomain")}</option>
              {domains.map((domain) => (
                <option key={domain} value={domain}>
                  {domain}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-(--text-muted)">
            {t("displayName")} *
          </label>
          <Input
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="min-h-11"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-(--text-muted)">{t("quotaGb")}</label>
          <Input
            type="number"
            min={1}
            max={limits.storagePerMailboxGb || undefined}
            value={form.quotaGb}
            onChange={(e) => setForm((f) => ({ ...f, quotaGb: e.target.value }))}
            className="min-h-11"
          />
          {limits.storagePerMailboxGb > 0 ? (
            <p className="mt-1 text-xs text-(--text-muted)">
              {t("maxQuota")}: {limits.storagePerMailboxGb} GB
            </p>
          ) : null}
        </div>
        <p className="text-xs text-(--text-muted)">{t("mailboxGeneratedPasswordHint")}</p>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={() => setShowAdd(false)} disabled={adding} className="rounded-xl">
            {t("cancel")}
          </Button>
          <Button
            onClick={() => void handleAdd()}
            disabled={adding || !form.localPart || !form.domain || !form.name}
            className="btn-primary justify-center rounded-xl"
          >
            {adding ? <Loader2 className="size-4 animate-spin" /> : t("create")}
          </Button>
        </div>
      </AppModal>

      <AppModal
        open={Boolean(editingMailbox)}
        onClose={() => setEditingMailbox(null)}
        closeAriaLabel={t("close")}
        closeDisabled={savingEdit || resetting}
        className="space-y-4 p-5"
      >
        <h2 className="text-lg font-semibold text-(--text-primary)">
          {t("editMailbox")}: {editingMailbox?.address}
        </h2>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-(--text-muted)">{t("displayName")}</label>
          <Input
            value={editForm.name}
            onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
            className="min-h-11"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-(--text-muted)">{t("quotaGb")}</label>
          <Input
            type="number"
            min={1}
            max={limits.storagePerMailboxGb || undefined}
            value={editForm.quotaGb}
            onChange={(e) => setEditForm((f) => ({ ...f, quotaGb: e.target.value }))}
            className="min-h-11"
          />
        </div>
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={editForm.active}
            onChange={(e) => setEditForm((f) => ({ ...f, active: e.target.checked }))}
            className="h-4 w-4 rounded border-border"
          />
          <span className="text-sm text-(--text-secondary)">{t("active")}</span>
        </label>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <Button
            variant="ghost"
            onClick={() => setEditingMailbox(null)}
            disabled={savingEdit || resetting}
            className="rounded-xl"
          >
            {t("cancel")}
          </Button>
          <Button
            variant="outline"
            onClick={() => void handleResetPasswordFromEdit()}
            disabled={resetting || savingEdit}
            className="rounded-xl text-(--error)"
          >
            {resetting ? <Loader2 className="size-4 animate-spin" /> : t("mailboxResetPassword")}
          </Button>
          <Button
            onClick={() => void handleEditMailbox()}
            disabled={savingEdit || resetting}
            className="btn-primary rounded-xl"
          >
            {savingEdit ? <Loader2 className="size-4 animate-spin" /> : t("save")}
          </Button>
        </div>
      </AppModal>

      <ConfirmModal
        open={deleteAddress !== null}
        title={t("deleteMailbox")}
        description={`${t("deleteMailboxConfirm")} ${deleteAddress ?? ""}?`}
        confirmLabel={t("delete")}
        cancelLabel={t("cancel")}
        onConfirm={() => void handleDelete()}
        onCancel={() => setDeleteAddress(null)}
        destructive
        isLoading={deleting}
      />

      <ConfirmModal
        open={resetAddress !== null}
        title={t("mailboxResetPassword")}
        description={`${t("mailboxResetPassword")}: ${resetAddress ?? ""}?`}
        confirmLabel={t("mailboxResetPassword")}
        cancelLabel={t("cancel")}
        onConfirm={() => void handleResetPassword()}
        onCancel={() => setResetAddress(null)}
        isLoading={resetting}
      />

      <AppModal
        open={Boolean(shownPassword)}
        onClose={() => setShownPassword(null)}
        closeAriaLabel={t("close")}
        className="space-y-3 p-5"
      >
        <h2 className="text-lg font-semibold text-(--text-primary)">{t("mailboxGeneratedPassword")}</h2>
        <p className="text-sm text-(--text-secondary)">{shownPassword?.address}</p>
        <p className="break-all rounded-(--radius-control) bg-white/5 p-3 font-mono text-sm text-(--text-primary)">
          {shownPassword?.password}
        </p>
        <p className="text-xs text-(--error)">{t("mailboxGeneratedPasswordHint")}</p>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={() => setShownPassword(null)} className="rounded-xl">
            {t("close")}
          </Button>
          <Button
            onClick={() => {
              if (!shownPassword) return;
              void navigator.clipboard.writeText(shownPassword.password).then(() => {
                show(t("copied"), "success");
              });
            }}
            className="btn-primary rounded-xl"
          >
            {t("copy")}
          </Button>
        </div>
      </AppModal>
    </section>
  );
}
