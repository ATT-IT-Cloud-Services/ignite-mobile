import { getWebBaseUrl, WEB_BASE_URL } from "./config";

/** Canonical static assets (logos, fonts, icons) from the elizon website — single source of truth. */
export function getBrandAssetUrl(path: string): string {
  const base = getWebBaseUrl().replace(/\/+$/, "");
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalized}`;
}

export function getDefaultBrandAssetUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${WEB_BASE_URL}${normalized}`;
}

export function getBrandLogoUrl(theme: "dark" | "light"): string {
  return getBrandAssetUrl(`/logo-${theme}.webp`);
}

export function getBrandLogoFallbackUrl(theme: "dark" | "light"): string {
  // Web origin is the only brand CDN; fallback is identical.
  return getDefaultBrandAssetUrl(`/logo-${theme}.webp`);
}
