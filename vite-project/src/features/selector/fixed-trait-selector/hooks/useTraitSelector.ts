import { useMemo } from "react";
import { useTFTBuilderStore } from "../../../store/useTFTBuilderStore";
import { getChosung } from "../../../utils/hangul";

export const useTraitSelector = (query: string) => {
  const traits = useTFTBuilderStore((state) => state.traits);
  const selectedTraits = useTFTBuilderStore((state) => state.selectedTraits);

  const totalSelectedCount = useMemo(() => {
    let total = 0;
    selectedTraits.forEach((count) => {
      total += count;
    });
    return total;
  }, [selectedTraits]);


  const filtered = useMemo(() => {
    if (!query) return traits;

    const lowerQuery = query.toLowerCase();

    return traits.filter((t) => {
      const name = t.name.toLowerCase();
      const chosung = getChosung(name);

      return name.includes(lowerQuery) || chosung.includes(lowerQuery);
    });
  }, [query, traits]);

  return {
    traits,
    filtered,
    totalSelectedCount,
  };
};