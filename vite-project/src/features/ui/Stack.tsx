import { forwardRef, type HTMLAttributes } from "react";

interface StackProps extends HTMLAttributes<HTMLDivElement> {}

const Stack = forwardRef<HTMLDivElement, StackProps>(
  ({ children, className = "", ...props }, ref) => {
    return (
      <div 
        ref={ref}
        className={`space-y-4 sm:space-y-6 ${className}`.trim()} 
        {...props}
      >
        {children}
      </div>
    );
  }
);
Stack.displayName = "Stack";

export default Stack;