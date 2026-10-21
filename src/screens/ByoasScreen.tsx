import { useCallback, useEffect, useState } from "react";
import { Loader2, Network, Plus, RefreshCw } from "lucide-react";

import { useAuth } from "../components/AuthProvider";
import { useToast } from "../components/Toast";
import { useI18n } from "../i18n";
import { AppModal } from "../components/ui/AppModal";
import { api } from "../lib/api";
import { resolveCaughtApiError } from "../api/resolve-caught-error";
import { cn } from "../lib/utils";
import { showPlusFeatures } from "../lib/plus";
import type { ByoasApplication, ByoasNetwork, ByoasPolicy } from "../api/byoas";

/**
 * BYOAS (Bring Your Own ASN): request an ASN, accept the legal text (typed or
 * drawn signature), then submit the prefixes to announce with an LOA.
 */
export function ByoasScreen() {
  const { show } = useToast();
  const { t } = useI18n();
  const { user } = useAuth();
  const plusActive = showPlusFeatures(user);
  const byoasInUse = user?.byoasInUse === true;
  const [policy, setPolicy] = useState<ByoasPolicy | null>(null);
  const [applications, setApplications] = useState<ByoasApplication[]>([]);
  const [networks, setNetworks] = useState<ByoasNetwork[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [asn, setAsn] = useState("");
  const [isApplying, setIsApplying] = useState(false);
  const [legalFor, setLegalFor] = useState<ByoasApplication | null>(null);
  const [signerName, setSignerName] = useState("");
  const [networkFor, setNetworkFor] = useState<ByoasApplication | null>(null);
  const [prefix, setPrefix] = useState("");

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.byoas.status();
      if (res.success) {
        setPolicy(res.policy);
        setApplications(res.applications ?? []);
        setNetworks(res.networks ?? []);
        setError(null);
      }
    } catch (err) {
      setError(resolveCaughtApiError(err, t, "byoasLoadError"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const apply = async () => {
    if (!asn.trim()) return;
    setIsApplying(true);
    try {
      const res = await api.byoas.apply(asn.trim());
      if (res.success) {
        show("ASN-Antrag gestellt", "success");
        setAsn("");
        await load();
      }
    } catch (err) {
      show(resolveCaughtApiError(err, t, "byoasApplyError"), "error");
    } finally {
      setIsApplying(false);
    }
  };

  const signLegal = async () => {
    if (!legalFor || signerName.trim().length < 3) return;
    try {
      await api.byoas.legal(legalFor.id, signerName.trim(), "TYPED");
      show("Rechtstext akzeptiert", "success");
      setLegalFor(null);
      setSignerName("");
      await load();
    } catch (err) {
      show(resolveCaughtApiError(err, t, "byoasLegalError"), "error");
    }
  };

  const submitNetwork = async () => {
    if (!networkFor || !prefix.trim()) return;
    try {
      await api.byoas.submitNetwork(networkFor.id, prefix.trim());
      show("Netz eingereicht", "success");
      setNetworkFor(null);
      setPrefix("");
      await load();
    } catch (err) {
      show(resolveCaughtApiError(err, t, "byoasNetworkError"), "error");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16 text-(--text-muted)">
        <Loader2 className="size-5 animate-spin" />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-4 py-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-(--text-primary)">BYOAS (eigene ASN)</h1>
          <p className="text-sm text-(--text-muted)">
            Eigene ASN anfragen, freigeben lassen und anzukündigende Netze mit LOA einreichen.
          </p>
        </div>
        <button type="button" onClick={() => void load()} className="glass rounded-xl p-2" aria-label="Neu laden">
          <RefreshCw className="size-4" />
        </button>
      </div>

      {error && <div className="glass rounded-xl p-4 text-sm text-(--error)">{error}</div>}

      {policy && !policy.enabled && (
        <div className="glass rounded-xl p-4 text-sm text-(--text-muted)">
          BYOAS ist für Ihr Konto nicht verfügbar.
        </div>
      )}

      {policy?.enabled && plusActive && (
        <div className="glass space-y-3 rounded-xl p-4">
          <div className="text-sm font-medium text-(--text-primary)">ASN anfragen</div>
          <div className="flex gap-2">
            <input
              value={asn}
              onChange={(e) => setAsn(e.target.value)}
              placeholder="AS12345"
              className="glass w-full rounded-control border border-(--border) px-3 py-2 text-sm"
            />
            <button
              type="button"
              onClick={() => void apply()}
              disabled={isApplying || !asn.trim()}
              className="btn-primary shrink-0 rounded-xl px-4 py-2 text-sm disabled:opacity-50"
            >
              {isApplying ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
            </button>
          </div>
        </div>
      )}

      {policy?.enabled && !plusActive && byoasInUse && (
        <div className="glass rounded-xl p-4 text-sm text-(--text-muted)">
          {t("byoasPlusRequiredNewRequests")}
        </div>
      )}

      <div className="space-y-3">
        {applications.map((application) => {
          const appNetworks = networks.filter((n) => n.applicationId === application.id);
          return (
            <div key={application.id} className="glass space-y-3 rounded-xl p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Network className="size-4 text-(--brand-primary)" />
                  <span className="font-mono text-sm font-medium text-(--text-primary)">{application.asn}</span>
                </div>
                <span className={cn("rounded-full px-2 py-0.5 text-xs", statusClass(application.status))}>
                  {application.status}
                </span>
              </div>

              {application.status !== "REJECTED" && !application.legalAcceptedAt && (
                <button
                  type="button"
                  onClick={() => setLegalFor(application)}
                  className="text-xs font-medium text-(--brand-primary) hover:underline"
                >
                  Rechtstext akzeptieren und unterschreiben
                </button>
              )}

              {application.status === "APPROVED" && (
                <button
                  type="button"
                  onClick={() => setNetworkFor(application)}
                  className="text-xs font-medium text-(--brand-primary) hover:underline"
                >
                  Netz hinzufügen (LOA)
                </button>
              )}

              {appNetworks.length > 0 && (
                <ul className="space-y-1 text-sm">
                  {appNetworks.map((network) => (
                    <li key={network.id} className="flex items-center justify-between gap-2 text-(--text-secondary)">
                      <span className="font-mono">{network.prefix}</span>
                      <span className="text-xs text-(--text-muted)">{network.status}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>

      {legalFor && (
        <AppModal open onClose={() => setLegalFor(null)} closeAriaLabel="Schließen">
          <h3 className="mb-3 text-lg font-semibold text-(--text-primary)">Rechtstext akzeptieren</h3>
          <div className="space-y-3">
            <p className="text-sm text-(--text-muted)">
              Mit der Eingabe Ihres Namens bestätigen Sie den Rechtstext und erteilen die Freigabe zur Ankündigung
              Ihrer ASN. Es wird ein signiertes PDF erstellt.
            </p>
            <input
              value={signerName}
              onChange={(e) => setSignerName(e.target.value)}
              placeholder="Vollständiger Name"
              className="glass w-full rounded-control border border-(--border) px-3 py-2 text-sm"
            />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setLegalFor(null)} className="glass rounded-xl px-4 py-2 text-sm">
                Abbrechen
              </button>
              <button
                type="button"
                onClick={() => void signLegal()}
                disabled={signerName.trim().length < 3}
                className="btn-primary rounded-xl px-4 py-2 text-sm disabled:opacity-50"
              >
                Unterzeichnen
              </button>
            </div>
          </div>
        </AppModal>
      )}

      {networkFor && (
        <AppModal open onClose={() => setNetworkFor(null)} closeAriaLabel="Schließen">
          <h3 className="mb-3 text-lg font-semibold text-(--text-primary)">Netz hinzufügen</h3>
          <div className="space-y-3">
            <p className="text-sm text-(--text-muted)">
              IPv4 höchstens /24, IPv6 höchstens /48. Laden Sie pro Netz eine LOA hoch.
            </p>
            <input
              value={prefix}
              onChange={(e) => setPrefix(e.target.value)}
              placeholder="203.0.113.0/24"
              className="glass w-full rounded-control border border-(--border) px-3 py-2 font-mono text-sm"
            />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setNetworkFor(null)} className="glass rounded-xl px-4 py-2 text-sm">
                Abbrechen
              </button>
              <button
                type="button"
                onClick={() => void submitNetwork()}
                disabled={!prefix.trim()}
                className="btn-primary rounded-xl px-4 py-2 text-sm disabled:opacity-50"
              >
                Einreichen
              </button>
            </div>
          </div>
        </AppModal>
      )}
    </div>
  );
}

function statusClass(status: string): string {
  if (status === "APPROVED" || status === "ANNOUNCED") return "bg-emerald-500/15 text-emerald-400";
  if (status === "REJECTED") return "bg-red-500/15 text-red-400";
  return "bg-amber-500/15 text-amber-300";
}
