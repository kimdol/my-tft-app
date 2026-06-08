import type { Cost } from "../types";

export const COST_COLORS: Record<Cost, string> = {
  1: 'border-slate-500 text-slate-400 bg-slate-500/10',
  2: 'border-emerald-500 text-emerald-400 bg-emerald-500/10',
  3: 'border-sky-500 text-sky-400 bg-sky-500/10',
  4: 'border-fuchsia-500 text-fuchsia-400 bg-fuchsia-500/10',
  5: 'border-amber-500 text-amber-400 bg-amber-500/10',
};

export const TRAIT_ICON_MAP: Record<string, string> = {
  '하트스틸': 'activity',
  '속사포': 'target',
  'K/DA': 'trophy',
  '술사': 'zap',
  '펜타킬': 'sword',
};