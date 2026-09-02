import { create } from "zustand";
import type { Champion, Cost } from "../domain/champion";
import {
  fetchTFTData,
  resetTFTDataCache,
  type TFTDatasetMetadata,
  type TFTTrait,
} from "../api/tftApi";
import type { OpEvaluationIndex } from "../domain/staticPower";

export type DataLoadStatus =
  | "idle"
  | "loading"
  | "success"
  | "empty"
  | "partial"
  | "error";

export interface BuilderSelectionSession {
  readonly selectedChampions: Set<string>;
  readonly fixedChampions: Set<string>;
  readonly selectedTraits: Map<string, number>;
}

export type ChampionRoleGroup = "fighter" | "tank" | "ranged" | "assassin";

export interface TFTBuilderState {
  champions: Champion[];
  traits: TFTTrait[];
  dataVersion: string | null;
  datasetMetadata: TFTDatasetMetadata | null;
  opEvaluationIndex: OpEvaluationIndex;
  selectedChampions: Set<string>;
  fixedChampions: Set<string>;
  selectedTraits: Map<string, number>;
  selectionSessions: Readonly<Record<string, BuilderSelectionSession>>;
  activeSelectionSessionId: string;
  loading: boolean;
  error: string | null;
  dataStatus: DataLoadStatus;

  fetchAll: () => Promise<void>;
  refreshAll: () => Promise<void>;

  toggle: (id: string) => void;
  toggleFixed: (id: string) => void;
  toggleByCost: (cost: Cost) => void;
  toggleByRole: (role: ChampionRoleGroup) => void;

  updateTraitCount: (name: string, count: number) => void;

  clear: () => void;
  clearChampionSelections: () => void;
  clearSelected: () => void;
  clearFixed: () => void;
  clearTraits: () => void;

  applyTeamAsFixed: (teamIds: readonly string[]) => void;
  createSelectionSession: (id: string, sourceId?: string) => void;
  activateSelectionSession: (id: string) => void;
  removeSelectionSession: (id: string, nextId: string) => void;
}

const createEmptySelectionSession = (): BuilderSelectionSession => ({
  selectedChampions: new Set(),
  fixedChampions: new Set(),
  selectedTraits: new Map(),
});

const updateActiveSelection = (
  state: TFTBuilderState,
  patch: Partial<BuilderSelectionSession>,
) => {
  const current = state.selectionSessions[state.activeSelectionSessionId] ?? {
    selectedChampions: state.selectedChampions,
    fixedChampions: state.fixedChampions,
    selectedTraits: state.selectedTraits,
  };
  const next = { ...current, ...patch };
  return {
    ...patch,
    selectionSessions: {
      ...state.selectionSessions,
      [state.activeSelectionSessionId]: next,
    },
  };
};

const createChampionLookup = (champions: readonly Champion[]) =>
  new Map(champions.map((champion) => [champion.id, champion]));

const getBaseIds = (
  ids: Iterable<string>,
  championLookup: ReadonlyMap<string, Champion>,
) => {
  const baseIds = new Set<string>();

  for (const id of ids) {
    baseIds.add(championLookup.get(id)?.baseId ?? id);
  }

  return baseIds;
};

const excludeBaseIds = (
  ids: Iterable<string>,
  blockedBaseIds: ReadonlySet<string>,
  championLookup: ReadonlyMap<string, Champion>,
) =>
  new Set(
    [...ids].filter(
      (id) => !blockedBaseIds.has(championLookup.get(id)?.baseId ?? id),
    ),
  );

export const getSelectableChampionsByCost = (
  champions: readonly Champion[],
  fixedChampionIds: ReadonlySet<string>,
  cost: Cost,
) => {
  const championLookup = createChampionLookup(champions);
  const fixedBaseIds = getBaseIds(fixedChampionIds, championLookup);

  return champions.filter(
    (champion) =>
      champion.cost === cost && !fixedBaseIds.has(champion.baseId),
  );
};

export const getSelectableChampionsByRole = (
  champions: readonly Champion[],
  fixedChampionIds: ReadonlySet<string>,
  role: ChampionRoleGroup,
) => {
  const championLookup = createChampionLookup(champions);
  const fixedBaseIds = getBaseIds(fixedChampionIds, championLookup);

  return champions.filter(
    (champion) =>
      champion.roles.some((candidateRole) => candidateRole.endsWith(`-${role}`)) &&
      !fixedBaseIds.has(champion.baseId),
  );
};

