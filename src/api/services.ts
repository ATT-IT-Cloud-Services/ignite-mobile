import { ResourceClient } from "./resource-client";
import type { IgniteClient } from "@ignite/api-client";
import type {
  ActionDispatchResponse,
  RawProviderViewResponse,
} from "../components/provider/types";

export type SubscriptionBillingCouponKind = "none" | "firstInvoiceOnly" | "infinite" | "finite";

export type SubscriptionBillingPreview = {
  billedCycleDays: number;
  regularRenewalGross: number;
  nextRenewalGross: number;
  couponKind: SubscriptionBillingCouponKind;
  couponAppliesToNextRenewal: boolean;
  couponCode: string | null;
  couponRecurringMonths: number | null;
  approxLastDiscountedBoundary: string | null;
  effectiveMonthsElapsedAtNextRenewal: number;
  orderCouponCodeSnapshot?: string | null;
  orderCouponDiscountAmount?: number | null;
  adminScheduledAppliesToNextRenewal: boolean;
  adminScheduledPercent: number | null;
};

export type ServiceSubscriptionSummary = {
  id: string;
  billingCycleDays: number;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  status: string;
  canceledAt: string | null;
  nextBillingCycleDays: number | null;
  permanentDiscountPercent?: number | null;
  billingMode?: string;
  bindingEndsAt?: string | null;
  earlyTerminationFeePercent?: number | null;
  contractNoticeDays?: number | null;
  options?: {
    autoBillingEnabled?: boolean;
    useNetPointsFirst?: boolean;
  };
  extendEligibility?: {
    bonusAvailable: boolean;
    loyaltyOfferAvailable?: boolean;
    cooldownUntil?: string;
  };
  cancellation?: {
    source: "admin" | "customer" | "system";
    reason: string;
    locked: boolean;
    scheduledAt: string;
  } | null;
  billingPreview?: SubscriptionBillingPreview | null;
};

export type ServiceContractDocuments = {
  billingMode: string;
  productName?: string;
  conditions: {
    billingCycleDays: number;
    contractTermMonths: number | null;
    contractDiscountPercent: number | null;
    bindingEndsAt: string | null;
    earlyTerminationFeePercent: number | null;
    contractNoticeDays: number | null;
    startedAt: string;
  };
  legalDocuments: Array<{ filename: string; downloadUrl: string }>;
};

// —— Datacenter / colocation (customer surfaces) ——

export type DatacenterUnitRange = { unitStart: number; unitHeight: number };

export type DatacenterRackDevice = DatacenterUnitRange & {
  id: string;
  name: string;
  kind: string;
  depth?: string;
  status?: string;
  managedBy?: string;
};

export type DatacenterRackReservation = DatacenterUnitRange & {
  id: string;
  mode: string;
  label?: string | null;
};

export type DatacenterRackElevation = {
  rack: { id: string; label: string; totalHeightU: number };
  reservations: DatacenterRackReservation[];
  devices: DatacenterRackDevice[];
  anonymousOccupied: DatacenterUnitRange[];
};

export type DatacenterRackResponse = {
  success: boolean;
  elevation: DatacenterRackElevation | null;
  error?: string;
  errorCode?: string;
};

export type DatacenterCablingDevice = DatacenterUnitRange & {
  id: string;
  name: string;
  kind: string;
  depth?: string;
  managedBy?: string;
};

export type DatacenterCablingPort = {
  id: string;
  deviceId: string;
  name: string;
  kind: string;
  speedMbps: number | null;
  portIndex?: number;
  status?: string;
  poe?: boolean;
  customerConnectable?: boolean;
};

export type DatacenterCablingIp = {
  id: string;
  portId: string;
  ipAddress: string;
  prefixLength: number | null;
  gateway?: string | null;
  vlanId?: number | null;
  isPrimary?: boolean;
};

export type DatacenterCablingForeignPort = {
  name?: string;
  kind?: string;
  customerConnectable?: boolean;
};

export type DatacenterCablingCable = {
  id: string;
  label: string;
  cableType?: string;
  speedMbps: number | null;
  status: string;
  fromPortId: string;
  toPortId: string;
  fromDeviceId?: string | null;
  toDeviceId?: string | null;
  fromForeignPort?: DatacenterCablingForeignPort | null;
  toForeignPort?: DatacenterCablingForeignPort | null;
};

