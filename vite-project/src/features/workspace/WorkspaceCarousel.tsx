import { forwardRef, type HTMLAttributes } from "react";

type WorkspaceCarouselProps = HTMLAttributes<HTMLDivElement>;

const WorkspaceCarousel = forwardRef<HTMLDivElement, WorkspaceCarouselProps>(
  ({ children, className = "", style, ...props }, ref) => {
    const baseClasses = [
      "flex overflow-x-hidden overscroll-x-none",
      "w-full gap-0 items-start isolate",
      className
    ].filter(Boolean).join(" ");

    return (
      <div
        ref={ref}
        data-workspace-carousel
        className={baseClasses}
        style={{
          touchAction: "pan-y pinch-zoom",
          overscrollBehaviorX: "none",
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
