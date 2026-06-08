import { size, radius } from "../styles/tokens";
import { buttonVariants } from "../styles/variants";

type Props = {
  children: React.ReactNode;
  loading?: boolean;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export default function Button({
  children,
  loading,
  variant = "primary",
  className = "",
  ...props
}: Props) {
  return (
    <button
      {...props}
      onMouseUp={(e) => e.currentTarget.blur()}
      className={`
        ${size.buttonMd}
        ${radius.lg}

        font-black
        flex items-center justify-center
        transition-all duration-100

        active:scale-[0.98] 
        [WebkitTapHighlightColor:transparent] 

        ${loading ? buttonVariants.disabled : buttonVariants[variant]}
        ${className}
      `}
    >
      {children}
    </button>
  );
}
