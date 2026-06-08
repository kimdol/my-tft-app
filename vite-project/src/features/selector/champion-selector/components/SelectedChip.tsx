import { X } from "lucide-react";
import type { Cost } from "../types";
import { COST_COLORS } from "../constants";
import Text from "../../../ui/Text";

interface Props {
  name: string;
  cost: Cost;
  onRemove: () => void;
}

export default function SelectedChip({ name, cost, onRemove }: Props) {
  return (
    <div
      onClick={onRemove}
      className={`
        flex items-center gap-2 px-3 py-1.5 rounded-lg border cursor-pointer
        transition-all active:scale-95 hover:brightness-110
        ${COST_COLORS[cost]}
      `}
    >
      <Text variant="badge" className="font-bold text-white">
        {name}
      </Text>
      <X size={14} className="text-white/70" />
    </div>
  );
}
