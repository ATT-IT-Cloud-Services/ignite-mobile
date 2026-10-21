import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import { getApiErrorCode } from "../api/resolve-error";
import { AuthField } from "../components/auth/auth-field";
import { AuthShell } from "../components/auth/auth-shell";
import { useAuth } from "../components/AuthProvider";
import { useI18n } from "../i18n";
import { api } from "../lib/api";

type VerifyAccountScreenProps = {
  /** Optional code from registration response when mail is not configured. */
  initialDevCode?: string | null;
};

export function VerifyAccountScreen({ initialDevCode = null }: VerifyAccountScreenProps) {
  const { t } = useI18n();
  const { refresh, logout, user, clearPendingDevActivationCode } = useAuth();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [devCode, setDevCode] = useState<string | null>(initialDevCode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (initialDevCode) setDevCode(initialDevCode);
  }, [initialDevCode]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const digits = code.replace(/\D/g, "");
    if (digits.length !== 6) {
      setError(t("authActivationError"));
      return;
    }
    setIsSubmitting(true);
    try {
      const data = await api.auth.verifyAccount(digits);
      if (data.success) {
        clearPendingDevActivationCode();
        await refresh();
        return;
      }
      const errKey: Record<string, string> = {
        pleaseEnterThe6DigitCodeFromYourEmail: "authActivationError",
        invalidOrExpiredCodePleaseRequestANewOne: "authActivationInvalidExpired",
        thisCodeHasExpiredPleaseRequestANewOne: "authActivationInvalidExpired",
        accountIsAlreadyVerified: "authActivationAlreadyVerified",
      };
      const apiCode = getApiErrorCode(data);
      setError(t((apiCode && errKey[apiCode] ? errKey[apiCode] : "authActivationError") as Parameters<typeof t>[0]));
    } catch {
      setError(t("authActivationError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setError("");
    try {
      const data = await api.auth.resendActivationCode();
      if (data.success) {
        setResendCooldown(60);
        if (data.devActivationCode) setDevCode(data.devActivationCode);
        return;
      }
      const errKey: Record<string, string> = {
        accountIsAlreadyVerified: "authActivationAlreadyVerified",
        pleaseWaitAMomentBeforeRequestingAnotherCode: "authActivationResendWait",
        failedToResendCode: "authActivationResendFailed",
      };
      const apiCode = getApiErrorCode(data);
      setError(
        t((apiCode && errKey[apiCode] ? errKey[apiCode] : "authActivationResendFailed") as Parameters<typeof t>[0]),
      );
    } catch {
      setError(t("authActivationResendFailed"));
    }
  };

  return (
    <AuthShell>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-(--text-primary)">{t("authActivationTitle")}</h1>
        <p className="mt-2 text-sm text-(--text-secondary)">{t("authActivationSubtitle")}</p>
        {user?.email ? (
          <p className="mt-2 text-xs text-(--text-muted)">{user.email}</p>
        ) : null}
      </div>

      <form noValidate onSubmit={(e) => void handleSubmit(e)} className="space-y-5">
        <AuthField
          id="activation-code"
          label={t("authActivationCode")}
          type="text"
          inputMode="numeric"
          maxLength={6}
          autoComplete="one-time-code"
          value={code}
          onChange={(e) => {
            setCode(e.target.value.replace(/\D/g, "").slice(0, 6));
            setError("");
          }}
          placeholder={t("authActivationCodePlaceholder")}
          className="text-center font-mono text-lg tracking-[0.35em]"
          error={error || undefined}
        />

        <button
          type="submit"
          disabled={code.replace(/\D/g, "").length !== 6 || isSubmitting}
          className="btn-primary w-full cursor-pointer py-3 text-sm font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? (
            <span className="inline-flex items-center justify-center gap-2">
              <Loader2 className="size-4 animate-spin" />
              {t("authActivationSubmit")}
            </span>
          ) : (
            t("authActivationSubmit")
          )}
        </button>

        <div className="text-center">
          <button
            type="button"
            onClick={() => void handleResend()}
            disabled={resendCooldown > 0}
            className="cursor-pointer text-sm text-primary hover:underline disabled:cursor-not-allowed disabled:opacity-50 disabled:no-underline"
          >
            {resendCooldown > 0
              ? `${t("authActivationResend")} (${resendCooldown}s)`
              : t("authActivationResend")}
          </button>
        </div>

        {devCode ? (
          <div className="rounded-control border border-amber-500/50 bg-amber-500/10 p-3 text-center text-sm">
            <p className="text-(--text-secondary)">{t("authMailNotConfigured")}</p>
            <p className="mt-1 font-mono text-lg font-bold tracking-widest text-(--text-primary)">{devCode}</p>
          </div>
        ) : null}
      </form>

      <p className="mt-8 text-center text-sm text-(--text-muted)">
        <button
          type="button"
          onClick={() => void logout()}
          className="cursor-pointer text-primary hover:underline"
        >
          {t("authBackToLogin")}
        </button>
      </p>
    </AuthShell>
  );
}
