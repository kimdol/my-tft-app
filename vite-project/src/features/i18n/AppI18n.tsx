import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  GUIDE_LANGUAGE_OPTIONS,
  isGuideLocale,
  type GuideLocale,
} from "../workspace/guide/guideLocales";
import {
  fetchTranslationCatalog,
  readCachedTranslationCatalog,
} from "./translationApi";
import {
  createBundledTranslationCatalog,
  type TranslationCatalog,
} from "./translationCatalog";
import { formatActiveTraitDescription } from "../core/traitDescriptionFormatter";
import { readDeviceLocale } from "./deviceLocale";
import {
  AppI18nContext,
  formatCostForLocale,
  type AppI18nValue,
} from "./useAppI18n";
import { resolveLocalizedChampionName } from "./championName";

const APP_LOCALE_STORAGE_KEY = "tft-app-locale";
const APP_LOCALE_MODE_STORAGE_KEY = "tft-app-locale-mode";
const MANUAL_LOCALE_MODE = "manual";
const REMOTE_TRANSLATION_REFRESH_DEDUPLICATION_MS = 15 * 1000;

interface LocaleState {
  readonly locale: GuideLocale;
  readonly isManual: boolean;
}

const readInitialLocaleState = (): LocaleState => {
  const automaticLocale = readDeviceLocale();
  if (typeof window === "undefined") {
    return { locale: automaticLocale, isManual: false };
  }

  try {
    const savedLocale = window.localStorage.getItem(APP_LOCALE_STORAGE_KEY);
    const localeMode = window.localStorage.getItem(
      APP_LOCALE_MODE_STORAGE_KEY,
    );
    if (localeMode === MANUAL_LOCALE_MODE && isGuideLocale(savedLocale)) {
      return { locale: savedLocale, isManual: true };
    }
  } catch {
    return { locale: automaticLocale, isManual: false };
  }

  return { locale: automaticLocale, isManual: false };
};

const getHtmlLanguageTag = (locale: GuideLocale): string => {
  if (locale === "zh") return "zh-Hans";
  if (locale === "zh_tw") return "zh-Hant";
  return locale.replaceAll("_", "-");
};

export function AppI18nProvider({ children }: { readonly children: ReactNode }) {
  const [localeState, setLocaleState] =
    useState<LocaleState>(readInitialLocaleState);
  const { locale } = localeState;
  const [remoteCatalog, setRemoteCatalog] =
    useState<TranslationCatalog | null>(null);
  const bundledCatalog = useMemo(
    () => createBundledTranslationCatalog(locale),
    [locale],
  );
  const cachedCatalog = useMemo(
    () => readCachedTranslationCatalog(locale),
    [locale],
  );
  const catalog =
    remoteCatalog?.locale === locale
      ? remoteCatalog
      : (cachedCatalog ?? bundledCatalog);
  const copy = catalog.app;

  const setLocale = useCallback((nextLocale: GuideLocale) => {
    setLocaleState({ locale: nextLocale, isManual: true });
    try {
      window.localStorage.setItem(APP_LOCALE_STORAGE_KEY, nextLocale);
      window.localStorage.setItem(
        APP_LOCALE_MODE_STORAGE_KEY,
        MANUAL_LOCALE_MODE,
      );
    } catch {
      return;
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = getHtmlLanguageTag(locale);
  }, [locale]);

  useEffect(() => {
    let cancelled = false;
    let lastRequestedAt = 0;
    const refreshCatalog = () => {
      lastRequestedAt = Date.now();
      void fetchTranslationCatalog(locale).then((nextCatalog) => {
        if (!cancelled && nextCatalog) {
          setRemoteCatalog(nextCatalog);
        }
      });
    };
    const refreshIfStale = () => {
      if (document.visibilityState === "hidden") return;
      if (
        Date.now() - lastRequestedAt <
        REMOTE_TRANSLATION_REFRESH_DEDUPLICATION_MS
      ) {
        return;
      }
      refreshCatalog();
    };
    refreshCatalog();
    document.addEventListener("visibilitychange", refreshIfStale);
    window.addEventListener("focus", refreshIfStale);
    window.addEventListener("online", refreshIfStale);

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", refreshIfStale);
      window.removeEventListener("focus", refreshIfStale);
      window.removeEventListener("online", refreshIfStale);
    };
  }, [locale]);

  const value = useMemo<AppI18nValue>(() => {
    const dataLocale = catalog.data;
    return {
      locale,
      setLocale,
      languageOptions: GUIDE_LANGUAGE_OPTIONS,
      copy,
      guide: catalog.guide,
      championName: (champion) =>
        resolveLocalizedChampionName(dataLocale, champion),
      traitName: (trait) => {
        return trait.apiName
          ? (dataLocale.traits[trait.apiName] ?? trait.name)
          : trait.name;
      },
      traitEffectDescription: (trait) => {
        const localizedTemplate =
          dataLocale.traitDescriptions[trait.apiName] ??
          trait.descriptionTemplate;
        return (
          formatActiveTraitDescription(
            localizedTemplate,
            trait.activeEffect,
            trait.tierIndex,
          ) ?? trait.currentEffectDescription
        );
      },
      formatCost: (cost, compact = false) =>
        formatCostForLocale(locale, copy, cost, compact),
      formatStar: (star) => `${star}${copy.common.star}`,
      formatCount: (count) => `${count}${copy.common.people}`,
      roleLabel: (role) =>
        role === null ? copy.detail.none : catalog.roles[role],
      statLabel: (stat) => catalog.stats[stat],
    };
  }, [catalog, copy, locale, setLocale]);

  return <AppI18nContext.Provider value={value}>{children}</AppI18nContext.Provider>;
}
