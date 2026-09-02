import { RotateCcw } from "lucide-react";
import TraitItem from "./TraitItem";
import TraitSearchBar from "./TraitSearchBar";
import { useTraitSelector } from "../hooks/useTraitSelector";
import { typography } from "../../../styles/typography";
import { useTFTBuilderStore } from "../../../store/useTFTBuilderStore";
import { useAppI18n } from "../../../i18n/useAppI18n";
import {
  TRAIT_PROGRESSIVE_PROFILE,
  useProgressiveRenderCount,
} from "../../hooks/useProgressiveRenderCount";
import { useSelectorModeStore } from "../../../store/useSelectorModeStore";

export default function FixedTraitSelector() {
  const { copy, traitName } = useAppI18n();
  const query = useSelectorModeStore(
    (state) => state.selectorQueries.trait,
  );
  const setSelectorQuery = useSelectorModeStore(
    (state) => state.setSelectorQuery,
  );
  const { filtered, selectedTraits, totalSelectedCount } = useTraitSelector(
    query,
    traitName,
  );
  const clearTraits = useTFTBuilderStore((state) => state.clearTraits);
  const hasSelectedTraits = totalSelectedCount > 0;
  const { renderCount, hasMore, sentinelRef } = useProgressiveRenderCount({
    totalCount: filtered.length,
    resetKey: query,
    profile: TRAIT_PROGRESSIVE_PROFILE,
  });
  const renderedTraits = filtered.slice(0, renderCount);

  return (
    <div className="space-y-4 pb-12">
      <header className="flex flex-col justify-between gap-3 px-1 sm:flex-row sm:items-end">
        <div className="min-w-0">
          <h2
            className={`${typography.heading} flex flex-wrap items-center gap-2 font-black text-white`}
          >
            {copy.traits.title}

            {hasSelectedTraits && (
              <span className="text-sm font-bold bg-white/10 text-white/90 px-2.5 py-0.5 rounded-full border border-white/20 backdrop-blur-sm">
                {totalSelectedCount}{copy.common.people} {copy.traits.selected}
              </span>
            )}
          </h2>
          <span className="text-sm font-medium text-white/40">
            {copy.traits.controlsHint}
          </span>
        </div>

        <div className="flex w-full min-w-0 items-center gap-2 sm:w-auto">
          <TraitSearchBar
            query={query}
            setQuery={(value) => setSelectorQuery("trait", value)}
          />
          <button
            type="button"
            data-tft-trait-reset
            aria-label={copy.traits.resetAria}
            disabled={!hasSelectedTraits}
            onClick={clearTraits}
            className="
              inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-lg
              border border-white/15 bg-white/[0.06] px-3 text-xs font-bold
              text-white/70 transition-colors hover:bg-white/10 hover:text-white
              disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-white/[0.06]
              focus-visible:outline focus-visible:outline-2
              focus-visible:outline-offset-2 focus-visible:outline-white
            "
          >
            <RotateCcw aria-hidden="true" size={15} />
            <span className="hidden sm:inline">{copy.traits.reset}</span>
          </button>
        </div>
      </header>

      <ul
        data-trait-grid
        data-rendered-count={renderedTraits.length}
        data-total-count={filtered.length}
        aria-label={copy.traits.listLabel}
        className="grid grid-cols-1 gap-3 sm:grid-cols-2"
      >
        {renderedTraits.map((trait) => (
          <li
            key={trait.apiName}
            className="min-h-[72px] [content-visibility:auto]"
          >
            <TraitItem
              trait={trait}
              localizedName={traitName(trait)}
              count={selectedTraits.get(trait.name) ?? 0}
            />
          </li>
        ))}
        {hasMore && (
          <li
            ref={sentinelRef}
            data-progressive-render-sentinel
            aria-hidden="true"
            className="col-span-full h-24 w-full"
          />
        )}
      </ul>
    </div>
  );
}
