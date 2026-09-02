import { memo, useId, useSyncExternalStore } from "react";
import type { OpEvaluationResult } from "../domain/staticPower";
import { componentTokens } from "../styles/tokens";
import { useAppI18n } from "../i18n/useAppI18n";
import {
  getClosedDetailPopoverState,
  getDetailPopoverState,
  subscribeToDetailPopover,
  toggleDetailPopover,
} from "../details/detailPopoverStore";

interface Props {
  readonly evaluation: OpEvaluationResult;
}

function StaticOpBadge({ evaluation }: Props) {
  const { championName, copy, formatStar, roleLabel: localizeRole } = useAppI18n();
  const reactId = useId().replace(/:/g, "");
  const triggerId =
    `op-${evaluation.championId}-${evaluation.starLevel}-${reactId}`;
  const isOpen = useSyncExternalStore(
    subscribeToDetailPopover,
    () => getDetailPopoverState().triggerId === triggerId,
    () => getClosedDetailPopoverState().triggerId === triggerId,
  );
  const roleLabel = evaluation.passedComparisons[0]?.role;

  return (
    <button
      id={triggerId}
      type="button"
      data-detail-popover-trigger
      data-result-op-badge
      aria-label={[
        championName({ id: evaluation.championId, baseId: evaluation.championBaseId, apiId: evaluation.championBaseId, name: evaluation.championName }),
        copy.detail.comparisonInfo,
        formatStar(evaluation.starLevel),
        roleLabel ? `${copy.detail.role} ${localizeRole(roleLabel)}` : null,
      ].filter(Boolean).join(", ")}
      aria-expanded={isOpen}
      aria-controls={isOpen ? "tft-detail-popover" : undefined}
      onClick={(event) => {
        event.stopPropagation();
        toggleDetailPopover(triggerId, event.currentTarget, {
          kind: "static-op",
          evaluation,
        });
      }}
      className={`
        ${componentTokens.touchTarget}
        relative z-20 inline-flex shrink-0 items-start justify-end p-1
        focus-visible:outline focus-visible:outline-2
        focus-visible:outline-offset-1 focus-visible:outline-white
      `}
    >
      <span
        aria-hidden="true"
        className={`
          ${componentTokens.statusBadgeText}
          inline-flex min-h-6 items-center justify-center rounded-md
          border-2 border-amber-200/95
          bg-gradient-to-br from-indigo-600 via-violet-700 to-indigo-950
          px-1.5 font-black leading-none text-amber-50
          shadow-[0_0_0_1px_rgba(0,0,0,0.9),0_0_11px_rgba(167,139,250,0.7)]
          [text-shadow:0_1px_2px_rgba(0,0,0,1)]
        `}
      >
        OP
      </span>
    </button>
  );
}

export default memo(StaticOpBadge);
