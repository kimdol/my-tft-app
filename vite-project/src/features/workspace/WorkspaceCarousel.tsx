import { forwardRef, type ReactNode } from "react";

interface WorkspaceCarouselProps {
  children: ReactNode;
  onScroll: () => void;
}

const WorkspaceCarousel = forwardRef<HTMLDivElement, WorkspaceCarouselProps>(
  ({ children, onScroll }, ref) => {
    return (
      <div
        ref={ref}
        onScroll={onScroll}
        className="
          flex 
          overflow-x-auto 
          snap-x snap-mandatory 
          scrollbar-none
          w-full gap-0
          items-start
        "
      >
        {children}
      </div>
    );
  }
);

WorkspaceCarousel.displayName = "WorkspaceCarousel";

export default WorkspaceCarousel;