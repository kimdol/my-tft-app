import Panel from "../../ui/Panel";
import Text from "../../ui/Text";
import { NumberInput } from "../../ui/NumberInput";
import Button from "../../ui/Button";

interface Props {
  teamSize: number;
  setTeamSize: (n: number) => void;
  run: () => void;
  loading: boolean;
}

export default function TeamBuilderPanel({
  teamSize,
  setTeamSize,
  run,
  loading,
}: Props) {
  const handleSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const parsed = parseInt(e.target.value, 10);
    let value = isNaN(parsed) ? 0 : parsed;
    
    if (value > 15) value = 15;
    if (value < 0) value = 0;
    
    setTeamSize(value);
  };

  return (
    <Panel className="flex items-stretch gap-4">
      <div
        className="flex items-center gap-4 px-6 py-4 bg-white/5 rounded-2xl w-full max-w-[520px]"
      >
        <Text variant="heading">인원 수</Text>
        <div className="relative flex-1">
          <NumberInput
            value={teamSize === 0 ? "" : teamSize}
            onChange={handleSizeChange}
            className="text-center w-full"
          />
          <div className="absolute -bottom-1 left-0 w-full h-[2px] bg-gradient-to-r from-purple-500 via-purple-400 to-purple-600 shadow-[0_0_8px_rgba(168,85,247,0.4)]" />
        </div>
      </div>

      <Button
        onClick={run}
        loading={loading}
        className="min-w-[220px] min-h-[72px] px-8 h-auto shrink-0"
      >
        <Text variant="heading" className="text-black text-[28px] tracking-[-0.02em]">
          {loading ? "조합 분석 중..." : "최적 팀 구성 →"}
        </Text>
      </Button>
    </Panel>
  );
}