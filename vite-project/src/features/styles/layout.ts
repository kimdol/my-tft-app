export const layout = {
  controlGroup: `
    flex items-center gap-3
    px-4 py-3 sm:px-6 sm:py-4
    bg-white/5 rounded-2xl
    min-w-[180px]
  `,

  championGrid: `
    grid
    grid-cols-[repeat(auto-fit,minmax(56px,68px))]
    gap-1.5
    mb-4
  `,

  traitChip: `
    flex items-center gap-1.5
    px-2.5 py-1
    rounded-lg text-[12px]
    border font-bold
    transition-transform
  `,

  panel: `
    flex flex-row gap-2
  `,

  resultGrid: `
    grid grid-cols-1
    sm:grid-cols-2
    lg:grid-cols-2
    xl:grid-cols-3
    gap-4
  `,

  traitRow: `
    flex flex-wrap gap-1.5 mt-3
  `,
};