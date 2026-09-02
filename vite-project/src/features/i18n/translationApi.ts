import { resolveTftRuntimeConfig } from "../api/tftApi";
import type { GuideLocale } from "../workspace/guide/guideLocales";
import {
  parseTranslationCatalog,
  type TranslationCatalog,
} from "./translationCatalog";

const CACHE_KEY_PREFIX = "tft-translation-catalog:v2:";

interface CachedCatalogEnvelope {
  readonly endpoint: string;
  readonly payload: unknown;
}

const requests = new Map<string, Promise<TranslationCatalog | null>>();

const resolveCatalogBaseUrl = (): string | null => {
  try {
    const baseUrl = resolveTftRuntimeConfig().translationsUrl;
    return baseUrl ? baseUrl.replace(/\/+$/, "") : null;
  } catch {
    return null;
  }
};

const resolveCatalogEndpoint = (locale: GuideLocale): string | null => {
  const baseUrl = resolveCatalogBaseUrl();
  return baseUrl ? `${baseUrl}/${encodeURIComponent(locale)}` : null;
};

const readCacheEnvelope = (
  locale: GuideLocale,
): CachedCatalogEnvelope | null => {
  if (typeof window === "undefined") return null;

  try {
    const saved = window.localStorage.getItem(`${CACHE_KEY_PREFIX}${locale}`);
    if (!saved) return null;
    const value: unknown = JSON.parse(saved);
    if (
      typeof value !== "object" ||
      value === null ||
      !("endpoint" in value) ||
      typeof value.endpoint !== "string" ||
      !("payload" in value)
    ) {
      return null;
    }
    return value as CachedCatalogEnvelope;
  } catch {
    return null;
  }
};

const writeCacheEnvelope = (
  locale: GuideLocale,
  endpoint: string,
  payload: unknown,
): void => {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(
      `${CACHE_KEY_PREFIX}${locale}`,
      JSON.stringify({ endpoint, payload }),
    );
  } catch {
    return;
  }
};

export const readCachedTranslationCatalog = (
  locale: GuideLocale,
): TranslationCatalog | null => {
  const endpoint = resolveCatalogEndpoint(locale);
  const cached = readCacheEnvelope(locale);
  if (!endpoint || !cached || cached.endpoint !== endpoint) return null;

  try {
    return parseTranslationCatalog(cached.payload, locale);
  } catch {
    return null;
  }
};

export const fetchTranslationCatalog = (
  locale: GuideLocale,
): Promise<TranslationCatalog | null> => {
  const endpoint = resolveCatalogEndpoint(locale);
  if (!endpoint) return Promise.resolve(null);

  const requestKey = `${locale}:${endpoint}`;
  const activeRequest = requests.get(requestKey);
  if (activeRequest) return activeRequest;

  const request = fetch(endpoint, {
    method: "GET",
    credentials: "omit",
    cache: "no-cache",
    headers: { Accept: "application/json" },
  })
    .then(async (response) => {
      if (!response.ok) return null;
      const payload: unknown = await response.json();
      const catalog = parseTranslationCatalog(payload, locale);
      writeCacheEnvelope(locale, endpoint, payload);
      return catalog;
    })
    .catch(() => null)
    .finally(() => {
      requests.delete(requestKey);
    });

  requests.set(requestKey, request);
  return request;
};

export const clearTranslationCatalogCache = (
  locale?: GuideLocale,
): void => {
  requests.clear();
  if (typeof window === "undefined") return;

  try {
    if (locale) {
      window.localStorage.removeItem(`${CACHE_KEY_PREFIX}${locale}`);
      return;
    }
    for (let index = window.localStorage.length - 1; index >= 0; index -= 1) {
      const key = window.localStorage.key(index);
      if (key?.startsWith(CACHE_KEY_PREFIX)) {
        window.localStorage.removeItem(key);
      }
    }
  } catch {
    return;
  }
};
