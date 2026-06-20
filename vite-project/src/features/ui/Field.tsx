import type { HTMLAttributes } from "react";

interface FieldProps extends HTMLAttributes<HTMLDivElement> {}

export default function Field({ children, className = "", ...props }: FieldProps) {
  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 sm:px-6 sm:py-4 bg-white/5 rounded-2xl flex-1 min-w-[180px] ${className}`.trim()}
      {...props}
    >
      {children}
    </div>
  );
}