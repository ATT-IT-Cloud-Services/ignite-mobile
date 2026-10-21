import { useCallback, useEffect, useState } from "react";
import { Loader2, UserPlus, Users } from "lucide-react";

import { useToast } from "../components/Toast";
import { useI18n } from "../i18n";
import { api } from "../lib/api";
import { Input } from "../components/ui/input";

/** Team center (mobile port: members + invites). */
export function TeamScreen() {
  const { t } = useI18n();
  const { show } = useToast();
  const [teamId, setTeamId] = useState("");
  const [members, setMembers] = useState<Array<Record<string, unknown>>>([]);
  const [invites, setInvites] = useState<Array<Record<string, unknown>>>([]);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const teams = await api.team.list();
      const first = teams.teams?.[0];
      const id = first && typeof first.id === "string" ? first.id : "";
      setTeamId(id);
      if (id) {
        const [m, i] = await Promise.all([api.team.members(id), api.team.invites(id)]);
        setMembers(Array.isArray(m.members) ? m.members : []);
        setInvites(Array.isArray(i.invites) ? i.invites : []);
      }
    } catch {
      setMembers([]);
      setInvites([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const invite = async () => {
    if (!teamId || !email.trim()) return;
    setBusy(true);
    try {
      await api.team.createInvite(teamId, { email: email.trim() });
      show(t("teamInviteSent"), "success");
      setEmail("");
      await load();
    } catch {
      show(t("somethingWentWrong"), "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-3xl space-y-4 py-4">
      <h1 className="text-2xl font-semibold text-(--text-primary)">{t("teamTitle")}</h1>
      {loading ? (
        <div className="flex h-24 items-center justify-center text-(--text-muted)"><Loader2 className="size-5 animate-spin" /></div>
      ) : !teamId ? (
        <p className="text-sm text-(--text-muted)">{t("teamNoTeam")}</p>
      ) : (
        <>
          <section className="glass space-y-3 p-4">
            <div className="flex items-center gap-2">
              <Users className="size-5 text-(--text-muted)" />
              <h2 className="text-sm font-semibold text-(--text-primary)">{t("teamMembers")}</h2>
            </div>
            <ul className="space-y-1 text-sm">
              {members.map((m, i) => (
                <li key={String(m.id ?? i)} className="flex items-center justify-between gap-2 rounded-lg bg-(--surface-soft) px-3 py-1.5">
                  <span className="truncate text-(--text-primary)">{String(m.email ?? m.displayName ?? m.id ?? "")}</span>
                  <span className="text-[11px] text-(--text-muted)">{String(m.teamRole ?? m.role ?? "")}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="glass space-y-3 p-4">
            <div className="flex items-center gap-2">
              <UserPlus className="size-5 text-(--text-muted)" />
              <h2 className="text-sm font-semibold text-(--text-primary)">{t("teamInvites")}</h2>
            </div>
            <div className="flex gap-2">
              <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t("teamInviteEmail")} className="min-h-11" />
              <button type="button" onClick={() => void invite()} disabled={busy || !email.trim()} className="btn-primary shrink-0 rounded-xl px-4 py-2 text-sm disabled:opacity-50">
                {busy ? <Loader2 className="size-4 animate-spin" /> : t("teamInviteSend")}
              </button>
            </div>
            <ul className="space-y-1 text-xs">
              {invites.map((inv, i) => (
                <li key={String(inv.id ?? i)} className="flex items-center justify-between gap-2 rounded-lg bg-(--surface-soft) px-3 py-1.5 text-(--text-secondary)">
                  <span className="truncate">{String(inv.email ?? inv.id ?? "")}</span>
                  <button type="button" onClick={() => void api.team.removeInvite(teamId, String(inv.id)).then(load)} className="text-(--error)">×</button>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </div>
  );
}
