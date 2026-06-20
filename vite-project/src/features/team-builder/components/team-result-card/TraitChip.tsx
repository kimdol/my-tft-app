import { layout } from "../../../styles/layout";
import { getTraitStyle } from "../../../core/traitTierUtils";
import type { TFTTrait } from "../../../api/tftApi";

export interface ActiveTraitData {
  name: string;
  count: number;
  trait: TFTTrait;
  tier: number;
}

interface TraitChipProps {
  trait: ActiveTraitData;
}

export default function TraitChip({ trait }: TraitChipProps) {
  return (
    <div
      className={`${layout.traitChip} ${getTraitStyle(
        trait.trait,
        trait.count
      )}`}
    >
      <span>{trait.name}</span>
      <span className="bg-black/20 px-1 py-0.5 rounded text-[9px]">
        {trait.count}
      </span>
    </div>
  );
}
