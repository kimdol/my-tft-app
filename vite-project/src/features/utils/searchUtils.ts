import type { Champion } from "../selector/champion-selector/types";
import { getChosung } from "./hangul";


const isMatchString = (target: string, query: string): boolean => {
  const lowerTarget = target.toLowerCase();
  
  if (lowerTarget.includes(query)) return true;
  
  const chosungTarget = getChosung(lowerTarget);
  if (chosungTarget.includes(query)) return true;

  return false;
};


export const filterChampionsByQuery = (champions: Champion[], query: string): Champion[] => {
  if (!query || !query.trim()) return champions;

  const lowerQuery = query.toLowerCase().trim();

  return champions.filter((champion) => {
    if (isMatchString(champion.name, lowerQuery)) return true;

    const hasMatchingTrait = champion.traits.some((trait) => 
      isMatchString(trait.name, lowerQuery)
    );

    return hasMatchingTrait;
  });
};