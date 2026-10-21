import { useState } from "react";
import { Cog, Loader2 } from "lucide-react";

import { api } from "../../../lib/api";
import { resolveCaughtApiError } from "../../../api/resolve-caught-error";
import { useI18n } from "../../../i18n";
import { useToast } from "../../Toast";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { AppModal } from "../../ui/AppModal";
import { useProviderT } from "../use-provider-t";
import type { ProviderWidgetProps } from "../types";

const NOTES_MAX = 2000;
const DISPLAY_NAME_MAX = 50;

/**
 * Generic settings for non-VM providers (Mailcow / Plesk / Ploi):
 * custom display name + notes. Labels/export stay web-only for now.
 */
export default function SettingsPanelWidget({ serviceId, context }: ProviderWidgetProps) {
  const { t: tTyped } = useI18n();
  const t = useProviderT();
  const { show } = useToast();
  const id = serviceId || context?.server?.id || "";
  const canEdit = context?.access?.canEditDetails !== false;

  const [open, setOpen] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const currentName = context?.server?.userDisplayName || "";
  const currentNotes = context?.server?.userNotes || "";

  if (!canEdit) {
    return (
      <section className="glass p-4">
        <p className="text-sm text-(--text-muted)">{t("providerWidgetUnavailable")}</p>
      </section>
    );
  }

  const openEditor = () => {
    setDisplayName(currentName);
    setNotes(currentNotes);
    setOpen(true);
  };

  const handleSave = async () => {
    if (displayName.length > DISPLAY_NAME_MAX) {
      show(t("userDisplayNameTooLong"), "error");
      return;
    }
    if (notes.length > NOTES_MAX) {
      show(t("userNotesTooLong"), "error");
      return;
    }
    setSaving(true);
    try {
      await api.client.services.updateSettings(id, {
        userDisplayName: displayName.trim() || null,
        userNotes: notes.trim() || null,
      });
      show(t("savedSuccessfully"), "success");
      setOpen(false);
      context?.onRefresh?.();
    } catch (err) {
      show(resolveCaughtApiError(err, tTyped, "error"), "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="glass p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Cog className="size-5 shrink-0 text-(--text-muted)" />
            <h3 className="text-sm font-semibold text-(--text-primary)">{t("customServerLabel")}</h3>
          </div>
          {currentName ? (
            <p className="mt-1 text-sm font-medium text-(--brand-primary)">{currentName}</p>
          ) : null}
          {currentNotes ? (
            <p className="mt-1 text-xs text-(--text-secondary)">{currentNotes}</p>
          ) : null}
          {!currentName && !currentNotes ? (
            <p className="mt-1 text-xs text-(--text-muted)">{t("customServerLabelDesc")}</p>
          ) : null}
        </div>
        <Button type="button" variant="outline" onClick={openEditor} className="min-h-11 shrink-0 rounded-xl">
          {t("editCustomName")}
        </Button>
      </div>

      <AppModal
        open={open}
        onClose={() => setOpen(false)}
        closeAriaLabel={t("close")}
        closeDisabled={saving}
        className="space-y-4 p-5"
      >
        <h2 className="text-lg font-semibold text-(--text-primary)">{t("editCustomName")}</h2>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-(--text-muted)">{t("displayName")}</label>
          <Input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            maxLength={DISPLAY_NAME_MAX}
            className="min-h-11"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-(--text-muted)">{t("serverNotes")}</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            maxLength={NOTES_MAX}
            className="min-h-24 w-full rounded-(--radius-control) border border-border bg-(--bg-elevated) px-3 py-2 text-sm text-(--text-primary)"
          />
        </div>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={() => setOpen(false)} disabled={saving} className="rounded-xl">
            {t("cancel")}
          </Button>
          <Button onClick={() => void handleSave()} disabled={saving} className="btn-primary rounded-xl">
            {saving ? <Loader2 className="size-4 animate-spin" /> : t("save")}
          </Button>
        </div>
      </AppModal>
    </section>
  );
}
