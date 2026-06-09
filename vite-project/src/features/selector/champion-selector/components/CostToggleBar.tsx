import { useTFTBuilderStore } from "../../../store/useTFTBuilderStore";
import type { Cost } from "../types";
import type { SelectorMode } from "../../../store/useSelectorModeStore";

interface Props {
  mode: SelectorMode;
}

const COST_STYLES = {
  1: {
    base: "text-zinc-300 border-zinc-500/40 bg-zinc-500/10 hover:bg-zinc-500/20",
    active: "bg-zinc-500/40 border-zinc-400 shadow-[0_0_10px_rgba(161,161,170,0.3)]",
  },
  2: {
    base: "text-emerald-400 border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20",
    active: "bg-emerald-500/40 border-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.3)]",
  },
  3: {
    base: "text-blue-400 border-blue-500/40 bg-blue-500/10 hover:bg-blue-500/20",
    active: "bg-blue-500/40 border-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.3)]",
  },
  4: {
    base: "text-purple-400 border-purple-500/40 bg-purple-500/10 hover:bg-purple-500/20",
    active: "bg-purple-500/40 border-purple-400 shadow-[0_0_10px_rgba(192,132,252,0.3)]",
  },
  5: {
    base: "text-yellow-400 border-yellow-500/40 bg-yellow-500/10 hover:bg-yellow-500/20",
    active: "bg-yellow-500/40 border-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.3)]",
  },
};

export default function CostToggleBar({ mode }: Props) {
  if (mode !== "candidate") return null;

  const toggleByCost = useTFTBuilderStore((state) => state.toggleByCost);
  const champions = useTFTBuilderStore((state) => state.champions);
  const selected = useTFTBuilderStore((state) => state.selectedChampions);
  const fixed = useTFTBuilderStore((state) => state.fixedChampions);

  const costs: Cost[] = [1, 2, 3, 4, 5];

  const checkIsFullySelected = (cost: Cost) => {
    const targets = champions.filter(
      (c) => c.cost === cost && !fixed.has(c.id)
    );
    if (targets.length === 0) return false;
    return targets.every((c) => selected.has(c.id));
  };

  return (
    <div className="flex w-full gap-1.5 sm:gap-2">
      {costs.map((cost) => {
        const isFullySelected = checkIsFullySelected(cost);
        const styles = COST_STYLES[cost];

        return (
          <button
            key={`cost-toggle-${cost}`}
            onClick={() => toggleByCost(cost)}
            className={`
              flex-1 flex items-center justify-center py-2 sm:py-2.5 rounded-lg
              border backdrop-blur-sm transition-all duration-200
              active:scale-95
              ${isFullySelected ? styles.active : styles.base}
            `}
          >
            <span className="font-bold text-sm sm:text-base tracking-tight drop-shadow-md">
              {cost}코<span className="hidden sm:inline">스트</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}