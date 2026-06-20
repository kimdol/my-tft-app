import { forwardRef, type ButtonHTMLAttributes } from "react";
import { size, radius } from "../styles/tokens";
import { buttonVariants } from "../styles/variants";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  variant?: "primary" | "secondary" | "ghost";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      loading = false,
      variant = "primary",
      className = "",
      disabled,
      ...props
    },
    ref
  ) => {
    const isDisabled = loading || disabled;

    const baseClasses = [
      size.buttonMd,
      radius.lg,
      "font-black flex items-center justify-center",
      "transition-all duration-100 active:scale-[0.98]",
      "outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f0f12]",
      "[WebkitTapHighlightColor:transparent]",
      isDisabled ? buttonVariants.disabled : buttonVariants[variant],
      className,
    ].filter(Boolean).join(" ");

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        aria-busy={loading}
        className={baseClasses}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;