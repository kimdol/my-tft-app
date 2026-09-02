import {
  useId,
  useSyncExternalStore,
  type KeyboardEvent,
} from "react";
import { layout } from "../../../styles/layout";
import { getTraitStyleClass } from "../../../core/traitTierUtils";
import type { ActiveTraitDetail } from "../../../core/traitEvaluator";
import {
  getClosedDetailPopoverState,
  getDetailPopoverState,
  subscribeToDetailPopover,
  toggleDetailPopover,
} from "../../../details/detailPopoverStore";
import { useAppI18n } from "../../../i18n/useAppI18n";

interface TraitChipProps {
  trait: ActiveTraitDetail;
}

export default function TraitChip({ trait }: TraitChipProps) {
  const { copy, traitName } = useAppI18n();
  const localizedName = traitName(trait);
  const reactId = useId().replace(/:/g, "");
  const triggerId = `result-trait-${trait.apiName}-${reactId}`;
  const isOpen = useSyncExternalStore(
    subscribeToDetailPopover,
    () => getDetailPopoverState().triggerId === triggerId,
    () => getClosedDetailPopoverState().triggerId === triggerId,
  );
  const openDetails = (anchor: HTMLButtonElement) =>
    toggleDetailPopover(triggerId, anchor, {
      kind: "trait",
      trait,
    });
  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    openDetails(event.currentTarget);
  };

  return (
    <button
      id={triggerId}
      type="button"
      data-tft-trait-chip
      data-detail-popover-trigger
      aria-label={`${localizedName}, ${trait.totalCount}, ${trait.tierIndex + 1} ${copy.common.tier}, ${copy.detail.traitInfo}`}
      aria-expanded={isOpen}
      aria-controls={isOpen ? "tft-detail-popover" : undefined}
      onClick={(event) => openDetails(event.currentTarget)}
      onKeyDown={handleKeyDown}
      className={`
        ${layout.traitChip}
        ${getTraitStyleClass(
          trait.activeStyle,
          trait.totalCount === 1 && trait.breakpoints.length === 1,
        )}
        min-h-11 focus-visible:outline focus-visible:outline-2
        focus-visible:outline-offset-2 focus-visible:outline-white
      `}
    >
      <span>{localizedName}</span>
      <span
        aria-hidden="true"
        className="rounded bg-black/20 px-1 py-0.5 text-[9px]"
      >
        {trait.totalCount}
      </span>
    </button>
  );
}
