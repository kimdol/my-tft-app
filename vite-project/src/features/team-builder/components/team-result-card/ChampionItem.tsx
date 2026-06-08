import Text from "../../../ui/Text";

export default function ChampionItem({ name }: any) {
  return (
    <div
      className="
        relative aspect-square w-full
        rounded-lg
        bg-white/5 border border-white/5
        flex items-center justify-center p-1
        transition-all duration-150
        hover:scale-105 hover:bg-white/10 hover:border-purple-500/50
        overflow-hidden
      "
    >
      <Text variant="label">{name}</Text>

      <div className="absolute inset-0 bg-purple-500/0 hover:bg-purple-500/10 transition-colors" />
    </div>
  );
}
