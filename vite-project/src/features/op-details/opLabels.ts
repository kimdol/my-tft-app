import type {
  ComparableStat,
} from "../domain/staticPower";
import { CHAMPION_ROLE_LABELS } from "../domain/championRoleLabels";

export const OP_ROLE_LABELS = CHAMPION_ROLE_LABELS;

export const OP_STAT_LABELS = {
  attackDamage: "공격력",
  attackSpeed: "공격 속도",
  armor: "방어력",
  magicResistance: "마법 저항력",
} as const satisfies Readonly<Record<ComparableStat, string>>;

export const formatOpValue = (value: number): string =>
  Number.isInteger(value)
    ? value.toLocaleString("ko-KR")
    : value.toLocaleString("ko-KR", { maximumFractionDigits: 2 });
