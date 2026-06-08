import type { Champion } from "../selector/champion-selector/types";
import type { Trait } from "../api/tftApi";
import { Node } from "./Node";

export const createTraitContext = (
  fixedChampions: Champion[], 
  champions: Champion[], 
  traits: Trait[]
) => {
  const champMap = new Map(
    [...fixedChampions, ...champions].map((c) => [c.id, c])
  );
  const traitMap = new Map(traits.map((t) => [t.name, t]));

  return { champMap, traitMap };
};

export const getTraitCountMap = (
  node: Node,
  champMap: Map<string, Champion>,
): Map<string, number> => {
  const traitCount = new Map<string, number>();

  for (const id of node.path) {
    const champ = champMap.get(id);
    if (!champ) continue;

    for (const trait of champ.traits) {
      traitCount.set(trait.name, (traitCount.get(trait.name) || 0) + 1);
    }
  }

  return traitCount;
};


/**
 * traitMap의 trait.breakpoints는 반드시 오름차순 정렬 상태여야 함
 */
export const calcTraitScore = (
  fixedTraits: Map<string, number>, 
  node: Node,
  champMap: Map<string, Champion>,
  traitMap: Map<string, Trait>,
): number => {
  const traitCount = getTraitCountMap(node, champMap);
  const combinedCounts = new Map<string, number>(fixedTraits);

  for (const [traitName, count] of traitCount) {
    combinedCounts.set(traitName, (combinedCounts.get(traitName) || 0) + count);
  }

  let score = 0;

  for (const [traitName, count] of combinedCounts) {
    const trait = traitMap.get(traitName);
    if (!trait) continue;

    let best = 0;

    for (const effect of trait.effects) {
      if (count >= effect.breakpoint) {
        best = effect.breakpoint;
      } else {
        break;
      }
    }

    score += best;
  }

  return score;
};




