import { forwardRef, type HTMLAttributes } from "react";

interface PanelProps extends HTMLAttributes<HTMLDivElement> {}

const Panel = forwardRef<HTMLDivElement, PanelProps>(
  ({ children, className = "", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`w-full bg-[#0f0f12] border border-white/10 rounded-3xl p-2 flex flex-col sm:flex-row items-stretch gap-2 ${className}`.trim()}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Panel.displayName = "Panel";

export default Panel;