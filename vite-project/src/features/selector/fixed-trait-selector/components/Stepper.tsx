import { Minus, Plus } from "lucide-react";
import Text from "../../../ui/Text";

interface Props {
  value: number;
  onIncrease: () => void;
  onDecrease: () => void;
  min?: number;
}

export default function Stepper({ value, onIncrease, onDecrease, min = 0 }: Props) {
  return (
    <div className="flex items-center gap-2 shrink-0">
      <button
        onClick={onDecrease}
        disabled={value <= min}
        className="p-1.5 rounded-md text-white/50 hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent transition-all active:scale-95"
      >
        <Minus size={14} strokeWidth={3} />
      </button>
      
      <Text variant="badge" className="w-4 text-center font-black text-purple-400">
        {value > 0 ? value : ''}
      </Text>
      
      <button
        onClick={onIncrease}
        className="p-1.5 rounded-md text-white/50 hover:bg-white/10 hover:text-white transition-all active:scale-95"
      >
        <Plus size={14} strokeWidth={3} />
      </button>
    </div>
  );
}