import type { Champion } from "../selector/champion-selector/types";
import { getChosung } from "./hangul";

interface ChampionSearchLocalizer {
  readonly championName?: (champion: Champion) => string;
  readonly traitName?: (trait: Champion["traits"][number]) => string;
}

const isMatchString = (target: string, query: string): boolean => {
  const lowerTarget = target.toLowerCase();
  
  if (lowerTarget.includes(query)) return true;
  
  const chosungTarget = getChosung(lowerTarget);
  if (chosungTarget.includes(query)) return true;

  return false;
};


export const filterChampionsByQuery = (
  champions: Champion[],
  query: string,
  localizer: ChampionSearchLocalizer = {},
): Champion[] => {
  if (!query || !query.trim()) return champions;

  const lowerQuery = query.toLowerCase().trim();

  return champions.filter((champion) => {
    const championNames = [
      champion.name,
      localizer.championName?.(champion),
    ].filter((name): name is string => Boolean(name));
    if (championNames.some((name) => isMatchString(name, lowerQuery))) {
      return true;
    }

    const hasMatchingTrait = champion.traits.some((trait) => {
      const traitNames = [trait.name, localizer.traitName?.(trait)].filter(
        (name): name is string => Boolean(name),
      );
      return traitNames.some((name) => isMatchString(name, lowerQuery));
    });

    return hasMatchingTrait;
  });
};
