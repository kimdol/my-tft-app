import type { TFTTrait } from "../api/tftApi";
import type { Champion } from "../domain/champion";
import type { RuntimeRecommendationSettings } from "../config/runtimeSettings";

interface RecommendationSignatureInput {
  readonly champions: readonly Champion[];
  readonly traits: readonly TFTTrait[];
  readonly selectedChampionIds: ReadonlySet<string>;
  readonly fixedChampionIds: ReadonlySet<string>;
  readonly selectedTraits: ReadonlyMap<string, number>;
  readonly teamSize: number;
  readonly shuffleCandidates: boolean;
  readonly runtimeSettings: RuntimeRecommendationSettings;
  readonly runtimeSettingsVersion: string;
}

const compareText = (left: string, right: string): number =>
  left === right ? 0 : left < right ? -1 : 1;

const serializeChampion = (champion: Champion) => ({
  id: champion.id,
  baseId: champion.baseId,
  cost: champion.cost,
  traits: champion.traits
    .map(({ name }) => name)
    .sort(compareText),
  roles: [...champion.roles].sort(compareText),
  primaryRole: champion.primaryRole,
  staticPower: {
    isOp: champion.staticPower?.isOp === true,
    opConfigVersion: champion.staticPower?.opConfigVersion ?? null,
    opStarLevels: champion.staticPower?.opStarLevels ?? [],
  },
});

export const createRecommendationInputSignature = ({
  champions,
  traits,
  selectedChampionIds,
  fixedChampionIds,
  selectedTraits,
  teamSize,
  shuffleCandidates,
  runtimeSettings,
  runtimeSettingsVersion,
}: RecommendationSignatureInput): string => {
  const includedIds = new Set([
    ...selectedChampionIds,
    ...fixedChampionIds,
  ]);
  const includedChampions = champions
    .filter(({ id }) => includedIds.has(id))
    .sort((left, right) => compareText(left.id, right.id))
    .map(serializeChampion);
  const traitRules = traits
    .map((trait) => ({
      name: trait.name,
      descriptionTemplate: trait.descriptionTemplate,
      effects: trait.effects.map(({ breakpoint, style, variables }) => ({
        breakpoint,
        style,
        variables: Object.fromEntries(
          Object.entries(variables ?? {}).sort(([left], [right]) =>
            compareText(left, right),
          ),
        ),
      })),
    }))
    .sort((left, right) => compareText(left.name, right.name));

  return JSON.stringify({
    version: 5,
    runtimeSettingsVersion,
    teamSize,
    shuffleCandidates,
    beamWidth: runtimeSettings.beamWidth,
    resultLimit: runtimeSettings.resultLimit,
    scoreWeights: {
      traitWeight: runtimeSettings.traitWeight,
      opBonus: runtimeSettings.opBonus,
      costWeight: runtimeSettings.costWeight,
      fighterBonus: runtimeSettings.fighterBonus,
      tankBonus: runtimeSettings.tankBonus,
      rangedBonus: runtimeSettings.rangedBonus,
      assassinBonus: runtimeSettings.assassinBonus,
    },
    selectedChampionIds: [...selectedChampionIds].sort(compareText),
    fixedChampionIds: [...fixedChampionIds].sort(compareText),
    selectedTraits: [...selectedTraits].sort(([left], [right]) =>
      compareText(left, right),
    ),
    champions: includedChampions,
    traitRules,
  });
};
