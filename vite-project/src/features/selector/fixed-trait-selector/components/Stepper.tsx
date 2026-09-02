import { Minus, Plus } from "lucide-react";
import Text from "../../../ui/Text";
import { useAppI18n } from "../../../i18n/useAppI18n";

interface Props {
  value: number;
  onIncrease: () => void;
  onDecrease: () => void;
  label: string;
  min?: number;
}

export default function Stepper({
  value,
  onIncrease,
  onDecrease,
  label,
  min = 0,
}: Props) {
  const { copy } = useAppI18n();
  return (
    <div className="flex items-center gap-2 shrink-0">
      <button
        type="button"
        data-tft-trait-stepper
        aria-label={`${label} ${copy.traits.decrease}`}
        onClick={onDecrease}
        disabled={value <= min}
        className="inline-flex h-10 w-10 items-center justify-center rounded-md text-white/50 hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent transition-all active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
      >
        <Minus aria-hidden="true" size={14} strokeWidth={3} />
      </button>
      
      <Text
        aria-live="polite"
        variant="badge"
        className="w-4 text-center font-black text-purple-400"
      >
        {value > 0 ? value : ''}
      </Text>
      
      <button
        type="button"
        data-tft-trait-stepper
        aria-label={`${label} ${copy.traits.increase}`}
        onClick={onIncrease}
        className="inline-flex h-10 w-10 items-center justify-center rounded-md text-white/50 hover:bg-white/10 hover:text-white transition-all active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
      >
        <Plus aria-hidden="true" size={14} strokeWidth={3} />
      </button>
    </div>
  );
}
