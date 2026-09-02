import { forwardRef, type HTMLAttributes } from "react";

type PanelProps = HTMLAttributes<HTMLDivElement>;

const Panel = forwardRef<HTMLDivElement, PanelProps>(
  ({ children, className = "", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`tft-control-panel w-full bg-[#0f0f12] border border-white/10 rounded-3xl p-2 flex items-stretch gap-2 ${className}`.trim()}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Panel.displayName = "Panel";

export default Panel;
