import type { SelectorMode } from "../../store/useSelectorModeStore";
import type { TFTBuilderState } from "../../store/useTFTBuilderStore";

export type ChampionSelectorMode = Extract<
  SelectorMode,
  "candidate" | "fixed"
>;

type StoreSelector<Value> = (state: TFTBuilderState) => Value;

const WHITE_SELECTION_OVERLAY =
  "bg-[linear-gradient(to_bottom,rgba(255,255,255,0.62)_0%,rgba(255,255,255,0.62)_58%,rgba(255,255,255,0.22)_78%,rgba(255,255,255,0.06)_100%)]";
const RED_SELECTION_OVERLAY =
  "bg-[linear-gradient(to_bottom,rgba(225,29,72,0.6)_0%,rgba(225,29,72,0.6)_58%,rgba(225,29,72,0.22)_78%,rgba(225,29,72,0.08)_100%)]";

export interface ChampionSelectorStrategy {
  readonly id: ChampionSelectorMode;
  readonly sectionTitle: string;
  readonly countLabel: string;
  readonly countColor: string;
  readonly clearSelectionLabel: string;
  readonly searchPlaceholder: string;
  readonly searchFocusBorder: string;
  readonly listLabel: string;
  readonly currentSelectionLabel: string;
  readonly oppositeSelectionLabel: string;
  readonly primaryOverlay: string;
  readonly oppositeOverlay: string;
  readonly primaryRing: string;
  readonly oppositeRing: string;
  readonly showCostToggle: boolean;
  readonly selectSelected: StoreSelector<Set<string>>;
  readonly selectOppositeSelected: StoreSelector<Set<string>>;
  readonly selectToggle: StoreSelector<(id: string) => void>;
  readonly selectClear: StoreSelector<() => void>;
}

const candidateStrategy = Object.freeze({
  id: "candidate",
  sectionTitle: "후보 유닛 선택",
  countLabel: "후보 카드 수",
  countColor: "text-purple-400",
  clearSelectionLabel: "후보 유닛 전체 선택 해제",
  searchPlaceholder: "후보 챔피언 검색",
  searchFocusBorder: "focus:border-purple-500/50",
  listLabel: "후보 유닛 목록",
  currentSelectionLabel: "후보 유닛",
  oppositeSelectionLabel: "고정 유닛",
  primaryOverlay: WHITE_SELECTION_OVERLAY,
  oppositeOverlay: RED_SELECTION_OVERLAY,
  primaryRing:
    "ring-2 ring-inset ring-white/90 shadow-[inset_0_0_18px_rgba(255,255,255,0.3)]",
  oppositeRing:
    "ring-2 ring-inset ring-rose-400 shadow-[inset_0_0_18px_rgba(244,63,94,0.45)]",
  showCostToggle: true,
  selectSelected: (state: TFTBuilderState) => state.selectedChampions,
  selectOppositeSelected: (state: TFTBuilderState) => state.fixedChampions,
  selectToggle: (state: TFTBuilderState) => state.toggle,
  selectClear: (state: TFTBuilderState) => state.clearSelected,
}) satisfies ChampionSelectorStrategy;

const fixedStrategy = Object.freeze({
  id: "fixed",
  sectionTitle: "고정 유닛 선택",
  countLabel: "고정 카드 수",
  countColor: "text-blue-400",
  clearSelectionLabel: "고정 유닛 전체 선택 해제",
  searchPlaceholder: "고정 챔피언 검색",
  searchFocusBorder: "focus:border-rose-500/60",
  listLabel: "고정 유닛 목록",
  currentSelectionLabel: "고정 유닛",
  oppositeSelectionLabel: "후보 유닛",
  primaryOverlay: RED_SELECTION_OVERLAY,
  oppositeOverlay: WHITE_SELECTION_OVERLAY,
  primaryRing:
    "ring-2 ring-inset ring-rose-400 shadow-[inset_0_0_18px_rgba(244,63,94,0.45)]",
  oppositeRing:
    "ring-2 ring-inset ring-white/90 shadow-[inset_0_0_18px_rgba(255,255,255,0.3)]",
  showCostToggle: false,
  selectSelected: (state: TFTBuilderState) => state.fixedChampions,
  selectOppositeSelected: (state: TFTBuilderState) =>
    state.selectedChampions,
  selectToggle: (state: TFTBuilderState) => state.toggleFixed,
  selectClear: (state: TFTBuilderState) => state.clearFixed,
}) satisfies ChampionSelectorStrategy;

export const CHAMPION_SELECTOR_STRATEGIES = Object.freeze({
  candidate: candidateStrategy,
  fixed: fixedStrategy,
}) satisfies Readonly<
  Record<ChampionSelectorMode, ChampionSelectorStrategy>
>;
