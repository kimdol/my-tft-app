import { layout } from "../../../styles/layout";
import { getTraitStyle } from "../../../core/traitTierUtils";

export default function TraitChip({ trait }: any) {
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
