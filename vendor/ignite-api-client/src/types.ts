export type QueryValue = string | number | boolean | null | undefined;
export type QueryParams = Record<string, QueryValue>;

export type IgniteClientKind = "desktop" | "mobile" | "api";

export interface IgniteClientConfig {
  /** Base URL of the ignite API (e.g. https://api.example.test). */
  baseUrl: string;
  /** Bearer session token or API key. */
  token?: string | null;
  /** Sent as X-Ignite-Client. Defaults to "api". */
  clientKind?: IgniteClientKind;
  /** Optional custom fetch implementation (Node 18+, browser, or polyfill). */
  fetch?: typeof fetch;
  /** Additional headers merged into every request. */
  headers?: Record<string, string>;
  /** Called when the client clears its token after an unauthenticated response. */
  onUnauthorized?: () => void;
  /** Enable sandbox mode: sends `x-sandbox: true` and requires no API key or session. */
  sandbox?: boolean;
  /** Force a sandbox error with this machine-readable code (`x-sandbox-error`). */
  sandboxError?: string;
  /** Optional HTTP status for a forced sandbox error (`x-sandbox-status`, default 400). */
  sandboxStatus?: number;
}

export interface ApiTransport {
  get<T>(path: string, query?: QueryParams): Promise<T>;
  post<T>(path: string, body?: unknown): Promise<T>;
  put<T>(path: string, body?: unknown): Promise<T>;
  patch<T>(path: string, body?: unknown): Promise<T>;
  delete<T>(path: string, query?: QueryParams, body?: unknown): Promise<T>;
}
