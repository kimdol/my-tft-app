import { forwardRef, type HTMLAttributes } from "react";

interface ResponsiveGridProps extends HTMLAttributes<HTMLDivElement> {}

const ResponsiveGrid = forwardRef<HTMLDivElement, ResponsiveGridProps>(
  ({ children, className = "", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-4 justify-items-center ${className}`.trim()}
        {...props}
      >
        {children}
      </div>
    );
  }
);
ResponsiveGrid.displayName = "ResponsiveGrid";

export default ResponsiveGrid;