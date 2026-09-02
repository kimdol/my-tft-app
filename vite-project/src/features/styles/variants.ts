export const buttonVariants = {
  primary: `
    bg-white text-black
    hover:bg-purple-50 hover:text-purple-700
    active:scale-95 active:bg-purple-100
    transition-all
  `,
  secondary: `
    bg-white/10 text-white
    hover:bg-purple-600 hover:text-white
  `,
  ghost: `
    bg-transparent
    text-white/60
    border border-transparent

    transition-all duration-150

    hover:bg-white/5
    hover:text-white

    active:bg-white/10
    active:scale-[0.98]

    focus-visible:outline
    focus-visible:outline-2
    focus-visible:outline-offset-2
    focus-visible:outline-white
  `,
  disabled: `
    bg-white/10 text-white/30 cursor-not-allowed
  `,
} as const;

export const cardVariants = {
  base: `
    bg-[#16161a]
    backdrop-blur-md

    hover:border-purple-500/40
    hover:bg-[#1c1c22]
  `,
};
