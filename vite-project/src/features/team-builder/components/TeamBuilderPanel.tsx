import Panel from "../../ui/Panel";
import Text from "../../ui/Text";
import { NumberInput } from "../../ui/NumberInput";
import Button from "../../ui/Button";
import { componentTokens } from "../../styles/tokens";
import { useAppI18n } from "../../i18n/useAppI18n";
import { RotateCcw } from "lucide-react";
import { useTFTBuilderStore } from "../../store/useTFTBuilderStore";

interface Props {
  teamSize: number;
  setTeamSize: (n: number) => void;
  run: () => void;
  loading: boolean;
  shuffleCandidates: boolean;
  setShuffleCandidates: (enabled: boolean) => void;
  maxTeamSize: number;
}

export default function TeamBuilderPanel({
  teamSize,
  setTeamSize,
  run,
  loading,
  shuffleCandidates,
  setShuffleCandidates,
  maxTeamSize,
}: Props) {
  const { copy } = useAppI18n();
  const selectedCount = useTFTBuilderStore(
    (state) => state.selectedChampions.size,
  );
  const fixedCount = useTFTBuilderStore(
    (state) => state.fixedChampions.size,
  );
  const traitCount = useTFTBuilderStore(
    (state) => state.selectedTraits.size,
  );
  const clearSelections = useTFTBuilderStore((state) => state.clear);
  const hasSelections = selectedCount + fixedCount + traitCount > 0;
  const handleSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const parsed = parseInt(e.target.value, 10);
    let value = isNaN(parsed) ? 0 : parsed;
    
    if (value > maxTeamSize) value = maxTeamSize;
    if (value < 0) value = 0;
    
    setTeamSize(value);
  };

  return (
    <Panel className="items-stretch gap-2 sm:gap-3">
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex min-h-14 items-center gap-3 rounded-2xl bg-white/5 px-4 py-3 sm:px-6">
          <Text variant="heading" className="shrink-0">
            {copy.team.teamSize}
          </Text>
          <label
            data-team-size-field=""
            className={`
              ${componentTokens.teamSizeField}
              group relative cursor-text rounded-lg transition-colors
              hover:bg-white/[0.03] active:bg-white/[0.07]
              focus-within:bg-white/[0.05]
            `}
          >
            <NumberInput
              aria-label={copy.team.teamSizeAria}
              value={teamSize === 0 ? "" : teamSize}
              onChange={handleSizeChange}
              className="
                absolute inset-0 h-full !w-full cursor-text rounded-lg
                px-2 pb-1 text-center
              "
            />
            <span
              aria-hidden="true"
              className="
                pointer-events-none absolute inset-x-0 bottom-1 h-[2px]
                bg-gradient-to-r from-purple-500 via-purple-400 to-purple-600
                shadow-[0_0_8px_rgba(168,85,247,0.4)]
                transition-[filter,transform]
                group-active:scale-y-125
                group-focus-within:brightness-125
              "
            />
          </label>
        </div>

        <button
          type="button"
          data-tft-shuffle-toggle
          role="switch"
          aria-checked={shuffleCandidates}
          onClick={() => setShuffleCandidates(!shuffleCandidates)}
          className="
            flex min-h-11 items-center justify-between gap-3 rounded-xl
            border border-white/10 bg-white/[0.04] px-4 py-2 text-left
            text-white/80 transition-colors hover:bg-white/[0.08]
            focus-visible:outline focus-visible:outline-2
            focus-visible:outline-offset-2 focus-visible:outline-white
          "
        >
          <span className="min-w-0">
            <span className="block text-sm font-bold">{copy.team.shuffle}</span>
            <span className="block text-[11px] text-white/45">
              {shuffleCandidates
                ? copy.team.shuffleOn
                : copy.team.shuffleOff}
            </span>
          </span>
          <span
            aria-hidden="true"
            className={`
              relative h-6 w-11 shrink-0 rounded-full border transition-colors
              ${shuffleCandidates ? "border-emerald-300/70 bg-emerald-500/70" : "border-white/15 bg-black/40"}
            `}
          >
            <span
              className={`
                absolute top-0.5 h-[18px] w-[18px] rounded-full bg-white
                shadow transition-transform
                ${shuffleCandidates ? "translate-x-[20px]" : "translate-x-0.5"}
              `}
            />
          </span>
        </button>

        <button
          type="button"
          data-clear-active-tab-units
          disabled={!hasSelections}
          aria-label={copy.team.clearTabUnitsAria}
          onClick={clearSelections}
          className="
            inline-flex min-h-11 items-center justify-center gap-2 rounded-xl
            border border-white/10 bg-white/[0.035] px-4 py-2 text-sm
            font-bold text-white/70 transition-colors hover:border-rose-300/30
            hover:bg-rose-400/10 hover:text-rose-100
            disabled:cursor-not-allowed disabled:opacity-35
            focus-visible:outline focus-visible:outline-2
            focus-visible:outline-offset-2 focus-visible:outline-white
          "
        >
          <RotateCcw aria-hidden="true" className="h-4 w-4" />
          <span>{copy.team.clearTabUnits}</span>
        </button>
      </div>

      <Button
        onClick={run}
        loading={loading}
        className="tft-run-button h-auto min-h-[72px] shrink-0 px-5"
      >
        <Text variant="heading" className="text-lg text-black sm:text-2xl">
          {loading ? copy.team.analyzing : copy.team.analyze}
        </Text>
      </Button>
    </Panel>
  );
}
