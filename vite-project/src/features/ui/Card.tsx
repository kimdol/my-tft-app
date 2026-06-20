import type { HTMLAttributes } from "react";
import { spacing, radius } from "../styles/tokens";
import { cardVariants } from "../styles/variants";

interface CardProps extends HTMLAttributes<HTMLDivElement> {}

export default function Card({ children, className = "", ...props }: CardProps) {
  const baseClasses = [
    spacing.md,
    radius.lg,
    cardVariants.base,
    "w-full min-w-0 max-w-[480px] p-1"
  ].filter(Boolean).join(" ");

  return (
    <div 
      className={`${baseClasses} ${className}`.trim()} 
      {...props}
    >
      {children}
    </div>
  );
}