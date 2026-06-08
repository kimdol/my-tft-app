import { spacing, radius } from "../styles/tokens";
import { cardVariants } from "../styles/variants";

export default function Card({ children, className = "" }: any) {
  return (
    <div
      className={`
        ${spacing.md}         
        ${radius.lg}          
        ${cardVariants.base}

        w-full
        min-w-0
        max-w-[480px]
        p-1

        ${className}
      `}
    >
      {children}
    </div>
  );
}
