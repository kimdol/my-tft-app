import { useMemo } from "react";
import Card from "../../../ui/Card";
import { layout } from "../../../styles/layout";

import TeamResultHeader from "./TeamResultHeader";
import ChampionItem from "./ChampionItem";
import TraitChip, { type ActiveTraitData } from "./TraitChip";

import { getTraitCountMap } from "../../../core/traitEvaluator";
import { getTraitTier } from "../../../core/traitTierUtils";
import { useTFTBuilderStore } from "../../../store/useTFTBuilderStore";
import { useSelectorModeStore } from "../../../store/useSelectorModeStore";

import type { BeamSearchResult } from "../../../core/beamSearchOptimizer";
import type { Champion } from "../../../selector/champion-selector/types";
import type { TFTTrait } from "../../../api/tftApi";

interface Props {
  selectedTraits: Map<string, number>;
  result: BeamSearchResult;
  champMap: Map<string, Champion>;
  traitMap: Map<string, TFTTrait>;
}

export default function TeamResultCard({ result, selectedTraits, champMap, traitMap }: Props) {
  const selectTeam = useTFTBuilderStore((state) => state.selectTeam);
  const setMode = useSelectorModeStore((state) => state.setMode);

  const activeTraits = useMemo(() => {
    const traitCount = getTraitCountMap(result.node, champMap);

    selectedTraits.forEach((count, traitName) => {
      const currentCount = traitCount.get(traitName) || 0;
      traitCount.set(traitName, currentCount + count);
    });

    return [...traitCount.entries()]
      .map(([name, count]): ActiveTraitData | null => {
        const trait = traitMap.get(name);
        if (!trait) return null;
        const tier = getTraitTier(trait, count);
        return tier >= 0 ? { name, count, trait, tier } : null;
      })
      .filter((item): item is ActiveTraitData => item !== null) 
      .sort((a, b) => {
        if (b.count !== a.count) return b.count - a.count;
        return b.tier - a.tier;
      });
  }, [result.node, champMap, traitMap, selectedTraits]);

  const sortedChampions = useMemo(() => {
    return result.node
      .toArray()
      .map((id) => champMap.get(id))
      .filter((champ): champ is Champion => champ !== undefined) 
      .sort((a, b) => a.cost - b.cost);
  }, [result.node, champMap]);

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
          {sortedChampions.map((champ) => (
            <ChampionItem key={champ.id} name={champ.name} cost={champ.cost} />
          ))}
        </div>

        <div className="flex flex-wrap gap-1.5 mt-3">
          {activeTraits.map((t) => (
            <TraitChip key={t.name} trait={t} />
          ))}
        </div>
      </Card>
    </div>
  );
}