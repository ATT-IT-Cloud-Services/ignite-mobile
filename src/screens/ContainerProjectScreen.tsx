import { resolveCaughtApiError } from "../api/resolve-caught-error";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { Loader2 } from "lucide-react";

import type { ContainerProjectAccess, ContainerProjectGraph } from "../api/container";
import { useAuth } from "../components/AuthProvider";
import { useRouter } from "../components/Router";
import { useToast } from "../components/Toast";
import { AppModal } from "../components/ui/AppModal";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useI18n } from "../i18n";
import { api } from "../lib/api";
import { cn } from "../lib/utils";

type Sheet = "domain" | "port" | "network" | "workload" | null;

function isBusinessAccount(accountType?: string | null) {
  return ["business", "BUSINESS"].includes(accountType ?? "");
}

export function ContainerProjectScreen({ id }: { id: string }) {
  const { t } = useI18n();
  const { user, isLoading: authLoading } = useAuth();
  const { navigate } = useRouter();
  const { show } = useToast();

  const [graph, setGraph] = useState<ContainerProjectGraph | null>(null);
  const [access, setAccess] = useState<ContainerProjectAccess>({ isOwner: false, permissions: [] });
  const [loading, setLoading] = useState(true);
  const [sheet, setSheet] = useState<Sheet>(null);
  const [submitting, setSubmitting] = useState(false);

  const [host, setHost] = useState("");
  const [https, setHttps] = useState(true);
  const [workloadId, setWorkloadId] = useState("");
  const [targetPort, setTargetPort] = useState("80");
  const [publishedPort, setPublishedPort] = useState("443");
  const [protocol, setProtocol] = useState<"tcp" | "udp">("tcp");
  const [networkName, setNetworkName] = useState("");
  const [driver, setDriver] = useState<"bridge" | "overlay">("bridge");
  const [internal, setInternal] = useState(false);
  const [workloadName, setWorkloadName] = useState("");
  const [kind, setKind] = useState("application");
  const [attachNetworkIds, setAttachNetworkIds] = useState<string[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const body = await api.container.getProject(id);
      setGraph(body.project);
      setAccess(body.access ?? { isOwner: false, permissions: [] });
      const firstWorkload = body.project.workloads[0]?.id ?? "";
      setWorkloadId((current) => current || firstWorkload);
    } catch (err) {
      show(resolveCaughtApiError(err, t, "containerTitle"), "error");
      setGraph(null);
    } finally {
      setLoading(false);
    }
  }, [id, show, t]);

  useEffect(() => {
    if (authLoading) return;
    if (!isBusinessAccount(user?.accountType)) {
      navigate({ name: "dashboard" });
      return;
    }
    if (id) void load();
  }, [authLoading, id, load, navigate, user?.accountType]);

  const can = (permission: string) => access.isOwner || access.permissions.includes(permission);

  const workloadById = useMemo(() => {
    const map = new Map<string, ContainerProjectGraph["workloads"][number]>();
    for (const workload of graph?.workloads ?? []) map.set(workload.id, workload);
    return map;
  }, [graph]);

  const closeSheet = () => {
    setSheet(null);
    setHost("");
    setHttps(true);
    setTargetPort("80");
    setPublishedPort("443");
    setProtocol("tcp");
    setNetworkName("");
    setDriver("bridge");
    setInternal(false);
    setWorkloadName("");
    setKind("application");
    setAttachNetworkIds([]);
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

  const settlementLabel =
    graph?.settlementMode === "business_fund" ? t("containerSettlementFund") : t("containerSettlementInvoice");

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

      {loading || !graph ? (
        <div className="glass h-48 animate-pulse" />
      ) : (
        <>
          <p className="text-xs text-(--text-muted)">
            {settlementLabel}
            {graph.status ? ` · ${graph.status}` : ""}
          </p>

          {can("settings") ? (
            <div className="flex flex-wrap gap-2">
              <button type="button" className="btn-primary min-h-11 rounded-xl px-3 text-sm" onClick={() => setSheet("workload")}>
                {t("containerCreateWorkload")}
              </button>
              <button type="button" className="btn-secondary min-h-11 rounded-xl px-3 text-sm" onClick={() => setSheet("network")}>
                {t("containerCreateNetwork")}
              </button>
              <button type="button" className="btn-secondary min-h-11 rounded-xl px-3 text-sm" onClick={() => setSheet("domain")}>
                {t("containerConnectDomain")}
              </button>
              <button type="button" className="btn-secondary min-h-11 rounded-xl px-3 text-sm" onClick={() => setSheet("port")}>
                {t("containerOpenPort")}
              </button>
            </div>
          ) : null}

          <section className="glass space-y-3 p-4">
            <h2 className="text-lg font-medium text-(--text-primary)">{t("containerWorkloads")}</h2>
            {graph.workloads.length === 0 ? (
              <p className="text-sm text-(--text-muted)">{t("containerEmptyWorkloads")}</p>
            ) : (
              graph.workloads.map((workload) => (
                <button
                  key={workload.id}
                  type="button"
                  onClick={() => navigate({ name: "container-workload", projectId: graph.id, workloadId: workload.id })}
                  className="flex min-h-11 w-full items-center justify-between rounded-xl border border-border px-3 py-2 text-left"
                >
                  <span className="text-sm font-medium text-(--text-primary)">{workload.name}</span>
                  <span className="text-xs text-(--text-muted)">{workload.kind} · {workload.status}</span>
                </button>
              ))
            )}
          </section>

          <section className="glass space-y-3 p-4">
            <h2 className="text-lg font-medium text-(--text-primary)">{t("containerNetworks")}</h2>
            {graph.networks.length === 0 ? (
              <p className="text-sm text-(--text-muted)">{t("containerEmptyNetworks")}</p>
            ) : (
              graph.networks.map((network) => (
                <div key={network.id} className="rounded-xl border border-border px-3 py-2 text-sm text-(--text-primary)">
                  {network.name}
                  <span className="text-(--text-muted)">
                    {` · ${network.driver}`}
                    {network.internal ? ` · ${t("containerInternal")}` : ""}
                  </span>
                </div>
              ))
            )}
          </section>

          <section className="glass space-y-3 p-4">
            <h2 className="text-lg font-medium text-(--text-primary)">{t("containerPublic")}</h2>
            {graph.domains.length === 0 && graph.ports.length === 0 ? (
              <p className="text-sm text-(--text-muted)">{t("containerEmptyPublic")}</p>
            ) : null}
            {graph.domains.map((domain) => (
              <div key={domain.id} className="rounded-xl border border-border px-3 py-2 text-sm">
                <p className="font-medium text-(--text-primary)">{domain.host}</p>
                <p className="text-xs text-(--text-muted)">
                  {t("containerAttachedTo").replace("{name}", workloadById.get(domain.workloadId)?.name || domain.workloadId)}
                </p>
              </div>
            ))}
            {graph.ports.map((port) => (
              <div key={port.id} className="rounded-xl border border-border px-3 py-2 text-sm">
                <p className="font-medium text-(--text-primary)">
                  {port.publishedPort} → {port.targetPort} ({port.protocol})
                </p>
                <p className="text-xs text-(--text-muted)">
                  {t("containerAttachedTo").replace("{name}", workloadById.get(port.workloadId)?.name || port.workloadId)}
                </p>
              </div>
            ))}
          </section>
        </>
      )}

      <AppModal
        open={sheet !== null}
        onClose={closeSheet}
        closeAriaLabel={t("containerCancel")}
        closeDisabled={submitting}
        maxWidthClassName="max-w-md"
        className="space-y-4 overflow-y-auto p-4"
      >
        {sheet === "workload" ? (
          <>
            <h3 className="text-base font-semibold text-(--text-primary)">{t("containerCreateWorkload")}</h3>
            <Field label={t("containerWorkloadName")}>
              <Input value={workloadName} onChange={(event) => setWorkloadName(event.target.value)} className="h-10 rounded-xl" />
            </Field>
            <Field label={t("containerWorkloadKind")}>
              <select
                value={kind}
                onChange={(event) => setKind(event.target.value)}
                className="h-10 w-full rounded-xl border border-border bg-(--bg-elevated) px-3 text-sm text-(--text-primary)"
              >
                <option value="application">{t("containerKindApplication")}</option>
                <option value="compose">{t("containerKindCompose")}</option>
                <option value="postgres">{t("containerKindPostgres")}</option>
              </select>
            </Field>
            {graph && graph.networks.length > 0 ? (
              <fieldset className="space-y-2">
                <legend className="text-xs font-medium text-(--text-secondary)">{t("containerNetworks")}</legend>
                {graph.networks.map((network) => {
                  const checked = attachNetworkIds.includes(network.id);
                  return (
                    <label key={network.id} className="flex min-h-11 items-center gap-2 text-sm text-(--text-primary)">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() =>
                          setAttachNetworkIds((current) =>
                            checked ? current.filter((item) => item !== network.id) : [...current, network.id],
                          )
                        }
                      />
                      {network.name}
                    </label>
                  );
                })}
              </fieldset>
            ) : null}
            <ModalActions
              submitting={submitting}
              disabled={!workloadName.trim()}
              onCancel={closeSheet}
              onSave={() =>
                void runCreate(() =>
                  api.container.createWorkload(id, { name: workloadName.trim(), kind, networkIds: attachNetworkIds }),
                )
              }
            />
          </>
        ) : null}

        {sheet === "network" ? (
          <>
            <h3 className="text-base font-semibold text-(--text-primary)">{t("containerCreateNetwork")}</h3>
            <Field label={t("containerNetworkName")}>
              <Input value={networkName} onChange={(event) => setNetworkName(event.target.value)} className="h-10 rounded-xl" />
            </Field>
            <Field label={t("containerDriver")}>
              <select
                value={driver}
                onChange={(event) => setDriver(event.target.value === "overlay" ? "overlay" : "bridge")}
                className="h-10 w-full rounded-xl border border-border bg-(--bg-elevated) px-3 text-sm text-(--text-primary)"
              >
                <option value="bridge">bridge</option>
                <option value="overlay">overlay</option>
              </select>
            </Field>
            <label className="flex min-h-11 items-center gap-2 text-sm text-(--text-primary)">
              <input type="checkbox" checked={internal} onChange={(event) => setInternal(event.target.checked)} />
              {t("containerInternal")}
            </label>
            <ModalActions
              submitting={submitting}
              disabled={!networkName.trim()}
              onCancel={closeSheet}
              onSave={() =>
                void runCreate(() => api.container.createNetwork(id, { name: networkName.trim(), driver, internal }))
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
            <WorkloadSelect
              value={workloadId}
              workloads={graph?.workloads ?? []}
              onChange={setWorkloadId}
            />
            <Field label={t("containerTargetPort")}>
              <Input value={targetPort} onChange={(event) => setTargetPort(event.target.value)} className="h-10 rounded-xl" />
            </Field>
            <label className="flex min-h-11 items-center gap-2 text-sm text-(--text-primary)">
              <input type="checkbox" checked={https} onChange={(event) => setHttps(event.target.checked)} />
              {t("containerHttps")}
            </label>
            <ModalActions
              submitting={submitting}
              disabled={!host.trim() || !workloadId}
              onCancel={closeSheet}
              onSave={() =>
                void runCreate(() =>
                  api.container.createDomain(id, {
                    host: host.trim(),
                    workloadId,
                    https,
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
            <Field label={t("containerPublishedPort")}>
              <Input value={publishedPort} onChange={(event) => setPublishedPort(event.target.value)} className="h-10 rounded-xl" />
            </Field>
            <Field label={t("containerTargetPort")}>
              <Input value={targetPort} onChange={(event) => setTargetPort(event.target.value)} className="h-10 rounded-xl" />
            </Field>
            <Field label={t("containerProtocol")}>
              <select
                value={protocol}
                onChange={(event) => setProtocol(event.target.value === "udp" ? "udp" : "tcp")}
                className="h-10 w-full rounded-xl border border-border bg-(--bg-elevated) px-3 text-sm text-(--text-primary)"
              >
                <option value="tcp">TCP</option>
                <option value="udp">UDP</option>
              </select>
            </Field>
            <WorkloadSelect
              value={workloadId}
              workloads={graph?.workloads ?? []}
              onChange={setWorkloadId}
            />
            <ModalActions
              submitting={submitting}
              disabled={!workloadId || !publishedPort}
              onCancel={closeSheet}
              onSave={() =>
                void runCreate(() =>
                  api.container.createPort(id, {
                    workloadId,
                    publishedPort: Number(publishedPort),
                    targetPort: Number(targetPort) || 80,
                    protocol,
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

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-(--text-muted)">{label}</Label>
      {children}
    </div>
  );
}

function WorkloadSelect({
  value,
  workloads,
  onChange,
}: {
  value: string;
  workloads: ContainerProjectGraph["workloads"];
  onChange: (id: string) => void;
}) {
  const { t } = useI18n();
  return (
    <Field label={t("containerTargetWorkload")}>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full rounded-xl border border-border bg-(--bg-elevated) px-3 text-sm text-(--text-primary)"
      >
        {workloads.map((workload) => (
          <option key={workload.id} value={workload.id}>
            {workload.name}
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
        className={cn("btn-primary inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold disabled:opacity-50")}
      >
        {submitting ? <Loader2 className="size-4 animate-spin" /> : null}
        {t("containerSave")}
      </button>
    </div>
  );
}
