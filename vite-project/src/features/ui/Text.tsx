import type { ElementType, HTMLAttributes, ReactNode } from "react";
import { typography } from "../styles/typography";

type TextVariant = keyof typeof typography;

interface TextProps extends HTMLAttributes<HTMLElement> {
  variant?: TextVariant;
  as?: ElementType;
  className?: string;
  children: ReactNode;
}

export default function Text({
  variant = "body",
  as: Component = "span",
  className = "",
  children,
  ...props
}: TextProps) {
  const isBody = variant === "body" ? "leading-tight" : "";
  const variantClass = typography[variant] || "";

  return (
    <Component
      className={`${variantClass} ${isBody} ${className}`.trim()}
      {...props}
    >
      {children}
    </Component>
  );
}