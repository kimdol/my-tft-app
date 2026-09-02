import { useEffect, useMemo } from "react";
import { useTFTBuilderStore } from "../../../store/useTFTBuilderStore";
import { filterChampionsByQuery } from "../../../utils/searchUtils";
import { useAppI18n } from "../../../i18n/useAppI18n";
import type { ChampionSelectorStrategy } from "../selectorStrategies";

export const useChampionSelector = (
  query: string,
  strategy: ChampionSelectorStrategy,
) => {
  const { championName, traitName } = useAppI18n();
  const champions = useTFTBuilderStore((state) => state.champions);
  const loading = useTFTBuilderStore((state) => state.loading);
  const error = useTFTBuilderStore((state) => state.error);
  const fetchAll = useTFTBuilderStore((state) => state.fetchAll);
  const selected = useTFTBuilderStore(strategy.selectSelected);
  const oppositeSelected = useTFTBuilderStore(
    strategy.selectOppositeSelected,
  );
  const toggle = useTFTBuilderStore(strategy.selectToggle);
  const clear = useTFTBuilderStore(strategy.selectClear);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const filtered = useMemo(() => {
    return filterChampionsByQuery(champions, query, {
      championName,
      traitName,
    });
  }, [championName, champions, query, traitName]);

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
