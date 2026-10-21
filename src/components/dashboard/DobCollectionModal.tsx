import { useMemo, useState } from "react";

import { resolveApiError } from "../../api/resolve-error";
import { useAuth } from "../AuthProvider";
import { useI18n } from "../../i18n";
import { useToast } from "../Toast";
import { isCompleteUnder16DateOfBirth } from "../../lib/is-under-16-date-of-birth";
import { api } from "../../lib/api";

type Props = {
  onComplete: () => void;
};

export function DobCollectionModal({ onComplete }: Props) {
  const { t } = useI18n();
  const { show } = useToast();
  const { refresh } = useAuth();
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const showUnder16Warning = useMemo(
    () => isCompleteUnder16DateOfBirth(dateOfBirth),
    [dateOfBirth]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dateOfBirth) return;
    setSubmitting(true);
    try {
      const data = await api.user.setDateOfBirth(dateOfBirth);
      if (data.success) {
        show(t("familyDobSaved"), "success");
        await refresh();
        onComplete();
        return;
      }
      show(resolveApiError(data, t, { fallbackKey: "errorGeneric" }), "error");
    } catch (err) {
      show(resolveApiError(err, t, { fallbackKey: "errorGeneric" }), "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="glass w-full max-w-md rounded-2xl p-6 shadow-2xl">
        <h2 className="text-xl font-bold text-(--text-primary)">{t("familyDobRequired")}</h2>
        <p className="mt-2 text-sm text-(--text-muted)">{t("familyDobRequiredDesc")}</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-(--text-primary)" htmlFor="mobile-dob">
              {t("familyDobLabel")}
            </label>
            <input
              id="mobile-dob"
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              max={new Date().toISOString().split("T")[0]}
              required
              className="w-full rounded-control border border-border bg-(--bg-elevated) px-3 py-2 text-sm text-(--text-primary) focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {showUnder16Warning ? (
              <p className="mt-2 text-xs font-medium text-amber-600 dark:text-amber-400">
                {t("familyDobUnder16AdoptionWarning")}
              </p>
            ) : null}
          </div>

          <button
            type="submit"
            disabled={submitting || !dateOfBirth}
            className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? t("loading") : t("familyDobSaveBtn")}
          </button>
        </form>
      </div>
    </div>
  );
}
