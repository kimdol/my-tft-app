import ChampionCard from "./ChampionCard";
import { useChampionSelector } from "../hooks/useChampionSelector";
import type { SelectorMode } from "../../../store/useSelectorModeStore";

interface Props {
  query: string;
  mode: SelectorMode;
}

export default function ChampionGrid({ query, mode }: Props) {
  const { filtered, selected, oppositeSelected, toggle, loading, error } =
    useChampionSelector(query, mode);

  if (loading) {
    return (
      <div className="py-20 text-center opacity-50">
        유닛 데이터를 불러오는 중...
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div
      className="
        grid
        grid-cols-[repeat(auto-fill,minmax(92px,110px))]
        justify-center
        gap-3
        pb-20
      "
    >
      {filtered.map((champion) => (
        <ChampionCard
          key={champion.id}
          champion={champion}
          isSelected={selected.has(champion.id)}
          isOppositeSelected={oppositeSelected.has(champion.id)}
          onToggle={toggle}
          mode={mode}
        />
      ))}
    </div>
  );
}
