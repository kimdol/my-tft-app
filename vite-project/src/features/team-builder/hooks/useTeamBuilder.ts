import { useState } from 'react';
import { useTFTBuilderStore } from '../../store/useTFTBuilderStore';
import { findBestCombinationBeam } from '../../core/beamSearchOptimizer';

export const useTeamBuilder = () => {
  const { champions, traits, selectedChampions, fixedChampions, selectedTraits  } = useTFTBuilderStore();

  const [teamSize, setTeamSize] = useState(4);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fixedChampList = champions.filter(c => fixedChampions.has(c.id));
  const selected = champions.filter(c => selectedChampions.has(c.id));

  const run = async () => {
    if (!champions.length) return;

    setLoading(true);

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
  };

  return {
    teamSize,
    setTeamSize,
    fixedChampList,
    selectedTraits, 
    results,
    run,
    loading
  };
};
