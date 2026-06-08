import { TRAIT_ICON_MAP } from '../constants';

interface Props {
  trait: string;
}

export default function TraitIcon({ trait }: Props) {
  return (
    <div className="bg-black/60 backdrop-blur p-1 rounded border border-white/10 text-white/80">
      {TRAIT_ICON_MAP[trait] || (
        <div className="w-1 h-1 bg-white rounded-full" />
      )}
    </div>
  );
}
