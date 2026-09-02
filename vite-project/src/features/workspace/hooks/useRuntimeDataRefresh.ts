import { useEffect } from "react";
import { useTFTBuilderStore } from "../../store/useTFTBuilderStore";
import { useRuntimeSettingsStore } from "../../config/runtimeSettings";

const FOREGROUND_REFRESH_DEDUPLICATION_MS = 15 * 1000;

let lastRuntimeRefreshAt = 0;

export const useRuntimeDataRefresh = (): void => {
  const fetchAll = useTFTBuilderStore((state) => state.fetchAll);
  const refreshAll = useTFTBuilderStore((state) => state.refreshAll);
  const refreshSettings = useRuntimeSettingsStore((state) => state.refresh);

  useEffect(() => {
    const loadInitialData = async () => {
      const currentStatus = useTFTBuilderStore.getState().dataStatus;
      if (
        currentStatus === "success" ||
        currentStatus === "empty" ||
        currentStatus === "partial"
      ) {
        await Promise.all([refreshAll(), refreshSettings()]);
      } else {
        await Promise.all([fetchAll(), refreshSettings()]);
      }
      lastRuntimeRefreshAt = Date.now();
    };
    void loadInitialData();

    const refreshIfStale = () => {
      if (document.visibilityState === "hidden") return;
      const now = Date.now();
      if (
        now - lastRuntimeRefreshAt <
        FOREGROUND_REFRESH_DEDUPLICATION_MS
      ) {
        return;
      }
      lastRuntimeRefreshAt = now;
      void Promise.all([refreshAll(), refreshSettings()]);
    };

    document.addEventListener("visibilitychange", refreshIfStale);
    window.addEventListener("focus", refreshIfStale);
    window.addEventListener("online", refreshIfStale);
    return () => {
      document.removeEventListener("visibilitychange", refreshIfStale);
      window.removeEventListener("focus", refreshIfStale);
      window.removeEventListener("online", refreshIfStale);
    };
  }, [fetchAll, refreshAll, refreshSettings]);
};
