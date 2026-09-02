import {
  useEffect,
  useId,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import MainLayout from "../layouts/MainLayout";
import Section from "../ui/Section";
import ChampionSelector from "../selector/champion-selector/ChampionSelector";
import { CHAMPION_SELECTOR_STRATEGIES } from "../selector/champion-selector/selectorStrategies";
import FixedTraitSelector from "../selector/fixed-trait-selector";
import TeamBuilder from "../team-builder/TeamBuilder";

import WorkspaceTabs from "./WorkspaceTabs";
import WorkspaceCarousel from "./WorkspaceCarousel";
import { useWorkspaceCarousel, type TabItem } from "./hooks/useWorkspaceCarousel";
import { useRuntimeDataRefresh } from "./hooks/useRuntimeDataRefresh";

import TFTGuide from "./guide/TFTGuide";
import DetailPopover from "../details/DetailPopover";
import { useAppI18n } from "../i18n/useAppI18n";
import LanguageSelector from "../i18n/LanguageSelector";
import "../styles/responsive.css";
import "../styles/wordpressButtonIsolation.css";

const WORKSPACE_TAB_IDS: readonly TabItem["id"][] = [
  "intro",
  "result",
  "candidate",
  "fixed",
  "trait",
];

const SLIDE_CLASS = "w-full shrink-0 snap-center snap-always";

interface SlideContainerProps {
  children: ReactNode;
  id: string;
  labelledBy: string;
  isActive: boolean;
  isMounted: boolean;
  isFirst?: boolean;
}

const SlideContainer = ({
  children,
  id,
  labelledBy,
  isActive,
  isMounted,
  isFirst = false,
}: SlideContainerProps) => (
    <div
      id={id}
      role="tabpanel"
      aria-labelledby={labelledBy}
      aria-hidden={!isActive}
      inert={!isActive}
      className={`${SLIDE_CLASS} ${isFirst ? "mt-4" : ""}`}
    >
      <div
        className={`tft-slide-content mx-auto w-full max-w-7xl ${
          isActive ? "" : "[content-visibility:hidden]"
        }`}
      >
        {isMounted ? children : null}
      </div>
    </div>
  );

export default function TftWorkspace() {
  useRuntimeDataRefresh();
  const { copy } = useAppI18n();
  const idPrefix = `tft-${useId().replace(/:/g, "")}`;
  const [detailPopoverHost, setDetailPopoverHost] =
    useState<HTMLDivElement | null>(null);
  const tabs = useMemo(
    () => WORKSPACE_TAB_IDS.map((id) => ({ id, label: copy.tabs[id] })),
    [copy.tabs],
  );
  const { containerRef, currentMode, mountedModes, handleTabClick, handleScroll } =
    useWorkspaceCarousel(tabs);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    if (!mountedModes.has(currentMode)) return;

    const activeIndex = tabs.findIndex((tab) => tab.id === currentMode);
    const activeSlide = container.children[activeIndex];
    if (!(activeSlide instanceof HTMLElement)) return;

    const content = activeSlide.querySelector(".tft-slide-content");
    if (!(content instanceof HTMLElement)) return;

    const shouldAnimateHeight = window.matchMedia("(min-width: 640px)").matches;
    container.style.willChange = shouldAnimateHeight ? "height" : "auto";
    container.style.overflowY = "hidden";
    container.style.transition = shouldAnimateHeight
      ? "height 0.2s ease-in-out"
      : "";
    let resizeFrame: number | null = null;

    const updateHeight = () => {
      if (resizeFrame !== null) cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(() => {
        container.style.height = `${content.scrollHeight}px`;
        resizeFrame = null;
      });
    };

    const resizeObserver = new ResizeObserver(updateHeight);
    resizeObserver.observe(content);
    updateHeight();

    return () => {
      resizeObserver.disconnect();
      if (resizeFrame !== null) cancelAnimationFrame(resizeFrame);
    };
  }, [containerRef, currentMode, mountedModes, tabs]);

  useEffect(
    () => () => {
      const container = containerRef.current;
      if (!container) return;
      container.style.willChange = "auto";
      container.style.overflowY = "";
      container.style.transition = "";
      container.style.height = "";
    },
    [containerRef],
  );

  return (
    <MainLayout>
      <div className="w-full overflow-x-hidden">
        <div className="mx-auto mb-5 w-full max-w-7xl px-1 sm:px-2">
          <WorkspaceTabs
            tabs={tabs}
            currentMode={currentMode}
            idPrefix={idPrefix}
            onTabClick={handleTabClick}
            className="mb-0 w-full"
          />
          <div className="mt-2 flex justify-end">
            <LanguageSelector />
          </div>
        </div>

        <WorkspaceCarousel ref={containerRef} onScroll={handleScroll}>
          <SlideContainer
            id={`${idPrefix}-panel-intro`}
            labelledBy={`${idPrefix}-tab-intro`}
            isActive={currentMode === "intro"}
            isMounted={mountedModes.has("intro")}
            isFirst
          >
            <TFTGuide />
          </SlideContainer>

          <SlideContainer
            id={`${idPrefix}-panel-result`}
            labelledBy={`${idPrefix}-tab-result`}
            isActive={currentMode === "result"}
            isMounted={mountedModes.has("result")}
          >
            <Section title={copy.team.sectionTitle}>
              <TeamBuilder />
            </Section>
          </SlideContainer>

          <SlideContainer
            id={`${idPrefix}-panel-candidate`}
            labelledBy={`${idPrefix}-tab-candidate`}
            isActive={currentMode === "candidate"}
            isMounted={mountedModes.has("candidate")}
          >
            <Section title={copy.selector.candidate.sectionTitle}>
              <ChampionSelector
                strategy={CHAMPION_SELECTOR_STRATEGIES.candidate}
              />
            </Section>
          </SlideContainer>

          <SlideContainer
            id={`${idPrefix}-panel-fixed`}
            labelledBy={`${idPrefix}-tab-fixed`}
            isActive={currentMode === "fixed"}
            isMounted={mountedModes.has("fixed")}
          >
            <Section title={copy.selector.fixed.sectionTitle}>
              <ChampionSelector
                strategy={CHAMPION_SELECTOR_STRATEGIES.fixed}
              />
            </Section>
          </SlideContainer>

          <SlideContainer
            id={`${idPrefix}-panel-trait`}
            labelledBy={`${idPrefix}-tab-trait`}
            isActive={currentMode === "trait"}
            isMounted={mountedModes.has("trait")}
          >
            <Section>
              <FixedTraitSelector />
            </Section>
          </SlideContainer>
        </WorkspaceCarousel>
      </div>
      <div ref={setDetailPopoverHost} data-detail-popover-host="" />
      <DetailPopover portalHost={detailPopoverHost} />
    </MainLayout>
  );
}
