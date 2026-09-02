import { CopyPlus, Plus, X } from "lucide-react";
import { useAppI18n } from "../../i18n/useAppI18n";
import { useRuntimeSettingsStore } from "../../config/runtimeSettings";
import { useRecommendationStore } from "../recommendationStore";

export default function RecommendationTabs() {
  const { copy } = useAppI18n();
  const settings = useRuntimeSettingsStore((state) => state.recommendation);
  const tabIds = useRecommendationStore((state) => state.tabIds);
  const activeTabId = useRecommendationStore((state) => state.activeTabId);
  const addTab = useRecommendationStore((state) => state.addTab);
  const copyActiveTab = useRecommendationStore(
    (state) => state.copyActiveTab,
  );
  const activateTab = useRecommendationStore((state) => state.activateTab);
  const closeTab = useRecommendationStore((state) => state.closeTab);
  const canAdd = tabIds.length < settings.maxAdditionalTabs + 1;

  const labelFor = (index: number) =>
    copy.team.recommendationTab.replace("{number}", String(index + 1));

  return (
    <div
      data-recommendation-tabs
      className="tft-scrollbar-none flex min-h-12 items-end overflow-x-auto rounded-t-2xl border-b border-white/15 bg-black/25 px-2 pt-2"
    >
      <div
        role="tablist"
        aria-label={copy.team.recommendationTabsLabel}
        className="flex min-w-max items-end gap-1"
      >
        {tabIds.map((id, index) => {
          const active = id === activeTabId;
          const label = labelFor(index);
          return (
            <div
              key={id}
              className={`
                group flex min-h-10 min-w-[118px] max-w-[180px] items-center
                rounded-t-xl border border-b-0 transition-colors
                ${active
                  ? "border-white/25 bg-slate-800 text-white shadow-[0_-5px_18px_rgba(0,0,0,0.25)]"
                  : "border-transparent bg-white/[0.045] text-white/55 hover:bg-white/[0.09] hover:text-white/85"}
              `}
            >
              <button
                type="button"
                role="tab"
                aria-selected={active}
                tabIndex={active ? 0 : -1}
                onClick={() => activateTab(id)}
                className="min-h-10 min-w-0 flex-1 truncate px-3 text-left text-xs font-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-white"
              >
                {label}
              </button>
              {id !== "default" && (
                <button
                  type="button"
                  aria-label={`${label} ${copy.team.closeRecommendationTab}`}
                  onClick={() => closeTab(id)}
                  className="mr-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white/45 hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
                >
                  <X aria-hidden="true" className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      <button
        type="button"
        data-add-recommendation-tab
        aria-label={canAdd
          ? copy.team.addRecommendationTab
          : copy.team.recommendationTabLimit}
        title={canAdd
          ? copy.team.addRecommendationTab
          : copy.team.recommendationTabLimit}
        disabled={!canAdd}
        onClick={() => addTab(
          settings.maxAdditionalTabs,
          settings.defaultTeamSize,
        )}
        className="mb-1 ml-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
      >
        <Plus aria-hidden="true" className="h-4 w-4" />
      </button>

      <button
        type="button"
        data-copy-recommendation-tab
        aria-label={canAdd
          ? copy.team.copyRecommendationTabAria
          : copy.team.recommendationTabLimit}
        title={canAdd
          ? copy.team.copyRecommendationTabAria
          : copy.team.recommendationTabLimit}
        disabled={!canAdd}
        onClick={() => copyActiveTab(settings.maxAdditionalTabs)}
        className="
          mb-1 ml-1 inline-flex h-9 shrink-0 items-center justify-center
          gap-1.5 rounded-lg px-2.5 text-xs font-bold text-white/70
          transition-colors hover:bg-white/10 hover:text-white
          disabled:cursor-not-allowed disabled:opacity-25
          focus-visible:outline focus-visible:outline-2
          focus-visible:outline-white
        "
      >
        <CopyPlus aria-hidden="true" className="h-4 w-4" />
        <span>{copy.team.copyRecommendationTab}</span>
      </button>
    </div>
  );
}
