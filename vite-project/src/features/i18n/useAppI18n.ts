import { createContext, useContext } from "react";
import type { TFTTrait, TFTTraitEffect } from "../api/tftApi";
import type { Champion } from "../domain/champion";
import type { ChampionCombatStats } from "../domain/championCombatStats";
import type { UnifiedChampionRole } from "../domain/championRole";
import type { AppLocaleCopy } from "./appLocales";
import { createBundledTranslationCatalog } from "./translationCatalog";
import {
  GUIDE_LANGUAGE_OPTIONS,
  type GuideCopy,
  type GuideLanguageOption,
  type GuideLocale,
} from "../workspace/guide/guideLocales";

type ChampionNameTarget = Pick<Champion, "id" | "baseId" | "apiId" | "name"> & {
  readonly traits?: readonly Champion["traits"][number][];
};
type TraitNameTarget = Pick<TFTTrait, "name"> & { readonly apiName?: string };

interface TraitEffectDescriptionTarget {
  readonly apiName: string;
  readonly descriptionTemplate: string | null;
  readonly activeEffect: TFTTraitEffect;
  readonly tierIndex: number;
  readonly currentEffectDescription: string | null;
}

export interface AppI18nValue {
  readonly locale: GuideLocale;
  readonly setLocale: (locale: GuideLocale) => void;
  readonly languageOptions: readonly GuideLanguageOption[];
  readonly copy: AppLocaleCopy;
  readonly guide: GuideCopy;
  readonly championName: (champion: ChampionNameTarget) => string;
  readonly traitName: (trait: TraitNameTarget) => string;
  readonly traitEffectDescription: (
    trait: TraitEffectDescriptionTarget,
  ) => string | null;
  readonly formatCost: (cost: number, compact?: boolean) => string;
  readonly formatStar: (star: number) => string;
  readonly formatCount: (count: number) => string;
  readonly roleLabel: (role: UnifiedChampionRole | null) => string;
  readonly statLabel: (stat: keyof ChampionCombatStats) => string;
}

const KOREAN_FALLBACK_CATALOG = createBundledTranslationCatalog("ko");

export const formatCostForLocale = (
  locale: GuideLocale,
  copy: AppLocaleCopy,
  cost: number,
  compact: boolean,
) => {
  if (locale === "en") {
    return compact
      ? `${cost}${copy.common.compactCost}`
      : `${cost}-${copy.common.cost}`;
  }
  return `${cost}${compact ? copy.common.compactCost : copy.common.cost}`;
};

const FALLBACK_APP_I18N: AppI18nValue = {
  locale: "ko",
  setLocale: () => {},
  languageOptions: GUIDE_LANGUAGE_OPTIONS,
  copy: KOREAN_FALLBACK_CATALOG.app,
  guide: KOREAN_FALLBACK_CATALOG.guide,
  championName: (champion) => champion.name,
  traitName: (trait) => trait.name,
  traitEffectDescription: (trait) => trait.currentEffectDescription,
  formatCost: (cost, compact = false) =>
    formatCostForLocale("ko", KOREAN_FALLBACK_CATALOG.app, cost, compact),
  formatStar: (star) =>
    `${star}${KOREAN_FALLBACK_CATALOG.app.common.star}`,
  formatCount: (count) =>
    `${count}${KOREAN_FALLBACK_CATALOG.app.common.people}`,
  roleLabel: (role) =>
    role === null
      ? KOREAN_FALLBACK_CATALOG.app.detail.none
      : KOREAN_FALLBACK_CATALOG.roles[role],
  statLabel: (stat) => KOREAN_FALLBACK_CATALOG.stats[stat],
};

export const AppI18nContext = createContext<AppI18nValue | null>(null);

export const useAppI18n = (): AppI18nValue => {
  const value = useContext(AppI18nContext);
  return value ?? FALLBACK_APP_I18N;
};
