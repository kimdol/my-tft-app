import type { Cost } from "./champion";
import type {
  ChampionRoleEvidence,
  UnifiedChampionRole,
  UnifiedChampionRoleProfile,
} from "./championRole";

export type { ChampionCombatStats } from "./championCombatStats";
export { UNKNOWN_CHAMPION_COMBAT_STATS } from "./championCombatStats";

export type StarLevel = 1 | 2 | 3;
export type OpTargetStarLevel = 2 | 3;
export type ChampionOpRole = UnifiedChampionRole;

export type ComparableStat =
  | "attackDamage"
  | "attackSpeed"
  | "armor"
  | "magicResistance";

export type BaselineSource =
  | "five-cost-two-star"
  | "five-cost-three-star"
  | "four-cost-three-star";

export type RoleEvidence = ChampionRoleEvidence;
export type ChampionRoleProfile = UnifiedChampionRoleProfile;

export interface MatchedStatEvidence {
  readonly stat: ComparableStat;
  readonly championValue: number;
  readonly baselineValue: number;
  readonly difference: number;
}

export interface BaselineComparisonResult {
  readonly role: ChampionOpRole;
  readonly baselineSource: BaselineSource;
  readonly baselineChampionId: string;
  readonly baselineChampionBaseId: string;
  readonly baselineChampionName: string;
  readonly baselineCost: 4 | 5;
  readonly baselineStarLevel: OpTargetStarLevel;
  readonly matchedStats: readonly MatchedStatEvidence[];
  readonly missingStats: readonly ComparableStat[];
  readonly comparedStatCount: number;
  readonly isMatch: boolean;
}

export type OpFailureReason =
  | "unsupported-cost-star"
  | "unclassified-role"
  | "missing-baseline"
  | "missing-comparable-stat"
  | "threshold-not-met";

export interface OpEvaluationResult {
  readonly isOp: boolean;
  readonly championId: string;
  readonly championBaseId: string;
  readonly championName: string;
  readonly cost: Cost;
  readonly starLevel: OpTargetStarLevel;
  readonly roles: readonly ChampionOpRole[];
  readonly baselineSource: BaselineSource | null;
  readonly comparisons: readonly BaselineComparisonResult[];
  readonly passedComparisons: readonly BaselineComparisonResult[];
  readonly failureReason: OpFailureReason | null;
}

export interface StaticPowerResult {
  readonly championId: string;
  readonly baseId: string;
  readonly championName: string;
  readonly cost: Cost;
  readonly roleProfile: ChampionRoleProfile;
  readonly evaluations: readonly OpEvaluationResult[];
  readonly opStarLevels: readonly OpTargetStarLevel[];
  readonly passedComparisons: readonly BaselineComparisonResult[];
  readonly isOp: boolean;
  readonly opConfigVersion?: string;
}

export type OpEvaluationKey =
  `${string}:${OpTargetStarLevel}`;

export type OpEvaluationIndex = ReadonlyMap<
  OpEvaluationKey,
  OpEvaluationResult
>;
