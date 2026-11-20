import { ResourceClient } from "./resource-client";
import type { IgniteClient } from "@ignite/api-client";

/** Settlement systems the platform offers side by side. */
export type ContainerSettlementMode = "balance" | "invoice" | "business_fund" | "token_wallet";

export type ContainerTokenWalletState = {
  balanceTokens: number;
  creditLimitTokens: number;
  remainingTokens: number;
  negative: boolean;
  exhausted: boolean;
  currency: string;
};

export type ContainerAccess = {
  allowed: boolean;
  canRead: boolean;
  canWrite: boolean;
  canCreate: boolean;
  reason: string;
  invoiceEnabled: boolean;
  hasActiveFund: boolean;
  hasTokenWallet: boolean;
  settlementMode: ContainerSettlementMode | null;
  settlementModes?: ContainerSettlementMode[];
  /** Account balance (Guthaben) the `balance` path debits. */
  balanceEur?: number;
  wallet: ContainerTokenWalletState | null;
};

export type ContainerRegion = {
  providerId: string;
  code: string;
  label: string;
  sort: number;
};

export type ContainerPricing = {
  unit: "tokens" | "times";
  pricePer1kTokens: number;
  pricePerTime: number;
  minimumChargePerPodMonthly: number;
  initialDeploymentEnabled: boolean;
  initialDeploymentPrice: number;
};

export type ContainerProjectSummary = {
  id: string;
  name: string;
  description: string | null;
  settlementMode: ContainerSettlementMode;
  status: string;
  regionCode: string | null;
  referenceId: string | null;
  workloadCount: number;
  networkCount: number;
  volumeCount: number;
  ipCount: number;
  isOwner: boolean;
  isShared: boolean;
};

/** A pod's live limits and state. */
export type ContainerPod = {
  id: string;
  name: string;
  kind: string;
  state: string;
  status: string;
  image: string | null;
  templateSlug: string | null;
  templateVersion: string | null;
  suspended: boolean;
  limits: {
    memoryMb: number;
    diskMb: number;
    cpuMillis: number;
    swapMb: number;
    ioWeight: number;
    pidsLimit: number;
  };
  networkIds: string[];
  mounts: string[];
  lastError: string | null;
  createdAt: string;
};

export type ContainerNetwork = {
  id: string;
  name: string;
  cidr: string | null;
  gateway: string | null;
  scope: string;
  internal: boolean;
};

export type ContainerAddress = {
  id: string;
  address: string;
  prefix: number;
  kind: string;
  mode: string;
  podId: string | null;
  label: string | null;
  rdns: string | null;
  rdnsStatus: string;
  monthlyPriceEur: number;
  status: string;
};

export type ContainerPort = {
  id: string;
  externalPort: number;
  targetPort: number;
  protocol: string;
  exposure: string;
  externalIp: string | null;
  /** Address the port answers on: pinned bind IP, otherwise the pod's node. */
  host?: string | null;
  label: string | null;
  workloadId: string;
};

export type ContainerDomain = {
  id: string;
  host: string;
  https: boolean;
  tls: string;
  path: string | null;
  enabled: boolean;
  targetPort: number;
  workloadId: string;
};

export type ContainerProjectGraph = {
  id: string;
  name: string;
  description: string | null;
  settlementMode: ContainerSettlementMode;
  status: string;
  regionCode: string | null;
  referenceId: string | null;
  icResourceGroupId: string | null;
  hardLimitTokens: number | null;
  softLimitTokens: number | null;
  pods: ContainerPod[];
  networks: ContainerNetwork[];
  addresses: ContainerAddress[];
  volumes: Array<{
    id: string;
    name: string;
    sizeGb: number;
    storageClass: string;
    accessMode: string;
    status: string;
  }>;
  domains: ContainerDomain[];
  ports: ContainerPort[];
};

export type ContainerProjectAccess = {
  isOwner: boolean;
  permissions: string[];
};

export type ContainerTemplateOption = {
  id: string;
  slug: string;
  name: string;
  description: string;
  version: string | null;
  channel: string | null;
};

export type ContainerUsageSummary = {
  unit: "tokens" | "times";
  tokens: number;
  costEur: number;
  minimumEur: number;
  chargedEur: number;
  pricePer1kTokens: number;
  minChargePerPodMonthly: number;
  settlementMode: string;
  from: string;
  to: string;
};

export type ContainerPodUsageSnapshot = {
  id: string;
  periodStart: string;
  tokensValue: number;
  chargedEur: number;
  settlementMode: string;
  status: string;
};

export class PodsResource extends ResourceClient {
  constructor(client: IgniteClient) {
    super(client);
  }

  // ---- account ---------------------------------------------------------

  access() {
    return this.client.pods.access() as Promise<{ success: boolean; access: ContainerAccess }>;
  }

  regions() {
    return this.client.pods.regions() as Promise<{
      success: boolean;
      regions: ContainerRegion[];
    }>;
  }

  wallet() {
    return this.client.pods.wallet() as Promise<{
      success: boolean;
      wallet: ContainerTokenWalletState | null;
    }>;
  }

  // ---- projects (= resource groups) ------------------------------------

