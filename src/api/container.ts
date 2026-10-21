import { ResourceClient } from "./resource-client";
import type { IgniteClient } from "@ignite/api-client";

export type ContainerAccess = {
  allowed: boolean;
  canRead?: boolean;
  canWrite?: boolean;
  canCreate?: boolean;
  reason: string;
  invoiceEnabled: boolean;
  hasActiveFund: boolean;
};

export type ContainerRegion = {
  providerId: string;
  code: string;
  label: string;
  sort: number;
};

export type ContainerProjectSummary = {
  id: string;
  name: string;
  description: string | null;
  settlementMode: string;
  status: string;
  workloadCount: number;
  networkCount: number;
  isShared?: boolean;
};

export type ContainerWorkloadSummary = {
  id: string;
  name: string;
  kind: string;
  status: string;
  networkIds: string[];
};

export type ContainerNetwork = {
  id: string;
  name: string;
  driver: string;
  internal: boolean;
};

export type ContainerDomain = {
  id: string;
  host: string;
  https: boolean;
  targetPort: number;
  workloadId: string;
};

export type ContainerPort = {
  id: string;
  publishedPort: number;
  targetPort: number;
  protocol: string;
  workloadId: string;
};

export type ContainerProjectGraph = {
  id: string;
  name: string;
  description: string | null;
  settlementMode: string;
  status: string;
  workloads: ContainerWorkloadSummary[];
  networks: ContainerNetwork[];
  domains: ContainerDomain[];
  ports: ContainerPort[];
};

export type ContainerProjectAccess = {
  isOwner: boolean;
  permissions: string[];
};

export type ContainerWorkloadDetail = {
  id: string;
  projectId: string;
  projectName: string;
  name: string;
  kind: string;
  status: string;
  appName: string | null;
  connected: boolean;
  unbilledMicro: number;
  unbilledEuros: number;
};

export class ContainerResource extends ResourceClient {
  constructor(client: IgniteClient) {
    super(client);
  }

  access() {
    return this.client.container.access() as Promise<{ success: boolean; access: ContainerAccess }>;
  }

  regions() {
    return this.client.container.regions() as Promise<{ success: boolean; regions: ContainerRegion[] }>;
  }

  listProjects() {
    return this.client.container.projects() as Promise<{
      success: boolean;
      projects: ContainerProjectSummary[];
    }>;
  }

  createProject(body: {
    name: string;
    description?: string;
    providerId: string;
    settlementMode: "invoice" | "business_fund";
  }) {
    return this.client.container.postProjects(body) as Promise<{
      success: boolean;
      project?: { id: string; name: string };
    }>;
  }

  getProject(id: string) {
    return this.client.container.getProjects(id) as Promise<{
      success: boolean;
      project: ContainerProjectGraph;
      access: ContainerProjectAccess;
    }>;
  }

  createNetwork(projectId: string, body: { name: string; driver?: "bridge" | "overlay"; internal?: boolean }) {
    return this.client.container.projectsNetworks(projectId, body) as Promise<{ success: boolean }>;
  }

  createWorkload(projectId: string, body: { name: string; kind: string; networkIds?: string[] }) {
    return this.client.container.projectsWorkloads(projectId, body) as Promise<{ success: boolean }>;
  }

  createDomain(
    projectId: string,
    body: { workloadId: string; host: string; https?: boolean; targetPort?: number },
  ) {
    return this.client.container.projectsDomains(projectId, body) as Promise<{ success: boolean }>;
  }

  createPort(
    projectId: string,
    body: { workloadId: string; publishedPort: number; targetPort: number; protocol?: "tcp" | "udp" },
  ) {
    return this.client.container.projectsPorts(projectId, body) as Promise<{ success: boolean }>;
  }

  getWorkload(id: string) {
    return this.client.container.workloads(id) as Promise<{
      success: boolean;
      workload: ContainerWorkloadDetail;
      access: ContainerProjectAccess;
    }>;
  }

  workloadAction(id: string, action: "start" | "stop" | "deploy") {
    return this.client.container.workloadsActions(id, { action }) as Promise<{ success: boolean }>;
  }

  workloadLogs(id: string) {
    return this.client.container.workloadsLogs(id) as Promise<{
      success: boolean;
      logs?: string;
      notice?: string | null;
    }>;
  }
}
