import { useMemo } from "react";
import { useTFTBuilderStore } from "../../../store/useTFTBuilderStore";
import SelectedChip from "./SelectedChip";
import type { ChampionSelectorStrategy } from "../selectorStrategies";
import { useAppI18n } from "../../../i18n/useAppI18n";

interface Props {
  strategy: ChampionSelectorStrategy;
}

export default function SelectedList({ strategy }: Props) {
  const { championName, copy } = useAppI18n();
  const selectorCopy = copy.selector[strategy.id];
  const champions = useTFTBuilderStore((state) => state.champions);
  const selected = useTFTBuilderStore(strategy.selectSelected);
  const toggle = useTFTBuilderStore(strategy.selectToggle);
  const championById = useMemo(
    () => new Map(champions.map((champion) => [champion.id, champion])),
    [champions],
  );

  if (selected.size === 0) return null;

  return (
    <div
      aria-label={`${selectorCopy.currentSelectionLabel} ${copy.common.selected}`}
      className="flex flex-wrap gap-2 rounded-lg border border-white/10 p-3"
    >
      {[...selected].map((id) => {
        const champ = championById.get(id);
        if (!champ) return null;

        return (
          <SelectedChip
            key={id}
            name={championName(champ)}
            cost={champ.cost}
            onRemove={() => toggle(id)}
          />
        );
      })}
    </div>
  );
}
