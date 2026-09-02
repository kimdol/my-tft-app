import { Trash2 } from "lucide-react";
import { useTFTBuilderStore } from "../../../store/useTFTBuilderStore";
import Text from "../../../ui/Text";
import { useAppI18n } from "../../../i18n/useAppI18n";
import type { ChampionSelectorStrategy } from "../selectorStrategies";

interface Props {
  strategy: ChampionSelectorStrategy;
}

export default function Header({ strategy }: Props) {
  const { copy } = useAppI18n();
  const selectorCopy = copy.selector[strategy.id];
  const count = useTFTBuilderStore(
    (state) => strategy.selectSelected(state).size,
  );
  const clear = useTFTBuilderStore(strategy.selectClear);

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-end mb-4">
      <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3 w-full sm:w-auto">
        <div
          className="
            flex items-center gap-2
            px-3 py-1.5
            rounded-full
            bg-white/[0.06]
            border border-white/10
            backdrop-blur-sm
            shrink-0
          "
        >
          <Text variant="label" className="opacity-50">
            {selectorCopy.countLabel}
          </Text>
          <Text
            variant="badge"
            className={`font-bold ${strategy.countColor}`}
          >
            {count}
          </Text>
        </div>

        {count > 0 && (
        <button
          type="button"
          data-tft-clear-selection
          aria-label={selectorCopy.clearAllAria}
          onClick={clear}
          className="
            flex min-h-10 items-center justify-center
            gap-1.5

            px-3.5 py-1.5
            rounded-full                 

            bg-red-500/10
            border border-red-500/20

            text-red-400

            backdrop-blur-sm

            transition-all duration-150

            hover:bg-red-500/20           
            hover:border-red-400/40
            hover:text-red-300
            hover:shadow-[0_0_12px_rgba(239,68,68,0.2)]

            active:scale-[0.95]
            active:bg-red-500/35
            active:text-red-200

            focus-visible:outline focus-visible:outline-2
            focus-visible:outline-offset-2 focus-visible:outline-white
          "
        >
          <Trash2 aria-hidden="true" size={14} className="opacity-90" />

          <span
            className="
              text-[10px]
              sm:text-xs
              font-black
              uppercase
              tracking-wide
            "
          >
            {selectorCopy.clearAll}
          </span>
        </button>
        )}
      </div>
    </div>
  );
}
