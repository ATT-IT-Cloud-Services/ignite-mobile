import { useEffect, useMemo, useState, type ReactNode } from "react";

import { api } from "../../lib/api";
import { resolveApiError } from "../../api/resolve-error";
import {
  formatDomainStatusLabel,
  isDomainStatusActive,
  isDomainStatusTransferPending,
  isLiveRegistryStatusHealthy,
  liveStatusesIncludePendingTransfer,
} from "../../lib/domain-status";
import { useI18n } from "../../i18n";
import { useToast } from "../Toast";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { ServicePermissionsPanel } from "./ServicePermissionsPanel";
import { ServiceSlaPanel } from "./ServiceSlaPanel";
import type {
  DomainContactRole,
  DomainRegistrationByService,
  DomainStoredContact,
  LiveRegistryStatus,
} from "../../api/domains";

type ContactForm = {
  handleId: string;
  firstName: string;
  lastName: string;
  email: string;
  companyName: string;
  street: string;
  zip: string;
  city: string;
  countryCode: string;
  phone: string;
};

type MobileTab = "overview" | "contacts" | "billing" | "settings" | "sla" | "permissions";

function emptyForm(): ContactForm {
  return {
    handleId: "",
    firstName: "",
    lastName: "",
    email: "",
    companyName: "",
    street: "",
    zip: "",
    city: "",
    countryCode: "DE",
    phone: "",
  };
}

function parseForms(reg: DomainRegistrationByService): Record<DomainContactRole, ContactForm> {
  const forms: Record<DomainContactRole, ContactForm> = {
    owner: emptyForm(),
    admin: emptyForm(),
    tech: emptyForm(),
    zone: emptyForm(),
  };

  let fallback: Partial<ContactForm> = {};
  try {
    if (reg.domainOrder?.registrantJson) {
      const parsed = JSON.parse(reg.domainOrder.registrantJson) as Record<string, unknown>;
      fallback = {
        firstName: String(parsed.firstName || ""),
        lastName: String(parsed.lastName || ""),
        email: String(parsed.email || ""),
        companyName: String(parsed.companyName || ""),
        street: String(parsed.street || ""),
        zip: String(parsed.zip || ""),
        city: String(parsed.city || ""),
        countryCode: String(parsed.countryCode || "DE").toUpperCase() || "DE",
        phone: String(parsed.phone || ""),
      };
    }
  } catch {
    // ignore
  }

  let contacts: Record<string, Record<string, unknown>> = {};
  try {
    if (reg.metadataJson) {
      const meta = JSON.parse(reg.metadataJson) as { contacts?: Record<string, Record<string, unknown>> };
      if (meta.contacts && typeof meta.contacts === "object") contacts = meta.contacts;
    }
  } catch {
    // ignore
  }

  for (const role of ["owner", "admin", "tech", "zone"] as DomainContactRole[]) {
    const c = contacts[role];
    if (c && typeof c === "object" && String(c.handleId || "").trim()) {
      forms[role] = {
        handleId: String(c.handleId || ""),
        firstName: String(c.firstName || fallback.firstName || ""),
        lastName: String(c.lastName || fallback.lastName || ""),
        email: String(c.email || fallback.email || ""),
        companyName: String(c.companyName || fallback.companyName || ""),
        street: String(c.street || fallback.street || ""),
        zip: String(c.zip || fallback.zip || ""),
        city: String(c.city || fallback.city || ""),
        countryCode: String(c.countryCode || fallback.countryCode || "DE").toUpperCase() || "DE",
        phone: String(c.phone || fallback.phone || ""),
      };
    } else {
      forms[role] = emptyForm();
    }
  }
  if (!forms.owner.handleId && (fallback.email || fallback.street)) {
    forms.owner = { ...emptyForm(), ...fallback, handleId: "" };
  }
  return forms;
}

type Props = {
  serviceId: string;
  canManageSettings?: boolean;
  /** When set, Abrechnung appears as a tab (parity with other services). */
  billingContent?: ReactNode;
  showBillingTab?: boolean;
  /** Only when schema includes sla (BUSINESS owner/admin). Never default on. */
  showSlaTab?: boolean;
  /** Schema-aligned: Freigaben when the caller may manage permissions. */
  showPermissionsTab?: boolean;
};

