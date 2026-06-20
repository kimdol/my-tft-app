import { useEffect, type ReactNode } from "react";
import MainLayout from "../layouts/MainLayout";
import Section from "../ui/Section";
import ChampionSelector from "../selector/champion-selector/ChampionSelector";
import FixedTraitSelector from "../selector/fixed-trait-selector";
import TeamBuilder from "../team-builder/TeamBuilder";

import WorkspaceTabs from "./WorkspaceTabs";
import WorkspaceCarousel from "./WorkspaceCarousel";
import { useWorkspaceCarousel, type TabItem } from "./hooks/useWorkspaceCarousel";

import TFTGuide from "./guide/TFTGuide";

const WORKSPACE_TABS: TabItem[] = [
  { id: "intro", label: "가이드" },
  { id: "result", label: "조합 추천" },
  { id: "candidate", label: "후보 유닛" },
  { id: "fixed", label: "고정 유닛" },
  { id: "trait", label: "추가 상징" },
];

const SLIDE_CLASS = "w-full shrink-0 snap-center snap-always";

const SlideContainer = ({ children, isFirst = false }: { children: ReactNode; isFirst?: boolean }) => (
  <div 
    role="tabpanel" 
    className={`${SLIDE_CLASS} ${isFirst ? "mt-4" : ""}`}
  >
    <div className="mx-auto w-full max-w-7xl px-2 md:px-6 lg:px-8">
      {children}
    </div>
  </div>
);

export default function TftWorkspace() {
  const { containerRef, currentMode, handleTabClick, handleScroll } =
    useWorkspaceCarousel(WORKSPACE_TABS);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const activeIndex = WORKSPACE_TABS.findIndex((tab) => tab.id === currentMode);
    const activeSlide = container.children[activeIndex];
    
    if (!(activeSlide instanceof HTMLElement)) return;

    container.style.willChange = "height";
    container.style.overflowY = "hidden";
    container.style.transition = "height 0.2s ease-in-out";

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        container.style.height = `${entry.contentRect.height}px`;
      }
    });

    resizeObserver.observe(activeSlide);

    return () => {
      resizeObserver.disconnect();
      container.style.willChange = "auto";
    };
  }, [currentMode, containerRef]);

  return (
    <MainLayout>
      <div className="w-full overflow-x-hidden touch-pan-y">
        <WorkspaceTabs
          tabs={WORKSPACE_TABS}
          currentMode={currentMode}
          onTabClick={handleTabClick}
        />

        <WorkspaceCarousel ref={containerRef} onScroll={handleScroll}>
          <SlideContainer isFirst>
            <TFTGuide />
          </SlideContainer>

          <SlideContainer>
            <Section title="팀 조합 추천" id="team-builder-section">
              <TeamBuilder />
            </Section>
          </SlideContainer>

          <SlideContainer>
            <Section title="후보 유닛 선택" id="champion-selector-section">
              <ChampionSelector mode="candidate" />
            </Section>
          </SlideContainer>

          <SlideContainer>
            <Section title="고정 유닛 선택">
              <ChampionSelector mode="fixed" />
            </Section>
          </SlideContainer>

          <SlideContainer>
            <Section title="">
              <FixedTraitSelector />
            </Section>
          </SlideContainer>
        </WorkspaceCarousel>
      </div>
    </MainLayout>
  );
}