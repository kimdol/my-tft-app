import type { Champion } from '../selector/champion-selector/types';
import type { Trait } from '../api/tftApi';
import { Node } from './Node';
import { calcTraitScore, createTraitContext } from './traitEvaluator';

interface Result {
  node: Node;
  score: number;
}

export const findBestCombinationBeam = (
  fixedChampions: Champion[],
  fixedTraits: Map<string, number>, 
  selectedChampions: Champion[],
  traits: Trait[],
  targetDepth: number,
  beamWidth: number = 10,
  returnCount: number = 5
): Result[] => {
  const { champMap, traitMap } = createTraitContext(fixedChampions, selectedChampions, traits);
  const visited = new Set<string>();

  const initialIds = fixedChampions.map(c => c.id).slice(0, targetDepth);
  const initialNode = new Node(initialIds);
  
  visited.add(initialNode.key());

  let currentLevel: Result[] = [{
    node: initialNode,
    score: calcTraitScore(fixedTraits, initialNode, champMap, traitMap)
  }];

  const remainingDepth = targetDepth - initialIds.length;
  const actualBeamWidth = Math.max(beamWidth, returnCount);

  for (let depth = 0; depth < remainingDepth; depth++) {
    const nextCandidates: Result[] = [];

    for (const { node: currentNode } of currentLevel) {
      for (const champ of selectedChampions) {
        if (currentNode.hasBaseId(champ.baseId, champMap)) continue;

        const nextNode = currentNode.push(champ.id);
        const key = nextNode.key();

        if (visited.has(key)) continue;
        visited.add(key);

        const score = calcTraitScore(
          fixedTraits, 
          nextNode,
          champMap,
          traitMap
        );

        nextCandidates.push({
          node: nextNode,
          score
        });
      }
    }

    if (nextCandidates.length === 0) break;

    nextCandidates.sort((a, b) => b.score - a.score);
    currentLevel = nextCandidates.slice(0, actualBeamWidth);
  }

  return currentLevel.slice(0, returnCount);
};