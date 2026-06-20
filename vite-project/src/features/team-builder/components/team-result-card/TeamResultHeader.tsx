import Text from "../../../ui/Text";
import Button from "../../../ui/Button";

interface TeamResultHeaderProps {
  score: number;
  onApply: () => void;
}

export default function TeamResultHeader({ score, onApply }: TeamResultHeaderProps) {
  return (
    <div className="flex justify-between items-center mb-6">
      <div className="flex flex-col">
        <Text variant="label" className="text-purple-400 opacity-100">
          TEAM SCORE
        </Text>
        <Text variant="score" className="leading-none mt-1">
          {score}
        </Text>
      </div>

      <Button
        onClick={onApply}
        variant="secondary"
        className="h-10 px-6 rounded-xl"
      >
        <Text variant="badge">구성 적용</Text>
      </Button>
    </div>
  );
}