export type DatacenterCabling = {
  devices: DatacenterCablingDevice[];
  ports: DatacenterCablingPort[];
  ips: DatacenterCablingIp[];
  cables: DatacenterCablingCable[];
  operatorLabel: string | null;
};

export type DatacenterCablingResponse = {
  success: boolean;
  cabling: DatacenterCabling | null;
  error?: string;
  errorCode?: string;
};

export type DatacenterDevice = DatacenterUnitRange & {
  id: string;
  name: string;
  kind: string;
  depth?: string;
  status?: string;
  managedBy?: string;
  rackId?: string;
  serialNumber?: string | null;
  assetTag?: string | null;
  notes?: string | null;
};

export type DatacenterDevicesResponse = {
  success: boolean;
  devices: DatacenterDevice[];
  error?: string;
  errorCode?: string;
};

export type DatacenterDeviceCreateInput = {
  rackId: string;
  name: string;
  unitStart: number;
  unitHeight?: number;
  kind?: string;
  depth?: string;
  serialNumber?: string | null;
  assetTag?: string | null;
  notes?: string | null;
};

export type DatacenterDeviceUpdateInput = Partial<Omit<DatacenterDeviceCreateInput, "rackId">>;

export type DatacenterDeviceWriteResponse = {
  success: boolean;
  device?: DatacenterDevice;
  error?: string;
  errorCode?: string;
};

export class ServicesResource extends ResourceClient {
  constructor(client: IgniteClient) {
    super(client);
  }

  find(id: string) {
    return this.client.services.find(id) as Promise<{ success: boolean; server?: unknown }>;
  }

  list(limit = 50, view?: string) {
    return this.client.services.list(limit, view) as Promise<{
      success: boolean;
      servers?: unknown[];
      services?: unknown[];
      pagination?: { total: number };
    }>;
  }

  /** GET /services/:id/view — serialized provider ViewModel (tabs, widgets, actions, fields). */
  view(id: string) {
    return this.client.services.view(id) as Promise<RawProviderViewResponse>;
  }

  /** POST /services/:id/actions/:key — dispatch a schema action (start/stop/restart/…). */
  action(id: string, key: string, body?: Record<string, unknown>) {
    return this.client.services.action(id, key, body ?? {}) as Promise<ActionDispatchResponse>;
  }

  statusBatch(ids: string[]) {
    return this.client.services.statusBatch(ids) as Promise<{
      success: boolean;
      statuses: Record<string, Record<string, unknown>>;
    }>;
  }

  /** GET /services/:id/ploi/storage-history */
  storageHistory(id: string, hours = 72) {
    return this.client.services.storageHistory(id, hours);
  }

  /** GET /services/:id/subscription */
  subscriptionGet(id: string) {
    return this.client.services.subscription(id) as Promise<{
      success: boolean;
      subscription?: ServiceSubscriptionSummary;
    }>;
  }

  /** POST /services/:id/subscription/cancel */
  subscriptionCancel(
    id: string,
    immediate = false,
    body?: { mode?: string; reason?: string },
  ) {
    return this.client.services.subscriptionCancel(id, { immediate, ...body }) as Promise<{
      success: boolean;
      message?: string;
      currentPeriodEnd?: string;
      invoiceId?: string | null;
      cancellationCredit?: number;
      balanceAfter?: number | null;
    }>;
  }

  /** POST /services/:id/subscription/reactivate */
  subscriptionReactivate(id: string) {
    return this.client.services.subscriptionReactivate(id, {}) as Promise<{
      success: boolean;
      message?: string;
      currentPeriodEnd?: string;
    }>;
  }

  /** PATCH /services/:id/subscription/autopay */
  subscriptionAutopay(id: string, body: { autoBillingEnabled: boolean; useNetPointsFirst: boolean }) {
    return this.client.services.updateSubscriptionAutopay(id, body) as Promise<{
      success: boolean;
      subscription?: { id: string; options?: unknown };
    }>;
  }

  /** PATCH /services/:id/subscription/interval */
  subscriptionInterval(id: string, billingCycleDays: number) {
    return this.client.services.updateSubscriptionInterval(id, { billingCycleDays }) as Promise<{
      success: boolean;
      nextBillingCycleDays?: number;
      currentPeriodEnd?: string;
    }>;
  }