  listProjects() {
    return this.client.pods.projects() as Promise<{
      success: boolean;
      projects: ContainerProjectSummary[];
      pricing: ContainerPricing | null;
    }>;
  }

  createProject(body: {
    name: string;
    description?: string;
    providerId?: string | null;
    settlementMode: ContainerSettlementMode;
  }) {
    return this.client.pods.postProjects(body) as Promise<{
      success: boolean;
      project?: { id: string; name: string };
    }>;
  }

  getProject(id: string) {
    return this.client.pods.getProjects(id) as Promise<{
      success: boolean;
      project: ContainerProjectGraph;
      pricing: ContainerPricing | null;
      wallet: ContainerTokenWalletState | null;
      access: ContainerProjectAccess;
    }>;
  }

  projectUsage(id: string, window: "1h" | "24h" | "7d" | "30d" = "24h") {
    return this.client.pods.projectUsage(id, { window }) as Promise<{
      success: boolean;
      summary: ContainerUsageSummary | null;
      snapshots: ContainerPodUsageSnapshot[];
      warning: string | null;
    }>;
  }

  // ---- pods ------------------------------------------------------------

  createPod(
    projectId: string,
    body: {
      name: string;
      templateId: string;
      image?: string;
      limits?: { memoryMb?: number; diskMb?: number; cpuMillis?: number };
      autoStart?: boolean;
    },
  ) {
    return this.client.pods.createPod(projectId, body) as Promise<{
      success: boolean;
      workloadId?: string;
      icPodId?: string;
    }>;
  }

  getPod(id: string) {
    return this.client.pods.pod(id) as Promise<{
      success: boolean;
      pod: ContainerPod;
      access: ContainerProjectAccess;
    }>;
  }

  podAction(id: string, action: "start" | "stop" | "restart" | "reinstall") {
    return this.client.pods.podActions(id, { action }) as Promise<{
      success: boolean;
      state?: string;
    }>;
  }

  podLogs(id: string) {
    return this.client.pods.getPodLogs(id, { lines: 200 }) as Promise<{
      success: boolean;
      lines?: string[];
    }>;
  }

  // ---- networks --------------------------------------------------------

  createNetwork(projectId: string, body: { name: string; cidr: string; internal?: boolean }) {
    return this.client.pods.projectsNetworks(projectId, {
      action: "create",
      ...body,
    }) as Promise<{ success: boolean; networkId?: string }>;
  }

  listRelays(projectId: string) {
    return this.client.pods.projectsRelays(projectId) as Promise<{
      success: boolean;
      relays: Array<{
        id: string;
        name: string;
        networkId: string;
        networkName: string;
        address: string | null;
        listenPort: number | null;
        protocol: string;
        enabled: boolean;
      }>;
    }>;
  }

  createRelay(
    projectId: string,
    body: { name: string; networkId: string; listenPort?: number; protocol?: string },
  ) {
    return this.client.pods.postProjectsRelays(projectId, {
      action: "create",
      ...body,
    }) as Promise<{ success: boolean; relayId?: string }>;
  }

  deleteRelay(projectId: string, relayId: string) {
    return this.client.pods.postProjectsRelays(projectId, {
      action: "delete",
      relayId,
    }) as Promise<{ success: boolean }>;
  }

  attachPod(projectId: string, body: { networkId: string; workloadId: string; ip?: string }) {
    return this.client.pods.projectsNetworks(projectId, {
      action: "attach",
      ...body,
    }) as Promise<{ success: boolean; ip?: string }>;
  }

  // ---- access ----------------------------------------------------------

  /**
   * Rent an address. The address is never part of the request: the platform
   * assigns the next free address from the operator's pool for this location.
   */
  rentAddress(
    projectId: string,
    body: { mode?: "nat" | "direct"; family?: "ipv4" | "ipv6"; label?: string },
  ) {
    return this.client.pods.projectsIps(projectId, body) as Promise<{
      success: boolean;
      addressId?: string;
      address?: string;
      prefix?: number;
    }>;
  }

  setReverseDns(addressId: string, ptr: string | null) {
    return this.client.pods.patchIp(addressId, { action: "rdns", ptr }) as Promise<{
      success: boolean;
      rdns?: string | null;
      status?: string;
    }>;
  }

  bindAddress(addressId: string, podId: string, primary = false) {
    return this.client.pods.patchIp(addressId, {
      action: "bind",
      workloadId: podId,
      primary,
    }) as Promise<{ success: boolean }>;
  }

  createPodPort(podId: string, body: { containerPort: number; exposure?: "public" | "internal" }) {
    return this.client.pods.podPorts(podId, body) as Promise<{
      success: boolean;
      portId?: string;
    }>;
  }

  createPodDomain(podId: string, body: { host: string; https?: boolean; targetPort?: number }) {
    return this.client.pods.podDomains(podId, body) as Promise<{
      success: boolean;
      domainId?: string;
    }>;
  }

  // ---- templates -------------------------------------------------------

  listTemplates(projectId: string) {
    return this.client.pods.getProjectTemplates(projectId) as Promise<{
      success: boolean;
      catalogue: ContainerTemplateOption[];
      custom: ContainerTemplateOption[];
      bundled: ContainerTemplateOption[];
    }>;
  }
}
