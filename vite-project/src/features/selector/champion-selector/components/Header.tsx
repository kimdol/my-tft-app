import { Trash2 } from "lucide-react";
import { useTFTBuilderStore } from "../../../store/useTFTBuilderStore";
import Text from "../../../ui/Text";
import type { SelectorMode } from "../../../store/useSelectorModeStore";

interface Props {
  mode: SelectorMode;
}

export default function Header({ mode }: Props) {
  const count = useTFTBuilderStore((state) => 
    mode === 'candidate' ? state.selectedChampions.size : state.fixedChampions.size
  );
  const clear = useTFTBuilderStore((state) => 
    mode === 'candidate' ? state.clearSelected : state.clearFixed
  );

  const labelText = mode === 'candidate' ? "후보 카드 수" : "고정 카드 수";
  const countColor = mode === 'candidate' ? "text-purple-400" : "text-blue-400";

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
            {labelText}
          </Text>
          <Text variant="badge" className={`font-bold ${countColor}`}>
            {count}
          </Text>
        </div>

        {count > -1 && (
        <button
          onClick={clear}
          onMouseUp={(e) => e.currentTarget.blur()}
          className="
            flex items-center justify-center
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

            focus:outline-none
          "
        >
          <Trash2 size={14} className="opacity-90" />

          <span
            className="
              text-[10px]
              sm:text-xs
              font-black
              uppercase
              tracking-wide
            "
          >
            전체 삭제
          </span>
        </button>
        )}
      </div>
    </div>
  );
}
