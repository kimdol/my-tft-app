import { useState, useMemo, useCallback } from 'react';
import { useTFTBuilderStore } from '../../store/useTFTBuilderStore';
import { findBestCombinationBeam, type BeamSearchResult } from '../../core/beamSearchOptimizer';

export const useTeamBuilder = () => {
  const { champions, traits, selectedChampions, fixedChampions, selectedTraits } = useTFTBuilderStore();

  const [teamSize, setTeamSize] = useState(4);
  const [results, setResults] = useState<BeamSearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const champMap = useMemo(() => new Map(champions.map((c) => [c.id, c])), [champions]);
  const traitMap = useMemo(() => new Map(traits.map((t) => [t.name, t])), [traits]);

  const fixedChampList = useMemo(() => {
    return champions.filter(c => fixedChampions.has(c.id));
  }, [champions, fixedChampions]);

  const selected = useMemo(() => {
    return champions.filter(c => selectedChampions.has(c.id));
  }, [champions, selectedChampions]);

  const run = useCallback(async () => {
    if (!champions.length) return;

    setLoading(true);
    
    await new Promise((resolve) => setTimeout(resolve, 10));

    try {
      const res = findBestCombinationBeam(
        fixedChampList,
        selectedTraits,
        selected,
        traits,
        teamSize
      );
      setResults(res);
    } finally {
      setLoading(false);
    }
  }, [champions.length, fixedChampList, selectedTraits, selected, traits, teamSize]);

  return {
    teamSize,
    setTeamSize,
    selectedTraits, 
    results,
    run,
    loading,
    champMap,
    traitMap
  };
};