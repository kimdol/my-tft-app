import type { Champion } from "../../domain/champion";
import type { ChampionCardViewModel } from "./championCardViewModel";
import { createChampionCardViewModel } from "./championCardViewModel";

export interface RecommendedUnitGroups {
  readonly fixedUnits: readonly ChampionCardViewModel[];
  readonly candidateUnits: readonly ChampionCardViewModel[];
}

const compareIds = (left: string, right: string): number =>
  left === right ? 0 : left < right ? -1 : 1;

const NAME_COLLATOR = new Intl.Collator("ko-KR", {
  numeric: true,
  sensitivity: "variant",
  usage: "sort",
});

export const sortRecommendedUnits = (
  units: readonly Champion[],
): Champion[] =>
  [...units].sort(
    (left, right) =>
      left.cost - right.cost ||
      NAME_COLLATOR.compare(left.name, right.name) ||
      compareIds(left.id, right.id),
  );

export const createRecommendedUnitGroups = (
  unitIds: readonly string[],
  champMap: ReadonlyMap<string, Champion>,
  fixedChampionIds: ReadonlySet<string>,
): RecommendedUnitGroups => {
  const fixedUnits: Champion[] = [];
  const candidateUnits: Champion[] = [];

  for (const id of unitIds) {
    const champion = champMap.get(id);
    if (!champion) continue;

    if (fixedChampionIds.has(champion.id)) {
      fixedUnits.push(champion);
    } else {
      candidateUnits.push(champion);
    }
  }

  const createViewModel = (champion: Champion, isFixed: boolean) => {
    const evaluation =
      champion.staticPower?.evaluations.find(
        (candidate) => candidate.isOp,
      ) ?? null;
    return createChampionCardViewModel(
      champion,
      isFixed,
      evaluation,
    );
  };

  return {
    fixedUnits: sortRecommendedUnits(fixedUnits).map((champion) =>
      createViewModel(champion, true),
    ),
    candidateUnits: sortRecommendedUnits(candidateUnits).map(
      (champion) => createViewModel(champion, false),
    ),
  };
};
