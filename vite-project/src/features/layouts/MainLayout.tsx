export default function MainLayout({ children }: any) {
  return (
    <div className="w-full text-[#e2e8f0] font-sans antialiased pb-8">
      <div className="bg-[#121216] border border-[#2d2d3d] rounded-[16px] shadow-[0_10px_25px_rgba(0,0,0,0.5)] p-6 sm:p-10 space-y-8 w-full box-border">
        {children}
      </div>
    </div>
  );
}