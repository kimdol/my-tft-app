import type { TFTTrait } from "../../../api/tftApi";
import { useTFTBuilderStore } from "../../../store/useTFTBuilderStore";
import { radius } from "../../../styles/tokens";
import TraitProfile from "./TraitProfile";
import Stepper from "./Stepper";

interface Props {
  trait: TFTTrait;
}

export default function TraitItem({ trait }: Props) {
  const selectedTraits = useTFTBuilderStore((state) => state.selectedTraits);
  const updateTraitCount = useTFTBuilderStore((state) => state.updateTraitCount);

  const count = selectedTraits.get(trait.name) || 0;

  const handleDecrease = () => {
    if (count > 0) updateTraitCount(trait.name, count - 1);
  };

  const handleIncrease = () => {
    updateTraitCount(trait.name, count + 1);
  };

  return (
    <div
      className={`
        flex items-center justify-between p-3 
        bg-white/5 border border-white/10 ${radius.lg} 
        transition-all duration-200
        ${count > 0 ? "border-purple-500/50 bg-purple-500/10" : "hover:bg-white/10"}
      `}
    >
      <TraitProfile name={trait.name} iconUrl={trait.iconUrl} />
      <Stepper 
        value={count} 
        onIncrease={handleIncrease} 
        onDecrease={handleDecrease} 
        min={0} 
      />
    </div>
  );
}