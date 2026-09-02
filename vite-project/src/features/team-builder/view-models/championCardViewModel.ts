import type { Champion, Cost, Trait } from "../../domain/champion";
import type { ChampionCombatStats } from "../../domain/championCombatStats";
import type { UnifiedChampionRole } from "../../domain/championRole";
import type { OpEvaluationResult } from "../../domain/staticPower";
import { CHAMPION_ROLE_LABELS } from "../../domain/championRoleLabels";

export interface ChampionStatViewModel {
  readonly key: keyof ChampionCombatStats;
  readonly label: string;
  readonly values: Readonly<Record<1 | 2 | 3, string>>;
}

export interface ChampionCardViewModel {
  readonly id: string;
  readonly baseId: string;
  readonly apiId: string;
  readonly name: string;
  readonly cost: Cost;
  readonly traits: readonly Trait[];
  readonly primaryRole: UnifiedChampionRole | null;
  readonly primaryRoleLabel: string;
  readonly secondaryRoles: readonly UnifiedChampionRole[];
  readonly secondaryRoleLabels: readonly string[];
  readonly combatStats: readonly ChampionStatViewModel[];
  readonly isFixed: boolean;
  readonly opEvaluation: OpEvaluationResult | null;
  readonly accessibleLabel: string;
}

const STAT_DEFINITIONS = [
  { key: "health", label: "체력" },
  { key: "attackDamage", label: "공격력" },
  { key: "attackSpeed", label: "공격 속도" },
  { key: "armor", label: "방어력" },
  { key: "magicResistance", label: "마법 저항력" },
  { key: "attackRange", label: "공격 사거리" },
  { key: "startingMana", label: "시작 마나" },
  { key: "maximumMana", label: "최대 마나" },
] as const satisfies readonly {
  readonly key: keyof ChampionCombatStats;
  readonly label: string;
}[];

const formatStatValue = (
  key: keyof ChampionCombatStats,
  value: number | null,
): string => {
  if (value === null || !Number.isFinite(value)) return "—";
  if (key === "attackSpeed") {
    return value.toLocaleString("ko-KR", {
      maximumFractionDigits: 2,
    });
  }
  return value.toLocaleString("ko-KR", {
    maximumFractionDigits: Number.isInteger(value) ? 0 : 2,
  });
};

export const createChampionCardViewModel = (
  champion: Champion,
  isFixed: boolean,
  opEvaluation: OpEvaluationResult | null = null,
): ChampionCardViewModel => {
  const primaryRole = champion.primaryRole;
  const secondaryRoles = champion.secondaryRoles;
  const primaryRoleLabel =
    primaryRole === null
      ? "역할 미분류"
      : CHAMPION_ROLE_LABELS[primaryRole];
  const secondaryRoleLabels = secondaryRoles.map(
    (role) => CHAMPION_ROLE_LABELS[role],
  );
  const combatStats = STAT_DEFINITIONS.map(({ key, label }) => ({
    key,
    label,
    values: {
      1: formatStatValue(key, champion.starLevelStats[1][key]),
      2: formatStatValue(key, champion.starLevelStats[2][key]),
      3: formatStatValue(key, champion.starLevelStats[3][key]),
    },
  }));
  const accessibleLabel = [
    champion.name,
    `${champion.cost}코스트`,
    primaryRoleLabel,
    isFixed ? "고정 유닛" : "추천 유닛",
    ...(opEvaluation?.isOp
      ? [`OP, ${opEvaluation.starLevel}성 판정`]
      : []),
    "상세 정보 보기",
  ].join(", ");

  return {
    id: champion.id,
    baseId: champion.baseId,
    apiId: champion.apiId,
    name: champion.name,
    cost: champion.cost,
    traits: champion.traits,
    primaryRole,
    primaryRoleLabel,
    secondaryRoles,
    secondaryRoleLabels,
    combatStats,
    isFixed,
    opEvaluation,
    accessibleLabel,
  };
};
