import Text from "../../ui/Text";
import ResponsiveGrid from "../../ui/ResponsiveGrid";
import { TeamResultCard } from "./team-result-card";

import type { BeamSearchResult } from "../../core/beamSearchOptimizer";
import type { Champion } from "../../domain/champion";
import { useAppI18n } from "../../i18n/useAppI18n";

interface Props {
  results: readonly BeamSearchResult[];
  fixedChampions: ReadonlySet<string>;
  champMap: ReadonlyMap<string, Champion>;
  needsRecalculation: boolean;
}

export default function TeamResultList({
  results,
  fixedChampions,
  champMap,
  needsRecalculation,
}: Props) {
  const { copy } = useAppI18n();
  if (!results || results.length === 0) {
    return (
      <Text
        as="div"
        variant="body"
        role={needsRecalculation ? "status" : undefined}
        className="text-center opacity-80 py-12 pb-24"
      >
        {needsRecalculation
          ? copy.team.staleResults
          : copy.team.emptyResults}
      </Text>
    );
  }

  return (
    <div className="pb-20">
      <ResponsiveGrid>
        {results.map((r) => (
          <TeamResultCard 
            key={r.node.key()} 
            result={r} 
            fixedChampions={fixedChampions}
            champMap={champMap}
          />
        ))}
      </ResponsiveGrid>
    </div>
  );
}
