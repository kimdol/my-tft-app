import type { HTMLAttributes } from "react";

interface LabelProps extends HTMLAttributes<HTMLSpanElement> {}

export function Label({ children, className = "", ...props }: LabelProps) {
  return (
    <span 
      className={`text-[10px] sm:text-xs font-black uppercase whitespace-nowrap ${className}`.trim()}
      {...props}
    >
      {children}
    </span>
  );
}