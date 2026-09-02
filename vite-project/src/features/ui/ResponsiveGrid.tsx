import { forwardRef, type HTMLAttributes } from "react";

type ResponsiveGridProps = HTMLAttributes<HTMLDivElement>;

const ResponsiveGrid = forwardRef<HTMLDivElement, ResponsiveGridProps>(
  ({ children, className = "", ...props }, ref) => {
    return (
      <div
        ref={ref}
        data-team-result-grid=""
        className={`tft-result-grid ${className}`.trim()}
        {...props}
      >
        {children}
      </div>
    );
  }
);
ResponsiveGrid.displayName = "ResponsiveGrid";

export default ResponsiveGrid;
