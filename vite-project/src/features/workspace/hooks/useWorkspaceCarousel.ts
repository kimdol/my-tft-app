import { useRef, useEffect } from "react";
import {
  useSelectorModeStore,
  type SelectorMode,
} from "../../store/useSelectorModeStore";

export interface TabItem {
  id: SelectorMode;
  label: string;
}

export const useWorkspaceCarousel = (tabs: TabItem[]) => {
  const { mode, setMode } = useSelectorModeStore();
  const containerRef = useRef<HTMLDivElement>(null);

  const isClickingRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const cancelClickLock = () => {
      if (isClickingRef.current) {
        isClickingRef.current = false;
        if (timerRef.current) clearTimeout(timerRef.current);
      }
    };

    container.addEventListener("touchstart", cancelClickLock, {
      passive: true,
    });
    container.addEventListener("wheel", cancelClickLock, { passive: true });

    return () => {
      container.removeEventListener("touchstart", cancelClickLock);
      container.removeEventListener("wheel", cancelClickLock);
    };
  }, []);

  useEffect(() => {
    if (!containerRef.current || isClickingRef.current) return;

    const index = tabs.findIndex((tab) => tab.id === mode);
    if (index === -1) return;

    const width = containerRef.current.clientWidth;
    const currentScrollLeft = containerRef.current.scrollLeft;

    if (Math.abs(currentScrollLeft - width * index) > 10) {
      containerRef.current.scrollTo({
        left: width * index,
        behavior: "smooth",
      });
    }
  }, [mode, tabs]);

  const handleTabClick = (targetMode: SelectorMode, index: number) => {
    if (mode === targetMode) return;

    const currentIndex = tabs.findIndex((tab) => tab.id === mode);
    const jumpCount = Math.abs(index - currentIndex);

    isClickingRef.current = true;
    setMode(targetMode);

    if (containerRef.current) {
      const width = containerRef.current.clientWidth;
      containerRef.current.scrollTo({
        left: width * index,
        behavior: "smooth",
      });
    }

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    const delay = 200 + jumpCount * 300;

    timerRef.current = setTimeout(() => {
      isClickingRef.current = false;
    }, delay);
  };

  const handleScroll = () => {
    if (!containerRef.current || isClickingRef.current) return;

    const { scrollLeft, clientWidth } = containerRef.current;
    if (clientWidth === 0) return;

    const snapOffset = scrollLeft % clientWidth;
    const isSnapped = snapOffset < 10 || snapOffset > clientWidth - 10;

    if (isSnapped) {
      const index = Math.round(scrollLeft / clientWidth);
      const currentMode = tabs[index]?.id;
      if (currentMode && mode !== currentMode) {
        setMode(currentMode);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return {
    containerRef,
    currentMode: mode,
    handleTabClick,
    handleScroll,
  };
};