  /** POST /services/:id/subscription/extend */
  subscriptionExtend(
    id: string,
    body?: { withBonus?: boolean; withLoyaltyOffer?: boolean; extensionDays?: number },
  ) {
    return this.client.services.subscriptionExtend(id, body ?? {}) as Promise<{
      success: boolean;
      invoiceId?: string | null;
      extensionDays?: number;
      newPeriodEnd?: string;
    }>;
  }

  /** POST /services/:id/renew — renewal price preview */
  renewPreview(id: string, billingCycleDays: number) {
    return this.client.services.renew(id, { billingCycleDays }) as Promise<{
      success: boolean;
      price?: number;
      currentPeriodEnd?: string;
      newPeriodEnd?: string;
      maxDate?: string;
      subscriptionId?: string;
      promotionSavingsMonthlyApprox?: number;
    }>;
  }

  /** GET /services/:id/contract-documents */
  contractDocuments(id: string) {
    return this.client.services.contractDocuments(id) as Promise<
      { success: boolean } & Partial<ServiceContractDocuments>
    >;
  }

  /** GET /services/:id/billing-cycles */
  billingCycles(id: string) {
    return this.client.services.billingCycles(id) as Promise<{
      success: boolean;
      allowedBillingCycles?: number[];
    }>;
  }

  /** POST /services/:id/domain/withdraw — Widerruf vor Registrar-Ausführung */
  domainWithdraw(id: string) {
    return this.client.services.domainWithdraw(id, {}) as Promise<{
      success: boolean;
      amount?: number;
      domain?: string;
      error?: string;
    }>;
  }

  /** POST /services/:id/subscription/withdraw — Widerruf (Treuhand oder ausgeliefert) */
  subscriptionWithdraw(id: string) {
    return this.client.services.subscriptionWithdraw(id, {}) as Promise<{
      success: boolean;
      paymentReleased?: boolean;
      refunded?: boolean;
      credit?: number;
      balanceAfter?: number | null;
      errorCode?: string;
    }>;
  }

  /** POST /services/:id/subscription/accelerate — Bereitstellung beschleunigen */
  subscriptionAccelerate(id: string) {
    return this.client.services.subscriptionAccelerate(id, {}) as Promise<{ success: boolean; errorCode?: string }>;
  }

  /** GET /services/:id/traffic — Traffic-Verlauf (RRD) */
  traffic(id: string, timeframe: "hour" | "day" | "week" | "month" = "day") {
    return this.client.services.traffic(id, { timeframe }) as Promise<Record<string, unknown>>;
  }

  /** GET /services/:id/backups */
  backups(id: string) {
    return this.client.services.backups(id) as unknown as Promise<{
      success: boolean;
      backups?: Array<Record<string, unknown>>;
      maxBackups?: number;
    }>;
  }

  createBackup(id: string, body?: Record<string, unknown>) {
    return this.client.services.postBackups(id, body ?? {}) as unknown as Promise<{ success: boolean; errorKey?: string }>;
  }

  deleteBackup(id: string, backupId: string) {
    return this.client.services.deleteBackups(id, backupId) as unknown as Promise<{ success: boolean; errorKey?: string }>;
  }

  restoreBackup(id: string, backupId: string, body?: Record<string, unknown>) {
    return this.client.services.postBackupsIdbackupId(id, backupId, body ?? {}) as unknown as Promise<{ success: boolean; errorKey?: string }>;
  }

  downloadBackup(id: string, backupId: string) {
    return this.client.services.backupsDownload(id, backupId) as unknown as Promise<{ success: boolean; url?: string }>;
  }

  /** GET /services/:id/startup-variables */
  startupVariables(id: string) {
    return this.client.services.startupVariables(id) as unknown as Promise<{ success: boolean; variables?: Array<Record<string, unknown>> }>;
  }

  updateStartupVariable(id: string, body: Record<string, unknown>) {
    return this.client.services.updateStartupVariables(id, body) as unknown as Promise<{ success: boolean; variable?: Record<string, unknown>; errorKey?: string }>;
  }

