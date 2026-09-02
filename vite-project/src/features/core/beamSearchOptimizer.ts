import type { Champion } from "../domain/champion";
import type { TFTTrait } from '../api/tftApi';
import { Node } from './Node';
import {
  calcTraitScoreBreakdown,
  createActiveTraitDetails,
  createTraitContext,
  type ActiveTraitDetail,
  type BeamScoreBreakdown,
  type ScoreWeights,
} from './traitEvaluator';
import { seededShuffle } from './candidateOrder';

export interface BeamSearchResult {
  node: Node;
  score: number;
  scoreBreakdown: BeamScoreBreakdown;
  activeTraits: readonly ActiveTraitDetail[];
}

interface BeamCandidate {
  node: Node;
  score: number;
  scoreBreakdown: BeamScoreBreakdown;
  tieBreakOrder: number;
}

export interface BeamSearchOptions {
  beamWidth?: number;
  resultLimit?: number;
  shuffleCandidates?: boolean;
  seed?: number;
  scoreWeights?: ScoreWeights;
}

export const findBestCombinationBeam = (
  fixedChampions: Champion[],
  fixedTraits: Map<string, number>,
  selectedChampions: Champion[],
  traits: TFTTrait[],
  targetDepth: number,
  options: BeamSearchOptions = {},
): BeamSearchResult[] => {
  const {
    beamWidth = 28,
    resultLimit = 5,
    shuffleCandidates = false,
    seed = 0,
    scoreWeights,
  } = options;
  const { champMap, traitMap } = createTraitContext(fixedChampions, selectedChampions, traits);
  const visited = new Set<string>();
  const orderedCandidates = shuffleCandidates
    ? seededShuffle(selectedChampions, seed)
    : [...selectedChampions];

  const initialIds = fixedChampions.map(c => c.id).slice(0, targetDepth);
  const initialNode = new Node(initialIds);
  
  visited.add(initialNode.key());

  const initialScore = calcTraitScoreBreakdown(
    fixedTraits,
    initialNode,
    champMap,
    traitMap,
    scoreWeights,
  );
  let currentLevel: BeamCandidate[] = [{
    node: initialNode,
    score: initialScore.totalScore,
    scoreBreakdown: initialScore,
    tieBreakOrder: 0,
  }];

  const remainingDepth = targetDepth - initialIds.length;
  const actualBeamWidth = Math.max(1, beamWidth, resultLimit);

  for (let depth = 0; depth < remainingDepth; depth++) {
    const nextCandidates: BeamCandidate[] = [];
    let nextTieBreakOrder = 0;

    for (const { node: currentNode } of currentLevel) {
      for (const champ of orderedCandidates) {
        if (currentNode.hasBaseId(champ.baseId, champMap)) continue;

        const nextNode = currentNode.push(champ.id);
        const key = nextNode.key();

        if (visited.has(key)) continue;
        visited.add(key);

        const scoreBreakdown = calcTraitScoreBreakdown(
          fixedTraits, 
          nextNode,
          champMap,
          traitMap,
          scoreWeights,
        );

        nextCandidates.push({
          node: nextNode,
          score: scoreBreakdown.totalScore,
          scoreBreakdown,
          tieBreakOrder: nextTieBreakOrder,
        });
        nextTieBreakOrder += 1;
      }
    }

    if (nextCandidates.length === 0) break;

    nextCandidates.sort(
      (left, right) =>
        right.score - left.score ||
        left.tieBreakOrder - right.tieBreakOrder,
    );
    currentLevel = nextCandidates.slice(0, actualBeamWidth);
  }

  return currentLevel
    .slice(0, Math.max(0, resultLimit))
    .map((candidate) => ({
      ...candidate,
      activeTraits: createActiveTraitDetails(
        fixedTraits,
        candidate.node,
        champMap,
        traitMap,
      ),
    }));
};
