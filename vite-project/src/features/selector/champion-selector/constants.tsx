import { Activity, Target, Trophy, Zap, Sword } from 'lucide-react';
import type { Cost } from './types';
import React from 'react';

export const COST_COLORS: Record<Cost, string> = {
  1: 'border-slate-500 text-slate-400 bg-slate-500/10',
  2: 'border-emerald-500 text-emerald-400 bg-emerald-500/10',
  3: 'border-sky-500 text-sky-400 bg-sky-500/10',
  4: 'border-fuchsia-500 text-fuchsia-400 bg-fuchsia-500/10',
  5: 'border-amber-500 text-amber-400 bg-amber-500/10',
};


export const CARD_STYLES = {
  border: "border-[3px] border-solid", 
};


export const COST_BORDERS = {
  1: "border-gray-400/70",
  2: "border-emerald-400/80",
  3: "border-sky-400/80",
  4: "border-violet-400/80",
  5: "border-amber-300",
};

export const TRAIT_ICON_MAP: Record<string, React.ReactNode> = {
  '하트스틸': <Activity size={10} />,
  '속사포': <Target size={10} />,
  'K/DA': <Trophy size={10} />,
  '술사': <Zap size={10} />,
  '펜타킬': <Sword size={10} />,
};
