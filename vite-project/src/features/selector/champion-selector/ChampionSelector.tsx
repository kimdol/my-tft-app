import { useState } from "react";
import Header from "./components/Header";
import SearchBar from "./components/SearchBar";
import SelectedList from "./components/SelectedList";
import ChampionGrid from "./components/ChampionGrid";
import CostToggleBar from './components/CostToggleBar';

import type { SelectorMode } from "../../store/useSelectorModeStore";

interface Props {
  mode: SelectorMode;
}

export default function ChampionSelector({ mode }: Props) {
  const [query, setQuery] = useState("");

  return (
    <div className="min-h-screen bg-[#050505] text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">

        <Header mode={mode} />

        <SelectedList mode={mode} />

        <div className="space-y-3">
          <SearchBar query={query} setQuery={setQuery} mode={mode} />
          <CostToggleBar mode={mode} />
        </div>

        <ChampionGrid query={query} mode={mode} />

      </div>
    </div>
  );
}
