import { useState, type FormEvent } from "react";
import ChampionCard from "./ChampionCard";
import { useChampionSelector } from "../hooks/useChampionSelector";
import type { ChampionSelectorStrategy } from "../selectorStrategies";
import {
  MISSING_TFT_RUNTIME_CONFIG_MESSAGE,
  resetTFTDataCache,
  saveDevelopmentWordPressOrigin,
} from "../../../api/tftApi";
import { useAppI18n } from "../../../i18n/useAppI18n";
import {
  CHAMPION_PROGRESSIVE_PROFILE,
  useProgressiveRenderCount,
} from "../../hooks/useProgressiveRenderCount";

interface Props {
  query: string;
  strategy: ChampionSelectorStrategy;
}

export default function ChampionGrid({ query, strategy }: Props) {
  const { copy } = useAppI18n();
  const selectorCopy = copy.selector[strategy.id];
  const { filtered, selected, oppositeSelected, toggle, loading, error } =
    useChampionSelector(query, strategy);
  const [wordpressOrigin, setWordpressOrigin] = useState("");
  const [configurationError, setConfigurationError] = useState<string | null>(
    null,
  );
  const { renderCount, hasMore, sentinelRef } = useProgressiveRenderCount({
    totalCount: filtered.length,
    resetKey: `${strategy.id}:${query}`,
    profile: CHAMPION_PROGRESSIVE_PROFILE,
  });
  const renderedChampions = filtered.slice(0, renderCount);

  const isDevelopmentConfigRequired =
    import.meta.env.DEV && error === MISSING_TFT_RUNTIME_CONFIG_MESSAGE;

  const saveDevelopmentConfig = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setConfigurationError(null);

    try {
      saveDevelopmentWordPressOrigin(wordpressOrigin);
      resetTFTDataCache(true);
      window.location.reload();
    } catch {
      setConfigurationError(copy.selector.development.saveFailed);
    }
  };

  if (loading) {
    return (
      <div role="status" className="py-20 text-center opacity-50">
        {copy.selector.loading}
      </div>
    );
  }

  if (error) {
    if (isDevelopmentConfigRequired) {
      return (
        <form
          onSubmit={saveDevelopmentConfig}
          className="mx-auto max-w-xl space-y-3 rounded-lg border border-amber-300/30 bg-amber-300/10 p-4 text-left"
        >
          <label className="block text-sm font-bold text-amber-100">
            {copy.selector.development.originLabel}
            <input
              type="url"
              value={wordpressOrigin}
              onChange={(event) => setWordpressOrigin(event.target.value)}
              placeholder={copy.selector.development.originPlaceholder}
              required
              className="mt-2 block w-full rounded-md border border-white/20 bg-black/30 px-3 py-2 text-white outline-none focus:border-amber-200"
            />
          </label>
          {configurationError && (
            <p role="alert" className="text-sm text-red-300">
              {configurationError}
            </p>
          )}
          <button
            type="submit"
            data-tft-development-connect
            className="rounded-md bg-amber-200 px-3 py-2 text-sm font-bold text-black"
          >
            {copy.selector.development.connect}
          </button>
        </form>
      );
    }

    return (
      <div role="alert" className="text-red-400">
        {copy.selector.loadFailed}
      </div>
    );
  }

  if (filtered.length === 0) {
    return (
      <p className="py-16 text-center text-sm text-white/55">
        {copy.selector.noMatches}
      </p>
    );
  }

  return (
    <ul
      data-champion-grid
      data-rendered-count={renderedChampions.length}
      data-total-count={filtered.length}
      aria-label={selectorCopy.listLabel}
      className="
        grid
        grid-cols-[repeat(auto-fill,minmax(78px,92px))]
        sm:grid-cols-[repeat(auto-fill,minmax(92px,110px))]
        justify-center
        gap-2 sm:gap-3
        pb-20
      "
    >
      {renderedChampions.map((champion) => (
        <li
          key={champion.id}
          className="min-w-0 aspect-[2/3] [content-visibility:auto]"
        >
          <ChampionCard
            champion={champion}
            isSelected={selected.has(champion.id)}
            isOppositeSelected={oppositeSelected.has(champion.id)}
            onToggle={toggle}
            strategy={strategy}
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
  );
}
