export type UnifiedChampionRole =
  | "physical-fighter"
  | "magic-fighter"
  | "physical-ranged"
  | "magic-ranged"
  | "physical-tank"
  | "magic-tank"
  | "physical-assassin"
  | "magic-assassin";

export interface ChampionRoleEvidence {
  readonly source: "api-role" | "range";
  readonly value: string;
  readonly reason: string;
}

export interface UnifiedChampionRoleProfile {
  readonly primaryRole: UnifiedChampionRole | null;
  readonly secondaryRoles: readonly UnifiedChampionRole[];
  readonly roles: readonly UnifiedChampionRole[];
  readonly evidence: readonly ChampionRoleEvidence[];
}
