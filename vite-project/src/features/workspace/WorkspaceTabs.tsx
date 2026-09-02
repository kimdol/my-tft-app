import type { HTMLAttributes } from "react";
import type { SelectorMode } from "../store/useSelectorModeStore";
import type { TabItem } from "./hooks/useWorkspaceCarousel";
import { useAppI18n } from "../i18n/useAppI18n";

interface WorkspaceTabsProps extends HTMLAttributes<HTMLDivElement> {
  tabs: TabItem[];
  currentMode: SelectorMode;
  idPrefix: string;
  onTabClick: (targetMode: SelectorMode, index: number) => void;
}

export default function WorkspaceTabs({
  tabs,
  currentMode,
  idPrefix,
  onTabClick,
  className = "",
  ...props
}: WorkspaceTabsProps) {
  const { copy } = useAppI18n();
  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    currentIndex: number,
  ) => {
    let nextIndex: number | null = null;

    if (event.key === "ArrowRight") {
      nextIndex = (currentIndex + 1) % tabs.length;
    } else if (event.key === "ArrowLeft") {
      nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = tabs.length - 1;
    }

    if (nextIndex === null) return;

    event.preventDefault();
    onTabClick(tabs[nextIndex].id, nextIndex);

    const tabButtons = event.currentTarget.parentElement?.querySelectorAll(
      '[role="tab"]',
    );
    const nextButton = tabButtons?.[nextIndex];
    if (nextButton instanceof HTMLButtonElement) {
      nextButton.focus();
    }
  };

  return (
    <div 
      role="tablist" 
      aria-label={copy.workspaceLabel}
      aria-orientation="horizontal"
      className={`tft-scrollbar-none mb-4 max-w-4xl mx-auto border-b border-white/10 bg-black/20 p-1 rounded-xl backdrop-blur-md overflow-x-auto ${className}`.trim()}
      {...props}
    >
      <div className="flex gap-1 min-w-max md:min-w-0">
        {tabs.map((tab, idx) => {
          const isActive = currentMode === tab.id;
          
          return (
            <button
              key={tab.id}
              id={`${idPrefix}-tab-${tab.id}`}
              type="button"
              role="tab"
              aria-controls={`${idPrefix}-panel-${tab.id}`}
              aria-selected={isActive}
              tabIndex={isActive ? 0 : -1}
              onClick={() => onTabClick(tab.id, idx)}
              onKeyDown={(event) => handleKeyDown(event, idx)}
              className={`
                min-h-11 flex-1 whitespace-nowrap px-3 py-2 text-sm md:text-base font-black rounded-lg
                transition-all duration-200 antialiased tracking-tight
                [WebkitTapHighlightColor:transparent]
                focus-visible:outline focus-visible:outline-2
                focus-visible:outline-offset-[-2px] focus-visible:outline-white
                ${
                  isActive
                    ? "bg-white/20 text-white shadow-[0_0_15px_rgba(255,255,255,0.25)] border border-white/40"
                    : "text-white/75 md:hover:text-white md:hover:bg-white/10 active:bg-white/15 active:text-white"
                }
              `.trim()}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
