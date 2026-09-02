import Text from "../../../ui/Text";
import Button from "../../../ui/Button";
import { formatTeamScore } from "../../scoreFormatting";
import { useAppI18n } from "../../../i18n/useAppI18n";

interface TeamResultHeaderProps {
  score: number;
  onApply: () => void;
}

export default function TeamResultHeader({
  score,
  onApply,
}: TeamResultHeaderProps) {
  const { copy } = useAppI18n();
  return (
    <div className="mb-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <Text variant="label" className="text-purple-400 opacity-100">
            {copy.team.score}
          </Text>
          <Text
            variant="score"
            className="mt-1 block leading-none tabular-nums"
          >
            {formatTeamScore(score)}
          </Text>
        </div>

        <Button
          onClick={onApply}
          variant="secondary"
          className="h-auto min-h-11 px-4 sm:px-6 rounded-xl"
        >
          <Text variant="badge">{copy.team.applyAsFixed}</Text>
        </Button>
      </div>
    </div>
  );
}
