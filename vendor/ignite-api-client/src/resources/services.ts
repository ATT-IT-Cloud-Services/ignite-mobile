import { ResourceClient } from "../resource-client.js";
import type { QueryParams } from "../types.js";
import type {
  ActionDispatchResponse,
  ProviderViewResponse,
  ServiceDetailResponse,
  ServiceListResponse,
  StatusBatchResponse,
} from "../schemas/service.js";

export class ServicesResource extends ResourceClient {
  /**
   * Get a single service by ID.
   * @throws {import("../errors.js").ApiError} `serviceNotFound`, `unauthenticated`, `accessDenied`
   */
  find(id: string) {
    return this.get<ServiceDetailResponse>(`/services/${id}`);
  }

  /**
   * List services for the current account.
   * @throws {import("../errors.js").ApiError} `unauthenticated`
   */
  list(limit = 50, view?: string) {
    return this.get<ServiceListResponse>("/services", { limit, view });
  }

  /**
   * Get the serialized provider view model for a service.
   * @throws {import("../errors.js").ApiError} `serviceNotFound`, `unauthenticated`, `accessDenied`
   */
  view(id: string) {
    return this.get<ProviderViewResponse>(`/services/${encodeURIComponent(id)}/view`);
  }

  /**
   * Dispatch a provider action (start, stop, restart, etc.).
   * @throws {import("../errors.js").ApiError} `invalidAction`, `serviceNotFound`, `unauthenticated`
   */
  action(id: string, key: string, body?: Record<string, unknown>) {
    return this.post<ActionDispatchResponse>(
      `/services/${encodeURIComponent(id)}/actions/${encodeURIComponent(key)}`,
      body ?? {},
    );
  }

  /**
   * Batch-fetch status for multiple services.
   * @throws {import("../errors.js").ApiError} `unauthenticated`, `invalidRequest`
   */
  statusBatch(ids: string[]) {
    return this.post<StatusBatchResponse>("/services/status-batch", { ids });
  }

  /**
   * Fetch storage usage history for a website hosting service.
   */
  storageHistory(id: string, hours = 72) {
    return this.get<{ serviceId: string; points: Array<{ at: string; bytes: string; gb: number }> }>(
      `/services/${encodeURIComponent(id)}/ploi/storage-history`,
      { hours }
    );
  }

  /**
   * Get or apply the DNS blueprint for a website hosting service.
   */
  siteDns(id: string, body?: Record<string, unknown>) {
    const path = `/services/${encodeURIComponent(id)}/ploi/dns`;
    return body
      ? this.post<Record<string, unknown>>(path, body)
      : this.get<Record<string, unknown>>(path);
  }

  /**
   * Get panel credentials for a shared hosting service.
   * Password is only included when `reveal` is true (requires settings permission).
   */
  hostingCredentials(id: string, opts?: { reveal?: boolean }) {
    return this.get<{
      panelUrl: string | null;
      login: string | null;
      email: string | null;
      hasPassword: boolean;
      password: string | null;
    }>(`/services/${encodeURIComponent(id)}/plesk/credentials`, {
      reveal: opts?.reveal ? "1" : undefined,
    });
  }

  /**
   * Rotate the panel password for a shared hosting service.
   */
  rotateHostingCredentials(id: string) {
    return this.post<{
      ok: boolean;
      password: string;
      panelUrl?: string;
      login?: string;
      email?: string;
    }>(`/services/${encodeURIComponent(id)}/plesk/credentials`, {});
  }

  /**
   * List domains linked to a shared hosting service.
   */
  hostingDomains(id: string) {
    return this.get<{
      domains: unknown;
      lastDomainSyncAt?: string;
      lastManualRefreshAt?: string;
      maxDomains?: number;
      storagePerDomainGb?: number;
      maxMailboxesPerDomain?: number;
      dnsManagement?: number;
    }>(`/services/${encodeURIComponent(id)}/plesk/domains`);
  }

  /**
   * Refresh the domain list for a shared hosting service.
   */
  refreshHostingDomains(id: string) {
    return this.post<{ ok: boolean; domains: unknown }>(
      `/services/${encodeURIComponent(id)}/plesk/domains`,
      {},
    );
  }

