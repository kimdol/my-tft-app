import { useMemo } from "react";
import { useTFTBuilderStore } from "../../../store/useTFTBuilderStore";
import { getChosung } from "../../../utils/hangul";
import type { TFTTrait } from "../../../api/tftApi";

export const useTraitSelector = (
  query: string,
  localizeTraitName: (trait: TFTTrait) => string,
) => {
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
      const names = [t.name, localizeTraitName(t)];

      return names.some((name) => {
        const normalizedName = name.toLowerCase();
        return (
          normalizedName.includes(lowerQuery) ||
          getChosung(normalizedName).includes(lowerQuery)
        );
      });
    });
  }, [localizeTraitName, query, traits]);

  return {
    traits,
    filtered,
    selectedTraits,
    totalSelectedCount,
  };
};
