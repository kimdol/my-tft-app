import type { ChampionCombatStats } from "../domain/championCombatStats";
import type { UnifiedChampionRole } from "../domain/championRole";
import {
  GUIDE_LANGUAGE_OPTIONS,
  GUIDE_LOCALES,
  type GuideCopy,
  type GuideLocale,
  type BundledGuideLocale,
  isBundledGuideLocale,
} from "../workspace/guide/guideLocales";
import { APP_LOCALES, type AppLocaleCopy } from "./appLocales";
import { toTraditionalChinese } from "./toTraditionalChinese";

export const TRANSLATION_CATALOG_SCHEMA_VERSION = 1;

const BUNDLED_CATALOG_VERSION = "ui-catalog-v2";
const BUNDLED_CATALOG_UPDATED_AT = "2026-08-29T00:00:00Z";

export interface TranslationDataCatalog {
  readonly champions: Readonly<Record<string, string>>;
  readonly traits: Readonly<Record<string, string>>;
  readonly traitDescriptions: Readonly<Record<string, string>>;
}

export interface TranslationCatalog {
  readonly schemaVersion: typeof TRANSLATION_CATALOG_SCHEMA_VERSION;
  readonly locale: GuideLocale;
  readonly label: string;
  readonly version: string;
  readonly updatedAt: string;
  readonly app: AppLocaleCopy;
  readonly guide: GuideCopy;
  readonly data: TranslationDataCatalog;
  readonly roles: Readonly<Record<UnifiedChampionRole, string>>;
  readonly stats: Readonly<Record<keyof ChampionCombatStats, string>>;
}

export const ROLE_LABELS: Readonly<
  Record<BundledGuideLocale, Readonly<Record<UnifiedChampionRole, string>>>
> = {
  ko: {
    "physical-fighter": "물리 전사",
    "magic-fighter": "마법 전사",
    "physical-ranged": "물리 원거리",
    "magic-ranged": "마법 원거리",
    "physical-tank": "물리 탱커",
    "magic-tank": "마법 탱커",
    "physical-assassin": "물리 암살자",
    "magic-assassin": "마법 암살자",
  },
  en: {
    "physical-fighter": "Physical Fighter",
    "magic-fighter": "Magic Fighter",
    "physical-ranged": "Physical Ranged",
    "magic-ranged": "Magic Ranged",
    "physical-tank": "Physical Tank",
    "magic-tank": "Magic Tank",
    "physical-assassin": "Physical Assassin",
    "magic-assassin": "Magic Assassin",
  },
  zh: {
    "physical-fighter": "物理战士",
    "magic-fighter": "魔法战士",
    "physical-ranged": "物理远程",
    "magic-ranged": "魔法远程",
    "physical-tank": "物理坦克",
    "magic-tank": "魔法坦克",
    "physical-assassin": "物理刺客",
    "magic-assassin": "魔法刺客",
  },
  ja: {
    "physical-fighter": "物理ファイター",
    "magic-fighter": "魔法ファイター",
    "physical-ranged": "物理遠隔",
    "magic-ranged": "魔法遠隔",
    "physical-tank": "物理タンク",
    "magic-tank": "魔法タンク",
    "physical-assassin": "物理アサシン",
    "magic-assassin": "魔法アサシン",
  },
};

export const STAT_LABELS: Readonly<
  Record<
    BundledGuideLocale,
    Readonly<Record<keyof ChampionCombatStats, string>>
  >
