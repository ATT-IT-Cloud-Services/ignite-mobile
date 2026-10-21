/**
 * Multi-daemon production hosts (see repo README).
 * - API  → apps/backend     (JSON at host root on api host; legacy /api and /v1 rewrite)
 * - Web  → apps/web         (pages, legal markdown, brand assets, marketing links)
 */

/** Hardcoded production API origin. */
export const API_BASE_URL = "https://api.elizon.app";

/** Hardcoded production web origin. */
export const WEB_BASE_URL = "https://www.elizon.app";

/** Hostnames that belong to the customer-facing web app (not the API daemon). */
export const WEB_HOSTS = new Set(["elizon.app", "www.elizon.app"]);

/** Hostnames that belong to the public API daemon. */
export const API_HOSTS = new Set(["api.elizon.app"]);

export function getApiBaseUrl(): string {
  return API_BASE_URL;
}

export function getWebBaseUrl(): string {
  return WEB_BASE_URL;
}

/** Absolute URL on the web daemon (pages, static assets under www). */
export function webUrl(path = "/"): string {
  const base = WEB_BASE_URL.replace(/\/+$/, "");
  if (!path || path === "/") return `${base}/`;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * Strip redundant `/api` and legacy `/v1` so requests hit api host root:
 * `/api/auth/me` → `/auth/me`
 */
export function stripApiSurfacePrefix(path: string): string {
  let p = path.startsWith("/") ? path : `/${path}`;
  if (p === "/api/v1" || p === "/api" || p === "/v1") return "/";
  if (p.startsWith("/api/v1/")) return p.slice("/api/v1".length) || "/";
  if (p.startsWith("/api/")) return p.slice("/api".length) || "/";
  if (p.startsWith("/v1/")) return p.slice("/v1".length) || "/";
  return p;
}

/** Absolute URL on the API daemon (no double /api). */
export function apiUrl(path = "/"): string {
  const base = API_BASE_URL.replace(/\/+$/, "");
  if (!path || path === "/") return `${base}/`;
  const p = stripApiSurfacePrefix(path.startsWith("/") ? path : `/${path}`);
  return `${base}${p}`;
}

/** Baked at build time via build.ts (semver + git sha, e.g. "0.8.2 (ba3559d)"). */
export const APP_VERSION = process.env.APP_VERSION ?? "0.0.0-dev";
