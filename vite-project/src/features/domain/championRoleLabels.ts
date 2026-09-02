import type { UnifiedChampionRole } from "./championRole";

export const CHAMPION_ROLE_LABELS = Object.freeze({
  "physical-fighter": "물리 전사",
  "magic-fighter": "마법 전사",
  "physical-ranged": "물리 원거리",
  "magic-ranged": "마법 원거리",
  "physical-tank": "물리 탱커",
  "magic-tank": "마법 탱커",
  "physical-assassin": "물리 암살자",
  "magic-assassin": "마법 암살자",
} satisfies Readonly<Record<UnifiedChampionRole, string>>);
