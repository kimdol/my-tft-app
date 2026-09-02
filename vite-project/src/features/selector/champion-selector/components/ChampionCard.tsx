import { memo, useId, useMemo, useState, useSyncExternalStore } from "react";
import { CheckCircle2, Info } from "lucide-react";
import type { Champion } from "../types";
import { COST_VARIANTS } from "../../../styles/costVariants";
import { componentTokens, radius } from "../../../styles/tokens";
import type { ChampionSelectorStrategy } from "../selectorStrategies";
import StaticOpBadge from "../../../op-details/StaticOpBadge";
import FallbackAvatar from "./FallbackAvatar";
import { useAppI18n } from "../../../i18n/useAppI18n";
import { createChampionCardViewModel } from "../../../team-builder/view-models/championCardViewModel";
import {
  getClosedDetailPopoverState,
  getDetailPopoverState,
  subscribeToDetailPopover,
  toggleDetailPopover,
} from "../../../details/detailPopoverStore";

interface Props {
  champion: Champion;
  isSelected: boolean;
  isOppositeSelected?: boolean;
  onToggle: (id: string) => void;
  strategy: ChampionSelectorStrategy;
}

function ChampionCard({
  champion,
  isSelected,
  isOppositeSelected = false,
  onToggle,
  strategy,
}: Props) {
  const { championName, copy, formatCost } = useAppI18n();
  const [imageFailed, setImageFailed] = useState(false);
  const localizedName = championName(champion);
  const reactId = useId().replace(/:/g, "");
  const infoTriggerId = `selector-champion-${champion.id}-${reactId}`;
  const isInfoOpen = useSyncExternalStore(
    subscribeToDetailPopover,
    () => getDetailPopoverState().triggerId === infoTriggerId,
    () => getClosedDetailPopoverState().triggerId === infoTriggerId,
  );
  const opEvaluation =
    champion.staticPower?.evaluations.find(
      (evaluation) => evaluation.isOp,
    ) ?? null;
  const detailChampion = useMemo(
    () => createChampionCardViewModel(
      champion,
      strategy.id === "fixed",
      opEvaluation,
    ),
    [champion, opEvaluation, strategy.id],
  );
  const hasImage = champion.imageUrl.length > 0 && !imageFailed;
  const isAnySelected = isSelected || isOppositeSelected;
  const variant = COST_VARIANTS[champion.cost];
  const overlayColor = isOppositeSelected
    ? strategy.oppositeOverlay
    : strategy.primaryOverlay;
  const selectedRingColor = isOppositeSelected
    ? strategy.oppositeRing
    : strategy.primaryRing;
  const selectionDescription = isSelected
    ? `${copy.selector[strategy.id].currentSelectionLabel} ${copy.selector.unselect}`
    : isOppositeSelected
      ? `${copy.selector[strategy.id].oppositeSelectionLabel} ${copy.selector.select}`
      : `${copy.selector[strategy.id].currentSelectionLabel} ${copy.selector.select}`;

  return (
    <div
      className="relative w-full"
      style={{ containerType: "inline-size" }}
    >
      <button
        type="button"
        data-champion-card
        aria-pressed={isSelected}
        aria-label={`${localizedName}, ${formatCost(champion.cost)}, ${selectionDescription}`}
        onClick={() => onToggle(champion.id)}
        className={`
          group relative block w-full
          ${radius.lg} overflow-hidden
          border-[3px] border-solid ${variant.cardBorder}
          ${variant.placeholder}
          text-left shadow-[0_10px_24px_rgba(0,0,0,0.35)]
          transition-[transform,filter,box-shadow] duration-200
          hover:scale-[1.03] hover:brightness-110
          active:scale-[0.98]
          focus-visible:outline focus-visible:outline-2
          focus-visible:outline-offset-2 focus-visible:outline-white
          ${isAnySelected ? selectedRingColor : ""}
        `}
      >
        <span className="relative block aspect-[2/3] w-full overflow-hidden">
          {hasImage ? (
            <img
              src={champion.imageUrl}
              alt=""
              width="220"
              height="330"
              loading="lazy"
              decoding="async"
              fetchPriority="low"
              onError={() => setImageFailed(true)}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <FallbackAvatar name={localizedName} />
          )}

          <span className="absolute inset-x-0 bottom-0 flex min-h-[46%] flex-col items-center justify-end bg-gradient-to-b from-transparent via-black/75 to-black/95 px-1.5 pb-2 pt-8 text-center">
            <span
              className={`
                ${componentTokens.cardNameText}
                w-full overflow-hidden break-words text-center
                font-black leading-[1.15] text-white
                drop-shadow-[0_1px_1px_rgba(0,0,0,0.9)]
                [display:-webkit-box] [-webkit-box-orient:vertical]
                [-webkit-line-clamp:2]
              `}
            >
              {localizedName}
            </span>
            <span
              className={`
                ${componentTokens.cardCaptionText}
                mt-1 font-black leading-none text-amber-300
              `}
            >
              {formatCost(champion.cost)}
            </span>
          </span>

          {isAnySelected && (
            <span
              data-selection-overlay
              className={`absolute inset-0 flex items-center justify-center ${overlayColor}`}
            >
              <CheckCircle2
                aria-hidden="true"
                className="h-9 w-9 text-white drop-shadow-[0_2px_5px_rgba(0,0,0,0.8)]"
              />
              <span className="sr-only">
                {isOppositeSelected
                  ? `${copy.selector[strategy.id].oppositeSelectionLabel} ${copy.common.selected}`
                  : `${copy.selector[strategy.id].currentSelectionLabel} ${copy.common.selected}`}
              </span>
            </span>
          )}
        </span>
      </button>

      <button
        id={infoTriggerId}
        type="button"
        data-champion-info-trigger
        data-detail-popover-trigger
        aria-label={`${localizedName}, ${copy.detail.championInfo}`}
        aria-expanded={isInfoOpen}
        aria-controls={isInfoOpen ? "tft-detail-popover" : undefined}
        onClick={(event) => {
          event.stopPropagation();
          toggleDetailPopover(infoTriggerId, event.currentTarget, {
            kind: "champion",
            champion: detailChampion,
          });
        }}
        className={`
          ${componentTokens.touchTarget}
          absolute -left-1 -top-1 z-30 inline-flex items-start justify-start p-1
          focus-visible:outline focus-visible:outline-2
          focus-visible:outline-offset-1 focus-visible:outline-white
        `}
      >
        <span
          aria-hidden="true"
          className="
            inline-flex h-6 w-6 items-center justify-center rounded-md
            border border-sky-200/90
            bg-gradient-to-br from-sky-500 via-indigo-600 to-violet-800
            text-white shadow-[0_0_0_1px_rgba(0,0,0,0.85),0_0_9px_rgba(56,189,248,0.55)]
          "
        >
          <Info className="h-3.5 w-3.5" strokeWidth={2.5} />
        </span>
      </button>

      {opEvaluation && (
        <div className="absolute -right-1 -top-1 z-30">
          <StaticOpBadge evaluation={opEvaluation} />
        </div>
      )}
    </div>
  );
}

export default memo(ChampionCard);
