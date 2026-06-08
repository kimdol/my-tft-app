export default function Panel({ children }: any) {
  return (
    <div className="
      w-full
      bg-[#0f0f12]
      border border-white/10
      rounded-3xl
      p-2

      flex flex-col sm:flex-row 
      items-stretch
      gap-2
    ">
      {children}
    </div>
  );
}
