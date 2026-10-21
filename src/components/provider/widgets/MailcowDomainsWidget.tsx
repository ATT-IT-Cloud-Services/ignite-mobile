import { useCallback, useEffect, useState } from "react";
import { Globe2, Loader2, Clock3 } from "lucide-react";

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

const SPFGENERATOR_HREF = "https://www.skysnag.com/spf-generator/";
const DMARC_GENERATOR_HREF = "https://www.skysnag.com/dmarc-generator/";

type DomainEntry = {
  name: string;
  active: boolean;
  createdAt: string;
  liveData?: { mboxes_in_domain: number; aliases_in_domain: number };
};

type MailDnsBlueprintRowUi = {
  id: string;
  type: string;
  originLabel: string;
  value: string | null;
  manual?: boolean;
  manualHint?: string;
};

type DnsCheckRow = { id: string; status: string; detail?: string };

export default function MailcowDomainsWidget({ serviceId, context }: ProviderWidgetProps) {
  const { t: tTyped } = useI18n();
  const t = useProviderT();
  const { show } = useToast();
  const id = serviceId || context?.server?.id || "";

  const [domains, setDomains] = useState<DomainEntry[]>([]);
  const [limits, setLimits] = useState({ used: 0, max: 0 });
  const [loading, setLoading] = useState(true);

  const [showAdd, setShowAdd] = useState(false);
  const [manualEntry, setManualEntry] = useState(false);
  const [newDomain, setNewDomain] = useState("");
  const [dnsZones, setDnsZones] = useState<Array<{ id: string; domain: string }>>([]);
  const [dnsZonesLoading, setDnsZonesLoading] = useState(false);
  const [selectedZoneId, setSelectedZoneId] = useState("");
  const [adding, setAdding] = useState(false);
  const [deleteDomain, setDeleteDomain] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [dnsDomain, setDnsDomain] = useState<string | null>(null);
  const [dnsBlueprint, setDnsBlueprint] = useState<MailDnsBlueprintRowUi[] | null>(null);
  const [dnsMailHost, setDnsMailHost] = useState<string | null>(null);
  const [dnsChecks, setDnsChecks] = useState<DnsCheckRow[] | null>(null);
  const [dnsVerifyLoading, setDnsVerifyLoading] = useState(false);
  const [dnsApplyLoading, setDnsApplyLoading] = useState(false);
  const [dnsLoading, setDnsLoading] = useState(false);

  const loadDomains = useCallback(async () => {
    if (!id) return;
    try {
      const data = await api.services.mailDomains(id);
      setDomains(Array.isArray(data.domains) ? data.domains : []);
      setLimits(data.limits || { used: 0, max: 0 });
    } catch {
      setDomains([]);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    setLoading(true);
    void loadDomains();
  }, [loadDomains]);

  useEffect(() => {
    if (!showAdd || !id) return;
    let cancelled = false;
    setDnsZonesLoading(true);
    api.services
      .mailDnsZones(id)
      .then((data) => {
        if (!cancelled) setDnsZones(Array.isArray(data.zones) ? data.zones : []);
      })
      .catch(() => {
        if (!cancelled) setDnsZones([]);
      })
      .finally(() => {
        if (!cancelled) setDnsZonesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [showAdd, id]);

  const handleAdd = async () => {
    if (manualEntry ? !newDomain.trim() : !selectedZoneId) return;
    setAdding(true);
    try {
      const body = manualEntry
        ? { domain: newDomain.trim().toLowerCase() }
        : { ownedDomainId: selectedZoneId };
      const data = await api.services.mailDomainsCreate(id, body);
      show(t("domainAdded"), "success");
      if (typeof data.dnsApplyError === "string" && data.dnsApplyError) {
        show(data.dnsApplyError, "warning");
      } else if (Array.isArray(data.dnsApply?.applied) && data.dnsApply.applied.length > 0) {
        show(t("mailcowDnsApplyDone"), "success");
      }
      setNewDomain("");
      setSelectedZoneId("");
      setManualEntry(false);
      setShowAdd(false);
      await loadDomains();
      context?.onRefresh?.();
    } catch (err) {
      show(resolveCaughtApiError(err, tTyped, "error"), "error");
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteDomain) return;
    setDeleting(true);
    try {
      await api.services.mailDomainsDelete(id, deleteDomain);
      show(t("domainRemoved"), "success");
      setDeleteDomain(null);
      await loadDomains();
      context?.onRefresh?.();
    } catch (err) {
      show(resolveCaughtApiError(err, tTyped, "error"), "error");
    } finally {
      setDeleting(false);
    }
  };

  const openDnsModal = async (domain: string) => {
    setDnsDomain(domain);
    setDnsBlueprint(null);
    setDnsMailHost(null);
    setDnsChecks(null);
    setDnsLoading(true);
    try {
      const data = await api.services.mailDomainDns(id, domain);
      setDnsBlueprint(Array.isArray(data.blueprint) ? data.blueprint : null);
      setDnsMailHost(typeof data.mailHost === "string" ? data.mailHost : null);
    } catch (err) {
      show(resolveCaughtApiError(err, tTyped, "error"), "error");
      setDnsDomain(null);
    } finally {
      setDnsLoading(false);
    }
  };

  const closeDnsModal = () => {
    setDnsDomain(null);
    setDnsBlueprint(null);
    setDnsMailHost(null);
    setDnsChecks(null);
  };

  const handleVerifyDns = async () => {
    if (!dnsDomain) return;
    setDnsVerifyLoading(true);
    try {
      const data = await api.services.mailVerifyDns(id, dnsDomain);
      setDnsChecks(Array.isArray(data.checks) ? data.checks : []);
      show(t("mailcowDnsVerifyDone"), "success");
    } catch (err) {
      show(resolveCaughtApiError(err, tTyped, "mailcowDnsVerifyFailed"), "error");
    } finally {
      setDnsVerifyLoading(false);
    }
  };

  const handleApplyDns = async () => {
    if (!dnsDomain) return;
    setDnsApplyLoading(true);
    try {
      await api.services.mailApplyDns(id, dnsDomain);
      show(t("mailcowDnsApplyDone"), "success");
    } catch (err) {
      show(resolveCaughtApiError(err, tTyped, "error"), "error");
    } finally {
      setDnsApplyLoading(false);
    }
  };

  const dnsCheckLabel = (rowId: string) => {
    const chk = dnsChecks?.find((c) => c.id === rowId);
    if (!dnsChecks) return t("mailcowDnsCheckNotRun");
    if (!chk) return t("mailcowDnsCheckNotRun");
    if (chk.status === "ok") return t("mailcowDnsCheckOk");
    if (chk.status === "missing") return t("mailcowDnsCheckMissing");
    if (chk.status === "mismatch") return t("mailcowDnsCheckMismatch");
    if (chk.status === "pending") return t("mailcowDnsCheckPending");
    return chk.status;
  };

  const dnsCheckClass = (rowId: string) => {
    const chk = dnsChecks?.find((c) => c.id === rowId);
    if (!chk || !dnsChecks) return "text-(--text-muted)";
    if (chk.status === "ok") return "text-success";
    if (chk.status === "missing" || chk.status === "mismatch") return "text-(--error)";
    return "text-(--text-secondary)";
  };

  const copyDnsValue = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      show(t("copied"), "success");
    } catch {
      show(t("error"), "error");
    }
  };

  const limitReached = limits.max > 0 && domains.length >= limits.max;

  return (
    <section className="glass p-4">
      <div className="flex items-center gap-2">
        <Globe2 className="size-5 shrink-0 text-(--text-muted)" />
        <h3 className="text-sm font-semibold text-(--text-primary)">{t("widgetMailcowDomains")}</h3>
      </div>

      <div className="mb-4 mt-3 flex min-h-9 items-center justify-between gap-3">
        <p className="text-xs text-(--text-muted)">
          {limits.max > 0 ? `${domains.length} / ${limits.max} ${t("domainsUsed")}` : null}
        </p>
        <Button
          type="button"
          onClick={() => setShowAdd(true)}
          disabled={loading || limitReached}
          className="btn-primary min-h-11 shrink-0 rounded-xl px-4"
        >
          {t("addDomain")}
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3" aria-hidden>
          {[1, 2].map((i) => (
            <div key={i} className="h-14 animate-pulse rounded-xl bg-white/5" />
          ))}
        </div>
      ) : domains.length > 0 ? (
        <div className="space-y-3">
          {domains.map((domain) => (
            <div key={domain.name} className="rounded-xl bg-white/5 p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="truncate font-medium text-(--text-primary)">{domain.name}</div>
                  {domain.liveData ? (
                    <div className="text-xs text-(--text-muted)">
                      {domain.liveData.mboxes_in_domain} {t("mailboxes")} ·{" "}
                      {domain.liveData.aliases_in_domain} {t("aliases")}
                    </div>
                  ) : null}
                </div>
                <Badge variant={domain.active ? "success" : "warning"}>
                  {domain.active ? t("active") : t("inactive")}
                </Badge>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => void openDnsModal(domain.name)}
                  className="min-h-11 rounded-xl px-3 text-sm"
                >
                  {t("dns")}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setDeleteDomain(domain.name)}
                  className="min-h-11 rounded-xl px-3 text-sm text-(--error)"
                >
                  {t("delete")}
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="py-8 text-center text-sm text-(--text-muted)">{t("noDomainsYet")}</p>
      )}

      <AppModal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        closeAriaLabel={t("close")}
        closeDisabled={adding}
        className="space-y-4 p-5"
      >
        <h2 className="text-lg font-semibold text-(--text-primary)">{t("addDomain")}</h2>
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={manualEntry}
            onChange={(e) => setManualEntry(e.target.checked)}
            className="h-4 w-4 rounded border-border"
          />
          <span className="text-sm text-(--text-secondary)">{t("mailcowAddDomainManual")}</span>
        </label>
        {manualEntry ? (
          <div>
            <label className="mb-1.5 block text-xs font-medium text-(--text-muted)">
              {t("domainName")}
            </label>
            <Input
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
              placeholder="mail.example.com"
              className="min-h-11"
            />
          </div>
        ) : (
          <div>
            <label className="mb-1.5 block text-xs font-medium text-(--text-muted)">
              {t("mailcowAddDomainFromDnsZone")}
            </label>
            <select
              value={selectedZoneId}
              onChange={(e) => setSelectedZoneId(e.target.value)}
              className="min-h-11 w-full rounded-(--radius-control) border border-border bg-(--bg-elevated) px-3 text-sm text-(--text-primary)"
            >
              <option value="">{dnsZonesLoading ? "…" : t("mailcowSelectDnsZone")}</option>
              {dnsZones.map((zone) => (
                <option key={zone.id} value={zone.id}>
                  {zone.domain}
                </option>
              ))}
            </select>
            {!dnsZonesLoading && dnsZones.length === 0 ? (
              <p className="mt-1 text-xs text-(--text-muted)">{t("mailcowNoDnsZonesHint")}</p>
            ) : null}
          </div>
        )}
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={() => setShowAdd(false)} disabled={adding} className="rounded-xl">
            {t("cancel")}
          </Button>
          <Button
            onClick={() => void handleAdd()}
            disabled={adding || (manualEntry ? !newDomain.trim() : !selectedZoneId)}
            className="btn-primary justify-center rounded-xl"
          >
            {adding ? <Loader2 className="size-4 animate-spin" /> : t("add")}
          </Button>
        </div>
      </AppModal>

      <AppModal
        open={Boolean(dnsDomain)}
        onClose={closeDnsModal}
        closeAriaLabel={t("close")}
        maxWidthClassName="max-w-2xl"
        className="space-y-3 overflow-y-auto p-5"
      >
        <h2 className="text-lg font-semibold text-(--text-primary)">
          {t("dnsRecordsFor")} {dnsDomain}
        </h2>
        {dnsMailHost ? (
          <p className="text-xs text-(--text-muted)">
            {t("mailcowDnsMailHostLabel")}:{" "}
            <span className="font-mono text-(--text-secondary)">{dnsMailHost}</span>
          </p>
        ) : null}
        <p className="text-xs text-(--text-muted)">{t("mailcowDnsBlueprintHint")}</p>
        <p className="flex items-start gap-2 rounded-xl bg-white/5 px-3 py-2 text-xs text-(--text-muted)">
          <Clock3 className="mt-0.5 h-4 w-4 shrink-0" />
          {t("mailcowDnsPropagationHint")}
        </p>
        {dnsLoading ? (
          <div className="space-y-3" aria-hidden>
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 animate-pulse rounded-xl bg-white/5" />
            ))}
          </div>
        ) : !dnsBlueprint?.length ? (
          <p className="rounded-xl bg-white/5 p-6 text-center text-sm text-(--text-muted)">
            {t("noDnsRecords")}
          </p>
        ) : (
          <div className="space-y-3">
            {dnsBlueprint.map((row) => {
              const check = dnsChecks?.find((c) => c.id === row.id);
              return (
                <div key={row.id} className="space-y-2 rounded-xl bg-white/5 p-4">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="font-mono text-xs font-medium text-(--text-primary)">{row.type}</span>
                    <span className={`text-xs ${dnsCheckClass(row.id)}`}>{dnsCheckLabel(row.id)}</span>
                  </div>
                  <p className="text-xs text-(--text-muted)">
                    {t("mailcowDnsColumnOrigin")}:{" "}
                    <span className="break-all font-mono text-(--text-secondary)">
                      {row.originLabel === "@" ? "@" : row.originLabel}
                    </span>
                  </p>
                  <div className="text-xs text-(--text-muted)">
                    {t("mailcowDnsColumnValue")}:
                    <div className="mt-1 break-all font-mono text-sm text-(--text-secondary)">
                      {row.manual ? (
                        <span className="block space-y-2 font-sans text-(--text-muted)">
                          <span>{t("mailcowDnsManualCompose")}</span>
                          {row.manualHint === "spf" ? (
                            <a
                              href={SPFGENERATOR_HREF}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block text-(--brand-primary) hover:underline"
                            >
                              {t("mailcowDnsSpfGeneratorLink")}
                            </a>
                          ) : null}
                          {row.manualHint === "dmarc" ? (
                            <a
                              href={DMARC_GENERATOR_HREF}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block text-(--brand-primary) hover:underline"
                            >
                              {t("mailcowDnsDmarcGeneratorLink")}
                            </a>
                          ) : null}
                        </span>
                      ) : (
                        row.value ?? "—"
                      )}
                    </div>
                  </div>
                  {check?.detail && check.status === "mismatch" ? (
                    <p className="break-all font-mono text-[10px] text-(--text-muted)">{check.detail}</p>
                  ) : null}
                  {row.value && !row.manual ? (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => void copyDnsValue(row.value ?? "")}
                      className="min-h-11 rounded-lg px-3 text-sm text-(--brand-primary)"
                    >
                      {t("copy")}
                    </Button>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-between">
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => void handleVerifyDns()}
              disabled={dnsVerifyLoading || dnsLoading || dnsApplyLoading}
              className="min-h-11 rounded-xl"
            >
              {dnsVerifyLoading ? <Loader2 className="size-4 animate-spin" /> : t("mailcowDnsRefreshChecks")}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => void handleApplyDns()}
              disabled={dnsApplyLoading || dnsLoading || dnsVerifyLoading}
              className="min-h-11 rounded-xl"
            >
              {dnsApplyLoading ? <Loader2 className="size-4 animate-spin" /> : t("mailcowDnsApplyAction")}
            </Button>
          </div>
          <Button type="button" onClick={closeDnsModal} className="btn-primary min-h-11 rounded-xl">
            {t("close")}
          </Button>
        </div>
      </AppModal>

      <ConfirmModal
        open={deleteDomain !== null}
        title={t("deleteDomain")}
        description={`${t("deleteDomainConfirm")} ${deleteDomain ?? ""}? ${t("deleteDomainWarning")}`}
        confirmLabel={t("delete")}
        cancelLabel={t("cancel")}
        onConfirm={() => void handleDelete()}
        onCancel={() => setDeleteDomain(null)}
        destructive
        isLoading={deleting}
      />
    </section>
  );
}
