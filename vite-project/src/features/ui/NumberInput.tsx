import { forwardRef, type InputHTMLAttributes } from "react";

interface NumberInputProps extends InputHTMLAttributes<HTMLInputElement> {}

export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  ({ className = "", ...props }, ref) => {
    return (
      <input
        ref={ref}
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        className={`w-10 sm:w-12 text-xl sm:text-2xl font-black !bg-transparent !border-0 outline-none !shadow-none focus:outline-none focus:ring-0 focus:border-0 ${className}`.trim()}
        {...props}
      />
    );
  }
);


NumberInput.displayName = "NumberInput";