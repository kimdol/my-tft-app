export default function ResponsiveGrid({ children }: any) {
  return (
    <div className="
      grid
      
      grid-cols-1
      md:grid-cols-2 
      xl:grid-cols-2

      gap-4

      justify-items-center
    ">
      {children}
    </div>
  );
}
