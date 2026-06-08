import type { Champion } from "../../selector/champion-selector/types";

export const sortChampionsByCost = (champions: Champion[]): Champion[] => {
  return [...champions].sort((a, b) => {
    if (a.cost !== b.cost) {
      return a.cost - b.cost;
    }
    return a.name.localeCompare(b.name, "ko");
  });
};