  /** GET /services/:id/teamspeak */
  teamspeak(id: string, reveal = false) {
    return this.client.services.teamspeak(id, reveal ? { reveal: 1 } : undefined) as unknown as Promise<Record<string, unknown>>;
  }

  /** GET /services/:id/firewall */
  firewall(id: string) {
    return this.client.services.firewall(id) as unknown as Promise<{ success: boolean; rules?: Array<Record<string, unknown>>; enabled?: boolean }>;
  }

  reinstallTemplates(id: string) {
    return this.client.get(`/services/${encodeURIComponent(id)}/templates`) as unknown as Promise<{ success: boolean; templates?: Array<Record<string, unknown>> }>;
  }

  gameEula(id: string) {
    return this.client.get(`/services/${encodeURIComponent(id)}/game/eula`) as unknown as Promise<{ success?: boolean; required?: boolean; accepted?: boolean; text?: string }>;
  }

  acceptGameEula(id: string) {
    return this.client.post(`/services/${encodeURIComponent(id)}/game/eula`, { accepted: true }) as unknown as Promise<{ success?: boolean }>;
  }

  /** POST /services/:id/reinstall */
  reinstall(id: string, body: Record<string, unknown>) {
    return this.client.services.reinstall(id, body) as unknown as Promise<{ success: boolean; errorKey?: string }>;
  }

  /** GET /services/:id/backup-storage (Proxmox Backup Server) */
  backupStorage(id: string) {
    return this.client.services.backupStorage(id) as unknown as Promise<Record<string, unknown>>;
  }

  backupPruneJobs(id: string) {
    return this.client.services.backupsPrune(id) as unknown as Promise<{ success: boolean; jobs?: Array<Record<string, unknown>> }>;
  }

  startBackupPrune(id: string, body: Record<string, unknown>) {
    return this.client.services.postBackupsPrune(id, body) as unknown as Promise<{ success: boolean; job?: Record<string, unknown> }>;
  }

  createBackupNamespace(id: string, path: string) {
    return this.client.services.backupStorageNamespaces(id, { path }) as unknown as Promise<{ success: boolean; errorKey?: string }>;
  }

  deleteBackupNamespace(id: string, wildcard: string) {
    return this.client.services.deleteBackupStorageNamespaces(id, wildcard) as unknown as Promise<{ success: boolean }>;
  }

  ploiStorageHistory(id: string, hours = 72) {
    return this.client.services.ploiStorageHistory(id, { hours }) as unknown as Promise<{ success?: boolean; points?: Array<Record<string, unknown>> }>;
  }

  ploiDns(id: string) {
    return this.client.services.ploiDns(id) as unknown as Promise<Record<string, unknown>>;
  }

  /** Firewall (proxmox): list / add / delete / toggle. */
  firewallRules(id: string) {
    return this.client.services.firewall(id) as unknown as Promise<{ success: boolean; rules?: Array<Record<string, unknown>> }>;
  }

  addFirewallRule(id: string, rule: Record<string, unknown>) {
    return this.client.services.postFirewall(id, rule) as unknown as Promise<{ success: boolean; rule?: Record<string, unknown>; errorKey?: string }>;
  }

  deleteFirewallRule(id: string, ruleId: string) {
    return this.client.services.deleteFirewall(id, ruleId) as unknown as Promise<{ success: boolean; errorKey?: string }>;
  }

  updateFirewallRule(id: string, ruleId: string, body: Record<string, unknown>) {
    return this.client.services.updateFirewall(id, ruleId, body) as unknown as Promise<{ success: boolean; errorKey?: string }>;
  }

  cartUpgradeResources(serviceId: string, resourceChanges: Record<string, unknown>) {
    return this.client.post("/cart/upgrade", { serviceId, resourceChanges }) as unknown as Promise<Record<string, unknown>>;
  }

  cartUpgrade(serviceId: string, targetProductId: string) {
    return this.client.post("/cart/upgrade", { serviceId, targetProductId }) as unknown as Promise<Record<string, unknown>>;
  }

  /** Pterodactyl file manager. */
  files(id: string, directory = "/") {
    return this.client.services.files(id, { directory }) as unknown as Promise<{
      success: boolean;
      files?: Array<Record<string, unknown>>;
    }>;
  }

