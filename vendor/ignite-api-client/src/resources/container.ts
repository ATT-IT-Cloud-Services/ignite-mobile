import { ResourceClient } from "../resource-client.js";
import type { QueryParams } from "../types.js";

/** Generated from apps/backend/app/openapi.generated.json. */
export class ContainerResource extends ResourceClient {
  /**
   * @generated GET /container/access
   */
  access(query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/container/access`, query);
  }

  /**
   * @generated GET /container/projects
   */
  projects(query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/container/projects`, query);
  }

  /**
   * @generated POST /container/projects
   */
  postProjects(body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/container/projects`, body);
  }

  /**
   * @generated GET /container/projects/[id]
   */
  getProjects(id: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/container/projects/${encodeURIComponent(id)}`, query);
  }

  /**
   * @generated POST /container/projects/[id]/domains
   */
  projectsDomains(id: string, body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/container/projects/${encodeURIComponent(id)}/domains`, body);
  }

  /**
   * @generated POST /container/projects/[id]/import
   */
  projectsImport(id: string, body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/container/projects/${encodeURIComponent(id)}/import`, body);
  }

  /**
   * @generated POST /container/projects/[id]/networks
   */
  projectsNetworks(id: string, body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/container/projects/${encodeURIComponent(id)}/networks`, body);
  }

  /**
   * @generated POST /container/projects/[id]/ports
   */
  projectsPorts(id: string, body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/container/projects/${encodeURIComponent(id)}/ports`, body);
  }

  /**
   * @generated GET /container/projects/[id]/templates
   */
  projectsTemplates(id: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/container/projects/${encodeURIComponent(id)}/templates`, query);
  }

  /**
   * @generated POST /container/projects/[id]/templates
   */
  postProjectsTemplates(id: string, body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/container/projects/${encodeURIComponent(id)}/templates`, body);
  }

  /**
   * @generated POST /container/projects/[id]/workloads
   */
  projectsWorkloads(id: string, body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/container/projects/${encodeURIComponent(id)}/workloads`, body);
  }

  /**
   * @generated GET /container/regions
   */
  regions(query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/container/regions`, query);
  }

  /**
   * @generated GET /container/workloads/[id]
   */
  workloads(id: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/container/workloads/${encodeURIComponent(id)}`, query);
  }

  /**
   * @generated POST /container/workloads/[id]/actions
   */
  workloadsActions(id: string, body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/container/workloads/${encodeURIComponent(id)}/actions`, body);
  }

  /**
   * @generated GET /container/workloads/[id]/env
   */
  workloadsEnv(id: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/container/workloads/${encodeURIComponent(id)}/env`, query);
  }

  /**
   * @generated PUT /container/workloads/[id]/env
   */
  replaceWorkloadsEnv(id: string, body?: Record<string, unknown>) {
    return this.put<Record<string, unknown>>(`/container/workloads/${encodeURIComponent(id)}/env`, body);
  }

  /**
   * @generated GET /container/workloads/[id]/files
   */
  workloadsFiles(id: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/container/workloads/${encodeURIComponent(id)}/files`, query);
  }

  /**
   * @generated POST /container/workloads/[id]/files
   */
  postWorkloadsFiles(id: string, body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/container/workloads/${encodeURIComponent(id)}/files`, body);
  }

  /**
   * @generated GET /container/workloads/[id]/logs
   */
  workloadsLogs(id: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/container/workloads/${encodeURIComponent(id)}/logs`, query);
  }

  /**
   * @generated GET /container/workloads/[id]/monitoring
   */
  workloadsMonitoring(id: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/container/workloads/${encodeURIComponent(id)}/monitoring`, query);
  }
}
