import Stack from "../ui/Stack";
import TeamBuilderPanel from "./components/TeamBuilderPanel";
import TeamResultList from "./components/TeamResultList";
import { useTeamBuilder } from "./hooks/useTeamBuilder";
import RecommendationTabs from "./components/RecommendationTabs";

export default function TeamBuilder() {
  const {
    teamSize, setTeamSize, fixedChampions, results, run, loading,
    shuffleCandidates, setShuffleCandidates, champMap,
    needsRecalculation,
    maxTeamSize,
  } = useTeamBuilder();

  return (
    <Stack>
      <RecommendationTabs />
      <TeamBuilderPanel
        teamSize={teamSize}
        setTeamSize={setTeamSize}
        run={run}
        loading={loading}
        shuffleCandidates={shuffleCandidates}
        setShuffleCandidates={setShuffleCandidates}
        maxTeamSize={maxTeamSize}
      />

      <TeamResultList
        results={results}
        fixedChampions={fixedChampions}
        champMap={champMap}
        needsRecalculation={needsRecalculation}
       />
    </Stack>
  );
}
