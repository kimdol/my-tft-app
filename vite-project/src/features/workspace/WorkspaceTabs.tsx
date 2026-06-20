import type { HTMLAttributes } from "react";
import type { SelectorMode } from "../store/useSelectorModeStore";
import type { TabItem } from "./hooks/useWorkspaceCarousel";

interface WorkspaceTabsProps extends HTMLAttributes<HTMLDivElement> {
  tabs: TabItem[];
  currentMode: SelectorMode;
  onTabClick: (targetMode: SelectorMode, index: number) => void;
}

export default function WorkspaceTabs({
  tabs,
  currentMode,
  onTabClick,
  className = "",
  ...props
}: WorkspaceTabsProps) {
  return (
    <div 
      role="tablist" 
      aria-orientation="horizontal"
      className={`mb-4 max-w-4xl mx-auto border-b !border-white/10 !bg-black/20 p-1 rounded-xl backdrop-blur-md overflow-x-auto scrollbar-none ${className}`.trim()}
      {...props}
    >
      <div className="flex gap-1 min-w-max md:min-w-0">
        {tabs.map((tab, idx) => {
          const isActive = currentMode === tab.id;
          
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onTabClick(tab.id, idx)}
              className={`
                flex-1 py-3 text-sm md:text-base font-black rounded-lg 
                transition-all duration-200 antialiased tracking-tight
                [WebkitTapHighlightColor:transparent]
                ${
                  isActive
                    ? "!bg-white/20 !text-white !shadow-[0_0_15px_rgba(255,255,255,0.25)] border !border-white/40"
                    : "!text-white/75 md:hover:!text-white md:hover:!bg-white/10 active:!bg-white/15 active:!text-white"
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