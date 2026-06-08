import type { JSX } from "react";
import { typography } from "../styles/typography";

type TextVariant = keyof typeof typography;

type Props = {
  variant?: TextVariant;
  as?: keyof JSX.IntrinsicElements;
  className?: string;
  children: React.ReactNode;
};

export default function Text({
  variant = "body",
  as: Component = "span",
  className = "",
  children,
}: Props) {
  return (
    <Component 
      className={`
      ${typography[variant]} 
      ${variant === 'body' ? 'leading-tight' : ''}
      ${className}
      `}
    >
      {children}
    </Component>
  );
}
