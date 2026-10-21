import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { ArrowRight, Link2, Loader2, Plus, RefreshCw, Server as ServerIcon, Trash2 } from "lucide-react";

import { ApiError, api } from "../../lib/api";
import { resolveApiError } from "../../api/resolve-error";
import { resolveCaughtApiError } from "../../api/resolve-caught-error";
import { useI18n } from "../../i18n";
import { useToast } from "../Toast";
import { AppModal } from "../ui/AppModal";
import { Button } from "../ui/button";
import { ConfirmModal } from "../ui/ConfirmModal";
import { Input } from "../ui/input";
import { isDesktopClient } from "../../lib/platform";
import { cn } from "../../lib/utils";
import { useWindowDimensions } from "../../hooks/useWindowDimensions";
import type {
  DatacenterCabling,
  DatacenterCablingCable,
  DatacenterCablingDevice,
  DatacenterCablingIp,
  DatacenterCablingPort,
  DatacenterDevice,
  DatacenterDeviceCreateInput,
  DatacenterRackElevation,
  DatacenterUnitRange,
} from "../../api/services";

/** Above this width the cut-down compact view upgrades to include the cabling. */
const DATACENTER_WIDE_BREAKPOINT = 900;

type Translate = (key: string, vars?: Record<string, string | number>) => string;

const DEVICE_KINDS = [
  "SERVER",
  "SWITCH",
  "PATCHPANEL",
  "PDU",
  "ROUTER",
  "STORAGE",
  "UPS",
  "OTHER",
] as const;

const DEVICE_DEPTHS = ["FULL", "HALF"] as const;

const DEVICE_KIND_KEYS: Record<string, string> = {
  SERVER: "datacenterKindServer",
  SWITCH: "datacenterKindSwitch",
  PATCHPANEL: "datacenterKindPatchpanel",
  PDU: "datacenterKindPdu",
  ROUTER: "datacenterKindRouter",
  STORAGE: "datacenterKindStorage",
  UPS: "datacenterKindUps",
  OTHER: "datacenterKindOther",
};

const PORT_KIND_KEYS: Record<string, string> = {
  MGMT_RJ45: "datacenterPortKindMgmtRj45",
  UPLINK_RJ45: "datacenterPortKindUplinkRj45",
  RJ45: "datacenterPortKindRj45",
  SFP: "datacenterPortKindSfp",
  SFP_PLUS: "datacenterPortKindSfpPlus",
  QSFP: "datacenterPortKindQsfp",
  QSFP28: "datacenterPortKindQsfp28",
  LC_LC: "datacenterPortKindLcLc",
  DAC: "datacenterPortKindDac",
  POWER: "datacenterPortKindPower",
  OTHER: "datacenterPortKindOther",
};

const PORT_STATUS_KEYS: Record<string, string> = {
  FREE: "datacenterPortStatusFree",
  USED: "datacenterPortStatusUsed",
  DEFECT: "datacenterPortStatusDefect",
};