export const useTFTBuilderStore = create<TFTBuilderState>((set, get) => {
  const loadAll = async (refresh: boolean) => {
    const currentStatus = get().dataStatus;
    if (
      currentStatus === "loading" ||
      (!refresh &&
        (currentStatus === "success" ||
          currentStatus === "empty" ||
          currentStatus === "partial"))
    ) {
      return;
    }

    if (refresh) {
      resetTFTDataCache();
    } else {
      set({ loading: true, error: null, dataStatus: "loading" });
    }

    try {
      const {
        champions,
        traits,
        dataVersion,
        metadata,
        opEvaluationIndex,
      } = await fetchTFTData();
      const validTraits = traits.filter((t) => t.name !== "특성 선택");

      const dataStatus: DataLoadStatus =
        champions.length === 0 && validTraits.length === 0
          ? "empty"
          : champions.length === 0 || validTraits.length === 0
            ? "partial"
            : "success";

      const validChampionIds = new Set(
        champions.map((champion) => champion.id),
      );
      const validTraitNames = new Set(validTraits.map((trait) => trait.name));
      set((state) => {
        const sessionsToValidate = {
          ...state.selectionSessions,
          [state.activeSelectionSessionId]: {
            selectedChampions: state.selectedChampions,
            fixedChampions: state.fixedChampions,
            selectedTraits: state.selectedTraits,
          },
        };
        const validSessions = Object.fromEntries(
          Object.entries(sessionsToValidate).map(([id, session]) => [
            id,
            {
              selectedChampions: new Set(
                [...session.selectedChampions].filter((championId) =>
                  validChampionIds.has(championId),
                ),
              ),
              fixedChampions: new Set(
                [...session.fixedChampions].filter((championId) =>
                  validChampionIds.has(championId),
                ),
              ),
              selectedTraits: new Map(
                [...session.selectedTraits].filter(([name]) =>
                  validTraitNames.has(name),
                ),
              ),
            },
          ]),
        );
        const activeSession = validSessions[state.activeSelectionSessionId] ??
          createEmptySelectionSession();
        return {
        champions,
        traits: validTraits,
        dataVersion,
        datasetMetadata: metadata,
        opEvaluationIndex,
        selectedChampions: activeSession.selectedChampions,
        fixedChampions: activeSession.fixedChampions,
        selectedTraits: activeSession.selectedTraits,
        selectionSessions: validSessions,
        error: null,
        dataStatus,
        };
      });
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : "데이터 불러오기 실패";
      if (!refresh || get().champions.length === 0) {
        set({ error: message, dataStatus: "error" });
      }
    } finally {
      if (!refresh) set({ loading: false });
    }
  };

  return {
    champions: [],
    traits: [],
    dataVersion: null,
    datasetMetadata: null,
    opEvaluationIndex: new Map(),
    selectedChampions: new Set(),
    fixedChampions: new Set(),
    selectedTraits: new Map(),
    selectionSessions: { default: createEmptySelectionSession() },
    activeSelectionSessionId: "default",
    loading: false,
    error: null,
    dataStatus: "idle",

    fetchAll: () => loadAll(false),
    refreshAll: () => loadAll(true),

    toggle: (id) =>
      set((state) => {
      const next = new Set(state.selectedChampions);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
        const championLookup = createChampionLookup(state.champions);
        const blockedBaseIds = getBaseIds([id], championLookup);
        const nextFixed = excludeBaseIds(
          state.fixedChampions,
          blockedBaseIds,
          championLookup,
        );
        return updateActiveSelection(state, {
          selectedChampions: next,
          fixedChampions: nextFixed,
        });
      }
      return updateActiveSelection(state, { selectedChampions: next });
      }),

    toggleFixed: (id) =>
      set((state) => {
      const nextFixed = new Set(state.fixedChampions);
      if (nextFixed.has(id)) {
        nextFixed.delete(id);
      } else {
        nextFixed.add(id);
        const championLookup = createChampionLookup(state.champions);
        const blockedBaseIds = getBaseIds([id], championLookup);
        const nextSelected = excludeBaseIds(
          state.selectedChampions,
          blockedBaseIds,
          championLookup,
        );
        return updateActiveSelection(state, {
          fixedChampions: nextFixed,
          selectedChampions: nextSelected,
        });
      }
      return updateActiveSelection(state, { fixedChampions: nextFixed });
      }),

    toggleByCost: (cost: Cost) =>
      set((state) => {
      const nextSelected = new Set(state.selectedChampions);
      const targetChampions = getSelectableChampionsByCost(
        state.champions,
        state.fixedChampions,
        cost,
      );

      if (targetChampions.length === 0) return state;

      const isAllSelected = targetChampions.every((c) =>
        nextSelected.has(c.id),
      );

      targetChampions.forEach((c) => {
        if (isAllSelected) {
          nextSelected.delete(c.id);
        } else {
          nextSelected.add(c.id);
        }
      });

      return updateActiveSelection(state, {
        selectedChampions: nextSelected,
      });
      }),

    toggleByRole: (role) =>
      set((state) => {
      const nextSelected = new Set(state.selectedChampions);
      const targetChampions = getSelectableChampionsByRole(
        state.champions,
        state.fixedChampions,
        role,
      );

      if (targetChampions.length === 0) return state;

      const isAllSelected = targetChampions.every((champion) =>
        nextSelected.has(champion.id),
      );

      targetChampions.forEach((champion) => {
        if (isAllSelected) {
          nextSelected.delete(champion.id);
        } else {
          nextSelected.add(champion.id);
        }
      });

      return updateActiveSelection(state, {
        selectedChampions: nextSelected,
      });
      }),

    updateTraitCount: (name, count) =>
      set((state) => {
      const next = new Map(state.selectedTraits);
      if (count <= 0) {
        next.delete(name);
      } else {
        next.set(name, count);
      }
      return updateActiveSelection(state, { selectedTraits: next });
      }),

    clear: () =>
      set((state) => updateActiveSelection(state, {
        selectedChampions: new Set(),
        fixedChampions: new Set(),
        selectedTraits: new Map(),
      })),

    clearChampionSelections: () =>
      set((state) => updateActiveSelection(state, {
        selectedChampions: new Set(),
        fixedChampions: new Set(),
      })),

    clearSelected: () =>
      set((state) => updateActiveSelection(state, {
        selectedChampions: new Set(),
      })),

    clearFixed: () =>
      set((state) => updateActiveSelection(state, {
        fixedChampions: new Set(),
      })),

    clearTraits: () =>
      set((state) => updateActiveSelection(state, {
        selectedTraits: new Map(),
      })),

    applyTeamAsFixed: (teamIds) =>
      set((state) => {
        const nextFixed = new Set(teamIds);
        const championLookup = createChampionLookup(state.champions);
        const fixedBaseIds = getBaseIds(nextFixed, championLookup);
        const nextSelected = excludeBaseIds(
          state.selectedChampions,
          fixedBaseIds,
          championLookup,
        );

        return updateActiveSelection(state, {
          fixedChampions: nextFixed,
          selectedChampions: nextSelected,
        });
      }),

    createSelectionSession: (id, sourceId) =>
      set((state) => {
        if (!id || state.selectionSessions[id]) return state;
        const source = sourceId === state.activeSelectionSessionId
          ? {
              selectedChampions: state.selectedChampions,
              fixedChampions: state.fixedChampions,
              selectedTraits: state.selectedTraits,
            }
          : sourceId
            ? state.selectionSessions[sourceId]
            : null;
        const session = source
          ? {
              selectedChampions: new Set(source.selectedChampions),
              fixedChampions: new Set(source.fixedChampions),
              selectedTraits: new Map(source.selectedTraits),
            }
          : createEmptySelectionSession();
        return {
          selectionSessions: {
            ...state.selectionSessions,
            [id]: session,
          },
        };
      }),

    activateSelectionSession: (id) =>
      set((state) => {
        const session = state.selectionSessions[id];
        if (!session || id === state.activeSelectionSessionId) return state;
        return {
          activeSelectionSessionId: id,
          selectedChampions: session.selectedChampions,
          fixedChampions: session.fixedChampions,
          selectedTraits: session.selectedTraits,
        };
      }),

    removeSelectionSession: (id, nextId) =>
      set((state) => {
        if (id === "default" || !state.selectionSessions[id]) return state;
        const nextSessions = { ...state.selectionSessions };
        delete nextSessions[id];
        const nextSession = nextSessions[nextId] ?? nextSessions.default;
        return {
          selectionSessions: nextSessions,
          activeSelectionSessionId: nextId in nextSessions ? nextId : "default",
          selectedChampions: nextSession.selectedChampions,
          fixedChampions: nextSession.fixedChampions,
          selectedTraits: nextSession.selectedTraits,
        };
      }),
  };
});
