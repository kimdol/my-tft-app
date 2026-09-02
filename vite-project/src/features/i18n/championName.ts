import type { AppI18nValue } from "./useAppI18n";
import type { TranslationCatalog } from "./translationCatalog";

export const resolveLocalizedChampionName = (
  dataLocale: TranslationCatalog["data"],
  champion: Parameters<AppI18nValue["championName"]>[0],
): string => {
  const exactName = dataLocale.champions[champion.id];
  if (exactName) return exactName;
  const baseName =
    dataLocale.champions[champion.baseId] ??
    dataLocale.champions[champion.apiId] ??
    champion.name;
  const variantTrait = champion.id !== champion.baseId
    ? champion.traits?.[0]
    : undefined;
  if (!variantTrait) return baseName;
  const localizedTrait = variantTrait.apiName
    ? (dataLocale.traits[variantTrait.apiName] ?? variantTrait.name)
    : variantTrait.name;
  return `${baseName} (${localizedTrait})`;
};
