import type { Champion } from "../domain/champion";
import type { TFTTrait, TFTTraitEffect } from "../api/tftApi";
import { BEAM_SEARCH_WEIGHTS } from "../config/beamSearchConfig";
import { Node } from "./Node";
import { formatActiveTraitDescription } from "./traitDescriptionFormatter";

export interface ScoreWeights {
  readonly traitWeight: number;
  readonly opBonus: number;
  readonly costWeight: number;
  readonly fighterBonus: number;
  readonly tankBonus: number;
  readonly rangedBonus: number;
  readonly assassinBonus: number;
}

export interface BeamScoreBreakdown {
  readonly synergyScore: number;
  readonly staticPowerScore: number;
  readonly opBonusScore: number;
  readonly costScore: number;
  readonly roleBonusScore: number;
  readonly totalScore: number;
}

export interface TraitBreakpointDetail {
  readonly breakpoint: number;
  readonly style: number;
  readonly isActive: boolean;
}

export interface TraitChampionDetail {
  readonly id: string;
  readonly baseId: string;
  readonly apiId: string;
  readonly name: string;
  readonly traits: Champion["traits"];
}

export interface ActiveTraitDetail {
  readonly apiName: string;
  readonly name: string;
  readonly iconUrl: string;
  readonly totalCount: number;
  readonly championCount: number;
  readonly additionalCount: number;
  readonly tierIndex: number;
  readonly activeBreakpoint: number;
  readonly activeStyle: number;
  readonly nextBreakpoint: number | null;
  readonly remainingToNextBreakpoint: number | null;
  readonly breakpoints: readonly TraitBreakpointDetail[];
  readonly descriptionTemplate: string | null;
  readonly activeEffect: TFTTraitEffect;
  readonly currentEffectDescription: string | null;
  readonly champions: readonly TraitChampionDetail[];
}

export const DEFAULT_SCORE_WEIGHTS: Readonly<ScoreWeights> =
  BEAM_SEARCH_WEIGHTS;

export const createTraitContext = (
  fixedChampions: Champion[],
  champions: Champion[],
  traits: TFTTrait[],
) => {
  const champMap = new Map(
    [...fixedChampions, ...champions].map((champion) => [
      champion.id,
      champion,
    ]),
  );
  const traitMap = new Map(traits.map((trait) => [trait.name, trait]));

  return { champMap, traitMap };
};

export const getTraitCountMap = (
  node: Node,
  champMap: ReadonlyMap<string, Champion>,
): Map<string, number> => {
  const traitCount = new Map<string, number>();

  for (const id of node) {
    const champion = champMap.get(id);
    if (!champion) continue;

    for (const trait of champion.traits) {
      traitCount.set(trait.name, (traitCount.get(trait.name) ?? 0) + 1);
    }
  }

  return traitCount;
};

