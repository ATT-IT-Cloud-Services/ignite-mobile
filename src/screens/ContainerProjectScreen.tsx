import { resolveCaughtApiError } from "../api/resolve-caught-error";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { Loader2 } from "lucide-react";

import type {
  ContainerProjectAccess,
  ContainerProjectGraph,
  ContainerTemplateOption,
  ContainerUsageSummary,
} from "../api/pods";
import { useAuth } from "../components/AuthProvider";
import { useRouter } from "../components/Router";
import { useToast } from "../components/Toast";
import { AppModal } from "../components/ui/AppModal";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useI18n } from "../i18n";
import { api } from "../lib/api";
import { cn } from "../lib/utils";

type Sheet = "pod" | "network" | "address" | "domain" | "port" | "rdns" | "relay" | null;

type RelayRow = {
  id: string;
  name: string;
  networkName: string;
  address: string | null;
  listenPort: number | null;
  protocol: string;
  enabled: boolean;
};
type Tab = "pods" | "network" | "access" | "billing";

function isBusinessAccount(accountType?: string | null) {
  return ["business", "BUSINESS"].includes(accountType ?? "");
}

export function ContainerProjectScreen({ id }: { id: string }) {
  const { t, lang } = useI18n();
  const { user, isLoading: authLoading } = useAuth();
  const { navigate } = useRouter();
  const { show } = useToast();

  const [graph, setGraph] = useState<ContainerProjectGraph | null>(null);
  const [access, setAccess] = useState<ContainerProjectAccess>({ isOwner: false, permissions: [] });
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("pods");
  const [sheet, setSheet] = useState<Sheet>(null);
  const [relays, setRelays] = useState<RelayRow[]>([]);
  const [relayName, setRelayName] = useState("");
  const [relayNetworkId, setRelayNetworkId] = useState("");
  const [relayDeleting, setRelayDeleting] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [templates, setTemplates] = useState<ContainerTemplateOption[]>([]);
  const [usage, setUsage] = useState<ContainerUsageSummary | null>(null);

  const [podName, setPodName] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [memoryMb, setMemoryMb] = useState("1024");
  const [cpuMillis, setCpuMillis] = useState("1000");
  const [diskMb, setDiskMb] = useState("5120");

  const [networkName, setNetworkName] = useState("");
  const [networkCidr, setNetworkCidr] = useState("10.40.0.0/24");
  const [networkInternal, setNetworkInternal] = useState(true);

  const [addressMode, setAddressMode] = useState<"nat" | "direct">("nat");
  const [addressFamily, setAddressFamily] = useState<"ipv4" | "ipv6">("ipv4");

  const [host, setHost] = useState("");
  const [targetPort, setTargetPort] = useState("80");
  const [podId, setPodId] = useState("");
  const [containerPort, setContainerPort] = useState("8080");

  const [rdnsAddressId, setRdnsAddressId] = useState("");
  const [rdnsValue, setRdnsValue] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const body = await api.pods.getProject(id);
      setGraph(body.project);
      setAccess(body.access ?? { isOwner: false, permissions: [] });
      setPodId((current) => current || body.project.pods[0]?.id || "");
      if (!templateId) {
        const templatesBody = await api.pods.listTemplates(id).catch(() => null);
        if (templatesBody) {
          const merged = [
            ...(templatesBody.catalogue ?? []),
            ...(templatesBody.bundled ?? []),
            ...(templatesBody.custom ?? []),
          ];
          const unique = new Map<string, ContainerTemplateOption>();
          for (const option of merged) if (option.id) unique.set(option.id, option);
          setTemplates([...unique.values()]);
          setTemplateId((current) => current || [...unique.keys()][0] || "");
        }
      }
      if (tab === "network") {
        const relaysBody = await api.pods.listRelays(id).catch(() => null);
        setRelays(relaysBody?.relays ?? []);
      }
      if (tab === "billing") {
        const usageBody = await api.pods.projectUsage(id).catch(() => null);
        setUsage(usageBody?.summary ?? null);
      }
    } catch (err) {
      show(resolveCaughtApiError(err, t, "containerTitle"), "error");
      setGraph(null);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- template/usage ids are guarded above
  }, [id, show, t, tab]);

  useEffect(() => {
    if (authLoading) return;
    if (!isBusinessAccount(user?.accountType)) {
      navigate({ name: "dashboard" });
      return;
    }
    if (id) void load();
  }, [authLoading, id, load, navigate, user?.accountType]);

  const can = (permission: string) => access.isOwner || access.permissions.includes(permission);

  const podById = useMemo(() => {
    const map = new Map<string, ContainerProjectGraph["pods"][number]>();
    for (const pod of graph?.pods ?? []) map.set(pod.id, pod);
    return map;
  }, [graph]);

  const closeSheet = () => {
    setSheet(null);
    setPodName("");
    setNetworkName("");
    setNetworkCidr("10.40.0.0/24");
    setNetworkInternal(true);
    setAddressMode("nat");
    setAddressFamily("ipv4");
    setHost("");
    setTargetPort("80");
    setContainerPort("8080");
    setRdnsAddressId("");
    setRdnsValue("");
  };

  const runCreate = async (task: () => Promise<unknown>) => {
    setSubmitting(true);
    try {
      await task();
      closeSheet();
      await load();
    } catch (err) {
      show(resolveCaughtApiError(err, t, "containerSave"), "error");
    } finally {
      setSubmitting(false);
    }
  };

  const settlementLabel = (mode: string) =>
    mode === "balance"
      ? t("containerSettlementBalance")
      : mode === "token_wallet"
        ? t("containerSettlementWallet")
        : mode === "business_fund"
          ? t("containerSettlementFund")
          : t("containerSettlementInvoice");

  const formatEur = (value: number) =>
    new Intl.NumberFormat(lang === "de" ? "de-DE" : "en-GB", {
      style: "currency",
      currency: "EUR",
    }).format(value);

  const tabs: Array<{ id: Tab; label: string }> = [
    { id: "pods", label: t("containerPods") },
    { id: "network", label: t("containerNetworks") },
    { id: "access", label: t("containerTabAccess") },
    { id: "billing", label: t("containerTabBilling") },
  ];

  return (
    <div className="mx-auto w-full max-w-4xl space-y-4 py-4 page-fullwidth">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-semibold text-(--text-primary)">
            {graph?.name || t("containerTitle")}
          </h1>
          <p className="text-sm text-(--text-muted)">{graph?.description || t("containerIntro")}</p>
        </div>
        <button
          type="button"
          onClick={() => navigate({ name: "container" })}
          className="btn-secondary shrink-0 rounded-xl px-3 py-2 text-sm"
        >
          {t("containerBackToList")}
        </button>
      </div>

      {graph ? (
        <p className="text-xs text-(--text-muted)">
          {settlementLabel(graph.settlementMode)}
          {graph.status ? ` · ${graph.status}` : ""}
          {graph.regionCode ? ` · ${graph.regionCode}` : ""}
        </p>
      ) : null}

      <div className="flex gap-2 overflow-x-auto">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={cn(
              "min-h-11 shrink-0 rounded-xl px-3 py-2 text-sm",
              tab === item.id
                ? "bg-primary/10 font-medium text-primary"
                : "text-(--text-secondary)",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {loading || !graph ? (
        <div className="glass h-48 animate-pulse" />
      ) : tab === "pods" ? (
        <section className="glass space-y-3 p-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-lg font-medium text-(--text-primary)">{t("containerPods")}</h2>
            {can("pods_manage") ? (
              <button
                type="button"
                onClick={() => setSheet("pod")}
                className="btn-primary min-h-11 rounded-xl px-3 text-sm"
              >
                {t("containerCreatePod")}
              </button>
            ) : null}
          </div>
          {graph.pods.length === 0 ? (
            <p className="text-sm text-(--text-muted)">{t("containerEmptyWorkloads")}</p>
          ) : (
            graph.pods.map((pod) => (
              <button
                key={pod.id}
                type="button"
                onClick={() => {
                  if (pod.kind === "relay") {
                    setTab("network");
                    return;
                  }
                  navigate({ name: "container-pod", projectId: graph.id, podId: pod.id });
                }}
                className={`flex min-h-11 w-full items-center justify-between rounded-xl border px-3 py-2 text-left ${pod.kind === "relay" ? "border-(--accent)" : "border-border"}`}
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-(--text-primary)">
                    {pod.name}
                  </span>
                  <span className="block text-[10px] text-(--text-muted)">
                    {pod.kind === "relay"
                      ? t("containerRelayRole")
                      : pod.templateSlug ?? pod.image ?? "—"}
                  </span>
                </span>
                <span className="shrink-0 text-xs text-(--text-muted)">{pod.state}</span>
              </button>
            ))
          )}
        </section>
      ) : tab === "network" ? (
        <section className="glass space-y-3 p-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-lg font-medium text-(--text-primary)">{t("containerNetworks")}</h2>
            {can("networks_manage") ? (
              <button
                type="button"
                onClick={() => setSheet("network")}
                className="btn-secondary min-h-11 rounded-xl px-3 text-sm"
              >
                {t("containerCreateNetwork")}
              </button>
            ) : null}
          </div>
          {graph.networks.length === 0 ? (
            <p className="text-sm text-(--text-muted)">{t("containerEmptyNetworks")}</p>
          ) : (
            graph.networks.map((network) => (
              <div
                key={network.id}
                className="rounded-xl border border-border px-3 py-2 text-sm text-(--text-primary)"
              >
                {network.name}
                <span className="text-(--text-muted)">
                  {network.cidr ? ` · ${network.cidr}` : ""}
                  {` · ${network.scope}`}
                  {network.internal ? ` · ${t("containerInternal")}` : ""}
                </span>
              </div>
            ))
          )}
          <div className="flex items-center justify-between gap-2 pt-2">
            <h2 className="text-lg font-medium text-(--text-primary)">{t("containerRelays")}</h2>
            {can("networks_manage") ? (
              <button
                type="button"
                onClick={() => {
                  setRelayNetworkId(graph.networks[0]?.id ?? "");
                  setSheet("relay");
                }}
                disabled={graph.networks.length === 0}
                className="btn-secondary min-h-11 rounded-xl px-3 text-sm"
              >
                {t("containerCreateRelay")}
              </button>
            ) : null}
          </div>
          <p className="text-xs text-(--text-muted)">{t("containerRelayHint")}</p>
          {relays.length === 0 ? (
            <p className="text-sm text-(--text-muted)">{t("containerRelayEmpty")}</p>
          ) : (
            relays.map((relay) => (
              <div
                key={relay.id}
                className="flex min-h-11 items-center justify-between gap-2 rounded-xl border border-border px-3 py-2 text-sm"
              >
                <span className="min-w-0">
                  <span className="block truncate font-medium text-(--text-primary)">{relay.name}</span>
                  <span className="block text-xs text-(--text-muted)">
                    {relay.networkName}
                    {relay.address ? ` · ${relay.address}` : ""}
                    {relay.listenPort ? ` · :${relay.listenPort}` : ""}
                  </span>
                </span>
                {can("networks_manage") ? (
                  relayDeleting === relay.id ? (
                    <span className="flex shrink-0 gap-2">
                      <button
                        type="button"
                        className="min-h-11 text-xs text-(--text-secondary)"
                        onClick={() => setRelayDeleting(null)}
                      >
                        {t("containerCancel")}
                      </button>
                      <button
                        type="button"
                        className="min-h-11 text-xs text-(--error)"
                        onClick={() =>
                          void runCreate(() => api.pods.deleteRelay(graph.id, relay.id)).then(() =>
                            setRelayDeleting(null),
                          )
                        }
                      >
                        {t("containerDeleteRelay")}
                      </button>
                    </span>
                  ) : (
                    <button
                      type="button"
                      className="min-h-11 shrink-0 text-xs text-(--text-secondary)"
                      onClick={() => setRelayDeleting(relay.id)}
                    >
                      {t("containerDelete")}
                    </button>
                  )
                ) : null}
              </div>
            ))
          )}
        </section>
      ) : tab === "access" ? (
        <div className="space-y-3">
          <section className="glass space-y-3 p-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-lg font-medium text-(--text-primary)">{t("containerAddresses")}</h2>
              {can("ips_manage") ? (
                <button
                  type="button"
                  onClick={() => setSheet("address")}
                  className="btn-secondary min-h-11 rounded-xl px-3 text-sm"
                >
                  {t("containerRentAddress")}
                </button>
              ) : null}
            </div>
            {graph.addresses.length === 0 ? (
              <p className="text-sm text-(--text-muted)">{t("containerNoAddresses")}</p>
            ) : (
              graph.addresses.map((entry) => (
                <div key={entry.id} className="rounded-xl border border-border px-3 py-2 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium text-(--text-primary)">
                      {entry.address}/{entry.prefix}
                    </p>
                    <span className="text-[10px] uppercase tracking-wider text-(--text-muted)">
                      {entry.mode}
                    </span>
                  </div>
                  <p className="text-xs text-(--text-muted)">
                    {t("containerReverseDns")}: {entry.rdns ?? "—"}{" "}
                    {entry.rdns ? `(${entry.rdnsStatus})` : ""}
                  </p>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {can("ips_manage") ? (
                      <button
                        type="button"
                        onClick={() => {
                          setRdnsAddressId(entry.id);
                          setRdnsValue(entry.rdns ?? "");
                          setSheet("rdns");
                        }}
                        className="text-xs text-primary"
                      >
                        {t("containerEditReverseDns")}
                      </button>
                    ) : null}
                    {can("ips_manage") && graph.pods.length > 0 ? (
                      <button
                        type="button"
                        onClick={() =>
                          void runCreate(() =>
                            api.pods.bindAddress(entry.id, podId || graph.pods[0]?.id || ""),
                          )
                        }
                        className="text-xs text-primary"
                      >
                        {t("containerAttachPod")}
                      </button>
                    ) : null}
                  </div>
                </div>
              ))
            )}
          </section>

          <section className="glass space-y-3 p-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-lg font-medium text-(--text-primary)">{t("containerPublic")}</h2>
              {can("ports_manage") && graph.pods.length > 0 ? (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSheet("domain")}
                    className="btn-secondary min-h-11 rounded-xl px-3 text-xs"
                  >
                    {t("containerConnectDomain")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSheet("port")}
                    className="btn-secondary min-h-11 rounded-xl px-3 text-xs"
                  >
                    {t("containerOpenPort")}
                  </button>
                </div>
              ) : null}
            </div>
            {graph.domains.length === 0 && graph.ports.length === 0 ? (
              <p className="text-sm text-(--text-muted)">{t("containerEmptyPublic")}</p>
            ) : null}
            {graph.domains.map((domain) => (
              <div key={domain.id} className="rounded-xl border border-border px-3 py-2 text-sm">
                <p className="font-medium text-(--text-primary)">
                  {domain.https ? "https://" : "http://"}
                  {domain.host}
                </p>
                <p className="text-xs text-(--text-muted)">
                  {t("containerAttachedTo").replace(
                    "{name}",
                    podById.get(domain.workloadId)?.name || domain.workloadId,
                  )}
                </p>
              </div>
            ))}
            {graph.ports.map((port) => (
              <div key={port.id} className="rounded-xl border border-border px-3 py-2 text-sm">
                <p className="font-medium text-(--text-primary)">
                  {port.host ? `${port.host}:${port.externalPort}` : `:${port.externalPort}`} →{" "}
                  {port.targetPort} ({port.protocol})
                </p>
                <p className="text-xs text-(--text-muted)">
                  {port.exposure === "public" ? t("containerPublic") : t("containerInternal")} ·{" "}
                  {t("containerAttachedTo").replace(
                    "{name}",
                    podById.get(port.workloadId)?.name || port.workloadId,
                  )}
                </p>
              </div>
            ))}
          </section>
        </div>
      ) : (
        <section className="glass space-y-2 p-4">
          <h2 className="text-lg font-medium text-(--text-primary)">{t("containerTabBilling")}</h2>
          {usage ? (
            <>
              <Row label={t("containerUsageTokens")} value={String(Math.round(usage.tokens))} />
              <Row label={t("containerUsageCost")} value={formatEur(usage.chargedEur)} />
              <Row label={t("containerMinimumCharge")} value={formatEur(usage.minimumEur)} />
              <Row label={t("containerPricePerTokens")} value={formatEur(usage.pricePer1kTokens)} />
              <Row
                label={t("containerSettlement")}
                value={settlementLabel(usage.settlementMode)}
              />
            </>
          ) : (
            <p className="text-sm text-(--text-muted)">{t("containerUsageEmpty")}</p>
          )}
        </section>
      )}

      <AppModal
        open={sheet !== null}
        onClose={closeSheet}
        closeAriaLabel={t("containerCancel")}
        closeDisabled={submitting}
        maxWidthClassName="max-w-md"
        className="space-y-4 overflow-y-auto p-4"
      >
        {sheet === "pod" ? (
          <>
            <h3 className="text-base font-semibold text-(--text-primary)">{t("containerCreatePod")}</h3>
            <Field label={t("containerPodName")}>
              <Input
                value={podName}
                onChange={(event) => setPodName(event.target.value)}
                className="h-10 rounded-xl"
              />
            </Field>
            <Field label={t("containerTemplate")}>
              <select
                value={templateId}
                onChange={(event) => setTemplateId(event.target.value)}
                className="h-10 w-full rounded-xl border border-border bg-(--bg-elevated) px-3 text-sm text-(--text-primary)"
              >
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                    {template.version ? ` · ${template.version}` : ""}
                  </option>
                ))}
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-2">
              <Field label={t("containerCpu")}>
                <Input
                  value={cpuMillis}
                  onChange={(event) => setCpuMillis(event.target.value)}
                  inputMode="numeric"
                  className="h-10 rounded-xl"
                />
              </Field>
              <Field label={t("containerMemory")}>
                <Input
                  value={memoryMb}
                  onChange={(event) => setMemoryMb(event.target.value)}
                  inputMode="numeric"
                  className="h-10 rounded-xl"
                />
              </Field>
              <Field label={t("containerDisk")}>
                <Input
                  value={diskMb}
                  onChange={(event) => setDiskMb(event.target.value)}
                  inputMode="numeric"
                  className="h-10 rounded-xl"
                />
              </Field>
            </div>
            <ModalActions
              submitting={submitting}
              disabled={!podName.trim() || !templateId}
              onCancel={closeSheet}
              onSave={() =>
                void runCreate(() =>
                  api.pods.createPod(id, {
                    name: podName.trim(),
                    templateId,
                    limits: {
                      cpuMillis: Number(cpuMillis) || 1000,
                      memoryMb: Number(memoryMb) || 1024,
                      diskMb: Number(diskMb) || 5120,
                    },
                  }),
                )
              }
            />
          </>
        ) : null}

        {sheet === "relay" ? (
          <>
            <h3 className="text-base font-semibold text-(--text-primary)">{t("containerCreateRelay")}</h3>
            <p className="text-xs text-(--text-muted)">{t("containerRelayHint")}</p>
            <Field label={t("containerRelayName")}>
              <Input
                value={relayName}
                onChange={(event) => setRelayName(event.target.value)}
                className="h-10 rounded-xl"
              />
            </Field>
            <Field label={t("containerNetwork")}>
              <select
                value={relayNetworkId}
                onChange={(event) => setRelayNetworkId(event.target.value)}
                className="h-11 w-full rounded-xl border border-border bg-transparent px-3 text-sm"
              >
                {(graph?.networks ?? []).map((network) => (
                  <option key={network.id} value={network.id}>
                    {network.name}
                  </option>
                ))}
              </select>
            </Field>
            <button
              type="button"
              disabled={submitting || !relayName.trim() || !relayNetworkId}
              onClick={() =>
                void runCreate(() =>
                  api.pods.createRelay(id, { name: relayName.trim(), networkId: relayNetworkId }),
                )
              }
              className="btn-primary min-h-11 rounded-xl px-3 text-sm"
            >
              {t("containerCreate")}
            </button>
          </>
        ) : null}

        {sheet === "network" ? (
          <>
            <h3 className="text-base font-semibold text-(--text-primary)">{t("containerCreateNetwork")}</h3>
            <Field label={t("containerNetworkName")}>
              <Input
                value={networkName}
                onChange={(event) => setNetworkName(event.target.value)}
                className="h-10 rounded-xl"
              />
            </Field>
            <Field label={t("containerNetworkCidr")}>
              <Input
                value={networkCidr}
                onChange={(event) => setNetworkCidr(event.target.value)}
                className="h-10 rounded-xl"
              />
            </Field>
            <label className="flex min-h-11 items-center gap-2 text-sm text-(--text-primary)">
              <input
                type="checkbox"
                checked={networkInternal}
                onChange={(event) => setNetworkInternal(event.target.checked)}
              />
              {t("containerInternal")}
            </label>
            <ModalActions
              submitting={submitting}
              disabled={!networkName.trim() || !networkCidr.trim()}
              onCancel={closeSheet}
              onSave={() =>
                void runCreate(() =>
                  api.pods.createNetwork(id, {
                    name: networkName.trim(),
                    cidr: networkCidr.trim(),
                    internal: networkInternal,
                  }),
                )
              }
            />
          </>
        ) : null}

        {sheet === "address" ? (
          <>
            <h3 className="text-base font-semibold text-(--text-primary)">{t("containerRentAddress")}</h3>
            <p className="text-sm font-medium text-(--text-primary)">
              {t("containerAddressAutoAssigned")}
            </p>
            <p className="text-xs text-(--text-muted)">{t("containerAddressAutoAssignedHint")}</p>
            <Field label={t("containerAddressFamily")}>
              <select
                value={addressFamily}
                onChange={(event) =>
                  setAddressFamily(event.target.value === "ipv6" ? "ipv6" : "ipv4")
                }
                className="h-10 w-full rounded-xl border border-border bg-(--bg-elevated) px-3 text-sm text-(--text-primary)"
              >
                <option value="ipv4">IPv4</option>
                <option value="ipv6">IPv6</option>
              </select>
            </Field>
            {addressFamily === "ipv4" ? (
              <Field label={t("containerMode")}>
                <select
                  value={addressMode}
                  onChange={(event) => setAddressMode(event.target.value === "direct" ? "direct" : "nat")}
                  className="h-10 w-full rounded-xl border border-border bg-(--bg-elevated) px-3 text-sm text-(--text-primary)"
                >
                  <option value="nat">{t("containerModeNat")}</option>
                  <option value="direct">{t("containerModeDirect")}</option>
                </select>
              </Field>
            ) : (
              <p className="text-xs text-(--text-muted)">{t("containerAddressIpv6DirectHint")}</p>
            )}
            <ModalActions
              submitting={submitting}
              disabled={false}
              onCancel={closeSheet}
              onSave={() =>
                void runCreate(() =>
                  api.pods.rentAddress(id, { mode: addressMode, family: addressFamily }),
                )
              }
            />
          </>
        ) : null}

        {sheet === "rdns" ? (
          <>
            <h3 className="text-base font-semibold text-(--text-primary)">
              {t("containerEditReverseDns")}
            </h3>
            <Field label={t("containerReverseDns")}>
              <Input
                value={rdnsValue}
                onChange={(event) => setRdnsValue(event.target.value)}
                placeholder="server.example.com"
                className="h-10 rounded-xl"
              />
            </Field>
            <ModalActions
              submitting={submitting}
              disabled={false}
              onCancel={closeSheet}
              onSave={() =>
                void runCreate(() =>
                  api.pods.setReverseDns(rdnsAddressId, rdnsValue.trim() || null),
                )
              }
            />
          </>
        ) : null}

        {sheet === "domain" ? (
          <>
            <h3 className="text-base font-semibold text-(--text-primary)">{t("containerConnectDomain")}</h3>
            <Field label={t("containerHost")}>
              <Input value={host} onChange={(event) => setHost(event.target.value)} className="h-10 rounded-xl" />
            </Field>
            <PodSelect value={podId} pods={graph?.pods ?? []} onChange={setPodId} />
            <Field label={t("containerTargetPort")}>
              <Input
                value={targetPort}
                onChange={(event) => setTargetPort(event.target.value)}
                inputMode="numeric"
                className="h-10 rounded-xl"
              />
            </Field>
            <ModalActions
              submitting={submitting}
              disabled={!host.trim() || !podId}
              onCancel={closeSheet}
              onSave={() =>
                void runCreate(() =>
                  api.pods.createPodDomain(podId, {
                    host: host.trim(),
                    https: true,
                    targetPort: Number(targetPort) || 80,
                  }),
                )
              }
            />
          </>
        ) : null}

        {sheet === "port" ? (
          <>
            <h3 className="text-base font-semibold text-(--text-primary)">{t("containerOpenPort")}</h3>
            <PodSelect value={podId} pods={graph?.pods ?? []} onChange={setPodId} />
            <Field label={t("containerTargetPort")}>
              <Input
                value={containerPort}
                onChange={(event) => setContainerPort(event.target.value)}
                inputMode="numeric"
                className="h-10 rounded-xl"
              />
            </Field>
            <ModalActions
              submitting={submitting}
              disabled={!podId || !containerPort.trim()}
              onCancel={closeSheet}
              onSave={() =>
                void runCreate(() =>
                  api.pods.createPodPort(podId, {
                    containerPort: Number(containerPort) || 8080,
                    exposure: "public",
                  }),
                )
              }
            />
          </>
        ) : null}
      </AppModal>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2 text-sm">
      <span className="text-(--text-muted)">{label}</span>
      <span className="text-(--text-primary)">{value}</span>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-(--text-muted)">{label}</Label>
      {children}
    </div>
  );
}

function PodSelect({
  value,
  pods,
  onChange,
}: {
  value: string;
  pods: ContainerProjectGraph["pods"];
  onChange: (id: string) => void;
}) {
  const { t } = useI18n();
  return (
    <Field label={t("containerPod")}>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full rounded-xl border border-border bg-(--bg-elevated) px-3 text-sm text-(--text-primary)"
      >
        {pods.map((pod) => (
          <option key={pod.id} value={pod.id}>
            {pod.name}
          </option>
        ))}
      </select>
    </Field>
  );
}

function ModalActions({
  submitting,
  disabled,
  onCancel,
  onSave,
}: {
  submitting: boolean;
  disabled: boolean;
  onCancel: () => void;
  onSave: () => void;
}) {
  const { t } = useI18n();
  return (
    <div className="flex justify-end gap-2">
      <button type="button" onClick={onCancel} className="glass glass-hover rounded-xl px-4 py-2 text-sm">
        {t("containerCancel")}
      </button>
      <button
        type="button"
        onClick={onSave}
        disabled={submitting || disabled}
        className="btn-primary inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold disabled:opacity-50"
      >
        {submitting ? <Loader2 className="size-4 animate-spin" /> : null}
        {t("containerSave")}
      </button>
    </div>
  );
}
