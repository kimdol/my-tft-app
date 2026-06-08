import Text from "../../ui/Text";

import ResponsiveGrid from "../../ui/ResponsiveGrid";
import { TeamResultCard } from "./team-result-card";

interface Props {
  selectedTraits: Map<string, number>;
  results: any[];
}

export default function TeamResultList({ selectedTraits, results }: Props) {
  if (!results || results.length === 0) {
    return (
      <Text as="div" variant="body" className="text-center opacity-80 py-12 pb-24">
        최적의 팀 결과가 여기에 표시됩니다.
      </Text>
    );
  }

  return (
    <div className="pb-20">
      <ResponsiveGrid>
        {results.map((r: any, i: number) => (
          <TeamResultCard key={i} result={r} selectedTraits={selectedTraits} />
        ))}
      </ResponsiveGrid>
    </div>
  );
}
