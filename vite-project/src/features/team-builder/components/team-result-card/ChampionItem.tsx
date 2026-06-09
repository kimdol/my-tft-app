import Text from "../../../ui/Text";
import type { Cost } from "../../../selector/champion-selector/types"; 
import { COST_THEMES } from "../../constants"; 

interface Props {
  name: string;
  cost: Cost;
}

export default function ChampionItem({ name, cost }: Props) {
  const theme = COST_THEMES[cost] || COST_THEMES[1];

  return (
    <div
      className={`
        relative aspect-square w-full
        rounded-lg
        border
        flex flex-col items-center justify-center 
        p-2.5 gap-y-1
        transition-all duration-200
        hover:scale-[1.03]
        overflow-hidden
        ${theme}
      `}
    >
      <Text variant="label" className="text-center break-keep leading-tight drop-shadow-md z-10">
        {name}
      </Text>
      
      <Text variant="caption" className="text-[10px] opacity-70 mt-0.5 z-10">
        {cost}G
      </Text>
    </div>
  );
}