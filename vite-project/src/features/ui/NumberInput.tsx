import { forwardRef, type InputHTMLAttributes } from "react";

type NumberInputProps = InputHTMLAttributes<HTMLInputElement>;

export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  ({ className = "", ...props }, ref) => {
    return (
      <input
        ref={ref}
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        className={`w-10 border-0 bg-transparent text-xl font-black shadow-none outline-none focus-visible:ring-2 focus-visible:ring-white/70 sm:w-12 sm:text-2xl ${className}`.trim()}
        {...props}
      />
    );
  }
);


NumberInput.displayName = "NumberInput";
