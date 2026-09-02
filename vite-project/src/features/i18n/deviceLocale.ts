import type { GuideLocale } from "../workspace/guide/guideLocales";

export const DEVICE_LOCALE_FALLBACK: GuideLocale = "en";

export const BUNDLED_DEVICE_LOCALES: readonly GuideLocale[] = [
  "ko",
  "en",
  "ja",
  "zh",
  "zh_tw",
];

const normalizeLanguageTag = (languageTag: string) =>
  languageTag.trim().replaceAll("_", "-").toLowerCase();

const normalizeLocaleId = (locale: GuideLocale) =>
  normalizeLanguageTag(locale).replaceAll("-", "_");

const getSupportedLocale = (
  languageTag: string,
  availableLocales: readonly GuideLocale[],
): GuideLocale | null => {
  const normalized = normalizeLanguageTag(languageTag);
  if (!normalized) return null;

  const localesByTag = new Map(
    availableLocales.map((locale) => [
      normalizeLanguageTag(locale),
      normalizeLocaleId(locale),
    ]),
  );
  const exact = localesByTag.get(normalized);
  if (exact) return exact;

  const [language] = normalized.split("-");
  if (language === "zh") {
    const usesTraditionalChinese =
      normalized.includes("-hant") ||
      normalized.includes("-tw") ||
      normalized.includes("-hk") ||
      normalized.includes("-mo");
    const chineseLocale = usesTraditionalChinese ? "zh_tw" : "zh";
    if (availableLocales.includes(chineseLocale)) return chineseLocale;
  }

  return localesByTag.get(language) ?? null;
};

export const resolveDeviceLocale = (
  languageTags: readonly string[],
  availableLocales: readonly GuideLocale[] = BUNDLED_DEVICE_LOCALES,
  fallback: GuideLocale = DEVICE_LOCALE_FALLBACK,
): GuideLocale => {
  for (const languageTag of languageTags) {
    const locale = getSupportedLocale(languageTag, availableLocales);
    if (locale) return locale;
  }

  return fallback;
};

export const readDeviceLocale = (
  availableLocales: readonly GuideLocale[] = BUNDLED_DEVICE_LOCALES,
): GuideLocale => {
  if (typeof navigator === "undefined") return DEVICE_LOCALE_FALLBACK;

  const languageTags =
    navigator.languages.length > 0
      ? navigator.languages
      : [navigator.language];
  return resolveDeviceLocale(languageTags, availableLocales);
};
