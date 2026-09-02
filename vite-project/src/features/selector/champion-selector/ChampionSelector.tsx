import Header from "./components/Header";
import SearchBar from "./components/SearchBar";
import SelectedList from "./components/SelectedList";
import ChampionGrid from "./components/ChampionGrid";
import CostToggleBar from "./components/CostToggleBar";
import RoleToggleBar from "./components/RoleToggleBar";
import type { ChampionSelectorStrategy } from "./selectorStrategies";
import { useSelectorModeStore } from "../../store/useSelectorModeStore";

interface Props {
  strategy: ChampionSelectorStrategy;
}

export default function ChampionSelector({ strategy }: Props) {
  const query = useSelectorModeStore(
    (state) => state.selectorQueries[strategy.id],
  );
  const setSelectorQuery = useSelectorModeStore(
    (state) => state.setSelectorQuery,
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white p-2 sm:p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <Header strategy={strategy} />

        <SelectedList strategy={strategy} />

        <div className="space-y-3">
          <SearchBar
            query={query}
            setQuery={(value) => setSelectorQuery(strategy.id, value)}
            strategy={strategy}
          />
          {strategy.showCostToggle && (
            <>
              <CostToggleBar />
              <RoleToggleBar />
            </>
          )}
        </div>

        <ChampionGrid query={query} strategy={strategy} />
      </div>
    </div>
  );
}