  // <generated-openapi>
  /**
   * @generated POST /services
   */
  create(body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/services`, body);
  }

  /**
   * @generated DELETE /services/[id]
   */
  remove(id: string, query?: QueryParams, body?: Record<string, unknown>) {
    return this.del<Record<string, unknown>>(`/services/${encodeURIComponent(id)}`, query, body);
  }

  /**
   * @generated PATCH /services/[id]
   */
  update(id: string, body?: Record<string, unknown>) {
    return this.patch<Record<string, unknown>>(`/services/${encodeURIComponent(id)}`, body);
  }

  /**
   * @generated POST /services/[id]/action
   */
  postAction(id: string, body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/services/${encodeURIComponent(id)}/action`, body);
  }

  /**
   * @generated GET /services/[id]/activity
   */
  activity(id: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/services/${encodeURIComponent(id)}/activity`, query);
  }

  /**
   * @generated GET /services/[id]/allocations
   */
  allocations(id: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/services/${encodeURIComponent(id)}/allocations`, query);
  }

  /**
   * @generated POST /services/[id]/apply-downgrade
   */
  applyDowngrade(id: string, body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/services/${encodeURIComponent(id)}/apply-downgrade`, body);
  }

  /**
   * @generated GET /services/[id]/backup-storage
   */
  backupStorage(id: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/services/${encodeURIComponent(id)}/backup-storage`, query);
  }

  /**
   * @generated POST /services/[id]/backup-storage/namespaces
   */
  backupStorageNamespaces(id: string, body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/services/${encodeURIComponent(id)}/backup-storage/namespaces`, body);
  }

  /**
   * @generated DELETE /services/[id]/backup-storage/namespaces/[...path]
   */
  deleteBackupStorageNamespaces(id: string, wildcard: string, query?: QueryParams, body?: Record<string, unknown>) {
    return this.del<Record<string, unknown>>(`/services/${encodeURIComponent(id)}/backup-storage/namespaces/${wildcard.replace(/^\//, "")}`, query, body);
  }

  /**
   * @generated GET /services/[id]/backups
   */
  backups(id: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/services/${encodeURIComponent(id)}/backups`, query);
  }

  /**
   * @generated POST /services/[id]/backups
   */
  postBackups(id: string, body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/services/${encodeURIComponent(id)}/backups`, body);
  }

  /**
   * @generated DELETE /services/[id]/backups/[backupId]
   */
  deleteBackups(id: string, backupId: string, query?: QueryParams, body?: Record<string, unknown>) {
    return this.del<Record<string, unknown>>(`/services/${encodeURIComponent(id)}/backups/${encodeURIComponent(backupId)}`, query, body);
  }

  /**
   * @generated POST /services/[id]/backups/[backupId]
   */
  postBackupsIdbackupId(id: string, backupId: string, body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/services/${encodeURIComponent(id)}/backups/${encodeURIComponent(backupId)}`, body);
  }

  /**
   * @generated GET /services/[id]/backups/[backupId]/download
   */
  backupsDownload(id: string, backupId: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/services/${encodeURIComponent(id)}/backups/${encodeURIComponent(backupId)}/download`, query);
  }

  /**
   * @generated GET /services/[id]/backups/prune
   */
  backupsPrune(id: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/services/${encodeURIComponent(id)}/backups/prune`, query);
  }

  /**
   * @generated POST /services/[id]/backups/prune
   */
  postBackupsPrune(id: string, body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/services/${encodeURIComponent(id)}/backups/prune`, body);
  }

  /**
   * @generated GET /services/[id]/backups/prune/[jobId]
   */
  getBackupsPrune(id: string, jobId: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/services/${encodeURIComponent(id)}/backups/prune/${encodeURIComponent(jobId)}`, query);
  }

  /**
   * @generated GET /services/[id]/bandwidth-usage
   */
  bandwidthUsage(id: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/services/${encodeURIComponent(id)}/bandwidth-usage`, query);
  }

  /**
   * @generated GET /services/[id]/billing-cycles
   */
  billingCycles(id: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/services/${encodeURIComponent(id)}/billing-cycles`, query);
  }

  /**
   * @generated GET /services/[id]/console
   */
  console(id: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/services/${encodeURIComponent(id)}/console`, query);
  }

  /**
   * @generated POST /services/[id]/console
   */
  postConsole(id: string, body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/services/${encodeURIComponent(id)}/console`, body);
  }

  /**
   * @generated POST /services/[id]/console/command
   */
  consoleCommand(id: string, body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/services/${encodeURIComponent(id)}/console/command`, body);
  }

  /**
   * @generated GET /services/[id]/console/embed
   */
  consoleEmbed(id: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/services/${encodeURIComponent(id)}/console/embed`, query);
  }

  /**
   * @generated GET /services/[id]/console/stream
   */
  consoleStream(id: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/services/${encodeURIComponent(id)}/console/stream`, query);
  }

  /**
   * @generated POST /services/[id]/content/install
   */
  contentInstall(id: string, body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/services/${encodeURIComponent(id)}/content/install`, body);
  }

  /**
   * @generated GET /services/[id]/content/jobs
   */
  contentJobs(id: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/services/${encodeURIComponent(id)}/content/jobs`, query);
  }

  /**
   * @generated GET /services/[id]/content/jobs/[jobId]
   */
  getContentJobs(id: string, jobId: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/services/${encodeURIComponent(id)}/content/jobs/${encodeURIComponent(jobId)}`, query);
  }

  /**
   * @generated GET /services/[id]/content/projects/[projectId]
   */
  contentProjects(id: string, projectId: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/services/${encodeURIComponent(id)}/content/projects/${encodeURIComponent(projectId)}`, query);
  }

  /**
   * @generated GET /services/[id]/content/search
   */
  contentSearch(id: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/services/${encodeURIComponent(id)}/content/search`, query);
  }

  /**
   * @generated GET /services/[id]/content/sources
   */
  contentSources(id: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/services/${encodeURIComponent(id)}/content/sources`, query);
  }

  /**
   * @generated GET /services/[id]/contract-documents
   */
  contractDocuments(id: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/services/${encodeURIComponent(id)}/contract-documents`, query);
  }

  /**
   * @generated GET /services/[id]/contract-documents/[filename]
   */
  getContractDocuments(id: string, filename: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/services/${encodeURIComponent(id)}/contract-documents/${encodeURIComponent(filename)}`, query);
  }

  /**
   * @generated GET /services/[id]/datacenter/cabling
   */
  datacenterCabling(id: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/services/${encodeURIComponent(id)}/datacenter/cabling`, query);
  }

  /**
   * @generated GET /services/[id]/datacenter/devices
   */
  datacenterDevices(id: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/services/${encodeURIComponent(id)}/datacenter/devices`, query);
  }

  /**
   * @generated POST /services/[id]/datacenter/devices
   */
  postDatacenterDevices(id: string, body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/services/${encodeURIComponent(id)}/datacenter/devices`, body);
  }

  /**
   * @generated DELETE /services/[id]/datacenter/devices/[deviceId]
   */
  deleteDatacenterDevices(id: string, deviceId: string, query?: QueryParams, body?: Record<string, unknown>) {
    return this.del<Record<string, unknown>>(`/services/${encodeURIComponent(id)}/datacenter/devices/${encodeURIComponent(deviceId)}`, query, body);
  }

  /**
   * @generated PATCH /services/[id]/datacenter/devices/[deviceId]
   */
  updateDatacenterDevices(id: string, deviceId: string, body?: Record<string, unknown>) {
    return this.patch<Record<string, unknown>>(`/services/${encodeURIComponent(id)}/datacenter/devices/${encodeURIComponent(deviceId)}`, body);
  }

  /**
   * @generated GET /services/[id]/datacenter/rack
   */
  datacenterRack(id: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/services/${encodeURIComponent(id)}/datacenter/rack`, query);
  }

  /**
   * @generated GET /services/[id]/disk-usage
   */
  diskUsage(id: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/services/${encodeURIComponent(id)}/disk-usage`, query);
  }

  /**
   * @generated POST /services/[id]/domain/withdraw
   */
  domainWithdraw(id: string, body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/services/${encodeURIComponent(id)}/domain/withdraw`, body);
  }

  /**
   * @generated GET /services/[id]/eggs
   */
  eggs(id: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/services/${encodeURIComponent(id)}/eggs`, query);
  }

  /**
   * @generated GET /services/[id]/features
   */
  features(id: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/services/${encodeURIComponent(id)}/features`, query);
  }

  /**
   * @generated GET /services/[id]/files
   */
  files(id: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/services/${encodeURIComponent(id)}/files`, query);
  }

  /**
   * @generated POST /services/[id]/files
   */
  postFiles(id: string, body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/services/${encodeURIComponent(id)}/files`, body);
  }

  /**
   * @generated GET /services/[id]/firewall
   */
  firewall(id: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/services/${encodeURIComponent(id)}/firewall`, query);
  }

  /**
   * @generated POST /services/[id]/firewall
   */
  postFirewall(id: string, body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/services/${encodeURIComponent(id)}/firewall`, body);
  }

  /**
   * @generated DELETE /services/[id]/firewall/[ruleId]
   */
  deleteFirewall(id: string, ruleId: string, query?: QueryParams, body?: Record<string, unknown>) {
    return this.del<Record<string, unknown>>(`/services/${encodeURIComponent(id)}/firewall/${encodeURIComponent(ruleId)}`, query, body);
  }

  /**
   * @generated PATCH /services/[id]/firewall/[ruleId]
   */
  updateFirewall(id: string, ruleId: string, body?: Record<string, unknown>) {
    return this.patch<Record<string, unknown>>(`/services/${encodeURIComponent(id)}/firewall/${encodeURIComponent(ruleId)}`, body);
  }

  /**
   * @generated GET /services/[id]/game-auth
   */
  gameAuth(id: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/services/${encodeURIComponent(id)}/game-auth`, query);
  }

  /**
   * @generated POST /services/[id]/game-auth
   */
  postGameAuth(id: string, body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/services/${encodeURIComponent(id)}/game-auth`, body);
  }

  /**
   * @generated GET /services/[id]/game/eula
   */
  gameEula(id: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/services/${encodeURIComponent(id)}/game/eula`, query);
  }

  /**
   * @generated POST /services/[id]/game/eula
   */
  postGameEula(id: string, body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/services/${encodeURIComponent(id)}/game/eula`, body);
  }

  /**
   * @generated DELETE /services/[id]/ips/cancel
   */
  deleteIpsCancel(id: string, query?: QueryParams, body?: Record<string, unknown>) {
    return this.del<Record<string, unknown>>(`/services/${encodeURIComponent(id)}/ips/cancel`, query, body);
  }

  /**
   * @generated POST /services/[id]/ips/cancel
   */
  ipsCancel(id: string, body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/services/${encodeURIComponent(id)}/ips/cancel`, body);
  }

  /**
   * @generated GET /services/[id]/keyhelp/credentials
   */
  keyhelpCredentials(id: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/services/${encodeURIComponent(id)}/keyhelp/credentials`, query);
  }

  /**
   * @generated POST /services/[id]/keyhelp/credentials
   */
  postKeyhelpCredentials(id: string, body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/services/${encodeURIComponent(id)}/keyhelp/credentials`, body);
  }

  /**
   * @generated GET /services/[id]/keyhelp/domains
   */
  keyhelpDomains(id: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/services/${encodeURIComponent(id)}/keyhelp/domains`, query);
  }

  /**
   * @generated POST /services/[id]/keyhelp/domains
   */
  postKeyhelpDomains(id: string, body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/services/${encodeURIComponent(id)}/keyhelp/domains`, body);
  }

  /**
   * @generated POST /services/[id]/keyhelp/reset
   */
  keyhelpReset(id: string, body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/services/${encodeURIComponent(id)}/keyhelp/reset`, body);
  }

  /**
   * @generated GET /services/[id]/keyhelp/setup
   */
  keyhelpSetup(id: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/services/${encodeURIComponent(id)}/keyhelp/setup`, query);
  }

  /**
   * @generated POST /services/[id]/keyhelp/setup
   */
  postKeyhelpSetup(id: string, body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/services/${encodeURIComponent(id)}/keyhelp/setup`, body);
  }

  /**
   * @generated GET /services/[id]/labels
   */
  labels(id: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/services/${encodeURIComponent(id)}/labels`, query);
  }

  /**
   * @generated POST /services/[id]/labels
   */
  postLabels(id: string, body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/services/${encodeURIComponent(id)}/labels`, body);
  }

  /**
   * @generated DELETE /services/[id]/labels/[labelId]
   */
  deleteLabels(id: string, labelId: string, query?: QueryParams, body?: Record<string, unknown>) {
    return this.del<Record<string, unknown>>(`/services/${encodeURIComponent(id)}/labels/${encodeURIComponent(labelId)}`, query, body);
  }

  /**
   * @generated PATCH /services/[id]/labels/[labelId]
   */
  updateLabels(id: string, labelId: string, body?: Record<string, unknown>) {
    return this.patch<Record<string, unknown>>(`/services/${encodeURIComponent(id)}/labels/${encodeURIComponent(labelId)}`, body);
  }

  /**
   * @generated PUT /services/[id]/labels/assignments
   */
  replaceLabelsAssignments(id: string, body?: Record<string, unknown>) {
    return this.put<Record<string, unknown>>(`/services/${encodeURIComponent(id)}/labels/assignments`, body);
  }

  /**
   * @generated DELETE /services/[id]/mail/aliases
   */
  deleteMailAliases(id: string, query?: QueryParams, body?: Record<string, unknown>) {
    return this.del<Record<string, unknown>>(`/services/${encodeURIComponent(id)}/mail/aliases`, query, body);
  }

  /**
   * @generated GET /services/[id]/mail/aliases
   */
  mailAliases(id: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/services/${encodeURIComponent(id)}/mail/aliases`, query);
  }

  /**
   * @generated POST /services/[id]/mail/aliases
   */
  postMailAliases(id: string, body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/services/${encodeURIComponent(id)}/mail/aliases`, body);
  }

  /**
   * @generated GET /services/[id]/mail/dns-zones
   */
  mailDnsZones(id: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/services/${encodeURIComponent(id)}/mail/dns-zones`, query);
  }

  /**
   * @generated DELETE /services/[id]/mail/domains
   */
  deleteMailDomains(id: string, query?: QueryParams, body?: Record<string, unknown>) {
    return this.del<Record<string, unknown>>(`/services/${encodeURIComponent(id)}/mail/domains`, query, body);
  }

  /**
   * @generated GET /services/[id]/mail/domains
   */
  mailDomains(id: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/services/${encodeURIComponent(id)}/mail/domains`, query);
  }

  /**
   * @generated POST /services/[id]/mail/domains
   */
  postMailDomains(id: string, body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/services/${encodeURIComponent(id)}/mail/domains`, body);
  }

  /**
   * @generated POST /services/[id]/mail/domains/apply-dns
   */
  mailDomainsApplyDns(id: string, body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/services/${encodeURIComponent(id)}/mail/domains/apply-dns`, body);
  }

  /**
   * @generated GET /services/[id]/mail/domains/dns
   */
  mailDomainsDns(id: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/services/${encodeURIComponent(id)}/mail/domains/dns`, query);
  }

  /**
   * @generated POST /services/[id]/mail/domains/verify-dns
   */
  mailDomainsVerifyDns(id: string, body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/services/${encodeURIComponent(id)}/mail/domains/verify-dns`, body);
  }

  /**
   * @generated DELETE /services/[id]/mail/mailboxes
   */
  deleteMailMailboxes(id: string, query?: QueryParams, body?: Record<string, unknown>) {
    return this.del<Record<string, unknown>>(`/services/${encodeURIComponent(id)}/mail/mailboxes`, query, body);
  }

  /**
   * @generated GET /services/[id]/mail/mailboxes
   */
  mailMailboxes(id: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/services/${encodeURIComponent(id)}/mail/mailboxes`, query);
  }

  /**
   * @generated PATCH /services/[id]/mail/mailboxes
   */
  updateMailMailboxes(id: string, body?: Record<string, unknown>) {
    return this.patch<Record<string, unknown>>(`/services/${encodeURIComponent(id)}/mail/mailboxes`, body);
  }

  /**
   * @generated POST /services/[id]/mail/mailboxes
   */
  postMailMailboxes(id: string, body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/services/${encodeURIComponent(id)}/mail/mailboxes`, body);
  }

  /**
   * @generated GET /services/[id]/metrics
   */
  metrics(id: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/services/${encodeURIComponent(id)}/metrics`, query);
  }

  /**
   * @generated GET /services/[id]/monitoring/config
   */
  monitoringConfig(id: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/services/${encodeURIComponent(id)}/monitoring/config`, query);
  }

  /**
   * @generated PATCH /services/[id]/monitoring/config
   */
  updateMonitoringConfig(id: string, body?: Record<string, unknown>) {
    return this.patch<Record<string, unknown>>(`/services/${encodeURIComponent(id)}/monitoring/config`, body);
  }

  /**
   * @generated GET /services/[id]/monitoring/history
   */
  monitoringHistory(id: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/services/${encodeURIComponent(id)}/monitoring/history`, query);
  }

  /**
   * @generated POST /services/[id]/monitoring/push/device-token
   */
  monitoringPushDeviceToken(id: string, body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/services/${encodeURIComponent(id)}/monitoring/push/device-token`, body);
  }

  /**
   * @generated GET /services/[id]/monitoring/push/public-key
   */
  monitoringPushPublicKey(id: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/services/${encodeURIComponent(id)}/monitoring/push/public-key`, query);
  }

  /**
   * @generated POST /services/[id]/monitoring/push/subscribe
   */
  monitoringPushSubscribe(id: string, body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/services/${encodeURIComponent(id)}/monitoring/push/subscribe`, body);
  }

  /**
   * @generated GET /services/[id]/monitoring/score
   */
  monitoringScore(id: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/services/${encodeURIComponent(id)}/monitoring/score`, query);
  }

  /**
   * @generated GET /services/[id]/monitoring/targets
   */
  monitoringTargets(id: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/services/${encodeURIComponent(id)}/monitoring/targets`, query);
  }

  /**
   * @generated POST /services/[id]/monitoring/targets
   */
  postMonitoringTargets(id: string, body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/services/${encodeURIComponent(id)}/monitoring/targets`, body);
  }

  /**
   * @generated DELETE /services/[id]/monitoring/targets/[targetId]
   */
  deleteMonitoringTargets(id: string, targetId: string, query?: QueryParams, body?: Record<string, unknown>) {
    return this.del<Record<string, unknown>>(`/services/${encodeURIComponent(id)}/monitoring/targets/${encodeURIComponent(targetId)}`, query, body);
  }

  /**
   * @generated PATCH /services/[id]/monitoring/targets/[targetId]
   */
  updateMonitoringTargets(id: string, targetId: string, body?: Record<string, unknown>) {
    return this.patch<Record<string, unknown>>(`/services/${encodeURIComponent(id)}/monitoring/targets/${encodeURIComponent(targetId)}`, body);
  }

  /**
   * @generated GET /services/[id]/notifications
   */
  notifications(id: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/services/${encodeURIComponent(id)}/notifications`, query);
  }

  /**
   * @generated GET /services/[id]/players
   */
  players(id: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/services/${encodeURIComponent(id)}/players`, query);
  }

  /**
   * @generated POST /services/[id]/players/action
   */
  playersAction(id: string, body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/services/${encodeURIComponent(id)}/players/action`, body);
  }

  /**
   * @generated POST /services/[id]/plesk/reset
   */
  pleskReset(id: string, body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/services/${encodeURIComponent(id)}/plesk/reset`, body);
  }

  /**
   * @generated GET /services/[id]/plesk/setup
   */
  pleskSetup(id: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/services/${encodeURIComponent(id)}/plesk/setup`, query);
  }

  /**
   * @generated POST /services/[id]/plesk/setup
   */
  postPleskSetup(id: string, body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/services/${encodeURIComponent(id)}/plesk/setup`, body);
  }

  /**
   * @generated GET /services/[id]/ploi/dns
   */
  ploiDns(id: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/services/${encodeURIComponent(id)}/ploi/dns`, query);
  }

  /**
   * @generated POST /services/[id]/ploi/dns
   */
  postPloiDns(id: string, body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/services/${encodeURIComponent(id)}/ploi/dns`, body);
  }

  /**
   * @generated GET /services/[id]/ploi/storage-history
   */
  ploiStorageHistory(id: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/services/${encodeURIComponent(id)}/ploi/storage-history`, query);
  }

  /**
   * @generated POST /services/[id]/reinstall
   */
  reinstall(id: string, body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/services/${encodeURIComponent(id)}/reinstall`, body);
  }

  /**
   * @generated POST /services/[id]/renew
   */
  renew(id: string, body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/services/${encodeURIComponent(id)}/renew`, body);
  }

  /**
   * @generated GET /services/[id]/settings
   */
  settings(id: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/services/${encodeURIComponent(id)}/settings`, query);
  }

  /**
   * @generated PATCH /services/[id]/settings
   */
  updateSettings(id: string, body?: Record<string, unknown>) {
    return this.patch<Record<string, unknown>>(`/services/${encodeURIComponent(id)}/settings`, body);
  }

  /**
   * @generated POST /services/[id]/settings
   */
  postSettings(id: string, body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/services/${encodeURIComponent(id)}/settings`, body);
  }

  /**
   * @generated PUT /services/[id]/settings
   */
  replaceSettings(id: string, body?: Record<string, unknown>) {
    return this.put<Record<string, unknown>>(`/services/${encodeURIComponent(id)}/settings`, body);
  }

  /**
   * @generated GET /services/[id]/sftp
   */
  sftp(id: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/services/${encodeURIComponent(id)}/sftp`, query);
  }

  /**
   * @generated POST /services/[id]/sftp/ensure-password
   */
  sftpEnsurePassword(id: string, body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/services/${encodeURIComponent(id)}/sftp/ensure-password`, body);
  }

  /**
   * @generated POST /services/[id]/sftp/rotate-password
   */
  sftpRotatePassword(id: string, body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/services/${encodeURIComponent(id)}/sftp/rotate-password`, body);
  }

  /**
   * @generated GET /services/[id]/sla
   */
  sla(id: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/services/${encodeURIComponent(id)}/sla`, query);
  }

  /**
   * @generated POST /services/[id]/sla
   */
  postSla(id: string, body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/services/${encodeURIComponent(id)}/sla`, body);
  }

  /**
   * @generated POST /services/[id]/sla/accept
   */
  slaAccept(id: string, body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/services/${encodeURIComponent(id)}/sla/accept`, body);
  }

  /**
   * @generated POST /services/[id]/sla/amend
   */
  slaAmend(id: string, body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/services/${encodeURIComponent(id)}/sla/amend`, body);
  }

  /**
   * @generated POST /services/[id]/sla/cancel
   */
  slaCancel(id: string, body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/services/${encodeURIComponent(id)}/sla/cancel`, body);
  }

  /**
   * @generated POST /services/[id]/sla/decline
   */
  slaDecline(id: string, body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/services/${encodeURIComponent(id)}/sla/decline`, body);
  }

  /**
   * @generated GET /services/[id]/sla/documents/[docId]
   */
  slaDocuments(id: string, docId: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/services/${encodeURIComponent(id)}/sla/documents/${encodeURIComponent(docId)}`, query);
  }

  /**
   * @generated POST /services/[id]/sla/revoke-cancel
   */
  slaRevokeCancel(id: string, body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/services/${encodeURIComponent(id)}/sla/revoke-cancel`, body);
  }

  /**
   * @generated POST /services/[id]/sla/withdraw
   */
  slaWithdraw(id: string, body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/services/${encodeURIComponent(id)}/sla/withdraw`, body);
  }

  /**
   * @generated GET /services/[id]/startup-variables
   */
  startupVariables(id: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/services/${encodeURIComponent(id)}/startup-variables`, query);
  }

  /**
   * @generated PATCH /services/[id]/startup-variables
   */
  updateStartupVariables(id: string, body?: Record<string, unknown>) {
    return this.patch<Record<string, unknown>>(`/services/${encodeURIComponent(id)}/startup-variables`, body);
  }

  /**
   * @generated PUT /services/[id]/startup-variables
   */
  replaceStartupVariables(id: string, body?: Record<string, unknown>) {
    return this.put<Record<string, unknown>>(`/services/${encodeURIComponent(id)}/startup-variables`, body);
  }

  /**
   * @generated GET /services/[id]/status
   */
  status(id: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/services/${encodeURIComponent(id)}/status`, query);
  }

  /**
   * @generated GET /services/[id]/subscription
   */
  subscription(id: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/services/${encodeURIComponent(id)}/subscription`, query);
  }

  /**
   * @generated POST /services/[id]/subscription/accelerate
   */
  subscriptionAccelerate(id: string, body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/services/${encodeURIComponent(id)}/subscription/accelerate`, body);
  }

  /**
   * @generated PATCH /services/[id]/subscription/autopay
   */
  updateSubscriptionAutopay(id: string, body?: Record<string, unknown>) {
    return this.patch<Record<string, unknown>>(`/services/${encodeURIComponent(id)}/subscription/autopay`, body);
  }

  /**
   * @generated PATCH /services/[id]/subscription/billing-address
   */
  updateSubscriptionBillingAddress(id: string, body?: Record<string, unknown>) {
    return this.patch<Record<string, unknown>>(`/services/${encodeURIComponent(id)}/subscription/billing-address`, body);
  }

  /**
   * @generated POST /services/[id]/subscription/cancel
   */
  subscriptionCancel(id: string, body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/services/${encodeURIComponent(id)}/subscription/cancel`, body);
  }

  /**
   * @generated POST /services/[id]/subscription/extend
   */
  subscriptionExtend(id: string, body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/services/${encodeURIComponent(id)}/subscription/extend`, body);
  }

  /**
   * @generated PATCH /services/[id]/subscription/interval
   */
  updateSubscriptionInterval(id: string, body?: Record<string, unknown>) {
    return this.patch<Record<string, unknown>>(`/services/${encodeURIComponent(id)}/subscription/interval`, body);
  }

  /**
   * @generated POST /services/[id]/subscription/reactivate
   */
  subscriptionReactivate(id: string, body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/services/${encodeURIComponent(id)}/subscription/reactivate`, body);
  }

  /**
   * @generated POST /services/[id]/subscription/withdraw
   */
  subscriptionWithdraw(id: string, body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/services/${encodeURIComponent(id)}/subscription/withdraw`, body);
  }

  /**
   * @generated GET /services/[id]/teamspeak
   */
  teamspeak(id: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/services/${encodeURIComponent(id)}/teamspeak`, query);
  }

  /**
   * @generated POST /services/[id]/teamspeak
   */
  postTeamspeak(id: string, body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/services/${encodeURIComponent(id)}/teamspeak`, body);
  }

  /**
   * @generated GET /services/[id]/templates
   */
  templates(id: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/services/${encodeURIComponent(id)}/templates`, query);
  }

  /**
   * @generated GET /services/[id]/top-ips
   */
  topIps(id: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/services/${encodeURIComponent(id)}/top-ips`, query);
  }

  /**
   * @generated GET /services/[id]/traffic
   */
  traffic(id: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/services/${encodeURIComponent(id)}/traffic`, query);
  }

  /**
   * @generated GET /services/[id]/upgrade
   */
  upgrade(id: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/services/${encodeURIComponent(id)}/upgrade`, query);
  }

  /**
   * @generated POST /services/[id]/upgrade
   */
  postUpgrade(id: string, body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/services/${encodeURIComponent(id)}/upgrade`, body);
  }

  /**
   * @generated POST /services/[id]/upgrade-preview
   */
  upgradePreview(id: string, body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/services/${encodeURIComponent(id)}/upgrade-preview`, body);
  }

  /**
   * @generated GET /services/[id]/usage-export
   */
  usageExport(id: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/services/${encodeURIComponent(id)}/usage-export`, query);
  }

  /**
   * @generated POST /services/[id]/usage-export
   */
  postUsageExport(id: string, body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/services/${encodeURIComponent(id)}/usage-export`, body);
  }

  /**
   * @generated GET /services/maintenance-notifications
   */
  maintenanceNotifications(query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/services/maintenance-notifications`, query);
  }
  // </generated-openapi>
}