export function DomainServicePanel({
  serviceId,
  canManageSettings = true,
  billingContent,
  showBillingTab = false,
  showSlaTab = false,
  showPermissionsTab = true,
}: Props) {
  const { t, lang } = useI18n();
  const { show } = useToast();
  const [tab, setTab] = useState<MobileTab>("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [registration, setRegistration] = useState<DomainRegistrationByService | null>(null);
  const [liveRegistryStatus, setLiveRegistryStatus] = useState<LiveRegistryStatus | null>(null);
  const [contactRole, setContactRole] = useState<DomainContactRole>("owner");
  const [forms, setForms] = useState<Record<DomainContactRole, ContactForm>>({
    owner: emptyForm(),
    admin: emptyForm(),
    tech: emptyForm(),
    zone: emptyForm(),
  });
  const [saving, setSaving] = useState(false);
  const [contactError, setContactError] = useState<string | null>(null);
  const [nameserverText, setNameserverText] = useState("");
  const [dnssecEnabled, setDnssecEnabled] = useState(false);
  const [dnssecAlgorithm, setDnssecAlgorithm] = useState(13);
  const [dnssecPublicKey, setDnssecPublicKey] = useState("");
  const [dnssecKeyTag, setDnssecKeyTag] = useState("");
  const [autoRenew, setAutoRenew] = useState(true);
  const [whoisPrivacy, setWhoisPrivacy] = useState(true);
  const [working, setWorking] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.domains.registrationByService(serviceId);
      if (!data?.success || !data.registration) {
        setError(typeof data?.error === "string" ? data.error : t("domainPanelLoadFailed"));
        setRegistration(null);
        setLiveRegistryStatus(null);
        return;
      }
      const reg = data.registration;
      setRegistration(reg);
      setLiveRegistryStatus(data.liveRegistryStatus ?? null);
      setForms(parseForms(reg));
      setAutoRenew(Boolean(reg.autoRenew));
      setWhoisPrivacy(reg.whoisPrivacyEnabled !== false);
      try {
        const parsed = reg.nameserversJson ? JSON.parse(reg.nameserversJson) : [];
        const list = Array.isArray(parsed)
          ? parsed.map((n) => String(n || "").trim()).filter(Boolean)
          : [];
        setNameserverText(list.join("\n"));
      } catch {
        setNameserverText("");
      }
      setDnssecEnabled(Boolean(reg.dnssec?.enabled));
      setDnssecAlgorithm(
        typeof reg.dnssec?.algorithm === "number" &&
          Number.isFinite(reg.dnssec.algorithm) &&
          [8, 10, 13, 14].includes(reg.dnssec.algorithm)
          ? reg.dnssec.algorithm
          : 13,
      );
      setDnssecPublicKey(String(reg.dnssec?.publicKey || "").trim());
      setDnssecKeyTag(
        typeof reg.dnssec?.keyTag === "number" && Number.isInteger(reg.dnssec.keyTag)
          ? String(reg.dnssec.keyTag)
          : "",
      );
      setContactError(null);
    } catch {
      setError(t("domainPanelLoadFailed"));
      setRegistration(null);
      setLiveRegistryStatus(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [serviceId]);

  const roles = useMemo(() => {
    const fromContacts = (["owner", "admin", "tech", "zone"] as DomainContactRole[]).filter((role) =>
      Boolean(forms[role]?.handleId)
    );
    return fromContacts.length > 0 ? fromContacts : (["owner"] as DomainContactRole[]);
  }, [forms]);

  useEffect(() => {
    if (!roles.includes(contactRole) && roles[0]) {
      setContactRole(roles[0]);
    }
  }, [roles, contactRole]);

  const roleLabel = (role: DomainContactRole) => {
    if (role === "owner") return t("domainPanelContactRoleOwner");
    if (role === "admin") return t("domainPanelContactRoleAdmin");
    if (role === "tech") return t("domainPanelContactRoleTech");
    return t("domainPanelContactRoleZone");
  };

  const active = forms[contactRole];
  const canEditSettings =
    isDomainStatusActive(registration?.status) || isDomainStatusTransferPending(registration?.status);

  useEffect(() => {
    if (tab === "billing" && !(showBillingTab && billingContent)) {
      setTab("overview");
    }
    if (tab === "sla" && !showSlaTab) {
      setTab("overview");
    }
    if (tab === "permissions" && !showPermissionsTab) {
      setTab("overview");
    }
  }, [tab, showBillingTab, billingContent, showSlaTab, showPermissionsTab]);

  const updateField = (field: keyof ContactForm, value: string) => {
    setForms((prev) => ({
      ...prev,
      [contactRole]: { ...prev[contactRole], [field]: value },
    }));
  };

  const saveContact = async () => {
    if (!registration || !canManageSettings) return;
    if (!active.email.trim() || !active.street.trim() || !active.zip.trim() || !active.city.trim() || !active.phone.trim()) {
      setContactError(t("domainPanelContactRequired"));
      return;
    }
    setSaving(true);
    setContactError(null);
    try {
      const data = await api.domains.registrationAction(registration.id, {
        action: "set_contact",
        role: contactRole,
        contact: {
          firstName: active.firstName,
          lastName: active.lastName,
          email: active.email,
          companyName: active.companyName || null,
          street: active.street,
          zip: active.zip,
          city: active.city,
          countryCode: active.countryCode,
          phone: active.phone,
        } satisfies Partial<DomainStoredContact>,
      });
      if (!data?.success) {
        setContactError(resolveApiError(data, t, { fallbackKey: "domainPanelContactSaveFailed" }));
        return;
      }
      show(t("domainPanelContactSaved"), "success");
      await load();
    } catch {
      setContactError(t("domainPanelContactSaveFailed"));
    } finally {
      setSaving(false);
    }
  };

  const runSettingsAction = async (
    action: "set_nameservers" | "set_auto_renew" | "set_whois_privacy"
  ) => {
    if (!registration || !canManageSettings || !canEditSettings) return;
    setWorking(true);
    try {
      const data = await api.domains.registrationAction(registration.id, {
        action,
        ...(action === "set_nameservers"
          ? {
              nameservers: nameserverText
                .split(/[\n\r,;]+|\s+/)
                .map((n) => n.trim())
                .filter(Boolean),
              dnssecEnabled,
              dnssecAlgorithm: dnssecEnabled ? dnssecAlgorithm : null,
              dnssecPublicKey: dnssecEnabled ? dnssecPublicKey : null,
              dnssecKeyTag:
                dnssecEnabled && dnssecKeyTag.trim() !== "" ? Number(dnssecKeyTag) : null,
            }
          : {}),
        ...(action === "set_auto_renew" ? { autoRenew } : {}),
        ...(action === "set_whois_privacy" ? { whoisPrivacyEnabled: whoisPrivacy } : {}),
      });
      if (!data?.success) {
        show(typeof data?.error === "string" ? data.error : t("domainPanelActionFailed"), "error");
        return;
      }
      show(t("domainPanelActionSaved"), "success");
      await load();
    } catch {
      show(t("domainPanelActionFailed"), "error");
    } finally {
      setWorking(false);
    }
  };

  if (loading) {
    return (
      <div className="glass space-y-3 p-4">
        <div className="h-5 w-40 animate-pulse rounded bg-(--surface-soft)" />
        <div className="h-28 animate-pulse rounded-xl bg-(--surface-soft)" />
      </div>
    );
  }

  if (error || !registration) {
    return (
      <div className="glass border border-(--error)/30 p-4 text-sm text-(--error)">
        {error || t("domainPanelNoLink")}
        <button
          type="button"
          onClick={() => void load()}
          className="ml-3 text-xs font-medium text-(--brand-primary) underline-offset-2 hover:underline"
        >
          {t("retry")}
        </button>
      </div>
    );
  }

  const locale = lang === "de" ? "de-DE" : "en-GB";
  const liveStatuses = liveRegistryStatus?.statuses ?? [];
  const hasLive = liveStatuses.length > 0;
  const statusPending = hasLive
    ? liveStatusesIncludePendingTransfer(liveStatuses)
    : isDomainStatusTransferPending(registration.status);
  const statusActive = hasLive
    ? isLiveRegistryStatusHealthy(liveStatuses)
    : isDomainStatusActive(registration.status);
  const tabs: { id: MobileTab; label: string }[] = [
    { id: "overview", label: t("overview") },
    { id: "contacts", label: t("domainTabContacts") },
    ...(showBillingTab && billingContent
      ? [{ id: "billing" as const, label: t("billing") }]
      : []),
    ...(showSlaTab ? [{ id: "sla" as const, label: t("serverTabSla") }] : []),
    { id: "settings", label: t("serverTabSettings") },
    ...(showPermissionsTab ? [{ id: "permissions" as const, label: t("permissions") }] : []),
  ];

  return (
    <div className="space-y-4">
      <div className="flex gap-2 overflow-x-auto">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`min-h-11 shrink-0 rounded-xl border px-3 py-2 text-sm ${
              tab === item.id
                ? "border-(--brand-primary) bg-(--brand-primary)/10 font-medium text-(--text-primary)"
                : "border-border text-(--text-secondary)"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === "overview" ? (
        <section className="glass space-y-3 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-[11px] uppercase tracking-wide text-(--text-muted)">
                {t("domainPanelDomainLabel")}
              </div>
              <div className="mt-1 truncate text-base font-semibold text-(--text-primary)">
                {registration.domain}
              </div>
            </div>
            {hasLive ? (
              <div className="flex max-w-[60%] flex-wrap justify-end gap-1.5">
                {liveStatuses.map((code) => (
                  <span
                    key={code}
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      statusActive
                        ? "bg-(--success)/10 text-success"
                        : statusPending
                          ? "bg-(--warning)/10 text-warning"
                          : "bg-(--surface-soft) text-(--text-primary)"
                    }`}
                  >
                    {formatDomainStatusLabel(code, (key) => t(key as Parameters<typeof t>[0]))}
                  </span>
                ))}
              </div>
            ) : (
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                  statusActive
                    ? "bg-(--success)/10 text-success"
                    : statusPending
                      ? "bg-(--warning)/10 text-warning"
                      : "bg-(--surface-soft) text-(--text-primary)"
                }`}
              >
                {formatDomainStatusLabel(registration.status, (key) => t(key as Parameters<typeof t>[0]))}
              </span>
            )}
          </div>
          {!hasLive && liveRegistryStatus ? (
            <p className="text-xs text-(--text-muted)">{t("domainOverviewLiveStatusUnavailable")}</p>
          ) : null}
          {statusPending ? (
            <p className="rounded-xl border border-(--warning)/30 bg-(--warning)/10 px-3 py-2 text-sm text-warning">
              {t("domainOverviewTransferPendingHint")}
            </p>
          ) : null}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <div className="text-[11px] text-(--text-muted)">{t("domainPanelExpiresLabel")}</div>
              <div className="mt-1 font-medium text-(--text-primary)">
                {registration.expiresAt ? new Date(registration.expiresAt).toLocaleDateString(locale) : "—"}
              </div>
            </div>
            <div>
              <div className="text-[11px] text-(--text-muted)">{t("domainPanelRestoreUntilLabel")}</div>
              <div className="mt-1 font-medium text-(--text-primary)">
                {registration.restoreEligibleUntil
                  ? new Date(registration.restoreEligibleUntil).toLocaleDateString(locale)
                  : "—"}
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {tab === "billing" && billingContent ? billingContent : null}

      {tab === "contacts" ? (
        <section className="glass space-y-4 p-4">
          <div>
            <h2 className="text-sm font-semibold text-(--text-primary)">{t("domainPanelContactsTitle")}</h2>
            <p className="mt-1 text-xs text-(--text-muted)">{t("domainPanelContactsBody")}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {roles.map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => {
                  setContactRole(role);
                  setContactError(null);
                }}
                className={`min-h-11 rounded-xl border px-3 py-2 text-sm ${
                  contactRole === role
                    ? "border-(--brand-primary) bg-(--brand-primary)/10 font-medium text-(--text-primary)"
                    : "border-border text-(--text-secondary)"
                }`}
              >
                {roleLabel(role)}
              </button>
            ))}
          </div>

          {active.handleId ? (
            <p className="text-xs text-(--text-muted)">
              {t("domainPanelContactHandleId")}: <span className="font-mono">{active.handleId}</span>
            </p>
          ) : null}

          <div className="grid gap-3">
            <label className="space-y-1 text-sm">
              <span className="text-(--text-muted)">{t("domainPanelContactFirstName")}</span>
              <Input
                value={active.firstName}
                disabled={!canManageSettings || saving || !canEditSettings}
                onChange={(e) => updateField("firstName", e.target.value)}
              />
            </label>
            <label className="space-y-1 text-sm">
              <span className="text-(--text-muted)">{t("domainPanelContactLastName")}</span>
              <Input
                value={active.lastName}
                disabled={!canManageSettings || saving || !canEditSettings}
                onChange={(e) => updateField("lastName", e.target.value)}
              />
            </label>
            <label className="space-y-1 text-sm">
              <span className="text-(--text-muted)">{t("domainPanelContactEmail")} *</span>
              <Input
                type="email"
                value={active.email}
                disabled={!canManageSettings || saving || !canEditSettings}
                onChange={(e) => updateField("email", e.target.value)}
              />
            </label>
            <label className="space-y-1 text-sm">
              <span className="text-(--text-muted)">{t("domainPanelContactStreet")} *</span>
              <Input
                value={active.street}
                disabled={!canManageSettings || saving || !canEditSettings}
                onChange={(e) => updateField("street", e.target.value)}
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="space-y-1 text-sm">
                <span className="text-(--text-muted)">{t("domainPanelContactZip")} *</span>
                <Input
                  value={active.zip}
                  disabled={!canManageSettings || saving || !canEditSettings}
                  onChange={(e) => updateField("zip", e.target.value)}
                />
              </label>
              <label className="space-y-1 text-sm">
                <span className="text-(--text-muted)">{t("domainPanelContactCity")} *</span>
                <Input
                  value={active.city}
                  disabled={!canManageSettings || saving || !canEditSettings}
                  onChange={(e) => updateField("city", e.target.value)}
                />
              </label>
            </div>
            <label className="space-y-1 text-sm">
              <span className="text-(--text-muted)">{t("domainPanelContactPhone")} *</span>
              <Input
                value={active.phone}
                disabled={!canManageSettings || saving || !canEditSettings}
                onChange={(e) => updateField("phone", e.target.value)}
              />
            </label>
          </div>

          {contactError ? <p className="text-sm text-(--error)">{contactError}</p> : null}

          <Button
            type="button"
            onClick={() => void saveContact()}
            disabled={saving || !canManageSettings || !canEditSettings}
            className="min-h-11 w-full"
          >
            {saving ? t("domainPanelLoading") : t("domainPanelContactSave")}
          </Button>
        </section>
      ) : null}

      {tab === "settings" ? (
        <section className="glass space-y-5 p-4">
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-(--text-primary)">{t("domainPanelNameserversTitle")}</h2>
            <p className="text-xs text-(--text-muted)">{t("domainSettingsNameserversHint")}</p>
            <label className="block space-y-1 text-sm">
              <span className="text-(--text-muted)">{t("domainSettingsNameserversLabel")} *</span>
              <textarea
                className="min-h-26 w-full rounded-xl border border-border bg-transparent px-3 py-2 font-mono text-sm text-(--text-primary) disabled:opacity-60"
                value={nameserverText}
                disabled={!canManageSettings || working || !canEditSettings}
                placeholder={"ns1.example.com\nns2.example.com"}
                onChange={(e) => setNameserverText(e.target.value)}
              />
              <span className="text-xs text-(--text-muted)">{t("domainSettingsNameserversCountHint")}</span>
            </label>

            <div className="space-y-2 rounded-xl border border-border p-3">
              <label className="flex min-h-11 items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={dnssecEnabled}
                  disabled={!canManageSettings || working || !canEditSettings}
                  onChange={(e) => setDnssecEnabled(e.target.checked)}
                />
                {t("domainDnssecEnableLabel")}
              </label>
              <p className="text-xs text-(--text-muted)">{t("domainDnssecHint")}</p>
              {dnssecEnabled ? (
                <div className="space-y-3">
                  <label className="block space-y-1 text-sm">
                    <span className="text-(--text-muted)">{t("domainDnssecAlgorithmLabel")} *</span>
                    <select
                      className="min-h-11 w-full rounded-xl border border-border bg-transparent px-3 py-2 text-sm disabled:opacity-60"
                      value={dnssecAlgorithm}
                      disabled={!canManageSettings || working || !canEditSettings}
                      onChange={(e) => setDnssecAlgorithm(Number(e.target.value))}
                    >
                      <option value={8}>{t("domainDnssecAlgRsasha256")}</option>
                      <option value={10}>{t("domainDnssecAlgRsasha512")}</option>
                      <option value={13}>{t("domainDnssecAlgEcdsap256")}</option>
                      <option value={14}>{t("domainDnssecAlgEcdsap384")}</option>
                    </select>
                  </label>
                  <label className="block space-y-1 text-sm">
                    <span className="text-(--text-muted)">{t("domainDnssecKeyTagLabel")}</span>
                    <input
                      type="number"
                      min={0}
                      max={65535}
                      step={1}
                      className="min-h-11 w-full rounded-xl border border-border bg-transparent px-3 py-2 text-sm disabled:opacity-60"
                      value={dnssecKeyTag}
                      disabled={!canManageSettings || working || !canEditSettings}
                      placeholder={t("domainDnssecKeyTagPlaceholder")}
                      onChange={(e) => setDnssecKeyTag(e.target.value)}
                    />
                    <span className="text-xs text-(--text-muted)">{t("domainDnssecKeyTagHint")}</span>
                  </label>
                  <label className="block space-y-1 text-sm">
                    <span className="text-(--text-muted)">{t("domainDnssecPublicKeyLabel")} *</span>
                    <textarea
                      className="min-h-20 w-full rounded-xl border border-border bg-transparent px-3 py-2 font-mono text-sm disabled:opacity-60"
                      value={dnssecPublicKey}
                      disabled={!canManageSettings || working || !canEditSettings}
                      placeholder={t("domainDnssecPublicKeyPlaceholder")}
                      onChange={(e) => setDnssecPublicKey(e.target.value)}
                    />
                  </label>
                </div>
              ) : null}
            </div>

            <Button
              type="button"
              onClick={() => void runSettingsAction("set_nameservers")}
              disabled={!canManageSettings || working || !canEditSettings}
              className="min-h-11 w-full"
            >
              {t("domainPanelNameserversSave")}
            </Button>
          </div>

          <div className="space-y-3 border-t border-border pt-4">
            <h2 className="text-sm font-semibold text-(--text-primary)">{t("domainPanelWhoisPrivacyTitle")}</h2>
            <label className="flex min-h-11 items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={whoisPrivacy}
                disabled={!canManageSettings || working || !canEditSettings}
                onChange={(e) => setWhoisPrivacy(e.target.checked)}
              />
              {t("domainPanelWhoisPrivacyEnableLabel")}
            </label>
            <Button
              type="button"
              onClick={() => void runSettingsAction("set_whois_privacy")}
              disabled={!canManageSettings || working || !canEditSettings}
              className="min-h-11 w-full"
            >
              {t("domainPanelWhoisPrivacySave")}
            </Button>
          </div>

          <div className="space-y-3 border-t border-border pt-4">
            <h2 className="text-sm font-semibold text-(--text-primary)">{t("domainPanelAutoRenewTitle")}</h2>
            <label className="flex min-h-11 items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={autoRenew}
                disabled={!canManageSettings || working || !canEditSettings}
                onChange={(e) => setAutoRenew(e.target.checked)}
              />
              {t("domainPanelAutoRenewLabel")}
            </label>
            <Button
              type="button"
              onClick={() => void runSettingsAction("set_auto_renew")}
              disabled={!canManageSettings || working || !canEditSettings}
              className="min-h-11 w-full"
            >
              {t("domainPanelAutoRenewSave")}
            </Button>
          </div>
        </section>
      ) : null}

      {tab === "sla" && showSlaTab ? <ServiceSlaPanel serviceId={serviceId} /> : null}

      {tab === "permissions" && showPermissionsTab ? (
        <ServicePermissionsPanel serviceId={serviceId} />
      ) : null}
    </div>
  );
}
