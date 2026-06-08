import Stack from "../ui/Stack";
import TeamBuilderPanel from "./components/TeamBuilderPanel";
import TeamResultList from "./components/TeamResultList";
import { useTeamBuilder } from "./hooks/useTeamBuilder";

export default function TeamBuilder() {
  const { teamSize, setTeamSize, selectedTraits, results, run, loading } = useTeamBuilder();

  return (
    <Stack>

      <TeamBuilderPanel
        teamSize={teamSize}
        setTeamSize={setTeamSize}
        run={run}
        loading={loading}
      />

      <TeamResultList 
        results={results} 
        selectedTraits={selectedTraits}
       />
       
    </Stack>
  );
}
