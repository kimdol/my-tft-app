export function NumberInput(props: any) {
  return (
    <input
      type="text"
      inputMode="numeric"
      pattern="[0-9]*"
      {...props}
      className={`
        w-10 sm:w-12
        text-xl sm:text-2xl
        font-black
        !bg-transparent

        !border-0
        outline-none
        !shadow-none
        
        focus:outline-none
        focus:ring-0
        focus:border-0
        
        ${props.className || ""}
      `}
    />
  );
}