import { forwardRef, type HTMLAttributes } from "react";

interface WorkspaceCarouselProps extends HTMLAttributes<HTMLDivElement> {}

const WorkspaceCarousel = forwardRef<HTMLDivElement, WorkspaceCarouselProps>(
  ({ children, className = "", style, ...props }, ref) => {
    const baseClasses = [
      "flex overflow-x-auto snap-x snap-mandatory scrollbar-none",
      "w-full gap-0 items-start isolate transform-gpu",
      className
    ].filter(Boolean).join(" ");

    return (
      <div
        ref={ref}
        className={baseClasses}
        style={{
          backfaceVisibility: "hidden",
          WebkitOverflowScrolling: "touch",
          ...style,
        }}
        {...props}
      >
        {children}
      </div>
    );
  }
);

WorkspaceCarousel.displayName = "WorkspaceCarousel";

export default WorkspaceCarousel;