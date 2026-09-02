import {
  memo,
  useId,
  useSyncExternalStore,
  type KeyboardEvent,
} from "react";
import { COST_VARIANTS } from "../../../styles/costVariants";
import { X } from "lucide-react";
import type { ChampionCardViewModel } from "../../view-models/championCardViewModel";
import { componentTokens } from "../../../styles/tokens";
import StaticOpBadge from "../../../op-details/StaticOpBadge";
import {
  getClosedDetailPopoverState,
  getDetailPopoverState,
  subscribeToDetailPopover,
  toggleDetailPopover,
} from "../../../details/detailPopoverStore";
import { useAppI18n } from "../../../i18n/useAppI18n";

interface Props {
  champion: ChampionCardViewModel;
  removeLabel: string;
  onRemove: (id: string) => void;
}

function ChampionItem({ champion, removeLabel, onRemove }: Props) {
  const { championName, copy, formatCost, roleLabel } = useAppI18n();
  const localizedName = championName({
    id: champion.id,
    baseId: champion.baseId,
    apiId: champion.apiId,
    name: champion.name,
    traits: champion.traits,
  });
  const reactId = useId().replace(/:/g, "");
  const triggerId = `result-champion-${champion.id}-${reactId}`;
  const isOpen = useSyncExternalStore(
    subscribeToDetailPopover,
    () => getDetailPopoverState().triggerId === triggerId,
    () => getClosedDetailPopoverState().triggerId === triggerId,
  );
  const theme = COST_VARIANTS[champion.cost].result;
  const openDetails = (anchor: HTMLButtonElement) =>
    toggleDetailPopover(triggerId, anchor, {
      kind: "champion",
      champion,
    });
  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    openDetails(event.currentTarget);
  };
  const opEvaluation =
    champion.opEvaluation?.isOp === true
      ? champion.opEvaluation
      : null;

  return (
    <div
      data-result-champion-card
      data-result-cost={champion.cost}
      data-result-cost-border
      style={{ containerType: "inline-size" }}
      className={`
        ${componentTokens.resultChampionCardSize}
        ${theme}
        group relative box-border w-full min-w-0 overflow-hidden
        rounded-lg border-2 text-center
        shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]
        transition-[border-color,background-color,box-shadow,transform]
        duration-150 hover:-translate-y-0.5
      `}
    >
      <button
        id={triggerId}
        type="button"
        data-result-champion-detail-trigger
        data-detail-popover-trigger
        aria-label={`${localizedName}, ${formatCost(champion.cost)}, ${roleLabel(champion.primaryRole)}, ${copy.detail.championInfo}`}
        aria-expanded={isOpen}
        aria-controls={isOpen ? "tft-detail-popover" : undefined}
        onClick={(event) => openDetails(event.currentTarget)}
        onKeyDown={handleKeyDown}
        className="
          absolute inset-0 z-10 flex min-w-0 flex-col items-center
          justify-start rounded-md px-2.5 py-2
          focus-visible:outline-none focus-visible:ring-2
          focus-visible:ring-inset focus-visible:ring-white/90
        "
      >
        <span aria-hidden="true" className="h-5 w-full shrink-0" />
        <span
          data-result-name-slot
          className={`
            ${componentTokens.resultChampionNameSlot}
            flex w-full min-w-0 items-center justify-center overflow-hidden
          `}
        >
          <span
            className={`
              ${componentTokens.resultChampionNameText}
              w-full min-w-0 overflow-hidden break-words font-black
              leading-tight tracking-normal text-white
              [display:-webkit-box] [-webkit-box-orient:vertical]
              [-webkit-line-clamp:2]
            `}
          >
            {localizedName}
          </span>
        </span>

        <span
          data-result-role
          className={`
            ${componentTokens.resultRoleText}
            ${componentTokens.resultChampionRoleSlot}
            mt-1.5 inline-flex max-w-full items-center justify-center
            truncate rounded-md border border-white/15 bg-black/25
            px-1.5 font-bold text-slate-100
          `}
        >
          {roleLabel(champion.primaryRole)}
        </span>
      </button>

      <button
        type="button"
        data-result-champion-remove
        aria-label={`${localizedName}, ${removeLabel}`}
        title={removeLabel}
        onClick={() => onRemove(champion.id)}
        className="
          absolute left-1 top-1 z-30 inline-flex h-6 w-6 items-center
          justify-center rounded-full border border-white/25 bg-slate-950/85
          text-white/70 shadow-md backdrop-blur-sm
          transition-colors hover:border-rose-300/80 hover:bg-rose-500/90
          hover:text-white focus-visible:outline focus-visible:outline-2
          focus-visible:outline-offset-1 focus-visible:outline-white
        "
      >
        <X aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={2.75} />
      </button>

      {opEvaluation && (
        <div className="absolute right-0 top-0 z-20">
          <StaticOpBadge evaluation={opEvaluation} />
        </div>
      )}
    </div>
  );
}

export default memo(ChampionItem);
