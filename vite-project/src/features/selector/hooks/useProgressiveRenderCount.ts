import { useCallback, useEffect, useState } from "react";

export interface ProgressiveRenderProfile {
  readonly mobile: number;
  readonly tablet: number;
  readonly desktop: number;
}

export const CHAMPION_PROGRESSIVE_PROFILE: ProgressiveRenderProfile = {
  mobile: 8,
  tablet: 12,
  desktop: 18,
};

export const TRAIT_PROGRESSIVE_PROFILE: ProgressiveRenderProfile = {
  mobile: 6,
  tablet: 10,
  desktop: 14,
};

export const getProgressivePageSize = (
  profile: ProgressiveRenderProfile,
  viewportWidth: number,
) => {
  if (viewportWidth < 640) return profile.mobile;
  if (viewportWidth < 1024) return profile.tablet;
  return profile.desktop;
};

const getViewportWidth = () => {
  if (typeof window === "undefined" || !Number.isFinite(window.innerWidth)) {
    return 1024;
  }
  return window.innerWidth;
};

interface UseProgressiveRenderCountOptions {
  readonly totalCount: number;
  readonly resetKey: string;
  readonly profile: ProgressiveRenderProfile;
}

export const useProgressiveRenderCount = ({
  totalCount,
  resetKey,
  profile,
}: UseProgressiveRenderCountOptions) => {
  const getPageSize = useCallback(
    () => getProgressivePageSize(profile, getViewportWidth()),
    [profile],
  );
  const [renderCount, setRenderCount] = useState(() =>
    Math.min(totalCount, getPageSize()),
  );
  const [sentinelNode, setSentinelNode] = useState<HTMLLIElement | null>(null);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setRenderCount(Math.min(totalCount, getPageSize()));
    });
    return () => cancelAnimationFrame(frame);
  }, [getPageSize, resetKey, totalCount]);

  useEffect(() => {
    const handleResize = () => {
      setRenderCount((current) =>
        Math.min(totalCount, Math.max(current, getPageSize())),
      );
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [getPageSize, totalCount]);

  const sentinelRef = useCallback((node: HTMLLIElement | null) => {
    setSentinelNode(node);
  }, []);

  useEffect(() => {
    if (!sentinelNode || renderCount >= totalCount) return;

    const renderNextPage = () => {
      setRenderCount((current) => Math.min(totalCount, current + getPageSize()));
    };

    const IntersectionObserverConstructor = globalThis.IntersectionObserver;
    if (typeof IntersectionObserverConstructor === "function") {
      const observer = new IntersectionObserverConstructor(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) renderNextPage();
        },
        { rootMargin: "0px 0px 240px" },
      );
      observer.observe(sentinelNode);
      return () => observer.disconnect();
    }

    let frame: number | null = null;
    const handleScroll = () => {
      if (frame !== null) return;
      frame = requestAnimationFrame(() => {
        frame = null;
        const bounds = sentinelNode.getBoundingClientRect();
        if (bounds.top <= window.innerHeight + 240 && bounds.bottom >= -48) {
          renderNextPage();
        }
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, [getPageSize, renderCount, sentinelNode, totalCount]);

  return {
    renderCount,
    hasMore: renderCount < totalCount,
    sentinelRef,
  };
};