const CABLE_STATUS_KEYS: Record<string, string> = {
  CONNECTED: "datacenterCableStatusConnected",
  PLANNED: "datacenterCableStatusPlanned",
  DEFECT: "datacenterCableStatusDefect",
  REMOVED: "datacenterCableStatusRemoved",
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toInt(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const num = typeof value === "number" ? value : Number(value);
  return Number.isFinite(num) ? Math.trunc(num) : null;
}

/** 403 customerFeatureUnavailable / missing surface (404) means: do not render the section. */
function isSurfaceUnavailable(error: unknown): boolean {
  if (!(error instanceof ApiError)) return false;
  if (String(error.code) === "customerFeatureUnavailable") return true;
  return error.status === 403 || error.status === 404;
}

async function safeCall<T>(
  promise: Promise<T>,
): Promise<{ ok: true; value: T } | { ok: false; error: unknown }> {
  try {
    return { ok: true, value: await promise };
  } catch (error) {
    return { ok: false, error };
  }
}

function deviceKindLabel(t: Translate, kind: string): string {
  return t(DEVICE_KIND_KEYS[kind] ?? "datacenterKindOther");
}

function portKindLabel(t: Translate, kind: string): string {
  return t(PORT_KIND_KEYS[kind] ?? "datacenterPortKindOther");
}

function portStatusLabel(t: Translate, status: string): string {
  return t(PORT_STATUS_KEYS[status] ?? "datacenterPortStatusFree");
}

function cableStatusLabel(t: Translate, status: string): string {
  return t(CABLE_STATUS_KEYS[status] ?? "datacenterCableStatusConnected");
}

function modeLabel(t: Translate, mode: string): string {
  if (mode === "INCLUDED") return t("datacenterModeIncluded");
  if (mode === "OWN") return t("datacenterModeOwn");
  return t("datacenterModeRent");
}

function unitRangeLabel(t: Translate, range: DatacenterUnitRange): string {
  const end = range.unitStart + range.unitHeight - 1;
  if (range.unitHeight <= 1) return t("datacenterUnitSingle", { unit: range.unitStart });
  return t("datacenterUnitRange", { start: range.unitStart, end });
}

/** German-friendly speed formatting: 1000 Mbit/s and above become Gbit/s. */
function formatSpeed(t: Translate, lang: string, speedMbps: number | null | undefined): string | null {
  if (typeof speedMbps !== "number" || !Number.isFinite(speedMbps) || speedMbps <= 0) return null;
  if (speedMbps >= 1000) {
    const value = new Intl.NumberFormat(lang === "de" ? "de-DE" : "en-US", {
      maximumFractionDigits: 1,
    }).format(speedMbps / 1000);
    return t("datacenterSpeedGbit", { speed: value });
  }
  return t("datacenterSpeedMbit", { speed: speedMbps });
}

/** Grid row: row 1 is the topmost unit (totalHeightU), so U 1 sits at the bottom. */
function rangeGridStyle(range: DatacenterUnitRange, totalHeightU: number) {
  const topUnit = range.unitStart + range.unitHeight - 1;
  return {
    gridColumn: "2",
    gridRow: `${totalHeightU - topUnit + 1} / span ${range.unitHeight}`,
  };
}

function detectCustomerManaged(
  rackDevices: DatacenterCablingDevice[] | DatacenterRackElevation["devices"],
  cablingDevices: DatacenterCablingDevice[],
  ownDevices: DatacenterDevice[],
): boolean {
  const has = (rows: Array<{ managedBy?: string }>) =>
    rows.some((row) => String(row.managedBy ?? "").toUpperCase() === "CUSTOMER");
  return has(rackDevices) || has(cablingDevices) || has(ownDevices);
}

/**
 * Customer-facing colocation surface: compact rack elevation on mobile, with the
 * cabling appended on desktop/wide viewports. Hidden entirely when the tenant
 * switched the datacenter feature off (403 customerFeatureUnavailable).
 */
export function DatacenterPanel({ serviceId }: { serviceId: string }) {
  const { t, lang } = useI18n();
  const tr = t as unknown as Translate;
  const { show } = useToast();
  const { width } = useWindowDimensions();
  const extended = isDesktopClient() || width >= DATACENTER_WIDE_BREAKPOINT;

  const [status, setStatus] = useState<"loading" | "ready" | "hidden" | "error">("loading");
  const [error, setError] = useState<unknown>(null);
  const [elevation, setElevation] = useState<DatacenterRackElevation | null>(null);
  const [cabling, setCabling] = useState<DatacenterCabling | null>(null);
  const [managedByCustomer, setManagedByCustomer] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DatacenterDevice | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    if (!serviceId) return;
    setStatus("loading");
    const [rackRes, cablingRes, devicesRes] = await Promise.all([
      safeCall(api.services.datacenterRack(serviceId)),
      safeCall(api.services.datacenterCabling(serviceId)),
      safeCall(api.services.datacenterDevices(serviceId)),
    ]);

    if (
      (!rackRes.ok && isSurfaceUnavailable(rackRes.error)) ||
      (!cablingRes.ok && isSurfaceUnavailable(cablingRes.error)) ||
      (!devicesRes.ok && isSurfaceUnavailable(devicesRes.error))
    ) {
      setStatus("hidden");
      return;
    }

    if (!rackRes.ok) {
      setError(rackRes.error);
      setStatus("error");
      return;
    }

    const nextElevation = rackRes.value.success ? rackRes.value.elevation ?? null : null;
    const nextCabling =
      cablingRes.ok && cablingRes.value.success ? cablingRes.value.cabling : null;
    const ownDevices =
      devicesRes.ok && devicesRes.value.success ? devicesRes.value.devices : [];

    setElevation(nextElevation);
    setCabling(nextCabling);
    setManagedByCustomer(
      detectCustomerManaged(
        nextElevation?.devices ?? [],
        nextCabling?.devices ?? [],
        ownDevices,
      ),
    );
    setError(null);
    setStatus("ready");
  }, [serviceId]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await load();
    } finally {
      setRefreshing(false);
    }
  }, [load]);

  const handleCreate = useCallback(
    async (values: {
      name: string;
      unitStart: number;
      unitHeight: number;
      kind: string;
      depth: string;
    }) => {
      if (!elevation) return;
      setSaving(true);
      setFormError(null);
      const body: DatacenterDeviceCreateInput = {
        rackId: elevation.rack.id,
        name: values.name.trim(),
        unitStart: values.unitStart,
        unitHeight: values.unitHeight,
        kind: values.kind,
        depth: values.depth,
        serialNumber: null,
        assetTag: null,
        notes: null,
      };
      try {
        const res = await api.services.datacenterDeviceCreate(serviceId, body);
        if (res.success) {
          show(tr("datacenterDeviceCreated"), "success");
          setManagedByCustomer(true);
          setFormOpen(false);
          await load();
        } else {
          setFormError(resolveApiError(res, t, { fallbackKey: "datacenterDeviceCreateFailed" }));
        }
      } catch (err) {
        if (err instanceof ApiError && err.status === 403) {
          // POST succeeded only for customer-managed products; otherwise operator-managed.
          setManagedByCustomer(false);
          setFormOpen(false);
          show(tr("datacenterManagedByOperatorHint"), "error");
        } else {
          setFormError(resolveCaughtApiError(err, t, "datacenterDeviceCreateFailed"));
        }
      } finally {
        setSaving(false);
      }
    },
    [elevation, serviceId, show, tr, t, load],
  );

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await api.services.datacenterDeviceDelete(serviceId, deleteTarget.id);
      if (res.success) {
        show(tr("datacenterDeviceDeleted"), "success");
        setDeleteTarget(null);
        await load();
      } else {
        show(resolveApiError(res, t, { fallbackKey: "datacenterDeviceDeleteFailed" }), "error");
      }
    } catch (err) {
      show(resolveCaughtApiError(err, t, "datacenterDeviceDeleteFailed"), "error");
    } finally {
      setDeleting(false);
    }
  }, [deleteTarget, serviceId, show, tr, t, load]);

  if (status === "hidden") return null;

  if (status === "loading") {
    return (
      <section className="glass space-y-3 p-4">
        <div className="h-5 w-40 animate-pulse rounded bg-(--surface-soft)" />
        <div className="h-40 animate-pulse rounded-xl bg-(--surface-soft)" />
      </section>
    );
  }

  if (status === "error") {
    return (
      <section className="glass border border-(--error)/30 p-4 text-sm text-(--error)">
        {resolveCaughtApiError(error, t, "datacenterLoadError")}
        <button
          type="button"
          onClick={() => void load()}
          className="ml-3 text-xs font-medium text-(--brand-primary) underline-offset-2 hover:underline"
        >
          {tr("retry")}
        </button>
      </section>
    );
  }

  const ownDevices = elevation?.devices ?? [];

  return (
    <section className="glass space-y-4 p-4">
      <header className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="grid size-9 shrink-0 place-items-center rounded-(--radius-control) bg-(--surface-soft) text-(--brand-primary)">
            <ServerIcon className="size-4" />
          </span>
          <h2 className="truncate text-sm font-semibold text-(--text-primary)">
            {tr("datacenterSectionTitle")}
          </h2>
        </div>
        <button
          type="button"
          onClick={() => void handleRefresh()}
          aria-label={tr("refresh")}
          disabled={refreshing}
          className="rounded-xl p-2 text-(--text-muted) hover:bg-(--surface-soft) disabled:opacity-50"
        >
          <RefreshCw className={cn("size-4", refreshing && "animate-spin")} />
        </button>
      </header>

      {elevation ? (
        <div className="space-y-3">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <span className="text-sm font-medium text-(--text-primary)">
              {elevation.rack.label || tr("datacenterRackTitle")}
            </span>
            <span className="text-xs text-(--text-muted)">
              {tr("datacenterRackHeight", { total: elevation.rack.totalHeightU })}
            </span>
          </div>

          {elevation.reservations.length > 0 ? (
            <ul className="space-y-1">
              {elevation.reservations.map((reservation) => (
                <li
                  key={reservation.id}
                  className="flex flex-wrap items-center gap-2 text-xs text-(--text-secondary)"
                >
                  <span className="h-3 w-1 shrink-0 rounded-full bg-(--brand-primary)" aria-hidden />
                  {tr("datacenterReservationLine", {
                    range: unitRangeLabel(tr, reservation),
                    mode: modeLabel(tr, reservation.mode),
                  })}
                  {reservation.label ? (
                    <span className="text-(--text-muted)">· {reservation.label}</span>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : null}

          <RackGrid elevation={elevation} t={tr} />
          <RackLegend t={tr} />

          {extended ? <CablingSection cabling={cabling} t={tr} lang={lang} /> : null}
        </div>
      ) : (
        <p className="rounded-xl border border-border bg-(--surface-soft) px-3 py-2 text-xs text-(--text-muted)">
          {tr("datacenterNoRack")}
        </p>
      )}

      {elevation ? (
        <div className="space-y-3 border-t border-border pt-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-(--text-primary)">
              {tr("datacenterOwnDevicesTitle")}
            </h3>
            {managedByCustomer ? (
              <button
                type="button"
                onClick={() => {
                  setFormError(null);
                  setFormOpen(true);
                }}
                className="btn-primary inline-flex min-h-11 items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium"
              >
                <Plus className="size-4" />
                {tr("datacenterAddDevice")}
              </button>
            ) : null}
          </div>

          {managedByCustomer ? (
            ownDevices.length > 0 ? (
              <ul className="divide-y divide-border rounded-xl border border-border">
                {ownDevices.map((device) => (
                  <li key={device.id} className="flex items-center gap-3 px-3 py-2.5">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-(--text-primary)">
                        {device.name || unitRangeLabel(tr, device)}
                      </p>
                      <p className="text-xs text-(--text-muted)">
                        {deviceKindLabel(tr, device.kind)} · {unitRangeLabel(tr, device)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(device)}
                      aria-label={tr("datacenterDeleteDevice")}
                      className="grid size-11 shrink-0 place-items-center rounded-xl text-(--error) hover:bg-(--error)/10"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="rounded-xl border border-border bg-(--surface-soft) px-3 py-2 text-xs text-(--text-muted)">
                {tr("datacenterNoOwnDevices")}
              </p>
            )
          ) : (
            <p className="rounded-xl border border-border bg-(--surface-soft) px-3 py-2 text-xs text-(--text-muted)">
              {tr("datacenterManagedByOperatorHint")}
            </p>
          )}
        </div>
      ) : null}

      {formOpen && elevation ? (
        <DeviceFormModal
          t={tr}
          reservations={elevation.reservations}
          totalHeightU={elevation.rack.totalHeightU}
          busy={saving}
          error={formError}
          onClose={() => setFormOpen(false)}
          onSubmit={handleCreate}
        />
      ) : null}

      {deleteTarget ? (
        <ConfirmModal
          open
          title={tr("datacenterDeleteDevice")}
          description={tr("datacenterDeleteDeviceConfirm", {
            name: deleteTarget.name || unitRangeLabel(tr, deleteTarget),
          })}
          confirmLabel={tr("delete")}
          cancelLabel={tr("cancel")}
          destructive
          isLoading={deleting}
          onConfirm={() => void handleDelete()}
          onCancel={() => setDeleteTarget(null)}
        />
      ) : null}
    </section>
  );
}

function RackGrid({ elevation, t }: { elevation: DatacenterRackElevation; t: Translate }) {
  const { rack, reservations, devices, anonymousOccupied } = elevation;
  const totalHeightU = rack.totalHeightU;
  const units = useMemo(() => {
    const list: number[] = [];
    for (let unit = totalHeightU; unit >= 1; unit -= 1) list.push(unit);
    return list;
  }, [totalHeightU]);

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <div className="grid grid-cols-[2.25rem_minmax(0,1fr)] auto-rows-[minmax(1.9rem,auto)]">
        {units.map((unit, index) => {
          const last = index === units.length - 1;
          return (
            <Fragment key={unit}>
              <div
                style={{ gridColumn: 1, gridRow: index + 1 }}
                className={cn(
                  "flex items-center justify-end pr-1.5 text-[11px] tabular-nums leading-none text-(--text-muted)",
                  !last && "border-b border-border/40",
                )}
              >
                {unit}
              </div>
              <div
                style={{ gridColumn: 2, gridRow: index + 1 }}
                className={cn("border-l border-border/40", !last && "border-b border-border/40")}
              />
            </Fragment>
          );
        })}

        {reservations.map((reservation) => (
          <div
            key={`reservation-${reservation.id}`}
            style={rangeGridStyle(reservation, totalHeightU)}
            className="pointer-events-none z-0 m-0.5 rounded-md border border-(--brand-primary)/30 border-l-4 border-l-(--brand-primary) bg-(--brand-primary)/10"
          />
        ))}

        {anonymousOccupied.map((range, index) => (
          <div
            key={`anonymous-${index}-${range.unitStart}-${range.unitHeight}`}
            style={rangeGridStyle(range, totalHeightU)}
            className="pointer-events-none z-0 m-0.5 flex items-center justify-center overflow-hidden rounded-md border border-dashed border-border bg-(--surface-soft)"
          >
            <span className="truncate px-1 text-[10px] leading-none text-(--text-muted)">
              {t("datacenterOccupied")}
            </span>
          </div>
        ))}

        {devices.map((device) => (
          <div
            key={`device-${device.id}`}
            style={rangeGridStyle(device, totalHeightU)}
            className="z-10 m-0.5 flex min-w-0 items-center gap-1.5 overflow-hidden rounded-md border border-border border-l-4 border-l-(--brand-primary) bg-(--bg-elevated) px-2 py-1"
          >
            <span className="shrink-0 rounded bg-(--surface-soft) px-1 py-0.5 text-[10px] leading-none font-medium text-(--text-muted)">
              {deviceKindLabel(t, device.kind)}
            </span>
            <span className="min-w-0 truncate text-xs font-medium text-(--text-primary)">
              {device.name || unitRangeLabel(t, device)}
            </span>
            <span className="ml-auto shrink-0 text-[10px] leading-none tabular-nums text-(--text-muted)">
              {unitRangeLabel(t, device)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function RackLegend({ t }: { t: Translate }) {
  const items: Array<{ className: string; label: string }> = [
    { className: "border border-border border-l-4 border-l-(--brand-primary) bg-(--bg-elevated)", label: t("datacenterLegendDevice") },
    { className: "border border-(--brand-primary)/30 border-l-4 border-l-(--brand-primary) bg-(--brand-primary)/10", label: t("datacenterLegendReservation") },
    { className: "border border-dashed border-border bg-(--surface-soft)", label: t("datacenterLegendOccupied") },
    { className: "border border-border/60", label: t("datacenterLegendFree") },
  ];

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-(--text-muted)">
      {items.map((item) => (
        <span key={item.label} className="inline-flex items-center gap-1.5">
          <span className={cn("h-3 w-3 shrink-0 rounded-[3px]", item.className)} aria-hidden />
          {item.label}
        </span>
      ))}
    </div>
  );
}

function CablingSection({
  cabling,
  t,
  lang,
}: {
  cabling: DatacenterCabling | null;
  t: Translate;
  lang: string;
}) {
  const deviceById = useMemo(() => {
    const map = new Map<string, DatacenterCablingDevice>();
    for (const device of cabling?.devices ?? []) map.set(device.id, device);
    return map;
  }, [cabling]);

  const portById = useMemo(() => {
    const map = new Map<string, DatacenterCablingPort>();
    for (const port of cabling?.ports ?? []) map.set(port.id, port);
    return map;
  }, [cabling]);

  const portsByDevice = useMemo(() => {
    const map = new Map<string, DatacenterCablingPort[]>();
    for (const port of cabling?.ports ?? []) {
      const list = map.get(port.deviceId) ?? [];
      list.push(port);
      map.set(port.deviceId, list);
    }
    for (const list of map.values()) {
      list.sort((a, b) => (a.portIndex ?? 0) - (b.portIndex ?? 0) || a.name.localeCompare(b.name, "de"));
    }
    return map;
  }, [cabling]);

  const ipsByPort = useMemo(() => {
    const map = new Map<string, DatacenterCablingIp[]>();
    for (const ip of cabling?.ips ?? []) {
      const list = map.get(ip.portId) ?? [];
      list.push(ip);
      map.set(ip.portId, list);
    }
    return map;
  }, [cabling]);

  const operatorLabel = cabling?.operatorLabel || t("datacenterCableOperatorEndpoint");

  return (
    <section className="space-y-4 border-t border-border pt-4">
      <div className="flex items-center gap-2">
        <Link2 className="size-4 text-(--text-muted)" />
        <h3 className="text-sm font-semibold text-(--text-primary)">{t("datacenterCablingTitle")}</h3>
      </div>

      {!cabling ? (
        <p className="rounded-xl border border-border bg-(--surface-soft) px-3 py-2 text-xs text-(--text-muted)">
          {t("datacenterCablingNoRack")}
        </p>
      ) : (
        <>
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-(--text-muted)">
              {t("datacenterDevicesTitle")}
            </h4>
            {cabling.devices.length === 0 ? (
              <p className="rounded-xl border border-border bg-(--surface-soft) px-3 py-2 text-xs text-(--text-muted)">
                {t("datacenterCablingNoDevices")}
              </p>
            ) : (
              <div className="space-y-2">
                {cabling.devices.map((device) => (
                  <article key={device.id} className="min-w-0 rounded-xl border border-border bg-(--bg-elevated) p-3">
                    <header className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="min-w-0 break-words text-sm font-medium text-(--text-primary)">
                        {device.name || unitRangeLabel(t, device)}
                      </span>
                      <span className="rounded bg-(--surface-soft) px-1.5 py-0.5 text-[10px] leading-none font-medium text-(--text-muted)">
                        {deviceKindLabel(t, device.kind)}
                      </span>
                      <span className="text-xs tabular-nums text-(--text-muted)">
                        {unitRangeLabel(t, device)}
                      </span>
                    </header>
                    <div className="mt-2 space-y-1.5">
                      {(portsByDevice.get(device.id) ?? []).length === 0 ? (
                        <p className="text-xs text-(--text-muted)">{t("datacenterCablingNoPorts")}</p>
                      ) : (
                        (portsByDevice.get(device.id) ?? []).map((port) => (
                          <PortRow key={port.id} port={port} ips={ipsByPort.get(port.id) ?? []} t={t} lang={lang} />
                        ))
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-(--text-muted)">
              {t("datacenterCablingConnectionsTitle")}
            </h4>
            {cabling.cables.length === 0 ? (
              <p className="rounded-xl border border-border bg-(--surface-soft) px-3 py-2 text-xs text-(--text-muted)">
                {t("datacenterCablingNoConnections")}
              </p>
            ) : (
              <ul className="divide-y divide-border rounded-xl border border-border bg-(--bg-elevated) px-3">
                {cabling.cables.map((cable) => (
                  <CableRow
                    key={cable.id}
                    cable={cable}
                    portById={portById}
                    deviceById={deviceById}
                    operatorLabel={operatorLabel}
                    t={t}
                    lang={lang}
                  />
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </section>
  );
}

function PortRow({
  port,
  ips,
  t,
  lang,
}: {
  port: DatacenterCablingPort;
  ips: DatacenterCablingIp[];
  t: Translate;
  lang: string;
}) {
  const speed = formatSpeed(t, lang, port.speedMbps);
  const status = String(port.status ?? "FREE").toUpperCase();

  return (
    <div className="min-w-0 rounded-lg bg-(--surface-soft) px-3 py-2">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <span className="min-w-0 break-words text-sm font-medium text-(--text-primary)">
          {port.name || "—"}
        </span>
        <span className="text-xs text-(--text-muted)">{portKindLabel(t, port.kind)}</span>
        {speed ? <span className="text-xs tabular-nums text-(--text-secondary)">{speed}</span> : null}
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-[10px] font-medium",
            status === "USED"
              ? "bg-(--brand-primary)/10 text-(--brand-primary)"
              : status === "DEFECT"
                ? "bg-(--error)/10 text-(--error)"
                : "bg-(--surface-strong) text-(--text-muted)",
          )}
        >
          {portStatusLabel(t, status)}
        </span>
      </div>
      {ips.length > 0 ? (
        <ul className="mt-1.5 space-y-0.5">
          {ips.map((ip) => (
            <li key={ip.id} className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-(--text-secondary)">
              <span className="break-all font-mono tabular-nums text-(--text-primary)">
                {ip.prefixLength !== null && ip.prefixLength !== undefined
                  ? `${ip.ipAddress}/${ip.prefixLength}`
                  : ip.ipAddress}
              </span>
              {ip.isPrimary ? (
                <span className="rounded bg-(--surface-strong) px-1 py-0.5 text-[10px] leading-none text-(--text-muted)">
                  {t("datacenterIpPrimary")}
                </span>
              ) : null}
              {ip.gateway ? (
                <span className="text-(--text-muted)">{t("datacenterIpGateway", { gateway: ip.gateway })}</span>
              ) : null}
              {ip.vlanId !== null && ip.vlanId !== undefined ? (
                <span className="text-(--text-muted)">{t("datacenterIpVlan", { vlan: ip.vlanId })}</span>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function CableEndpoint({
  port,
  device,
  operatorLabel,
  t,
}: {
  port: DatacenterCablingPort | null;
  device: DatacenterCablingDevice | null;
  operatorLabel: string;
  t: Translate;
}) {
  if (!port) {
    return (
      <span className="inline-flex items-center gap-1 text-sm text-(--text-secondary)">
        <Link2 className="size-3.5 shrink-0 text-(--text-muted)" />
        {operatorLabel}
      </span>
    );
  }

  return (
    <span className="inline-flex min-w-0 flex-wrap items-baseline gap-1.5">
      <span className="min-w-0 break-words text-sm font-medium text-(--text-primary)">
        {port.name || "—"}
      </span>
      {device ? <span className="min-w-0 break-words text-xs text-(--text-muted)">{device.name}</span> : null}
    </span>
  );
}

function CableRow({
  cable,
  portById,
  deviceById,
  operatorLabel,
  t,
  lang,
}: {
  cable: DatacenterCablingCable;
  portById: Map<string, DatacenterCablingPort>;
  deviceById: Map<string, DatacenterCablingDevice>;
  operatorLabel: string;
  t: Translate;
  lang: string;
}) {
  const fromPort = portById.get(cable.fromPortId) ?? null;
  const toPort = portById.get(cable.toPortId) ?? null;
  const fromDevice = fromPort ? deviceById.get(fromPort.deviceId) ?? null : null;
  const toDevice = toPort ? deviceById.get(toPort.deviceId) ?? null : null;
  const speed = formatSpeed(t, lang, cable.speedMbps);
  const status = String(cable.status ?? "CONNECTED").toUpperCase();

  return (
    <li className="flex flex-wrap items-center gap-x-2 gap-y-1 py-2.5">
      <CableEndpoint port={fromPort} device={fromDevice} operatorLabel={operatorLabel} t={t} />
      <ArrowRight className="size-4 shrink-0 text-(--text-muted)" />
      <CableEndpoint port={toPort} device={toDevice} operatorLabel={operatorLabel} t={t} />
      <span className="ml-auto flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-(--text-muted)">
        {cable.label ? <span className="tabular-nums">{t("datacenterCableNumber", { label: cable.label })}</span> : null}
        {speed ? <span className="tabular-nums">{speed}</span> : null}
        {status !== "CONNECTED" ? (
          <span className="rounded-full bg-(--surface-strong) px-2 py-0.5 text-[10px]">
            {cableStatusLabel(t, status)}
          </span>
        ) : null}
      </span>
    </li>
  );
}

function DeviceFormModal({
  t,
  reservations,
  totalHeightU,
  busy,
  error,
  onClose,
  onSubmit,
}: {
  t: Translate;
  reservations: DatacenterUnitRange[];
  totalHeightU: number;
  busy: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (values: {
    name: string;
    unitStart: number;
    unitHeight: number;
    kind: string;
    depth: string;
  }) => void | Promise<void>;
}) {
  const firstReservation = reservations[0];
  const [name, setName] = useState("");
  const [unitStart, setUnitStart] = useState(firstReservation ? String(firstReservation.unitStart) : "1");
  const [unitHeight, setUnitHeight] = useState("1");
  const [kind, setKind] = useState<string>("SERVER");
  const [depth, setDepth] = useState<string>("FULL");
  const [validationError, setValidationError] = useState<string | null>(null);

  const validate = (): boolean => {
    const start = Math.floor(Number(unitStart));
    const height = Math.floor(Number(unitHeight));
    if (!name.trim()) {
      setValidationError(t("datacenterDeviceNameRequired"));
      return false;
    }
    if (!Number.isFinite(start) || start < 1 || !Number.isFinite(height) || height < 1) {
      setValidationError(t("datacenterUnitRangeInvalid"));
      return false;
    }
    const end = start + height - 1;
    if (end > totalHeightU) {
      setValidationError(t("datacenterUnitRangeOutside", { total: totalHeightU }));
      return false;
    }
    if (
      reservations.length > 0 &&
      !reservations.some(
        (reservation) =>
          start >= reservation.unitStart &&
          end <= reservation.unitStart + reservation.unitHeight - 1,
      )
    ) {
      setValidationError(t("datacenterUnitRangeOutsideReservation"));
      return false;
    }
    setValidationError(null);
    return true;
  };

  const submit = () => {
    if (!validate()) return;
    void onSubmit({
      name: name.trim(),
      unitStart: Math.floor(Number(unitStart)),
      unitHeight: Math.floor(Number(unitHeight)),
      kind,
      depth,
    });
  };

  const submitDisabled = busy || !name.trim() || !unitStart.trim() || !unitHeight.trim();

  return (
    <AppModal
      open
      onClose={onClose}
      closeAriaLabel={t("cancel")}
      closeDisabled={busy}
      maxWidthClassName="max-w-md"
      className="space-y-4 overflow-y-auto p-5"
    >
      <h2 className="text-lg font-semibold text-(--text-primary)">{t("datacenterNewDeviceTitle")}</h2>
      <div className="space-y-3">
        <label className="block space-y-1">
          <span className="text-xs text-(--text-muted)">{t("datacenterDeviceName")} *</span>
          <Input value={name} onChange={(event) => setName(event.target.value)} />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block space-y-1">
            <span className="text-xs text-(--text-muted)">{t("datacenterDeviceUnitStart")} *</span>
            <Input
              type="number"
              min={1}
              value={unitStart}
              onChange={(event) => setUnitStart(event.target.value)}
            />
          </label>
          <label className="block space-y-1">
            <span className="text-xs text-(--text-muted)">{t("datacenterDeviceUnitHeight")}</span>
            <Input
              type="number"
              min={1}
              value={unitHeight}
              onChange={(event) => setUnitHeight(event.target.value)}
            />
          </label>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <label className="block space-y-1">
            <span className="text-xs text-(--text-muted)">{t("datacenterDeviceKind")}</span>
            <select
              value={kind}
              onChange={(event) => setKind(event.target.value)}
              className="h-9 w-full rounded-(--radius-control) border border-border bg-(--bg-elevated) px-3 text-sm text-(--text-primary)"
            >
              {DEVICE_KINDS.map((value) => (
                <option key={value} value={value}>
                  {deviceKindLabel(t, value)}
                </option>
              ))}
            </select>
          </label>
          <label className="block space-y-1">
            <span className="text-xs text-(--text-muted)">{t("datacenterDeviceDepth")}</span>
            <select
              value={depth}
              onChange={(event) => setDepth(event.target.value)}
              className="h-9 w-full rounded-(--radius-control) border border-border bg-(--bg-elevated) px-3 text-sm text-(--text-primary)"
            >
              {DEVICE_DEPTHS.map((value) => (
                <option key={value} value={value}>
                  {value === "HALF" ? t("datacenterDepthHalf") : t("datacenterDepthFull")}
                </option>
              ))}
            </select>
          </label>
        </div>
        <p className="text-xs text-(--text-muted)">* {t("requiredFieldLegend")}</p>
        {validationError || error ? (
          <p className="text-sm text-(--error)">{validationError ?? error}</p>
        ) : null}
      </div>
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="ghost" onClick={onClose} disabled={busy} className="rounded-xl">
          {t("cancel")}
        </Button>
        <Button onClick={submit} disabled={submitDisabled} className="justify-center rounded-xl">
          {busy ? <Loader2 className="size-4 animate-spin" /> : t("datacenterCreate")}
        </Button>
      </div>
    </AppModal>
  );
}
