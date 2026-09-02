import { X } from "lucide-react";
import type { Cost } from "../types";
import { COST_VARIANTS } from "../../../styles/costVariants";
import Text from "../../../ui/Text";
import { useAppI18n } from "../../../i18n/useAppI18n";

interface Props {
  name: string;
  cost: Cost;
  onRemove: () => void;
}

export default function SelectedChip({ name, cost, onRemove }: Props) {
  const variant = COST_VARIANTS[cost];
  const { copy, formatCost } = useAppI18n();

  return (
    <button
      type="button"
      data-tft-selection-chip={cost}
      aria-label={`${name}, ${formatCost(cost)}, ${copy.selector.removeSelection}`}
      onClick={onRemove}
      className={`
        flex min-h-11 max-w-full items-center gap-2 rounded-lg border px-2.5 py-1.5
        transition-all active:scale-95 hover:brightness-110
        focus-visible:outline focus-visible:outline-2
        focus-visible:outline-offset-2 focus-visible:outline-white
        ${variant.chip}
      `}
    >
      <span
        aria-hidden="true"
        className={`shrink-0 rounded-md border px-1.5 py-1 text-[10px] font-black leading-none ${variant.placeholderAccent}`}
      >
        {formatCost(cost, true)}
      </span>
      <Text
        variant="badge"
        className="min-w-0 truncate font-bold text-white"
      >
        {name}
      </Text>
      <X
        aria-hidden="true"
        size={14}
        className="shrink-0 text-white/70"
      />
    </button>
  );
}
