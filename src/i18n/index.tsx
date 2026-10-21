import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

import { de } from "./de";
import { en, type Dict } from "./en";
import { apiUrl } from "../lib/config";

export type Lang = "de" | "en";
type Key = keyof Dict;

const STORAGE_KEY = "ignite.lang";
const LEGACY_STORAGE_KEY = "ignite.lang";
const dicts: Record<Lang, Dict> = { de, en };

type TranslationVars = Record<string, string | number>;

function applyVars(template: string, vars?: TranslationVars): string {
  if (!vars || !template.includes("{")) return template;
  let out = template;
  for (const [key, raw] of Object.entries(vars)) {
    const value = String(raw);
    out = out.split(`{{${key}}}`).join(value);
    out = out.split(`{${key}}`).join(value);
  }
  return out;
}

type I18nContextValue = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: Key, vars?: TranslationVars) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

function detectInitialLang(): Lang {
  if (typeof window === "undefined") return "de";
  const stored = window.localStorage.getItem(STORAGE_KEY) || window.localStorage.getItem(LEGACY_STORAGE_KEY);
  if (stored === "de" || stored === "en") return stored;
  const nav = window.navigator?.language?.toLowerCase() ?? "";
  return nav.startsWith("de") ? "de" : "en";
}

export function I18nProvider({ children, vars }: { children: ReactNode; vars?: TranslationVars }) {
  const [lang, setLangState] = useState<Lang>(() => detectInitialLang());
  const [remoteVars, setRemoteVars] = useState<TranslationVars>({});

  useEffect(() => {
    document.documentElement.lang = lang;
    window.localStorage.setItem(STORAGE_KEY, lang);
  }, [lang]);

  useEffect(() => {
    let cancelled = false;
    fetch(apiUrl("/public/appearance"))
      .then((res) => res.json())
      .then((json: { appearance?: { brandName?: string; plusName?: string; legalName?: string; supportEmail?: string; siteUrl?: string; siteHost?: string } }) => {
        if (cancelled) return;
        const appearance = json.appearance;
        if (!appearance?.brandName) return;
        setRemoteVars({
          brand: appearance.brandName,
          plusName: appearance.plusName || `${appearance.brandName}+`,
          legalName: appearance.legalName || appearance.brandName,
          supportEmail: appearance.supportEmail || "",
          siteUrl: appearance.siteUrl || "",
          siteHost: appearance.siteHost || "",
        });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const setLang = useCallback((next: Lang) => setLangState(next), []);
  const t = useCallback(
    (key: Key, callVars?: TranslationVars) =>
      applyVars(dicts[lang][key] ?? dicts.en[key] ?? String(key), { ...remoteVars, ...vars, ...callVars }),
    [lang, vars, remoteVars],
  );

  const value = useMemo<I18nContextValue>(() => ({ lang, setLang, t }), [lang, setLang, t]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside <I18nProvider>");
  return ctx;
}
