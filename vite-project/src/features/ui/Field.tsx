export default function Field({ children }: any) {
  return (
    <div
      className="
        flex items-center
        gap-3
        px-4 py-3 sm:px-6 sm:py-4
        bg-white/5
        rounded-2xl
        flex-1 min-w-[180px]
      "
    >
      {children}
    </div>
  );
}
