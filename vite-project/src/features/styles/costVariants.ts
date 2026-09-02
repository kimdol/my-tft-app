import type { Cost } from "../domain/champion";

interface CostVariant {
  label: string;
  cardBorder: string;
  chip: string;
  placeholder: string;
  placeholderAccent: string;
  result: string;
  toggle: string;
  toggleActive: string;
}

export const COST_VARIANTS: Record<Cost, CostVariant> = {
  1: {
    label: "1코스트",
    cardBorder: "border-zinc-400/80",
    chip: "border-zinc-500 text-zinc-300 bg-zinc-500/10",
    placeholder: "bg-[linear-gradient(145deg,#3f3f46_0%,#18181b_58%,#09090b_100%)]",
    placeholderAccent: "border-zinc-300/55 text-zinc-100 bg-zinc-950/45",
    result:
      "border-zinc-300/90 bg-zinc-500/10 hover:border-zinc-200 focus-within:border-zinc-200 hover:bg-zinc-500/20 hover:shadow-[0_0_12px_rgba(161,161,170,0.3)]",
    toggle:
      "text-zinc-300 border-zinc-500/40 bg-zinc-500/10 hover:bg-zinc-500/20",
    toggleActive:
      "text-zinc-100 bg-zinc-500/40 border-zinc-400 shadow-[0_0_10px_rgba(161,161,170,0.3)]",
  },
  2: {
    label: "2코스트",
    cardBorder: "border-emerald-400/80",
    chip: "border-emerald-500 text-emerald-300 bg-emerald-500/10",
    placeholder:
      "bg-[linear-gradient(145deg,#166534_0%,#052e16_58%,#07130d_100%)]",
    placeholderAccent:
      "border-emerald-300/60 text-emerald-100 bg-emerald-950/45",
    result:
      "border-emerald-400 bg-emerald-500/10 hover:border-emerald-300 focus-within:border-emerald-300 hover:bg-emerald-500/20 hover:shadow-[0_0_12px_rgba(16,185,129,0.3)]",
    toggle:
      "text-emerald-400 border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20",
    toggleActive:
      "text-emerald-100 bg-emerald-500/40 border-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.3)]",
  },
  3: {
    label: "3코스트",
    cardBorder: "border-sky-400/80",
    chip: "border-sky-500 text-sky-300 bg-sky-500/10",
    placeholder:
      "bg-[linear-gradient(145deg,#075985_0%,#082f49_58%,#07111b_100%)]",
    placeholderAccent: "border-sky-300/60 text-sky-100 bg-sky-950/45",
    result:
      "border-sky-400 bg-sky-500/10 hover:border-sky-300 focus-within:border-sky-300 hover:bg-sky-500/20 hover:shadow-[0_0_12px_rgba(14,165,233,0.3)]",
    toggle:
      "text-sky-400 border-sky-500/40 bg-sky-500/10 hover:bg-sky-500/20",
    toggleActive:
      "text-sky-100 bg-sky-500/40 border-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.3)]",
  },
  4: {
    label: "4코스트",
    cardBorder: "border-violet-400/80",
    chip: "border-violet-500 text-violet-300 bg-violet-500/10",
    placeholder:
      "bg-[linear-gradient(145deg,#6d28d9_0%,#2e1065_58%,#120a22_100%)]",
    placeholderAccent:
      "border-violet-300/60 text-violet-100 bg-violet-950/45",
    result:
      "border-violet-400 bg-violet-500/10 hover:border-violet-300 focus-within:border-violet-300 hover:bg-violet-500/20 hover:shadow-[0_0_12px_rgba(139,92,246,0.3)]",
    toggle:
      "text-violet-400 border-violet-500/40 bg-violet-500/10 hover:bg-violet-500/20",
    toggleActive:
      "text-violet-100 bg-violet-500/40 border-violet-400 shadow-[0_0_10px_rgba(167,139,250,0.3)]",
  },
  5: {
    label: "5코스트",
    cardBorder: "border-amber-300",
    chip: "border-amber-500 text-amber-300 bg-amber-500/10",
    placeholder:
      "bg-[linear-gradient(145deg,#b45309_0%,#713f12_58%,#1c1205_100%)]",
    placeholderAccent: "border-amber-200/70 text-amber-50 bg-amber-950/45",
    result:
      "border-amber-300 bg-amber-500/10 hover:border-amber-200 focus-within:border-amber-200 hover:bg-amber-500/20 hover:shadow-[0_0_12px_rgba(245,158,11,0.35)]",
    toggle:
      "text-amber-400 border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20",
    toggleActive:
      "text-amber-50 bg-amber-500/40 border-amber-300 shadow-[0_0_10px_rgba(252,211,77,0.35)]",
  },
};
