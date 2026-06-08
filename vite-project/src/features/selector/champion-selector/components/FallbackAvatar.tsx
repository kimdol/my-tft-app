interface Props {
  name: string;
}

export default function FallbackAvatar({ name }: Props) {
  const initial = name?.[0] ?? '?';

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900">
      <span className="text-2xl font-black text-white/70">
        {initial}
      </span>
    </div>
  );
}
