import { useMemo } from "react";
import {
  getSelectableChampionsByCost,
  useTFTBuilderStore,
} from "../../../store/useTFTBuilderStore";
import { COST_VARIANTS } from "../../../styles/costVariants";
import type { Cost } from "../types";
import { useAppI18n } from "../../../i18n/useAppI18n";

const COSTS: readonly Cost[] = [1, 2, 3, 4, 5];

export default function CostToggleBar() {
  const { copy, formatCost } = useAppI18n();
  const toggleByCost = useTFTBuilderStore((state) => state.toggleByCost);
  const champions = useTFTBuilderStore((state) => state.champions);
  const selected = useTFTBuilderStore((state) => state.selectedChampions);
  const fixed = useTFTBuilderStore((state) => state.fixedChampions);

  const selectableChampionsByCost = useMemo(
    () =>
      new Map(
        COSTS.map((cost) => [
          cost,
          getSelectableChampionsByCost(champions, fixed, cost),
        ]),
      ),
    [champions, fixed],
  );

  return (
    <div className="flex w-full gap-1.5 sm:gap-2">
      {COSTS.map((cost) => {
        const targets = selectableChampionsByCost.get(cost) ?? [];
        const isFullySelected =
          targets.length > 0 && targets.every((champion) => selected.has(champion.id));
        const variant = COST_VARIANTS[cost];

        return (
          <button
            type="button"
            key={`cost-toggle-${cost}`}
            data-tft-cost-toggle={cost}
            onClick={() => toggleByCost(cost)}
            aria-pressed={isFullySelected}
            aria-label={`${formatCost(cost)} ${copy.selector.costAll} ${isFullySelected ? copy.selector.unselect : copy.selector.select}`}
            className={`
              flex min-h-11 flex-1 items-center justify-center rounded-lg px-1 py-2
              border backdrop-blur-sm transition-all duration-200
              active:scale-95
              focus-visible:outline focus-visible:outline-2
              focus-visible:outline-offset-2 focus-visible:outline-white
              ${isFullySelected ? variant.toggleActive : variant.toggle}
            `}
          >
            <span className="font-bold text-sm sm:text-base tracking-tight drop-shadow-md">
              {formatCost(cost, true)}
            </span>
          </button>
        );
      })}
    </div>
  );
}
