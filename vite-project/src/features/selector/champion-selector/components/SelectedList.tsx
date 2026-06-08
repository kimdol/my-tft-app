import SelectedChip from './SelectedChip';
import { useChampionSelector } from '../hooks/useChampionSelector';
import type { SelectorMode } from "../../../store/useSelectorModeStore";

interface Props {
  mode: SelectorMode;
}

export default function SelectedList({ mode }: Props) {
  const { selected, champions, toggle } = useChampionSelector('', mode);

  return (
    <div className="flex flex-wrap gap-2 p-3 border border-white/10 rounded-lg">
      {[...selected].map((id) => {
        const champ = champions.find((c) => c.id === id);
        if (!champ) return null;

        return (
          <SelectedChip
            key={id}
            name={champ.name}
            cost={champ.cost}
            onRemove={() => toggle(id)}
          />
        );
      })}
    </div>
  );
}
