import { ApiError } from "./errors.js";
import type { IgniteClientConfig, QueryParams } from "./types.js";

type RequestInitJson = Omit<RequestInit, "body" | "headers"> & {
  body?: unknown;
  headers?: Record<string, string>;
  query?: QueryParams;
};

function isApiFailure(response: Response, body: unknown): boolean {
  const semantic =
    body !== null &&
    typeof body === "object" &&
    typeof (body as { status?: unknown }).status === "number"
      ? Number((body as { status: number }).status)
      : response.status;

  if (body !== null && typeof body === "object") {
    if (typeof (body as { ok?: unknown }).ok === "boolean") {
      return !(body as { ok: boolean }).ok;
    }
    if ((body as { success?: unknown }).success === false) {
      return true;
    }
  }

  return semantic < 200 || semantic >= 300;
}

/**
 * Official ignite API client.
 *
 * All resource namespaces are available as properties (e.g. `client.auth`, `client.services`).
 * Failures throw {@link ApiError} with machine-readable `code`, HTTP `status`, and raw `payload`.
 */
export class IgniteClient {
  private readonly baseUrl: string;
  private token: string | null;
  private readonly clientKind: string;
  private readonly fetchFn: typeof fetch;
  private readonly extraHeaders: Record<string, string>;
  private readonly onUnauthorized?: () => void;
  private readonly sandbox: boolean;
  private readonly sandboxError?: string;
  private readonly sandboxStatus?: number;

  constructor(config: IgniteClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, "");
    this.token = config.token ?? null;
    this.clientKind = config.clientKind ?? "api";
    this.fetchFn = config.fetch ?? globalThis.fetch;
    this.extraHeaders = config.headers ?? {};
    this.onUnauthorized = config.onUnauthorized;
    this.sandbox = config.sandbox ?? false;
    this.sandboxError = config.sandboxError;
    this.sandboxStatus = config.sandboxStatus;
  }

  /** Set or clear the Bearer token used for authenticated requests. */
  setToken(token: string | null): void {
    this.token = token;
  }

  getToken(): string | null {
    return this.token;
  }

  private buildUrl(path: string, query?: QueryParams): string {
    const url = new URL(path.startsWith("/") ? path : `/${path}`, `${this.baseUrl}/`);
    if (query) {
      for (const [key, value] of Object.entries(query)) {
        if (value === undefined || value === null) continue;
        url.searchParams.set(key, String(value));
      }
    }
    return url.toString();
  }

  private buildHeaders(extra?: Record<string, string>, isJson = false): Record<string, string> {
    return {
      Accept: "application/json",
      "X-Ignite-Client": this.clientKind,
      ...(isJson ? { "Content-Type": "application/json" } : {}),
      ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
      ...(this.sandbox ? { "x-sandbox": "true" } : {}),
      ...(this.sandboxError ? { "x-sandbox-error": this.sandboxError } : {}),
      ...(this.sandboxStatus !== undefined ? { "x-sandbox-status": String(this.sandboxStatus) } : {}),
      ...this.extraHeaders,
      ...(extra ?? {}),
    };
  }

  private async executeFetch<T>(path: string, init: RequestInitJson = {}): Promise<T> {
    const { body, headers, query, ...rest } = init;
    const isJson = body !== undefined && !(body instanceof FormData);

    const response = await this.fetchFn(this.buildUrl(path, query), {
      ...rest,
      headers: this.buildHeaders(headers, isJson),
      body: isJson ? JSON.stringify(body) : (body as BodyInit | null | undefined),
    });

    let parsed: unknown = null;
    const contentType = response.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      parsed = await response.json().catch(() => null);
    } else if (response.status !== 204) {
      parsed = await response.text().catch(() => null);
    }

    const semanticStatus =
      parsed && typeof parsed === "object" && typeof (parsed as { status?: unknown }).status === "number"
        ? Number((parsed as { status: number }).status)
        : response.status;

    const apiFailed =
      parsed !== null && typeof parsed === "object"
        ? isApiFailure(response, parsed)
        : !response.ok;

    if (apiFailed) {
      if (
        semanticStatus === 401 ||
        (parsed &&
          typeof parsed === "object" &&
          ((parsed as { errorCode?: unknown }).errorCode === "unauthenticated" ||
            (parsed as { message?: unknown }).message === "unauthenticated"))
      ) {
        this.token = null;
        this.onUnauthorized?.();
      }
      throw ApiError.fromResponse(semanticStatus, parsed);
    }

    return parsed as T;
  }

  get<T>(path: string, query?: QueryParams): Promise<T> {
    return this.executeFetch<T>(path, { method: "GET", query });
  }

  post<T>(path: string, body?: unknown): Promise<T> {
    return this.executeFetch<T>(path, { method: "POST", body });
  }

  put<T>(path: string, body?: unknown): Promise<T> {
    return this.executeFetch<T>(path, { method: "PUT", body });
  }

  patch<T>(path: string, body?: unknown): Promise<T> {
    return this.executeFetch<T>(path, { method: "PATCH", body });
  }

  delete<T>(path: string, query?: QueryParams, body?: unknown): Promise<T> {
    return this.executeFetch<T>(path, { method: "DELETE", query, body });
  }
}
