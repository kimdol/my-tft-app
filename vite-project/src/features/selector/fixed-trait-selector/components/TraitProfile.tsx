import Text from "../../../ui/Text";

interface Props {
  name: string;
  iconUrl?: string;
}

export default function TraitProfile({ name, iconUrl }: Props) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 p-1 bg-black/60 rounded-full border border-white/20 flex items-center justify-center shrink-0">
        {iconUrl ? (
          <img
            src={iconUrl}
            alt={name}
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="w-2 h-2 bg-white/50 rounded-full" />
        )}
      </div>
      <Text variant="label" className="font-bold text-white/90 truncate">
        {name}
      </Text>
    </div>
  );
}