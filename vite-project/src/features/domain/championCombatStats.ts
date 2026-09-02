export interface ChampionCombatStats {
  readonly health: number | null;
  readonly attackDamage: number | null;
  readonly attackSpeed: number | null;
  readonly armor: number | null;
  readonly magicResistance: number | null;
  readonly attackRange: number | null;
  readonly startingMana: number | null;
  readonly maximumMana: number | null;
}

export const UNKNOWN_CHAMPION_COMBAT_STATS: Readonly<ChampionCombatStats> =
  Object.freeze({
    health: null,
    attackDamage: null,
    attackSpeed: null,
    armor: null,
    magicResistance: null,
    attackRange: null,
    startingMana: null,
    maximumMana: null,
  });