  readFile(id: string, file: string) {
    return this.client.services.postFiles(id, { action: "read", file }) as unknown as Promise<{ success: boolean; content?: string }>;
  }

  /** Plesk / KeyHelp credentials + domains (dynamic provider slug). */
  providerCredentials(id: string, slug: "plesk" | "keyhelp", reveal = false) {
    return this.client.get(`/services/${encodeURIComponent(id)}/${slug}/credentials`, reveal ? { reveal: 1 } : undefined) as unknown as Promise<Record<string, unknown>>;
  }

  rotateProviderCredentials(id: string, slug: "plesk" | "keyhelp") {
    return this.client.post(`/services/${encodeURIComponent(id)}/${slug}/credentials`, {}) as unknown as Promise<Record<string, unknown>>;
  }

  providerSetup(id: string, slug: "plesk" | "keyhelp") {
    return this.client.get(`/services/${encodeURIComponent(id)}/${slug}/setup`) as unknown as Promise<Record<string, unknown>>;
  }

  postProviderSetup(id: string, slug: "plesk" | "keyhelp", body: Record<string, unknown>) {
    return this.client.post(`/services/${encodeURIComponent(id)}/${slug}/setup`, body) as unknown as Promise<Record<string, unknown>>;
  }

  providerDomains(id: string, slug: "plesk" | "keyhelp") {
    return this.client.get(`/services/${encodeURIComponent(id)}/${slug}/domains`) as unknown as Promise<Record<string, unknown>>;
  }

  refreshProviderDomains(id: string, slug: "plesk" | "keyhelp") {
    return this.client.post(`/services/${encodeURIComponent(id)}/${slug}/domains`, {}) as unknown as Promise<Record<string, unknown>>;
  }

  /** Monitoring (proxmox/game). */
  monitoringTargets(id: string) {
    return this.client.services.monitoringTargets(id) as unknown as Promise<{ success: boolean; targets?: Array<Record<string, unknown>> }>;
  }

  monitoringScore(id: string) {
    return this.client.services.monitoringScore(id) as unknown as Promise<Record<string, unknown>>;
  }

  // —— Mailcow /mail/* ——

  mailDomains(id: string) {
    return this.client.services.mailDomains(id) as Promise<{
      domains?: Array<{
        name: string;
        active: boolean;
        createdAt: string;
        liveData?: { mboxes_in_domain: number; aliases_in_domain: number };
      }>;
      limits?: { used: number; max: number };
      setup?: unknown;
      liveDataUnavailable?: boolean;
      error?: string;
      errorCode?: string;
    }>;
  }

  mailDomainsCreate(id: string, body: Record<string, unknown>) {
    return this.client.services.postMailDomains(id, body) as Promise<{
      success?: boolean;
      setup?: unknown;
      dnsApply?: { applied?: unknown[]; skipped?: unknown[]; warnings?: unknown[] };
      dnsApplyError?: string;
      error?: string;
      errorCode?: string;
    }>;
  }

  mailDomainsDelete(id: string, domain: string) {
    return this.client.services.deleteMailDomains(id, undefined, { domain }) as Promise<{
      success?: boolean;
      setup?: unknown;
      error?: string;
      errorCode?: string;
    }>;
  }

  mailDnsZones(id: string) {
    return this.client.services.mailDnsZones(id) as Promise<{
      zones?: Array<{ id: string; domain: string }>;
      error?: string;
      errorCode?: string;
    }>;
  }

  mailDomainDns(id: string, domain: string) {
    return this.client.services.mailDomainsDns(id, { domain }) as Promise<{
      dns?: unknown;
      blueprint?: Array<{
        id: string;
        type: string;
        originLabel: string;
        value: string | null;
        manual?: boolean;
        manualHint?: string;
        mxPriority?: number;
        srvContent?: string;
        expectedMxExchange?: string;
        expectedTxtNormalized?: string;
      }>;
      mailHost?: string;
      setup?: unknown;
      error?: string;
      errorCode?: string;
    }>;
  }

  mailVerifyDns(id: string, domain: string) {
    return this.client.services.mailDomainsVerifyDns(id, { domain }) as Promise<{
      success?: boolean;
      checks?: Array<{ id: string; status: string; detail?: string }>;
      blueprint?: unknown;
      mailHost?: string;
      waitSeconds?: number;
      error?: string;
      errorCode?: string;
    }>;
  }

