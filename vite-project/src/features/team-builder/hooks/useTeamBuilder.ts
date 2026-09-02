import { useCallback, useEffect, useMemo } from "react";
import { useTFTBuilderStore } from '../../store/useTFTBuilderStore';
import { findBestCombinationBeam } from '../../core/beamSearchOptimizer';
import { createShuffleSeed } from '../../core/candidateOrder';
import {
  isRecommendationSnapshotCurrent,
  useRecommendationStore,
} from "../recommendationStore";
import { createRecommendationInputSignature } from "../recommendationSignature";
import {
  toScoreWeights,
  useRuntimeSettingsStore,
} from "../../config/runtimeSettings";

export const useTeamBuilder = () => {
  const champions = useTFTBuilderStore((state) => state.champions);
  const traits = useTFTBuilderStore((state) => state.traits);
  const selectedChampions = useTFTBuilderStore(
    (state) => state.selectedChampions,
  );
  const fixedChampions = useTFTBuilderStore((state) => state.fixedChampions);
  const selectedTraits = useTFTBuilderStore((state) => state.selectedTraits);
  const runtimeSettings = useRuntimeSettingsStore(
    (state) => state.recommendation,
  );
  const runtimeSettingsVersion = useRuntimeSettingsStore(
    (state) => state.version,
  );
  const activeTabId = useRecommendationStore((state) => state.activeTabId);

  const teamSize = useRecommendationStore((state) => state.teamSize);
  const setStoredTeamSize = useRecommendationStore(
    (state) => state.setTeamSize,
  );
  const setTeamSize = useCallback(
    (value: number) => setStoredTeamSize(value, runtimeSettings.maxTeamSize),
    [runtimeSettings.maxTeamSize, setStoredTeamSize],
  );
  const shuffleCandidates = useRecommendationStore(
    (state) => state.shuffleCandidates,
  );
  const setShuffleCandidates = useRecommendationStore(
    (state) => state.setShuffleCandidates,
  );
  const snapshot = useRecommendationStore((state) => state.snapshot);
  const loading = useRecommendationStore((state) => state.loading);
  const storedNeedsRecalculation = useRecommendationStore(
    (state) => state.needsRecalculation,
  );
  const startRecommendation = useRecommendationStore(
    (state) => state.startRecommendation,
  );
  const completeRecommendation = useRecommendationStore(
    (state) => state.completeRecommendation,
  );
  const failRecommendation = useRecommendationStore(
    (state) => state.failRecommendation,
  );
  const invalidateRecommendation = useRecommendationStore(
    (state) => state.invalidateRecommendation,
  );
  const applyRuntimeLimits = useRecommendationStore(
    (state) => state.applyRuntimeLimits,
  );

  useEffect(() => {
    applyRuntimeLimits(
      runtimeSettings.defaultTeamSize,
      runtimeSettings.maxTeamSize,
    );
  }, [applyRuntimeLimits, runtimeSettings.defaultTeamSize, runtimeSettings.maxTeamSize]);

  const champMap = useMemo(() => new Map(champions.map((c) => [c.id, c])), [champions]);

  const fixedChampList = useMemo(() => {
    return champions.filter(c => fixedChampions.has(c.id));
  }, [champions, fixedChampions]);

  const selected = useMemo(() => {
    return champions.filter(c => selectedChampions.has(c.id));
  }, [champions, selectedChampions]);

  const inputSignature = useMemo(
    () =>
      createRecommendationInputSignature({
        champions,
        traits,
        selectedChampionIds: selectedChampions,
        fixedChampionIds: fixedChampions,
        selectedTraits,
        teamSize,
        shuffleCandidates,
        runtimeSettings,
        runtimeSettingsVersion,
      }),
    [
      champions,
      traits,
      selectedChampions,
      fixedChampions,
      selectedTraits,
      teamSize,
      shuffleCandidates,
      runtimeSettings,
      runtimeSettingsVersion,
    ],
  );
  const hasCurrentSnapshot = isRecommendationSnapshotCurrent(
    snapshot,
    inputSignature,
  );
  const hasStaleSnapshot = snapshot !== null && !hasCurrentSnapshot;
  const results = hasCurrentSnapshot ? snapshot.results : [];
  const needsRecalculation =
    storedNeedsRecalculation || hasStaleSnapshot;

  useEffect(() => {
    if (hasStaleSnapshot) invalidateRecommendation();
  }, [hasStaleSnapshot, invalidateRecommendation]);

  const run = useCallback(async () => {
    if (!champions.length) return;

    const targetTabId = activeTabId;
    startRecommendation(targetTabId);
    
    await new Promise((resolve) => setTimeout(resolve, 10));

    try {
      const res = findBestCombinationBeam(
        fixedChampList,
        selectedTraits,
        selected,
        traits,
        teamSize,
        {
          beamWidth: runtimeSettings.beamWidth,
          resultLimit: runtimeSettings.resultLimit,
          scoreWeights: toScoreWeights(runtimeSettings),
          shuffleCandidates,
          seed: shuffleCandidates ? createShuffleSeed() : undefined,
        },
      );
      completeRecommendation(res, inputSignature, targetTabId);
    } catch (error) {
      failRecommendation(targetTabId);
      throw error;
    }
  }, [
    champions.length,
    fixedChampList,
    selectedTraits,
    selected,
    traits,
    teamSize,
    shuffleCandidates,
    inputSignature,
    activeTabId,
    runtimeSettings,
    startRecommendation,
    completeRecommendation,
    failRecommendation,
  ]);

  return {
    teamSize,
    setTeamSize,
    selectedTraits,
    fixedChampions,
    results,
    needsRecalculation,
    run,
    loading,
    shuffleCandidates,
    setShuffleCandidates,
    champMap,
    maxTeamSize: runtimeSettings.maxTeamSize,
  };
};
