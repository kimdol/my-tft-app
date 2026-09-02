import {
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import {
  closeDetailPopover,
  getClosedDetailPopoverState,
  getDetailPopoverState,
  subscribeToDetailPopover,
  type DetailPopoverContent,
} from "./detailPopoverStore";
import {
  formatOpValue,
} from "../op-details/opLabels";
import {
  calculateOpPopoverPosition,
  OP_POPOVER_MAX_HEIGHT,
  OP_POPOVER_MAX_WIDTH,
  OP_POPOVER_VIEWPORT_GAP,
  type OpPopoverPosition,
} from "../op-details/opPopoverPosition";
import { useAppI18n } from "../i18n/useAppI18n";

interface Props {
  readonly portalHost: HTMLDivElement | null;
}

const DetailSection = ({
  title,
  children,
}: {
  readonly title: string;
  readonly children: ReactNode;
}) => (
  <section className="border-t border-white/10 pt-3">
    <h3 className="text-xs font-black text-white/60">{title}</h3>
    {children}
  </section>
);

export const StaticOpContent = ({
  content,
}: {
  readonly content: Extract<
    DetailPopoverContent,
    { kind: "static-op" }
  >;
}) => {
  const { evaluation } = content;
  const { championName, copy, formatCost, formatStar, roleLabel, statLabel } = useAppI18n();
  const candidateName = championName({
    id: evaluation.championId,
    baseId: evaluation.championBaseId,
    apiId: evaluation.championBaseId,
    name: evaluation.championName,
  });

  return (
    <div className="space-y-3">
      {evaluation.passedComparisons.map((comparison) => (
        <section
          key={`${comparison.role}:${comparison.baselineChampionId}`}
          className="rounded-md border border-white/10 bg-white/[0.06] p-3"
        >
          <dl className="grid grid-cols-[auto,minmax(0,1fr)] gap-x-3 gap-y-1.5 text-xs">
            <dt className="font-bold text-white/60">{copy.detail.role}</dt>
            <dd className="min-w-0 text-right font-black text-white">
              {roleLabel(comparison.role)}
            </dd>
            <dt className="font-bold text-white/60">{copy.detail.baseline}</dt>
            <dd className="min-w-0 text-right font-black text-white">
              {championName({ id: comparison.baselineChampionId, baseId: comparison.baselineChampionBaseId, apiId: comparison.baselineChampionBaseId, name: comparison.baselineChampionName })} ( {formatCost(comparison.baselineCost)} {formatStar(comparison.baselineStarLevel)} )
            </dd>
          </dl>

          <div className="mt-3 space-y-2">
            {comparison.matchedStats.map((stat) => (
              <section
                key={stat.stat}
                className="rounded-md border border-white/[0.08] bg-black/20 p-2.5"
              >
                <h3 className="text-xs font-black text-white">
                  {statLabel(stat.stat)}
                </h3>
                <dl className="mt-2 grid grid-cols-[minmax(0,1fr),auto] gap-x-3 gap-y-1 text-xs tabular-nums">
                  <dt className="min-w-0 text-white/60">
                    {copy.detail.candidate} <span className="text-white/85">{candidateName} ( {formatCost(evaluation.cost)} {formatStar(evaluation.starLevel)} )</span>
                  </dt>
                  <dd className="font-black text-white">
                    {formatOpValue(stat.championValue)}
                  </dd>
                  <dt className="min-w-0 text-white/60">
                    {copy.detail.baseline} <span className="text-white/85">{championName({ id: comparison.baselineChampionId, baseId: comparison.baselineChampionBaseId, apiId: comparison.baselineChampionBaseId, name: comparison.baselineChampionName })} ( {formatCost(comparison.baselineCost)} {formatStar(comparison.baselineStarLevel)} )</span>
                  </dt>
                  <dd className="font-black text-white">
                    {formatOpValue(stat.baselineValue)}
                  </dd>
                  <dt className="border-t border-white/10 pt-1 text-white/60">{copy.detail.difference}</dt>
                  <dd className="border-t border-white/10 pt-1 font-black text-emerald-200">
                    +{formatOpValue(stat.difference)}
                  </dd>
                </dl>
              </section>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
};

export const ChampionContent = ({
  content,
}: {
  readonly content: Extract<
    DetailPopoverContent,
    { kind: "champion" }
  >;
}) => {
  const { champion } = content;
  const { championName, copy, formatStar, roleLabel, statLabel, traitName } = useAppI18n();
  const localizedName = championName({
    id: champion.id,
    baseId: champion.baseId,
    apiId: champion.apiId,
    name: champion.name,
    traits: champion.traits,
  });

  return (
    <div className="space-y-4">
      <dl className="grid grid-cols-[auto,1fr] gap-x-3 gap-y-2 text-sm">
        <dt className="font-bold text-white/55">{copy.detail.cost}</dt>
        <dd className="text-right font-black">{champion.cost}</dd>
        <dt className="font-bold text-white/55">{copy.detail.primaryRole}</dt>
        <dd className="text-right font-black">
          {roleLabel(champion.primaryRole)}
        </dd>
        {champion.secondaryRoleLabels.length > 0 && (
          <>
            <dt className="font-bold text-white/55">{copy.detail.secondaryRole}</dt>
            <dd className="text-right font-black">
              {champion.secondaryRoles.map(roleLabel).join(", ")}
            </dd>
          </>
        )}
      </dl>

      <DetailSection title={copy.detail.traits}>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {champion.traits.length > 0 ? (
            champion.traits.map((trait) => (
              <span
                key={trait.name}
                className="rounded-md border border-white/15 bg-white/[0.06] px-2 py-1 text-xs font-bold"
              >
                {traitName(trait)}
              </span>
            ))
          ) : (
            <p className="text-sm text-white/55">{copy.detail.noTraits}</p>
          )}
        </div>
      </DetailSection>

      <DetailSection title={copy.detail.starStats}>
        {champion.combatStats.length > 0 ? (
          <div
            role="table"
            aria-label={`${localizedName} ${copy.detail.starStats}`}
            className="mt-2 min-w-0 text-[11px] sm:text-xs"
          >
            <div
              role="row"
              className="grid grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))] gap-x-1 border-b border-white/10 pb-1.5 text-center font-black text-white/55"
            >
              <span role="columnheader" className="text-left">{copy.detail.stat}</span>
              <span role="columnheader">{formatStar(1)}</span>
              <span role="columnheader">{formatStar(2)}</span>
              <span role="columnheader">{formatStar(3)}</span>
            </div>
            {champion.combatStats.map((stat) => (
              <div
                key={stat.key}
                role="row"
                className="grid grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))] gap-x-1 border-b border-white/[0.06] py-1.5 last:border-0"
              >
                <span role="rowheader" className="min-w-0 break-words font-bold text-white/55">
                  {statLabel(stat.key)}
                </span>
                {[1, 2, 3].map((star) => (
                  <span
                    key={star}
                    role="cell"
                    className="min-w-0 text-center font-black tabular-nums"
                  >
                    {stat.values[star as 1 | 2 | 3]}
                  </span>
                ))}
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-sm text-white/55">
            {copy.detail.noStats}
          </p>
        )}
      </DetailSection>
    </div>
  );
};

const TraitContent = ({
  content,
}: {
  readonly content: Extract<
    DetailPopoverContent,
    { kind: "trait" }
  >;
}) => {
  const { trait } = content;
  const { championName, copy, traitEffectDescription } = useAppI18n();
  const effectDescription = traitEffectDescription(trait);

  return (
    <div className="space-y-4">
      <dl className="grid grid-cols-[auto,1fr] gap-x-3 gap-y-2 text-sm">
        <dt className="font-bold text-white/55">{copy.detail.totalCount}</dt>
        <dd className="text-right font-black">{trait.totalCount}</dd>
        <dt className="font-bold text-white/55">{copy.detail.activeTier}</dt>
        <dd className="text-right font-black">
          {trait.tierIndex + 1} {copy.common.tier} ({trait.activeBreakpoint})
        </dd>
        <dt className="font-bold text-white/55">{copy.detail.nextTier}</dt>
        <dd className="text-right font-black">
          {trait.nextBreakpoint ?? copy.detail.maxTier}
        </dd>
        <dt className="font-bold text-white/55">{copy.detail.needed}</dt>
        <dd className="text-right font-black">
          {trait.remainingToNextBreakpoint ?? copy.detail.none}
        </dd>
        <dt className="font-bold text-white/55">{copy.detail.extraEmblems}</dt>
        <dd className="text-right font-black">{trait.additionalCount}</dd>
      </dl>

      <DetailSection title={copy.detail.breakpoints}>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {trait.breakpoints.map((breakpoint) => (
            <span
              key={breakpoint.breakpoint}
              className={`
                rounded-md border px-2 py-1 text-xs font-black
                ${
                  breakpoint.isActive
                    ? "border-emerald-300/45 bg-emerald-400/15 text-emerald-100"
                    : "border-white/15 bg-white/[0.04] text-white/45"
                }
              `}
            >
              {breakpoint.breakpoint}
            </span>
          ))}
        </div>
      </DetailSection>

      {effectDescription !== null && (
        <DetailSection title={copy.detail.currentEffect}>
          <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-white/80">
            {effectDescription}
          </p>
        </DetailSection>
      )}

      <DetailSection title={copy.detail.traitChampions}>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {trait.champions.length > 0 ? (
            trait.champions.map((champion) => (
              <span
                key={champion.id}
                className="rounded-md border border-white/15 bg-white/[0.06] px-2 py-1 text-xs font-bold"
              >
                {championName(champion)}
              </span>
            ))
          ) : (
            <p className="text-sm text-white/55">
              {copy.detail.emblemOnly}
            </p>
          )}
        </div>
      </DetailSection>
    </div>
  );
};

const renderContent = (content: DetailPopoverContent) => {
  switch (content.kind) {
    case "static-op":
      return <StaticOpContent content={content} />;
    case "champion":
      return <ChampionContent content={content} />;
    case "trait":
      return <TraitContent content={content} />;
  }
};

export default function DetailPopover({ portalHost }: Props) {
  const { championName, copy, traitName } = useAppI18n();
  const state = useSyncExternalStore(
    subscribeToDetailPopover,
    getDetailPopoverState,
    getClosedDetailPopoverState,
  );
  const popoverRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] =
    useState<OpPopoverPosition | null>(null);
  const anchorRoot = state.anchor?.closest("[data-tft-workspace-root]");
  const hostRoot = portalHost?.closest("[data-tft-workspace-root]");
  const ownsPopover =
    anchorRoot !== null &&
    anchorRoot !== undefined &&
    anchorRoot === hostRoot;

  useLayoutEffect(() => {
    if (!state.anchor || !state.content || !ownsPopover) return;

    const updatePosition = () => {
      if (!state.anchor || !popoverRef.current) return;
      setPosition(
        calculateOpPopoverPosition({
          anchor: state.anchor.getBoundingClientRect(),
          viewportWidth: window.innerWidth,
          viewportHeight: window.innerHeight,
          contentHeight: popoverRef.current.scrollHeight,
        }),
      );
    };
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (
        popoverRef.current?.contains(target) ||
        state.anchor?.contains(target)
      ) {
        return;
      }
      if (
        target instanceof Element &&
        target.closest("[data-detail-popover-trigger]")
      ) {
        return;
      }
      closeDetailPopover();
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      closeDetailPopover(true);
    };

    const frame = requestAnimationFrame(updatePosition);
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    document.addEventListener("pointerdown", handlePointerDown, true);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
      document.removeEventListener("pointerdown", handlePointerDown, true);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [ownsPopover, state.anchor, state.content]);

  if (
    typeof document === "undefined" ||
    !state.content ||
    !portalHost ||
    !ownsPopover
  ) {
    return null;
  }

  const header =
    state.content.kind === "static-op"
      ? { title: null, description: null }
      : state.content.kind === "champion"
        ? {
            title: championName({
              id: state.content.champion.id,
              baseId: state.content.champion.baseId,
              apiId: state.content.champion.apiId,
              name: state.content.champion.name,
              traits: state.content.champion.traits,
            }),
            description: copy.detail.championInfo,
          }
        : {
            title: traitName(state.content.trait),
            description: copy.detail.traitInfo,
          };

  return createPortal(
    <div
      ref={popoverRef}
      id="tft-detail-popover"
      role="dialog"
      aria-modal="false"
      aria-labelledby={header.title !== null ? "tft-detail-popover-title" : undefined}
      aria-label={header.title === null ? copy.detail.comparisonInfo : undefined}
      style={{
        left: position?.left ?? OP_POPOVER_VIEWPORT_GAP,
        top: position?.top ?? OP_POPOVER_VIEWPORT_GAP,
        width:
          position?.width ??
          `min(${OP_POPOVER_MAX_WIDTH}px, calc(100vw - 16px))`,
        maxHeight:
          position?.maxHeight ??
          `min(${OP_POPOVER_MAX_HEIGHT}px, calc(100vh - 16px))`,
        visibility: position ? "visible" : "hidden",
      }}
      className="
        tft-scrollbar-subtle fixed z-[10000]
        max-h-[min(32rem,calc(100vh-16px))] overflow-y-auto
        rounded-lg border border-white/20 bg-[#11131a] p-4
        font-sans text-white shadow-[0_18px_60px_rgba(0,0,0,0.65)]
      "
      onClick={(event) => event.stopPropagation()}
    >
      <div className="flex items-start gap-3">
        {header.title !== null && (
          <div className="min-w-0">
            <p
              id="tft-detail-popover-title"
              className="break-words text-base font-black"
            >
              {header.title}
            </p>
            {header.description !== null && (
              <p className="mt-1 text-xs text-white/60">
                {header.description}
              </p>
            )}
          </div>
        )}
        <button
          type="button"
          data-tft-popover-close
          aria-label={copy.detail.close}
          onClick={() => closeDetailPopover(true)}
          className="
            ml-auto inline-flex min-h-11 min-w-11 shrink-0 items-center
            justify-center rounded-md text-white/75 hover:bg-white/10
            hover:text-white focus-visible:outline focus-visible:outline-2
            focus-visible:outline-white
          "
        >
          <X aria-hidden="true" className="h-5 w-5" />
        </button>
      </div>

      <div className="mt-3">{renderContent(state.content)}</div>
    </div>,
    portalHost,
  );
}