export const createActiveTraitDetails = (
  additionalTraits: ReadonlyMap<string, number>,
  node: Node,
  champMap: ReadonlyMap<string, Champion>,
  traitMap: ReadonlyMap<string, TFTTrait>,
): ActiveTraitDetail[] => {
  const championCounts = getTraitCountMap(
    node,
    champMap,
  );
  const combinedCounts = new Map(championCounts);
  const championsByTrait = new Map<string, TraitChampionDetail[]>();

  for (const id of node) {
    const champion = champMap.get(id);
    if (!champion) continue;

    for (const { name } of champion.traits) {
      const contributors = championsByTrait.get(name) ?? [];
      contributors.push({
        id: champion.id,
        baseId: champion.baseId,
        apiId: champion.apiId,
        name: champion.name,
        traits: champion.traits,
      });
      championsByTrait.set(name, contributors);
    }
  }

  for (const [name, count] of additionalTraits) {
    combinedCounts.set(name, (combinedCounts.get(name) ?? 0) + count);
  }

  const details: ActiveTraitDetail[] = [];

  for (const [name, totalCount] of combinedCounts) {
    const trait = traitMap.get(name);
    if (!trait) continue;

    let tierIndex = -1;
    for (let index = 0; index < trait.effects.length; index += 1) {
      if (totalCount < trait.effects[index].breakpoint) break;
      tierIndex = index;
    }
    if (tierIndex < 0) continue;

    const activeEffect = trait.effects[tierIndex];
    const nextEffect = trait.effects[tierIndex + 1];
    details.push({
      apiName: trait.apiName,
      name,
      iconUrl: trait.iconUrl,
      totalCount,
      championCount: championCounts.get(name) ?? 0,
      additionalCount: additionalTraits.get(name) ?? 0,
      tierIndex,
      activeBreakpoint: activeEffect.breakpoint,
      activeStyle: activeEffect.style,
      nextBreakpoint: nextEffect?.breakpoint ?? null,
      remainingToNextBreakpoint: nextEffect
        ? Math.max(0, nextEffect.breakpoint - totalCount)
        : null,
      breakpoints: trait.effects.map((effect) => ({
        breakpoint: effect.breakpoint,
        style: effect.style,
        isActive: totalCount >= effect.breakpoint,
      })),
      currentEffectDescription: formatActiveTraitDescription(
        trait.descriptionTemplate,
        activeEffect,
        tierIndex,
      ),
      descriptionTemplate: trait.descriptionTemplate,
      activeEffect,
      champions: (championsByTrait.get(name) ?? []).sort((left, right) =>
        left.name.localeCompare(right.name, "ko"),
      ),
    });
  }

  return details.sort(
    (left, right) =>
      right.totalCount - left.totalCount ||
      right.tierIndex - left.tierIndex ||
      left.name.localeCompare(right.name, "ko"),
  );
};

export const calcTraitScoreBreakdown = (
  fixedTraits: Map<string, number>,
  node: Node,
  champMap: Map<string, Champion>,
  traitMap: Map<string, TFTTrait>,
  weights: ScoreWeights = DEFAULT_SCORE_WEIGHTS,
): BeamScoreBreakdown => {
  const combinedCounts = new Map<string, number>(fixedTraits);

  for (const [traitName, count] of getTraitCountMap(node, champMap)) {
    combinedCounts.set(
      traitName,
      (combinedCounts.get(traitName) ?? 0) + count,
    );
  }

  let activatedBreakpointScore = 0;
  for (const [traitName, count] of combinedCounts) {
    const trait = traitMap.get(traitName);
    if (!trait) continue;

    let highestBreakpoint = 0;
    for (const effect of trait.effects) {
      if (count < effect.breakpoint) break;
      highestBreakpoint = effect.breakpoint;
    }
    activatedBreakpointScore += highestBreakpoint;
  }

  let totalCost = 0;
  let roleBonusScore = 0;
  const opBaseIds = new Set<string>();
  for (const id of node) {
    const champion = champMap.get(id);
    if (!champion) continue;

    totalCost += champion.cost;
    const roleShapes = new Set(
      champion.roles.map((role) => role.slice(role.lastIndexOf("-") + 1)),
    );
    if (roleShapes.has("fighter")) roleBonusScore += weights.fighterBonus;
    if (roleShapes.has("tank")) roleBonusScore += weights.tankBonus;
    if (roleShapes.has("ranged")) roleBonusScore += weights.rangedBonus;
    if (roleShapes.has("assassin")) roleBonusScore += weights.assassinBonus;

    if (champion.staticPower?.isOp === true) {
      opBaseIds.add(champion.baseId);
    }
  }

  const synergyScore =
    weights.traitWeight * activatedBreakpointScore;
  const staticPowerScore = 0;
  const opBonusScore = weights.opBonus * opBaseIds.size;
  const costScore = weights.costWeight * totalCost;
  const totalScore =
    synergyScore + staticPowerScore + opBonusScore + costScore + roleBonusScore;

  return {
    synergyScore,
    staticPowerScore,
    opBonusScore,
    costScore,
    roleBonusScore,
    totalScore,
  };
};

export const calcTraitScore = (
  fixedTraits: Map<string, number>,
  node: Node,
  champMap: Map<string, Champion>,
  traitMap: Map<string, TFTTrait>,
  weights: ScoreWeights = DEFAULT_SCORE_WEIGHTS,
): number =>
  calcTraitScoreBreakdown(
    fixedTraits,
    node,
    champMap,
    traitMap,
    weights,
  ).totalScore;