> = {
  ko: {
    health: "체력",
    attackDamage: "공격력",
    attackSpeed: "공격 속도",
    armor: "방어력",
    magicResistance: "마법 저항력",
    attackRange: "공격 사거리",
    startingMana: "시작 마나",
    maximumMana: "최대 마나",
  },
  en: {
    health: "Health",
    attackDamage: "Attack damage",
    attackSpeed: "Attack speed",
    armor: "Armor",
    magicResistance: "Magic resist",
    attackRange: "Range",
    startingMana: "Starting mana",
    maximumMana: "Maximum mana",
  },
  zh: {
    health: "生命值",
    attackDamage: "攻击力",
    attackSpeed: "攻击速度",
    armor: "护甲",
    magicResistance: "魔法抗性",
    attackRange: "攻击距离",
    startingMana: "初始法力",
    maximumMana: "最大法力",
  },
  ja: {
    health: "体力",
    attackDamage: "攻撃力",
    attackSpeed: "攻撃速度",
    armor: "物理防御",
    magicResistance: "魔法防御",
    attackRange: "攻撃射程",
    startingMana: "開始マナ",
    maximumMana: "最大マナ",
  },
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const mergeKnownShape = <T>(fallback: T, override: unknown): T => {
  if (typeof fallback === "string") {
    return (typeof override === "string" ? override : fallback) as T;
  }

  if (Array.isArray(fallback)) {
    return (Array.isArray(override) &&
      override.every((item) => typeof item === "string")
      ? override
      : fallback) as T;
  }

  if (isRecord(fallback)) {
    const source = isRecord(override) ? override : {};
    return Object.fromEntries(
      Object.entries(fallback).map(([key, value]) => [
        key,
        mergeKnownShape(value, source[key]),
      ]),
    ) as T;
  }

  return (typeof override === typeof fallback ? override : fallback) as T;
};

const mergeStringMap = (
  fallback: Readonly<Record<string, string>>,
  override: unknown,
): Readonly<Record<string, string>> => {
  if (!isRecord(override)) return fallback;

  const additions = Object.fromEntries(
    Object.entries(override).filter(
      ([key, value]) =>
        key !== "__proto__" &&
        key !== "constructor" &&
        key !== "prototype" &&
        typeof value === "string",
    ),
  ) as Record<string, string>;
  return { ...fallback, ...additions };
};

const localizeTraditionalChinese = <T>(value: T): T => {
  if (typeof value === "string") return toTraditionalChinese(value) as T;
  if (Array.isArray(value)) {
    return value.map((item) => localizeTraditionalChinese(item)) as T;
  }
  if (isRecord(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        localizeTraditionalChinese(item),
      ]),
    ) as T;
  }
  return value;
};

const getBundledContentLocale = (locale: GuideLocale): BundledGuideLocale => {
  if (locale === "zh_tw") return "zh";
  return isBundledGuideLocale(locale) ? locale : "en";
};

const getBundledLanguageLabel = (locale: GuideLocale): string =>
  GUIDE_LANGUAGE_OPTIONS.find((option) => option.id === locale)?.label ??
  locale;

export const createBundledTranslationCatalog = (
  locale: GuideLocale,
): TranslationCatalog => {
  const contentLocale = getBundledContentLocale(locale);
  const localize = locale === "zh_tw" ? localizeTraditionalChinese : <T>(value: T) => value;

  return {
    schemaVersion: TRANSLATION_CATALOG_SCHEMA_VERSION,
    locale,
    label: getBundledLanguageLabel(locale),
    version: BUNDLED_CATALOG_VERSION,
    updatedAt: BUNDLED_CATALOG_UPDATED_AT,
    app: localize(APP_LOCALES[contentLocale]),
    guide: localize(GUIDE_LOCALES[contentLocale]),
    data: { champions: {}, traits: {}, traitDescriptions: {} },
    roles: localize(ROLE_LABELS[contentLocale]),
    stats: localize(STAT_LABELS[contentLocale]),
  };
};

export const parseTranslationCatalog = (
  value: unknown,
  expectedLocale: GuideLocale,
): TranslationCatalog => {
  if (!isRecord(value)) {
    throw new Error("번역 카탈로그 응답이 객체가 아닙니다.");
  }
  if (value.schemaVersion !== TRANSLATION_CATALOG_SCHEMA_VERSION) {
    throw new Error(
      `지원하지 않는 번역 카탈로그 스키마입니다: ${String(value.schemaVersion)}`,
    );
  }
  if (value.locale !== expectedLocale) {
    throw new Error(
      `요청한 언어와 번역 카탈로그 언어가 다릅니다: ${String(value.locale)}`,
    );
  }
  if (typeof value.version !== "string" || value.version.trim() === "") {
    throw new Error("번역 카탈로그 버전이 없습니다.");
  }

  const fallback = createBundledTranslationCatalog(expectedLocale);
  const data = isRecord(value.data) ? value.data : {};

  return {
    schemaVersion: TRANSLATION_CATALOG_SCHEMA_VERSION,
    locale: expectedLocale,
    label:
      typeof value.label === "string" && value.label.trim() !== ""
        ? value.label
        : fallback.label,
    version: value.version,
    updatedAt:
      typeof value.updatedAt === "string" && value.updatedAt !== ""
        ? value.updatedAt
        : fallback.updatedAt,
    app: mergeKnownShape(fallback.app, value.app),
    guide: mergeKnownShape(fallback.guide, value.guide),
    data: {
      champions: mergeStringMap(
        fallback.data.champions,
        data.champions,
      ),
      traits: mergeStringMap(fallback.data.traits, data.traits),
      traitDescriptions: mergeStringMap(
        fallback.data.traitDescriptions,
        data.traitDescriptions,
      ),
    },
    roles: mergeKnownShape(fallback.roles, value.roles),
    stats: mergeKnownShape(fallback.stats, value.stats),
  };
};
