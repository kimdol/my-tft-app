import { useEffect, useMemo } from "react";
import { useTFTBuilderStore } from "../../../store/useTFTBuilderStore";
import { filterChampionsByQuery } from "../../../utils/searchUtils";
import type { SelectorMode } from "../../../store/useSelectorModeStore";

export const useChampionSelector = (query: string, mode: SelectorMode = 'candidate') => {
  const champions = useTFTBuilderStore((state) => state.champions);
  const loading = useTFTBuilderStore((state) => state.loading);
  const error = useTFTBuilderStore((state) => state.error);
  const fetchAll = useTFTBuilderStore((state) => state.fetchAll);

  const candidateSelected = useTFTBuilderStore((state) => state.selectedChampions);
  const fixedSelected = useTFTBuilderStore((state) => state.fixedChampions);  
  
  const toggle = useTFTBuilderStore((state) => 
    mode === 'candidate' ? state.toggle : state.toggleFixed
  );
  const clear = useTFTBuilderStore((state) => 
    mode === 'candidate' ? state.clearSelected : state.clearFixed
  );

  const selected = mode === 'candidate' ? candidateSelected : fixedSelected;
  const oppositeSelected = mode === 'candidate' ? fixedSelected : candidateSelected;
  

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

const filtered = useMemo(() => {
    return filterChampionsByQuery(champions, query);
  }, [query, champions]);

  return {
    champions,
    filtered,
    selected,
    oppositeSelected,
    toggle,
    clear,
    loading,
    error,
  };
};