  mailApplyDns(id: string, domain: string) {
    return this.client.services.mailDomainsApplyDns(id, { domain }) as Promise<{
      success?: boolean;
      result?: { applied?: unknown[]; skipped?: unknown[]; warnings?: unknown[] };
      error?: string;
      errorCode?: string;
    }>;
  }

  mailMailboxes(id: string, domain?: string) {
    return this.client.services.mailMailboxes(id, domain ? { domain } : undefined) as Promise<{
      mailboxes?: Array<{
        address: string;
        domain: string;
        name: string;
        quotaGb: number;
        active: boolean;
      }>;
      limits?: { maxPerDomain: number; storagePerMailboxGb: number };
      setup?: unknown;
      error?: string;
      errorCode?: string;
    }>;
  }

  mailMailboxesCreate(id: string, body: Record<string, unknown>) {
    return this.client.services.postMailMailboxes(id, body) as Promise<{
      success?: boolean;
      error?: string;
      errorCode?: string;
    }>;
  }

  mailMailboxesPatch(id: string, body: Record<string, unknown>) {
    return this.client.services.updateMailMailboxes(id, body) as Promise<{
      success?: boolean;
      error?: string;
      errorCode?: string;
    }>;
  }

  mailMailboxesDelete(id: string, address: string) {
    return this.client.services.deleteMailMailboxes(id, undefined, { address }) as Promise<{
      success?: boolean;
      error?: string;
      errorCode?: string;
    }>;
  }

  mailAliases(id: string, domain: string) {
    return this.client.services.mailAliases(id, { domain }) as Promise<{
      aliases?: Array<{ id: number; address: string; goto: string; domain: string; active: number }>;
      error?: string;
      errorCode?: string;
    }>;
  }

  mailAliasesCreate(id: string, body: { address: string; goto: string }) {
    return this.client.services.postMailAliases(id, body) as Promise<{
      success?: boolean;
      error?: string;
      errorCode?: string;
    }>;
  }

  mailAliasesDelete(id: string, aliasId: number) {
    return this.client.services.deleteMailAliases(id, undefined, { aliasId }) as Promise<{
      success?: boolean;
      error?: string;
      errorCode?: string;
    }>;
  }

  // —— Datacenter / colocation (customer view) ——

  /** GET /services/:id/datacenter/rack — own reservation/device elevation + anonymous foreign units. */
  datacenterRack(id: string) {
    return this.client.services.datacenterRack(id) as unknown as Promise<DatacenterRackResponse>;
  }

  /** GET /services/:id/datacenter/cabling — own devices/ports/IPs and cables (foreign endpoints anonymized). */
  datacenterCabling(id: string) {
    return this.client.services.datacenterCabling(id) as unknown as Promise<DatacenterCablingResponse>;
  }

  /** GET /services/:id/datacenter/devices — own devices incl. managedBy (customer self-service probe). */
  datacenterDevices(id: string) {
    return this.client.services.datacenterDevices(id) as unknown as Promise<DatacenterDevicesResponse>;
  }

  /** POST /services/:id/datacenter/devices — create an own device (customer-managed products only). */
  datacenterDeviceCreate(id: string, body: DatacenterDeviceCreateInput) {
    return this.client.services.postDatacenterDevices(
      id,
      body as unknown as Record<string, unknown>,
    ) as unknown as Promise<DatacenterDeviceWriteResponse>;
  }

  /** PATCH /services/:id/datacenter/devices/:deviceId — update an own device. */
  datacenterDeviceUpdate(id: string, deviceId: string, body: DatacenterDeviceUpdateInput) {
    return this.client.services.updateDatacenterDevices(
      id,
      deviceId,
      body as unknown as Record<string, unknown>,
    ) as unknown as Promise<DatacenterDeviceWriteResponse>;
  }

  /** DELETE /services/:id/datacenter/devices/:deviceId — delete an own device. */
  datacenterDeviceDelete(id: string, deviceId: string) {
    return this.client.services.deleteDatacenterDevices(id, deviceId) as unknown as Promise<{
      success: boolean;
      error?: string;
      errorCode?: string;
    }>;
  }
}
