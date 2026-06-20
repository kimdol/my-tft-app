import type { TFTTrait } from "../api/tftApi";

/**
 * 현재 활성화된 시너지가 몇 단계인지(index) 반환합니다.
 */
export const getTraitTier = (trait: TFTTrait, count: number): number => {
  let tier = -1;

  for (let i = 0; i < trait.effects.length; i++) {
    if (count >= trait.effects[i].breakpoint) {
      tier = i;
    } else {
      break;
    }
  }

  return tier;
};

/**
 * 활성화된 시너지의 실제 '스타일 번호'를 반환합니다.
 */
export const getTraitStyleNumber = (trait: TFTTrait, count: number): number => {
  let styleNumber = 0;

  for (const effect of trait.effects) {
    if (count >= effect.breakpoint) {
      styleNumber = effect.style;
    } else {
      break;
    }
  }

  return styleNumber;
};

/**
 * 스타일 번호에 따른 CSS 클래스를 반환합니다.
 */
export const getTraitStyle = (trait: TFTTrait, count: number) => {
  const styleNum = getTraitStyleNumber(trait, count);
  
  if (styleNum <= 0) return "";

  if (count === 1 && trait.effects.length === 1) {
    return "bg-gradient-to-br from-orange-400 via-amber-600 to-orange-800 border-orange-300/60 text-orange-50 shadow-[0_0_15px_rgba(251,146,60,0.5)] animate-pulse";
  }

  switch (styleNum) {
    case 1: 
      return "bg-gradient-to-br from-[#3d251e] to-[#2a1a15] border-[#5e3a2e]/50 text-orange-200/80 shadow-inner";
    case 3: 
      return "bg-gradient-to-br from-slate-400 via-slate-200 to-slate-500 border-white/40 text-slate-900 shadow-[0_0_10px_rgba(203,213,225,0.3)]";
    case 5: 
      return "bg-gradient-to-br from-yellow-500 via-yellow-200 to-yellow-600 border-yellow-100/50 text-yellow-950 shadow-[0_0_15px_rgba(234,179,8,0.5)] font-bold";
    case 6: 
    default:
      return "bg-gradient-to-br from-indigo-600 via-purple-400 to-pink-500 border-white/60 text-white shadow-[0_0_20px_rgba(168,85,247,0.6)] animate-pulse font-black";
  }
};