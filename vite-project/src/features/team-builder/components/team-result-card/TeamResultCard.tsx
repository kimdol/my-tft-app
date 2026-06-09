import Card from "../../../ui/Card";
import { layout } from "../../../styles/layout";

import TeamResultHeader from "./TeamResultHeader";
import ChampionItem from "./ChampionItem";
import TraitChip from "./TraitChip";

import { getTraitCountMap } from "../../../core/traitEvaluator";
import { getTraitTier } from "../../../core/traitTierUtils";
import { useTFTBuilderStore } from "../../../store/useTFTBuilderStore";

import { useSelectorModeStore } from "../../../store/useSelectorModeStore";

interface Props {
  selectedTraits: Map<string, number>;
  result: any;
}

export default function TeamResultCard({ result, selectedTraits }: Props) {
  const { champions, traits, selectTeam } = useTFTBuilderStore();
  const { setMode } = useSelectorModeStore();

  const champMap = new Map(champions.map((c) => [c.id, c]));
  const traitMap = new Map(traits.map((t) => [t.name, t]));

  const traitCount = getTraitCountMap(result.node, champMap);

  selectedTraits.forEach((count, traitName) => {
    const currentCount = traitCount.get(traitName) || 0;
    traitCount.set(traitName, currentCount + count);
  });

  const activeTraits = [...traitCount.entries()]
    .map(([name, count]) => {
      const trait = traitMap.get(name);
      if (!trait) return null;
      const tier = getTraitTier(trait, count);
      return tier >= 0 ? { name, count, trait, tier } : null;
    })
    .filter(Boolean)
    .sort((a: any, b: any) => {
      if (b.count !== a.count) return b.count - a.count;
      return b.tier - a.tier;
    });

  const sortedChampions = result.node
    .toArray()
    .map((id: string) => champMap.get(id))
    .filter(Boolean)
    .sort((a: any, b: any) => a.cost - b.cost);

  const handleApplyTeam = () => {
    const ids = result.node.toArray();
    selectTeam(ids);

    setMode("candidate");
  };

  return (
    <div
      className="w-full transform-gpu"
      style={{
        contentVisibility: "auto",
        containIntrinsicSize: "0 500px",
      }}
    >
      <Card>
        <TeamResultHeader score={result.score} onApply={handleApplyTeam} />

        <div className={layout.championGrid}>
          {sortedChampions.map((champ: any) => (
            <ChampionItem key={champ.id} name={champ.name} cost={champ.cost} />
          ))}
        </div>

        <div className="flex flex-wrap gap-1.5 mt-3">
          {activeTraits.map((t: any) => (
            <TraitChip key={t.name} trait={t} />
          ))}
        </div>
      </Card>
    </div>
  );
}
