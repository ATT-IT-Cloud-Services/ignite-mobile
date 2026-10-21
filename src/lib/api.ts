import { ApiError, IgniteClient, type QueryParams } from "@ignite/api-client";
import { AuthResource } from "../api/auth";
import { DashboardResource } from "../api/dashboard";
import { BillingResource } from "../api/billing";
import { CheckoutResource } from "../api/checkout";
import { ShopResource } from "../api/shop";
import { FamilyResource } from "../api/family";
import { ServicesResource } from "../api/services";
import { SupportResource } from "../api/support";
import { UserResource } from "../api/user";
import { WalletResource } from "../api/wallet";
import { BusinessResource } from "../api/business";
import { ContainerResource } from "../api/container";
import { AffiliatesResource } from "../api/affiliates";
import { DomainsResource } from "../api/domains";
import { IpManagerResource } from "../api/ip-manager";
import { SshKeysResource } from "../api/ssh-keys";
import { SubdomainsResource } from "../api/subdomains";
import { SettingsResource } from "../api/settings";
import { FloatingIpsResource } from "../api/floating-ips";
import { ByoipResource } from "../api/byoip";
import { ByoasResource } from "../api/byoas";
import { PlusResource } from "../api/plus";
import { PublicResource } from "../api/public";
import { BlogResource } from "../api/blog";
import { IdVerificationResource } from "../api/id-verification";
import { TenantTransferResource } from "../api/tenant-transfer";
import { DocumentsResource } from "../api/documents";
import { TeamResource } from "../api/team";
import type { ApiTransport } from "../api/types";
import { API_BASE_URL, stripApiSurfacePrefix } from "./config";
import { getClientKind, getPlatformHeader } from "./platform";
import {
  clearSessionToken as clearStoredSessionToken,
  getSessionToken,
  initSessionToken as initStoredSessionToken,
  setSessionToken as persistSessionToken,
} from "./session-token";

export { ApiError };
export { getSessionToken, hasStoredSessionToken, isPersistedSession } from "./session-token";

type RequestInitJson = Omit<RequestInit, "body" | "headers"> & {
  body?: unknown;
  headers?: Record<string, string>;
  query?: QueryParams;
};

const ignite = new IgniteClient({
  baseUrl: API_BASE_URL,
  clientKind: getClientKind(),
  token: getSessionToken(),
  headers: {
    "X-Elizon-Platform": getPlatformHeader(),
  },
  fetch: ((input: Parameters<typeof fetch>[0], init?: RequestInit) =>
    fetch(input, { ...init, credentials: "include" })) as typeof fetch,
  onUnauthorized: () => {
    clearStoredSessionToken();
  },
});

function toHostPath(path: string): string {
  return stripApiSurfacePrefix(path.startsWith("/") ? path : `/${path}`);
}

class IgniteTransport implements ApiTransport {
  get<T>(path: string, query?: QueryParams) {
    return ignite.get<T>(toHostPath(path), query);
  }

  post<T>(path: string, body?: unknown) {
    return ignite.post<T>(toHostPath(path), body);
  }

  put<T>(path: string, body?: unknown) {
    return ignite.put<T>(toHostPath(path), body);
  }

  patch<T>(path: string, body?: unknown) {
    return ignite.patch<T>(toHostPath(path), body);
  }

  delete<T>(path: string, query?: QueryParams, body?: unknown) {
    return ignite.delete<T>(toHostPath(path), query, body);
  }
}

const transport = new IgniteTransport();

export function setSessionToken(token: string, options?: { persist?: boolean }): void {
  persistSessionToken(token, options);
  ignite.setToken(token);
}

export function clearSessionToken(): void {
  clearStoredSessionToken();
  ignite.setToken(null);
}

export async function initSessionToken(): Promise<void> {
  await initStoredSessionToken();
  ignite.setToken(getSessionToken());
}

export async function apiFetch<T = unknown>(path: string, init: RequestInitJson = {}): Promise<T> {
  const method = (init.method ?? "GET").toUpperCase();
  const hostPath = toHostPath(path);
  if (method === "GET") return ignite.get<T>(hostPath, init.query);
  if (method === "POST") return ignite.post<T>(hostPath, init.body);
  if (method === "PUT") return ignite.put<T>(hostPath, init.body);
  if (method === "PATCH") return ignite.patch<T>(hostPath, init.body);
  if (method === "DELETE") return ignite.delete<T>(hostPath, init.query, init.body);
  throw new Error(`Unsupported method ${method}`);
}

/**
 * Mobile-facing API.
 *
 * The hand-written facades in `src/api/*` are thin typed adapters: every call
 * delegates to the generated `@ignite/api-client` (single source of truth for
 * paths and HTTP semantics), so the mobile layer cannot drift from the OpenAPI
 * spec. Session auth flows through `setSessionToken` → `ignite.setToken`.
 */
export class ApiClient implements ApiTransport {
  /** Raw ignite API client (OpenAPI resources and generated methods). */
  public readonly client = ignite;

  public readonly auth = new AuthResource(ignite);
  public readonly dashboard = new DashboardResource(ignite);
  public readonly billing = new BillingResource(ignite);
  public readonly checkout = new CheckoutResource(ignite);
  public readonly shop = new ShopResource(ignite);
  public readonly family = new FamilyResource(ignite);
  public readonly services = new ServicesResource(ignite);
  public readonly domains = new DomainsResource(ignite);
  public readonly subdomains = new SubdomainsResource(ignite);
  public readonly ipManager = new IpManagerResource(ignite);
  public readonly sshKeys = new SshKeysResource(ignite);
  public readonly support = new SupportResource(ignite);
  public readonly user = new UserResource(ignite);
  public readonly wallet = new WalletResource(ignite);
  public readonly business = new BusinessResource(ignite);
  public readonly container = new ContainerResource(ignite);
  public readonly affiliates = new AffiliatesResource(ignite);
  public readonly byoip = new ByoipResource(ignite);
  public readonly byoas = new ByoasResource(ignite);
  public readonly floatingIps = new FloatingIpsResource(ignite);
  public readonly publicApi = new PublicResource(ignite);
  public readonly blog = new BlogResource(ignite);
  public readonly settings = new SettingsResource(ignite);
  public readonly idVerification = new IdVerificationResource(ignite);
  public readonly plus = new PlusResource(ignite);
  public readonly tenantTransfer = new TenantTransferResource(this);
  public readonly documents = new DocumentsResource(ignite);
  public readonly team = new TeamResource(ignite);

  get<T>(path: string, query?: QueryParams) {
    return transport.get<T>(path, query);
  }

  post<T>(path: string, body?: unknown) {
    return transport.post<T>(path, body);
  }

  put<T>(path: string, body?: unknown) {
    return transport.put<T>(path, body);
  }

  patch<T>(path: string, body?: unknown) {
    return transport.patch<T>(path, body);
  }

  delete<T>(path: string, query?: QueryParams, body?: unknown) {
    return transport.delete<T>(path, query, body);
  }

  request<T = unknown>(path: string, init: RequestInitJson = {}): Promise<T> {
    return apiFetch<T>(path, init);
  }
}

export const api = new ApiClient();
