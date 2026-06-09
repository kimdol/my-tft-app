import { useEffect } from "react";
import MainLayout from "../layouts/MainLayout";
import Section from "../ui/Section";
import ChampionSelector from "../selector/champion-selector/ChampionSelector";
import FixedTraitSelector from "../selector/fixed-trait-selector";
import TeamBuilder from "../team-builder/TeamBuilder";

import WorkspaceTabs from "./WorkspaceTabs";
import WorkspaceCarousel from "./WorkspaceCarousel";
import {
  useWorkspaceCarousel,
  type TabItem,
} from "./hooks/useWorkspaceCarousel";

import TFTGuide from "./guide/TFTGuide";

export default function TftWorkspace() {
  const tabs: TabItem[] = [
    { id: "intro", label: "가이드" },
    { id: "result", label: "조합 추천" },
    { id: "candidate", label: "후보 유닛" },
    { id: "fixed", label: "고정 유닛" },
    { id: "trait", label: "추가 상징" },
  ];

  const { containerRef, currentMode, handleTabClick, handleScroll } =
    useWorkspaceCarousel(tabs);

  const slideClass = "w-full shrink-0 snap-center snap-always";

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const activeIndex = tabs.findIndex((tab) => tab.id === currentMode);
    const activeSlide = container.children[activeIndex] as HTMLElement;
    if (!activeSlide) return;

    container.style.willChange = "height";

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        container.style.overflowY = "hidden";
        container.style.transition = "height 0.2s ease-in-out";
        container.style.height = `${entry.contentRect.height}px`;
      }
    });

    resizeObserver.observe(activeSlide);

    return () => {
      resizeObserver.disconnect();
    };
  }, [currentMode, tabs, containerRef]);

  return (
    <MainLayout>
      <div className="w-full overflow-x-hidden touch-pan-y">
        <WorkspaceTabs
          tabs={tabs}
          currentMode={currentMode}
          onTabClick={handleTabClick}
        />

        <WorkspaceCarousel ref={containerRef} onScroll={handleScroll}>
          <div className={`${slideClass} mt-4`}>
            <div className="mx-auto w-full max-w-7xl px-2 md:px-6 lg:px-8">
              <TFTGuide />
            </div>
          </div>

          <div className={slideClass}>
            <div className="mx-auto w-full max-w-7xl px-2 md:px-6 lg:px-8">
              <Section title="팀 조합 추천" id="team-builder-section">
                <TeamBuilder />
              </Section>
            </div>
          </div>

          <div className={slideClass}>
            <div className="mx-auto w-full max-w-7xl px-2 md:px-6 lg:px-8">
              <Section title="후보 유닛 선택" id="champion-selector-section">
                <ChampionSelector mode="candidate" />
              </Section>
            </div>
          </div>

          <div className={slideClass}>
            <div className="mx-auto w-full max-w-7xl px-2 md:px-6 lg:px-8">
              <Section title="고정 유닛 선택">
                <ChampionSelector mode="fixed" />
              </Section>
            </div>
          </div>

          <div className={slideClass}>
            <div className="mx-auto w-full max-w-7xl px-2 md:px-6 lg:px-8">
              <Section title="">
                <FixedTraitSelector />
              </Section>
            </div>
          </div>
        </WorkspaceCarousel>
      </div>
    </MainLayout>
  );
}
