import { ResourceClient } from "../resource-client.js";
import type { QueryParams } from "../types.js";

/** Generated from apps/backend/app/openapi.generated.json. */
export class PodsResource extends ResourceClient {
  /**
   * @generated DELETE /pods/[id]
   */
  remove(id: string, query?: QueryParams, body?: Record<string, unknown>) {
    return this.del<Record<string, unknown>>(`/pods/${encodeURIComponent(id)}`, query, body);
  }

  /**
   * @generated GET /pods/[id]
   */
  find(id: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/pods/${encodeURIComponent(id)}`, query);
  }

  /**
   * @generated PATCH /pods/[id]
   */
  update(id: string, body?: Record<string, unknown>) {
    return this.patch<Record<string, unknown>>(`/pods/${encodeURIComponent(id)}`, body);
  }

  /**
   * @generated GET /pods/[id]/actions
   */
  actions(id: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/pods/${encodeURIComponent(id)}/actions`, query);
  }

  /**
   * @generated POST /pods/[id]/actions
   */
  postActions(id: string, body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/pods/${encodeURIComponent(id)}/actions`, body);
  }

  /**
   * @generated DELETE /pods/[id]/allocations
   */
  deleteAllocations(id: string, query?: QueryParams, body?: Record<string, unknown>) {
    return this.del<Record<string, unknown>>(`/pods/${encodeURIComponent(id)}/allocations`, query, body);
  }

  /**
   * @generated POST /pods/[id]/allocations
   */
  allocations(id: string, body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/pods/${encodeURIComponent(id)}/allocations`, body);
  }

  /**
   * @generated GET /pods/[id]/backups
   */
  backups(id: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/pods/${encodeURIComponent(id)}/backups`, query);
  }

  /**
   * @generated POST /pods/[id]/backups
   */
  postBackups(id: string, body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/pods/${encodeURIComponent(id)}/backups`, body);
  }

  /**
   * @generated GET /pods/[id]/backups/[backupId]/download
   */
  backupsDownload(id: string, backupId: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/pods/${encodeURIComponent(id)}/backups/${encodeURIComponent(backupId)}/download`, query);
  }

  /**
   * @generated GET /pods/[id]/deploy
   */
  deploy(id: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/pods/${encodeURIComponent(id)}/deploy`, query);
  }

  /**
   * @generated DELETE /pods/[id]/domains
   */
  deleteDomains(id: string, query?: QueryParams, body?: Record<string, unknown>) {
    return this.del<Record<string, unknown>>(`/pods/${encodeURIComponent(id)}/domains`, query, body);
  }

  /**
   * @generated GET /pods/[id]/domains
   */
  domains(id: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/pods/${encodeURIComponent(id)}/domains`, query);
  }

  /**
   * @generated POST /pods/[id]/domains
   */
  postDomains(id: string, body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/pods/${encodeURIComponent(id)}/domains`, body);
  }

  /**
   * @generated GET /pods/[id]/env
   */
  env(id: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/pods/${encodeURIComponent(id)}/env`, query);
  }

  /**
   * @generated PUT /pods/[id]/env
   */
  replaceEnv(id: string, body?: Record<string, unknown>) {
    return this.put<Record<string, unknown>>(`/pods/${encodeURIComponent(id)}/env`, body);
  }

  /**
   * @generated GET /pods/[id]/files
   */
  files(id: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/pods/${encodeURIComponent(id)}/files`, query);
  }

  /**
   * @generated POST /pods/[id]/files
   */
  postFiles(id: string, body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/pods/${encodeURIComponent(id)}/files`, body);
  }

  /**
   * @generated DELETE /pods/[id]/forwards
   */
  deleteForwards(id: string, query?: QueryParams, body?: Record<string, unknown>) {
    return this.del<Record<string, unknown>>(`/pods/${encodeURIComponent(id)}/forwards`, query, body);
  }

  /**
   * @generated GET /pods/[id]/forwards
   */
  forwards(id: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/pods/${encodeURIComponent(id)}/forwards`, query);
  }

  /**
   * @generated PATCH /pods/[id]/forwards
   */
  updateForwards(id: string, body?: Record<string, unknown>) {
    return this.patch<Record<string, unknown>>(`/pods/${encodeURIComponent(id)}/forwards`, body);
  }

  /**
   * @generated POST /pods/[id]/forwards
   */
  postForwards(id: string, body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/pods/${encodeURIComponent(id)}/forwards`, body);
  }

  /**
   * @generated GET /pods/[id]/logs
   */
  logs(id: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/pods/${encodeURIComponent(id)}/logs`, query);
  }

  /**
   * @generated POST /pods/[id]/logs
   */
  postLogs(id: string, body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/pods/${encodeURIComponent(id)}/logs`, body);
  }

  /**
   * @generated GET /pods/[id]/platform
   */
  platform(id: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/pods/${encodeURIComponent(id)}/platform`, query);
  }

  /**
   * @generated PUT /pods/[id]/platform
   */
  replacePlatform(id: string, body?: Record<string, unknown>) {
    return this.put<Record<string, unknown>>(`/pods/${encodeURIComponent(id)}/platform`, body);
  }

  /**
   * @generated DELETE /pods/[id]/ports
   */
  deletePorts(id: string, query?: QueryParams, body?: Record<string, unknown>) {
    return this.del<Record<string, unknown>>(`/pods/${encodeURIComponent(id)}/ports`, query, body);
  }

  /**
   * @generated GET /pods/[id]/ports
   */
  ports(id: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/pods/${encodeURIComponent(id)}/ports`, query);
  }

  /**
   * @generated PATCH /pods/[id]/ports
   */
  updatePorts(id: string, body?: Record<string, unknown>) {
    return this.patch<Record<string, unknown>>(`/pods/${encodeURIComponent(id)}/ports`, body);
  }

  /**
   * @generated POST /pods/[id]/ports
   */
  postPorts(id: string, body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/pods/${encodeURIComponent(id)}/ports`, body);
  }

  /**
   * @generated GET /pods/[id]/revisions
   */
  revisions(id: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/pods/${encodeURIComponent(id)}/revisions`, query);
  }

  /**
   * @generated POST /pods/[id]/revisions
   */
  postRevisions(id: string, body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/pods/${encodeURIComponent(id)}/revisions`, body);
  }

  /**
   * @generated GET /pods/[id]/schedules
   */
  schedules(id: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/pods/${encodeURIComponent(id)}/schedules`, query);
  }

  /**
   * @generated POST /pods/[id]/schedules
   */
  postSchedules(id: string, body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/pods/${encodeURIComponent(id)}/schedules`, body);
  }

  /**
   * @generated GET /pods/[id]/stats
   */
  stats(id: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/pods/${encodeURIComponent(id)}/stats`, query);
  }

  /**
   * @generated POST /pods/[id]/transfer
   */
  transfer(id: string, body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/pods/${encodeURIComponent(id)}/transfer`, body);
  }

  /**
   * @generated GET /pods/[id]/volume
   */
  volume(id: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/pods/${encodeURIComponent(id)}/volume`, query);
  }

  /**
   * @generated POST /pods/[id]/volume
   */
  postVolume(id: string, body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/pods/${encodeURIComponent(id)}/volume`, body);
  }

  /**
   * @generated GET /pods/[id]/volumes
   */
  volumes(id: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/pods/${encodeURIComponent(id)}/volumes`, query);
  }

  /**
   * @generated POST /pods/[id]/volumes
   */
  postVolumes(id: string, body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/pods/${encodeURIComponent(id)}/volumes`, body);
  }

  /**
   * @generated GET /pods/access
   */
  access(query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/pods/access`, query);
  }

  /**
   * @generated GET /pods/api-keys
   */
  apiKeys(query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/pods/api-keys`, query);
  }

  /**
   * @generated POST /pods/api-keys
   */
  postApiKeys(body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/pods/api-keys`, body);
  }

  /**
   * @generated DELETE /pods/api-keys/[id]
   */
  deleteApiKeys(id: string, query?: QueryParams, body?: Record<string, unknown>) {
    return this.del<Record<string, unknown>>(`/pods/api-keys/${encodeURIComponent(id)}`, query, body);
  }

  /**
   * @generated GET /pods/audit
   */
  audit(query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/pods/audit`, query);
  }

  /**
   * @generated GET /pods/billing
   */
  billing(query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/pods/billing`, query);
  }

  /**
   * @generated GET /pods/cost-centers
   */
  costCenters(query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/pods/cost-centers`, query);
  }

  /**
   * @generated POST /pods/cost-centers
   */
  postCostCenters(body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/pods/cost-centers`, body);
  }

  /**
   * @generated GET /pods/events
   */
  events(query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/pods/events`, query);
  }

  /**
   * @generated POST /pods/events
   */
  postEvents(body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/pods/events`, body);
  }

  /**
   * @generated DELETE /pods/ips/[id]
   */
  deleteIps(id: string, query?: QueryParams, body?: Record<string, unknown>) {
    return this.del<Record<string, unknown>>(`/pods/ips/${encodeURIComponent(id)}`, query, body);
  }

  /**
   * @generated PATCH /pods/ips/[id]
   */
  updateIps(id: string, body?: Record<string, unknown>) {
    return this.patch<Record<string, unknown>>(`/pods/ips/${encodeURIComponent(id)}`, body);
  }

  /**
   * @generated GET /pods/metrics
   */
  metrics(query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/pods/metrics`, query);
  }

  /**
   * @generated POST /pods/metrics
   */
  postMetrics(body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/pods/metrics`, body);
  }

  /**
   * @generated GET /pods/notification-channels
   */
  notificationChannels(query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/pods/notification-channels`, query);
  }

  /**
   * @generated POST /pods/notification-channels
   */
  postNotificationChannels(body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/pods/notification-channels`, body);
  }

  /**
   * @generated GET /pods/notifications
   */
  notifications(query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/pods/notifications`, query);
  }

  /**
   * @generated POST /pods/notifications
   */
  postNotifications(body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/pods/notifications`, body);
  }

  /**
   * @generated GET /pods/packages
   */
  packages(query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/pods/packages`, query);
  }

  /**
   * @generated POST /pods/packages
   */
  postPackages(body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/pods/packages`, body);
  }

  /**
   * @generated GET /pods/projects
   */
  projects(query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/pods/projects`, query);
  }

  /**
   * @generated POST /pods/projects
   */
  postProjects(body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/pods/projects`, body);
  }

  /**
   * @generated DELETE /pods/projects/[id]
   */
  deleteProjects(id: string, query?: QueryParams, body?: Record<string, unknown>) {
    return this.del<Record<string, unknown>>(`/pods/projects/${encodeURIComponent(id)}`, query, body);
  }

  /**
   * @generated GET /pods/projects/[id]
   */
  getProjects(id: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/pods/projects/${encodeURIComponent(id)}`, query);
  }

  /**
   * @generated PATCH /pods/projects/[id]
   */
  updateProjects(id: string, body?: Record<string, unknown>) {
    return this.patch<Record<string, unknown>>(`/pods/projects/${encodeURIComponent(id)}`, body);
  }

  /**
   * @generated DELETE /pods/projects/[id]/backup-policy
   */
  deleteProjectsBackupPolicy(id: string, query?: QueryParams, body?: Record<string, unknown>) {
    return this.del<Record<string, unknown>>(`/pods/projects/${encodeURIComponent(id)}/backup-policy`, query, body);
  }

  /**
   * @generated GET /pods/projects/[id]/backup-policy
   */
  projectsBackupPolicy(id: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/pods/projects/${encodeURIComponent(id)}/backup-policy`, query);
  }

  /**
   * @generated PUT /pods/projects/[id]/backup-policy
   */
  replaceProjectsBackupPolicy(id: string, body?: Record<string, unknown>) {
    return this.put<Record<string, unknown>>(`/pods/projects/${encodeURIComponent(id)}/backup-policy`, body);
  }

  /**
   * @generated GET /pods/projects/[id]/billing-report
   */
  projectsBillingReport(id: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/pods/projects/${encodeURIComponent(id)}/billing-report`, query);
  }

  /**
   * @generated POST /pods/projects/[id]/bulk
   */
  projectsBulk(id: string, body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/pods/projects/${encodeURIComponent(id)}/bulk`, body);
  }

  /**
   * @generated DELETE /pods/projects/[id]/certificates
   */
  deleteProjectsCertificates(id: string, query?: QueryParams, body?: Record<string, unknown>) {
    return this.del<Record<string, unknown>>(`/pods/projects/${encodeURIComponent(id)}/certificates`, query, body);
  }

  /**
   * @generated GET /pods/projects/[id]/certificates
   */
  projectsCertificates(id: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/pods/projects/${encodeURIComponent(id)}/certificates`, query);
  }

  /**
   * @generated POST /pods/projects/[id]/certificates
   */
  postProjectsCertificates(id: string, body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/pods/projects/${encodeURIComponent(id)}/certificates`, body);
  }

  /**
   * @generated GET /pods/projects/[id]/compose
   */
  projectsCompose(id: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/pods/projects/${encodeURIComponent(id)}/compose`, query);
  }

  /**
   * @generated POST /pods/projects/[id]/compose
   */
  postProjectsCompose(id: string, body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/pods/projects/${encodeURIComponent(id)}/compose`, body);
  }

  /**
   * @generated DELETE /pods/projects/[id]/databases
   */
  deleteProjectsDatabases(id: string, query?: QueryParams, body?: Record<string, unknown>) {
    return this.del<Record<string, unknown>>(`/pods/projects/${encodeURIComponent(id)}/databases`, query, body);
  }

  /**
   * @generated GET /pods/projects/[id]/databases
   */
  projectsDatabases(id: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/pods/projects/${encodeURIComponent(id)}/databases`, query);
  }

  /**
   * @generated POST /pods/projects/[id]/databases
   */
  postProjectsDatabases(id: string, body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/pods/projects/${encodeURIComponent(id)}/databases`, body);
  }

  /**
   * @generated DELETE /pods/projects/[id]/gateway-tokens
   */
  deleteProjectsGatewayTokens(id: string, query?: QueryParams, body?: Record<string, unknown>) {
    return this.del<Record<string, unknown>>(`/pods/projects/${encodeURIComponent(id)}/gateway-tokens`, query, body);
  }

  /**
   * @generated GET /pods/projects/[id]/gateway-tokens
   */
  projectsGatewayTokens(id: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/pods/projects/${encodeURIComponent(id)}/gateway-tokens`, query);
  }

  /**
   * @generated POST /pods/projects/[id]/gateway-tokens
   */
  postProjectsGatewayTokens(id: string, body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/pods/projects/${encodeURIComponent(id)}/gateway-tokens`, body);
  }


  /**
   * @generated GET /pods/projects/[id]/storage-targets
   */
  projectsStorageTargets(id: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/pods/projects/${encodeURIComponent(id)}/storage-targets`, query);
  }

  /**
   * @generated POST /pods/projects/[id]/storage-targets
   */
  postProjectsStorageTargets(id: string, body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/pods/projects/${encodeURIComponent(id)}/storage-targets`, body);
  }

  /**
   * @generated DELETE /pods/projects/[id]/storage-targets
   */
  deleteProjectsStorageTargets(id: string, query?: QueryParams, body?: Record<string, unknown>) {
    return this.del<Record<string, unknown>>(`/pods/projects/${encodeURIComponent(id)}/storage-targets`, query, body);
  }

  /**
   * @generated GET /pods/projects/[id]/storage-targets/objects
   */
  projectsStorageTargetObjects(id: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/pods/projects/${encodeURIComponent(id)}/storage-targets/objects`, query);
  }

  /**
   * @generated DELETE /pods/projects/[id]/storage-targets/objects
   */
  deleteProjectsStorageTargetObjects(id: string, query?: QueryParams, body?: Record<string, unknown>) {
    return this.del<Record<string, unknown>>(`/pods/projects/${encodeURIComponent(id)}/storage-targets/objects`, query, body);
  }

  /**
   * @generated GET /pods/[id]/storage
   */
  storage(id: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/pods/${encodeURIComponent(id)}/storage`, query);
  }

  /**
   * @generated POST /pods/[id]/storage
   */
  postStorage(id: string, body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/pods/${encodeURIComponent(id)}/storage`, body);
  }

  /**
   * @generated DELETE /pods/[id]/storage
   */
  deleteStorage(id: string, query?: QueryParams, body?: Record<string, unknown>) {
    return this.del<Record<string, unknown>>(`/pods/${encodeURIComponent(id)}/storage`, query, body);
  }

  /**
   * @generated GET /pods/projects/[id]/git
   */
  projectsGit(id: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/pods/projects/${encodeURIComponent(id)}/git`, query);
  }

  /**
   * @generated POST /pods/projects/[id]/git
   */
  postProjectsGit(id: string, body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/pods/projects/${encodeURIComponent(id)}/git`, body);
  }

  /**
   * @generated GET /pods/projects/[id]/images
   */
  projectsImages(id: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/pods/projects/${encodeURIComponent(id)}/images`, query);
  }

  /**
   * @generated POST /pods/projects/[id]/images
   */
  postProjectsImages(id: string, body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/pods/projects/${encodeURIComponent(id)}/images`, body);
  }

  /**
   * @generated GET /pods/projects/[id]/ips
   */
  projectsIps(id: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/pods/projects/${encodeURIComponent(id)}/ips`, query);
  }

  /**
   * @generated POST /pods/projects/[id]/ips
   */
  postProjectsIps(id: string, body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/pods/projects/${encodeURIComponent(id)}/ips`, body);
  }

  /**
   * @generated GET /pods/projects/[id]/ips/available
   */
  projectsIpsAvailable(id: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/pods/projects/${encodeURIComponent(id)}/ips/available`, query);
  }

  /**
   * @generated GET /pods/projects/[id]/jobs
   */
  projectsJobs(id: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/pods/projects/${encodeURIComponent(id)}/jobs`, query);
  }

  /**
   * @generated POST /pods/projects/[id]/jobs
   */
  postProjectsJobs(id: string, body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/pods/projects/${encodeURIComponent(id)}/jobs`, body);
  }

  /**
   * @generated DELETE /pods/projects/[id]/listeners
   */
  deleteProjectsListeners(id: string, query?: QueryParams, body?: Record<string, unknown>) {
    return this.del<Record<string, unknown>>(`/pods/projects/${encodeURIComponent(id)}/listeners`, query, body);
  }

  /**
   * @generated GET /pods/projects/[id]/listeners
   */
  projectsListeners(id: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/pods/projects/${encodeURIComponent(id)}/listeners`, query);
  }

  /**
   * @generated POST /pods/projects/[id]/listeners
   */
  postProjectsListeners(id: string, body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/pods/projects/${encodeURIComponent(id)}/listeners`, body);
  }

  /**
   * @generated GET /pods/projects/[id]/networks
   */
  projectsNetworks(id: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/pods/projects/${encodeURIComponent(id)}/networks`, query);
  }

  /**
   * @generated POST /pods/projects/[id]/networks
   */
  postProjectsNetworks(id: string, body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/pods/projects/${encodeURIComponent(id)}/networks`, body);
  }

  /**
   * @generated GET /pods/projects/[id]/pods
   */
  projectsPods(id: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/pods/projects/${encodeURIComponent(id)}/pods`, query);
  }

  /**
   * @generated POST /pods/projects/[id]/pods
   */
  postProjectsPods(id: string, body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/pods/projects/${encodeURIComponent(id)}/pods`, body);
  }

  /**
   * @generated GET /pods/projects/[id]/reference
   */
  projectsReference(id: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/pods/projects/${encodeURIComponent(id)}/reference`, query);
  }

  /**
   * @generated DELETE /pods/projects/[id]/runtime-groups
   */
  deleteProjectsRuntimeGroups(id: string, query?: QueryParams, body?: Record<string, unknown>) {
    return this.del<Record<string, unknown>>(`/pods/projects/${encodeURIComponent(id)}/runtime-groups`, query, body);
  }

  /**
   * @generated GET /pods/projects/[id]/runtime-groups
   */
  projectsRuntimeGroups(id: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/pods/projects/${encodeURIComponent(id)}/runtime-groups`, query);
  }

  /**
   * @generated POST /pods/projects/[id]/runtime-groups
   */
  postProjectsRuntimeGroups(id: string, body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/pods/projects/${encodeURIComponent(id)}/runtime-groups`, body);
  }

  /**
   * @generated DELETE /pods/projects/[id]/storage-backends
   */
  deleteProjectsStorageBackends(id: string, query?: QueryParams, body?: Record<string, unknown>) {
    return this.del<Record<string, unknown>>(`/pods/projects/${encodeURIComponent(id)}/storage-backends`, query, body);
  }

  /**
   * @generated GET /pods/projects/[id]/storage-backends
   */
  projectsStorageBackends(id: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/pods/projects/${encodeURIComponent(id)}/storage-backends`, query);
  }

  /**
   * @generated POST /pods/projects/[id]/storage-backends
   */
  postProjectsStorageBackends(id: string, body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/pods/projects/${encodeURIComponent(id)}/storage-backends`, body);
  }

  /**
   * @generated GET /pods/projects/[id]/templates
   */
  projectsTemplates(id: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/pods/projects/${encodeURIComponent(id)}/templates`, query);
  }

  /**
   * @generated POST /pods/projects/[id]/templates
   */
  postProjectsTemplates(id: string, body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/pods/projects/${encodeURIComponent(id)}/templates`, body);
  }

  /**
   * @generated GET /pods/projects/[id]/transfer
   */
  projectsTransfer(id: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/pods/projects/${encodeURIComponent(id)}/transfer`, query);
  }

  /**
   * @generated POST /pods/projects/[id]/transfer
   */
  postProjectsTransfer(id: string, body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/pods/projects/${encodeURIComponent(id)}/transfer`, body);
  }

  /**
   * @generated GET /pods/projects/[id]/usage
   */
  projectsUsage(id: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/pods/projects/${encodeURIComponent(id)}/usage`, query);
  }

  /**
   * @generated GET /pods/projects/[id]/volumes
   */
  projectsVolumes(id: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/pods/projects/${encodeURIComponent(id)}/volumes`, query);
  }

  /**
   * @generated POST /pods/projects/[id]/volumes
   */
  postProjectsVolumes(id: string, body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/pods/projects/${encodeURIComponent(id)}/volumes`, body);
  }

  /**
   * @generated GET /pods/projects/[id]/workflow
   */
  projectsWorkflow(id: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/pods/projects/${encodeURIComponent(id)}/workflow`, query);
  }

  /**
   * @generated POST /pods/projects/[id]/workflow
   */
  postProjectsWorkflow(id: string, body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/pods/projects/${encodeURIComponent(id)}/workflow`, body);
  }

  /**
   * @generated GET /pods/rdns-zones
   */
  rdnsZones(query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/pods/rdns-zones`, query);
  }

  /**
   * @generated GET /pods/regions
   */
  regions(query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/pods/regions`, query);
  }

  /**
   * @generated GET /pods/registry
   */
  registry(query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/pods/registry`, query);
  }

  /**
   * @generated GET /pods/ssh-keys
   */
  sshKeys(query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/pods/ssh-keys`, query);
  }

  /**
   * @generated POST /pods/ssh-keys
   */
  postSshKeys(body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/pods/ssh-keys`, body);
  }

  /**
   * @generated DELETE /pods/ssh-keys/[id]
   */
  deleteSshKeys(id: string, query?: QueryParams, body?: Record<string, unknown>) {
    return this.del<Record<string, unknown>>(`/pods/ssh-keys/${encodeURIComponent(id)}`, query, body);
  }

  /**
   * @generated PATCH /pods/ssh-keys/[id]
   */
  updateSshKeys(id: string, body?: Record<string, unknown>) {
    return this.patch<Record<string, unknown>>(`/pods/ssh-keys/${encodeURIComponent(id)}`, body);
  }

  /**
   * @generated GET /pods/tenants
   */
  tenants(query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/pods/tenants`, query);
  }

  /**
   * @generated POST /pods/tenants
   */
  postTenants(body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/pods/tenants`, body);
  }

  /**
   * @generated DELETE /pods/tenants/[id]
   */
  deleteTenants(id: string, query?: QueryParams, body?: Record<string, unknown>) {
    return this.del<Record<string, unknown>>(`/pods/tenants/${encodeURIComponent(id)}`, query, body);
  }

  /**
   * @generated DELETE /pods/tenants/[id]/access
   */
  deleteTenantsAccess(id: string, query?: QueryParams, body?: Record<string, unknown>) {
    return this.del<Record<string, unknown>>(`/pods/tenants/${encodeURIComponent(id)}/access`, query, body);
  }

  /**
   * @generated GET /pods/tenants/[id]/access
   */
  tenantsAccess(id: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/pods/tenants/${encodeURIComponent(id)}/access`, query);
  }

  /**
   * @generated POST /pods/tenants/[id]/access
   */
  postTenantsAccess(id: string, body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/pods/tenants/${encodeURIComponent(id)}/access`, body);
  }

  /**
   * @generated DELETE /pods/tenants/[id]/transfer-keys
   */
  deleteTenantsTransferKeys(id: string, query?: QueryParams, body?: Record<string, unknown>) {
    return this.del<Record<string, unknown>>(`/pods/tenants/${encodeURIComponent(id)}/transfer-keys`, query, body);
  }

  /**
   * @generated GET /pods/tenants/[id]/transfer-keys
   */
  tenantsTransferKeys(id: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/pods/tenants/${encodeURIComponent(id)}/transfer-keys`, query);
  }

  /**
   * @generated POST /pods/tenants/[id]/transfer-keys
   */
  postTenantsTransferKeys(id: string, body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/pods/tenants/${encodeURIComponent(id)}/transfer-keys`, body);
  }

  /**
   * @generated GET /pods/transfers/[id]
   */
  transfers(id: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/pods/transfers/${encodeURIComponent(id)}`, query);
  }

  /**
   * @generated POST /pods/transfers/[id]
   */
  postTransfers(id: string, body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/pods/transfers/${encodeURIComponent(id)}`, body);
  }

  /**
   * @generated GET /pods/tree
   */
  tree(query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/pods/tree`, query);
  }

  /**
   * @generated GET /pods/wallet
   */
  wallet(query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/pods/wallet`, query);
  }

  /**
   * @generated POST /pods/wallet
   */
  postWallet(body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/pods/wallet`, body);
  }

  /**
   * @generated GET /pods/webhooks
   */
  webhooks(query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/pods/webhooks`, query);
  }

  /**
   * @generated POST /pods/webhooks
   */
  postWebhooks(body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/pods/webhooks`, body);
  }

  /**
   * @generated DELETE /pods/webhooks/[id]
   */
  deleteWebhooks(id: string, query?: QueryParams, body?: Record<string, unknown>) {
    return this.del<Record<string, unknown>>(`/pods/webhooks/${encodeURIComponent(id)}`, query, body);
  }

  /**
   * @generated POST /pods/webhooks/[id]
   */
  postWebhooksId(id: string, body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/pods/webhooks/${encodeURIComponent(id)}`, body);
  }

  /**
   * @generated GET /pods/webhooks/[id]/deliveries
   */
  webhooksDeliveries(id: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/pods/webhooks/${encodeURIComponent(id)}/deliveries`, query);
  }

  /**
   * @generated POST /pods/webhooks/[id]/rotate-secret
   */
  webhooksRotateSecret(id: string, body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/pods/webhooks/${encodeURIComponent(id)}/rotate-secret`, body);
  }
}
