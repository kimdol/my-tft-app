import { useMemo } from "react";
import {
  getSelectableChampionsByRole,
  useTFTBuilderStore,
  type ChampionRoleGroup,
} from "../../../store/useTFTBuilderStore";
import { useAppI18n } from "../../../i18n/useAppI18n";

const ROLE_GROUPS: readonly ChampionRoleGroup[] = [
  "fighter",
  "tank",
  "ranged",
  "assassin",
];

const ROLE_TOGGLE_STYLES: Readonly<
  Record<ChampionRoleGroup, { readonly idle: string; readonly active: string }>
> = {
  fighter: {
    idle: "border-amber-400/20 bg-amber-400/[0.06] text-amber-100/70 hover:bg-amber-400/15",
    active: "border-amber-300/70 bg-amber-400/30 text-amber-50 shadow-[0_0_16px_rgba(251,191,36,0.18)]",
  },
  tank: {
    idle: "border-sky-400/20 bg-sky-400/[0.06] text-sky-100/70 hover:bg-sky-400/15",
    active: "border-sky-300/70 bg-sky-400/30 text-sky-50 shadow-[0_0_16px_rgba(56,189,248,0.18)]",
  },
  ranged: {
    idle: "border-violet-400/20 bg-violet-400/[0.06] text-violet-100/70 hover:bg-violet-400/15",
    active: "border-violet-300/70 bg-violet-400/30 text-violet-50 shadow-[0_0_16px_rgba(167,139,250,0.18)]",
  },
  assassin: {
    idle: "border-rose-400/20 bg-rose-400/[0.06] text-rose-100/70 hover:bg-rose-400/15",
    active: "border-rose-300/70 bg-rose-400/30 text-rose-50 shadow-[0_0_16px_rgba(251,113,133,0.18)]",
  },
};

export default function RoleToggleBar() {
  const { copy } = useAppI18n();
  const toggleByRole = useTFTBuilderStore((state) => state.toggleByRole);
  const champions = useTFTBuilderStore((state) => state.champions);
  const selected = useTFTBuilderStore((state) => state.selectedChampions);
  const fixed = useTFTBuilderStore((state) => state.fixedChampions);

  const selectableChampionsByRole = useMemo(
    () =>
      new Map(
        ROLE_GROUPS.map((role) => [
          role,
          getSelectableChampionsByRole(champions, fixed, role),
        ]),
      ),
    [champions, fixed],
  );

  return (
    <div className="flex w-full gap-1.5 sm:gap-2">
      {ROLE_GROUPS.map((role) => {
        const targets = selectableChampionsByRole.get(role) ?? [];
        const isFullySelected =
          targets.length > 0 &&
          targets.every((champion) => selected.has(champion.id));
        const label = copy.selector.roleGroups[role];
        const styles = ROLE_TOGGLE_STYLES[role];

        return (
          <button
            type="button"
            key={role}
            data-tft-role-toggle={role}
            onClick={() => toggleByRole(role)}
            aria-pressed={isFullySelected}
            aria-label={`${label} ${copy.selector.costAll} ${isFullySelected ? copy.selector.unselect : copy.selector.select}`}
            className={`
              flex min-h-11 flex-1 items-center justify-center rounded-lg
              border px-2 py-2 text-sm font-bold transition-all duration-200
              active:scale-95 focus-visible:outline focus-visible:outline-2
              focus-visible:outline-offset-2 focus-visible:outline-white
              ${isFullySelected ? styles.active : styles.idle}
            `}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
