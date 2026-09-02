export const spacing = {
  xs: "p-2",
  sm: "p-3",
  md: "p-4",
  lg: "p-5",
};

export const radius = {
  sm: "rounded-lg",
  md: "rounded-xl",
  lg: "rounded-2xl",
  xl: "rounded-3xl",
};

export const size = {
  inputSm: "w-10",
  inputMd: "w-12",

  buttonSm: "h-[48px]",
  buttonMd: "h-[56px]",
  buttonLg: "h-[64px]",
};

export const componentTokens = {
  cardNameText: "text-[clamp(0.75rem,11cqi,0.875rem)]",
  cardCaptionText: "text-[clamp(0.625rem,8cqi,0.6875rem)]",
  statusBadgeText: "text-[clamp(0.6875rem,9cqi,0.75rem)]",
  resultChampionNameText:
    "text-[0.8125rem] sm:text-[0.9375rem] lg:text-base",
  resultRoleText:
    "text-[0.625rem] sm:text-[0.6875rem] lg:text-xs",
  resultChampionCardSize: "h-28 sm:h-[7.5rem]",
  resultChampionNameSlot: "h-11",
  resultChampionRoleSlot: "min-h-6",
  teamSizeField:
    "h-11 w-[clamp(4rem,10cqi,5rem)] shrink-0",
  touchTarget: "min-h-11 min-w-11",
} as const;
