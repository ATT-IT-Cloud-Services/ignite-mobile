import { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import { useToast } from "../components/Toast";
import { useI18n } from "../i18n";
import { useRouter } from "../components/Router";
import { api } from "../lib/api";

export function TeamInviteScreen({ token }: { token: string }) {
  const { t } = useI18n();
  const { show } = useToast();
  const { navigate } = useRouter();
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const accept = useCallback(async () => {
    setBusy(true);
    try {
      const res = await api.team.acceptInvite(token);
      if (res.success) {
        setDone(true);
        show(t("teamInviteAccepted"), "success");
        navigate({ name: "team" });
      } else {
        show(t("somethingWentWrong"), "error");
      }
    } catch {
      show(t("somethingWentWrong"), "error");
    } finally {
      setBusy(false);
    }
  }, [token, t, show, navigate]);

  useEffect(() => {
    void accept();
  }, [accept]);

  return (
    <div className="flex min-h-40 items-center justify-center py-10 text-(--text-muted)">
      {busy || !done ? <Loader2 className="size-5 animate-spin" /> : null}
    </div>
  );
}
