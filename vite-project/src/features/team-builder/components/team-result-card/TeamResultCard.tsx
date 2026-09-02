import { useMemo } from "react";
import Card from "../../../ui/Card";
import { layout } from "../../../styles/layout";
import TeamResultHeader from "./TeamResultHeader";
import ChampionItem from "./ChampionItem";
import TraitChip from "./TraitChip";
import { useTFTBuilderStore } from "../../../store/useTFTBuilderStore";
import { useSelectorModeStore } from "../../../store/useSelectorModeStore";
import type { BeamSearchResult } from "../../../core/beamSearchOptimizer";
import type { Champion } from "../../../domain/champion";
import type { ChampionCardViewModel } from "../../view-models/championCardViewModel";
import { createRecommendedUnitGroups } from "../../view-models/recommendedUnitGroups";
import { useAppI18n } from "../../../i18n/useAppI18n";

interface Props {
  result: BeamSearchResult;
  champMap: ReadonlyMap<string, Champion>;
  fixedChampions: ReadonlySet<string>;
}

interface UnitGroupProps {
  kind: "fixed" | "candidate";
  label: string;
  units: readonly ChampionCardViewModel[];
  onRemove: (id: string) => void;
}

const UnitGroup = ({ kind, label, units, onRemove }: UnitGroupProps) => {
  const { copy, formatCount } = useAppI18n();
  if (units.length === 0) return null;

  return (
    <section
      data-result-unit-group={kind}
      aria-label={`${label} ${formatCount(units.length)}`}
    >
      <div className="mb-2 flex items-center gap-2">
        <h3 className="shrink-0 text-xs font-black text-white/60">
          {label}
        </h3>
        <span
          aria-hidden="true"
          className="h-px min-w-0 flex-1 bg-white/10"
        />
        <span className="text-[10px] font-bold tabular-nums text-white/35">
          {units.length}
        </span>
      </div>
      <div className={layout.championGrid}>
        {units.map((champion) => (
          <ChampionItem
            key={champion.id}
            champion={champion}
            removeLabel={`${label} ${copy.selector.removeSelection}`}
            onRemove={onRemove}
          />
        ))}
      </div>
    </section>
  );
};

export default function TeamResultCard({
  result,
  champMap,
  fixedChampions,
}: Props) {
  const { copy } = useAppI18n();
  const applyTeamAsFixed = useTFTBuilderStore(
    (state) => state.applyTeamAsFixed,
  );
  const removeCandidate = useTFTBuilderStore((state) => state.toggle);
  const removeFixed = useTFTBuilderStore((state) => state.toggleFixed);
  const setMode = useSelectorModeStore((state) => state.setMode);
  const unitGroups = useMemo(
    () =>
      createRecommendedUnitGroups(
        result.node.toArray(),
        champMap,
        fixedChampions,
      ),
    [result.node, champMap, fixedChampions],
  );

  const handleApplyTeam = () => {
    applyTeamAsFixed(result.node.toArray());
    setMode("fixed");
  };

  return (
    <div className="w-full">
      <Card>
        <TeamResultHeader
          score={result.score}
          onApply={handleApplyTeam}
        />

        <div className="space-y-4">
          <UnitGroup
            kind="fixed"
            label={copy.team.fixedUnits}
            units={unitGroups.fixedUnits}
            onRemove={removeFixed}
          />
          <UnitGroup
            kind="candidate"
            label={copy.team.recommendedUnits}
            units={unitGroups.candidateUnits}
            onRemove={removeCandidate}
          />
        </div>

        <div className={layout.traitRow}>
          {result.activeTraits.map((trait) => (
            <TraitChip key={trait.name} trait={trait} />
          ))}
        </div>
      </Card>
    </div>
  );
}
