import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  useSelectorModeStore,
  type SelectorMode,
} from "../../store/useSelectorModeStore";
import { getAdjacentSwipeIndex } from "../carouselNavigation";

export interface TabItem {
  id: SelectorMode;
  label: string;
}

const SNAP_TOLERANCE = 10;
const SCROLL_SETTLE_TOLERANCE_PX = 2;
const SCROLL_SETTLE_FALLBACK_MS = 900;

export const getWorkspaceNavigationBehavior = (
  viewportWidth: number,
  prefersReducedMotion = false,
): ScrollBehavior =>
  prefersReducedMotion || viewportWidth < 640 ? "auto" : "smooth";

const readWorkspaceNavigationBehavior = (): ScrollBehavior => {
  if (typeof window === "undefined") return "auto";
  return getWorkspaceNavigationBehavior(
    window.innerWidth,
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false,
  );
};

export const useWorkspaceCarousel = (tabs: TabItem[]) => {
  const mode = useSelectorModeStore((state) => state.mode);
  const setMode = useSelectorModeStore((state) => state.setMode);
  const containerRef = useRef<HTMLDivElement>(null);
  const isNavigatingRef = useRef(false);
  const navigationFrameRef = useRef<number | null>(null);
  const resizeFrameRef = useRef<number | null>(null);
  const settleFrameRef = useRef<number | null>(null);
  const settleTimerRef = useRef<number | null>(null);
  const targetModeRef = useRef(mode);
  const [mountedModes, setMountedModes] = useState<ReadonlySet<SelectorMode>>(
    () => new Set([mode]),
  );

  const mountMode = useCallback((targetMode: SelectorMode) => {
    setMountedModes((currentModes) => {
      if (currentModes.has(targetMode)) return currentModes;
      const nextModes = new Set(currentModes);
      nextModes.add(targetMode);
      return nextModes;
    });
  }, []);

  const cancelSettleWait = useCallback(() => {
    if (settleFrameRef.current !== null) {
      cancelAnimationFrame(settleFrameRef.current);
      settleFrameRef.current = null;
    }

    if (settleTimerRef.current !== null) {
      window.clearTimeout(settleTimerRef.current);
      settleTimerRef.current = null;
    }
  }, []);

  const finishNavigation = useCallback(() => {
    cancelSettleWait();
    isNavigatingRef.current = false;
  }, [cancelSettleWait]);

  const waitForScrollSettle = useCallback(
    (targetIndex: number) => {
      cancelSettleWait();

      const checkScrollPosition = () => {
        const container = containerRef.current;
        if (!container) {
          finishNavigation();
          return;
        }

        const targetLeft = container.clientWidth * targetIndex;
        if (
          Math.abs(container.scrollLeft - targetLeft) <=
          SCROLL_SETTLE_TOLERANCE_PX
        ) {
          finishNavigation();
          return;
        }

        settleFrameRef.current = requestAnimationFrame(checkScrollPosition);
      };

      settleFrameRef.current = requestAnimationFrame(checkScrollPosition);
      settleTimerRef.current = window.setTimeout(
        finishNavigation,
        SCROLL_SETTLE_FALLBACK_MS,
      );
    },
    [cancelSettleWait, finishNavigation],
  );

  const navigateTo = useCallback(
    (targetMode: SelectorMode, targetIndex: number, behavior: ScrollBehavior) => {
      const container = containerRef.current;
      if (!container || targetMode === targetModeRef.current) return;

      mountMode(targetMode);
      targetModeRef.current = targetMode;
      isNavigatingRef.current = true;
      setMode(targetMode);

      if (navigationFrameRef.current !== null) {
        cancelAnimationFrame(navigationFrameRef.current);
      }
      navigationFrameRef.current = requestAnimationFrame(() => {
        const currentContainer = containerRef.current;
        navigationFrameRef.current = null;
        if (!currentContainer) {
          finishNavigation();
          return;
        }

        currentContainer.scrollTo({
          left: currentContainer.clientWidth * targetIndex,
          behavior,
        });
        waitForScrollSettle(targetIndex);
      });
    },
    [finishNavigation, mountMode, setMode, waitForScrollSettle],
  );

  const handleTabClick = useCallback(
    (targetMode: SelectorMode, index: number) => {
      navigateTo(targetMode, index, readWorkspaceNavigationBehavior());
    },
    [navigateTo],
  );

  const handleScroll = useCallback(() => {
    const container = containerRef.current;
    if (!container || isNavigatingRef.current) return;

    const { scrollLeft, clientWidth } = container;
    if (clientWidth === 0) return;

    const snapOffset = scrollLeft % clientWidth;
    const isSnapped =
      snapOffset < SNAP_TOLERANCE || snapOffset > clientWidth - SNAP_TOLERANCE;

    if (!isSnapped) return;

    const index = Math.round(scrollLeft / clientWidth);
    const currentMode = tabs[index]?.id;
    if (!currentMode) return;

    targetModeRef.current = currentMode;
    if (mode !== currentMode) setMode(currentMode);
    mountMode(currentMode);
  }, [mode, mountMode, setMode, tabs]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let startPoint: { x: number; y: number } | null = null;

    const handleTouchStart = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (!touch) return;

      startPoint = { x: touch.clientX, y: touch.clientY };
    };

    const handleTouchEnd = (event: TouchEvent) => {
      const touch = event.changedTouches[0];
      if (!startPoint || !touch) {
        startPoint = null;
        return;
      }

      const currentIndex = tabs.findIndex((tab) => tab.id === mode);
      const targetIndex = getAdjacentSwipeIndex({
        currentIndex,
        itemCount: tabs.length,
        deltaX: touch.clientX - startPoint.x,
        deltaY: touch.clientY - startPoint.y,
      });

      startPoint = null;

      if (targetIndex !== currentIndex) {
        const targetTab = tabs[targetIndex];
        if (targetTab) handleTabClick(targetTab.id, targetIndex);
      }
    };

    const handleTouchCancel = () => {
      startPoint = null;
    };

    container.addEventListener("touchstart", handleTouchStart, { passive: true });
    container.addEventListener("touchend", handleTouchEnd, { passive: true });
    container.addEventListener("touchcancel", handleTouchCancel, { passive: true });

    return () => {
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchend", handleTouchEnd);
      container.removeEventListener("touchcancel", handleTouchCancel);
    };
  }, [handleTabClick, mode, tabs]);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container || mode === targetModeRef.current) return;

    const index = tabs.findIndex((tab) => tab.id === mode);
    if (index < 0) return;

    const frame = requestAnimationFrame(() => {
      navigateTo(mode, index, readWorkspaceNavigationBehavior());
    });
    return () => cancelAnimationFrame(frame);
  }, [mode, navigateTo, tabs]);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let previousWidth = container.clientWidth;
    const resizeObserver = new ResizeObserver(() => {
      const nextWidth = container.clientWidth;
      if (nextWidth === 0 || nextWidth === previousWidth) return;

      previousWidth = nextWidth;
      const index = tabs.findIndex((tab) => tab.id === mode);
      if (index < 0) return;

      if (resizeFrameRef.current !== null) {
        cancelAnimationFrame(resizeFrameRef.current);
      }

      isNavigatingRef.current = true;
      container.scrollTo({ left: nextWidth * index, behavior: "auto" });
      resizeFrameRef.current = requestAnimationFrame(() => {
        isNavigatingRef.current = false;
        resizeFrameRef.current = null;
      });
    });

    resizeObserver.observe(container);
    return () => {
      resizeObserver.disconnect();
      if (resizeFrameRef.current !== null) {
        cancelAnimationFrame(resizeFrameRef.current);
        resizeFrameRef.current = null;
      }
    };
  }, [mode, tabs]);

  useEffect(
    () => () => {
      cancelSettleWait();
      if (navigationFrameRef.current !== null) {
        cancelAnimationFrame(navigationFrameRef.current);
      }
      if (resizeFrameRef.current !== null) {
        cancelAnimationFrame(resizeFrameRef.current);
      }
    },
    [cancelSettleWait],
  );

  return {
    containerRef,
    currentMode: mode,
    mountedModes,
    handleTabClick,
    handleScroll,
  };
};
