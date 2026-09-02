import type { TFTTraitEffect } from "../api/tftApi";

const decodeKnownEntities = (value: string): string =>
  value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'");

const formatVariable = (value: number): string =>
  Number.isInteger(value)
    ? value.toLocaleString("ko-KR")
    : value.toLocaleString("ko-KR", {
        maximumFractionDigits: 2,
      });

export const formatActiveTraitDescription = (
  template: string | null,
  effect: TFTTraitEffect,
  tierIndex = 0,
): string | null => {
  if (!template) return null;

  const variables: Readonly<Record<string, number>> = {
    ...(effect.variables ?? {}),
    MinUnits: effect.breakpoint,
  };
  const tierRows = [
    ...template.matchAll(/<(?:row|expandRow)\b[^>]*>([\s\S]*?)<\/(?:row|expandRow)>/gi),
  ];
  const tierTemplate =
    tierRows[Math.min(tierIndex, Math.max(0, tierRows.length - 1))]?.[1] ??
    template;
  const interpolated = tierTemplate.replace(
    /@([A-Za-z0-9_]+)(\*100)?@/g,
    (_token, variableName: string, scale: string | undefined) => {
      const value = variables[variableName];
      if (value === undefined || !Number.isFinite(value)) return "";
      return formatVariable(scale ? value * 100 : value);
    },
  );

  const plainText = decodeKnownEntities(
    interpolated
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/%i:[^%]+%/gi, "")
      .replace(/\{\{[^}]+\}\}/g, "")
      .replace(/<[^>]+>/g, " "),
  )
    .replace(/[ \t]+/g, " ")
    .replace(/ *\n */g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return plainText.length > 0 ? plainText : null;
};
