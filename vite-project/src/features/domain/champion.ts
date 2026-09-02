import type { ChampionCombatStats } from "./championCombatStats";
import type { UnifiedChampionRole } from "./championRole";
import type { StaticPowerResult } from "./staticPower";

export type Cost = 1 | 2 | 3 | 4 | 5;

export type RangeType = "melee" | "ranged" | "unknown";

export type DamageType = "physical" | "magic" | "hybrid" | "unknown";

export type ChampionRole =
  | "tank"
  | "fighter"
  | "reaper"
  | "carry"
  | "caster"
  | "specialist"
  | "assassin"
  | "marksman"
  | "unknown";

export type PatchChangeType =
  | "buff"
  | "nerf"
  | "adjusted"
  | "unchanged"
  | "unknown";

export interface ChampionMeta {
  readonly rangeType: RangeType;
  readonly damageType: DamageType;
  readonly combatRole: ChampionRole;
  readonly patchChangeType: PatchChangeType;
  readonly buffedInLatestPatch: boolean;
  readonly patchVersion?: string;
}

export interface Trait {
  readonly apiName?: string;
  name: string;
  iconUrl: string;
}

export interface Champion {
  id: string;
  baseId: string;
  apiId: string;
  name: string;
  cost: Cost;
  traits: Trait[];
  imageUrl: string;
  roles: readonly UnifiedChampionRole[];
  primaryRole: UnifiedChampionRole | null;
  secondaryRoles: readonly UnifiedChampionRole[];
  meta: ChampionMeta;
  combatStats: ChampionCombatStats;
  starLevelStats: Readonly<Record<1 | 2 | 3, ChampionCombatStats>>;
  staticPower?: StaticPowerResult | null;
}

export const UNKNOWN_CHAMPION_META: Readonly<ChampionMeta> = Object.freeze({
  rangeType: "unknown",
  damageType: "unknown",
  combatRole: "unknown",
  patchChangeType: "unknown",
  buffedInLatestPatch: false,
});
