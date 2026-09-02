import { create } from "zustand";
import type { BeamSearchResult } from "../core/beamSearchOptimizer";
import { useTFTBuilderStore } from "../store/useTFTBuilderStore";

export interface RecommendationSnapshot {
  readonly results: readonly BeamSearchResult[];
  readonly inputSignature: string;
  readonly generatedAt: number;
}

export interface RecommendationSession {
  readonly teamSize: number;
  readonly teamSizeCustomized: boolean;
  readonly shuffleCandidates: boolean;
  readonly snapshot: RecommendationSnapshot | null;
  readonly loading: boolean;
  readonly needsRecalculation: boolean;
}

interface RecommendationState extends RecommendationSession {
  readonly tabIds: readonly string[];
  readonly activeTabId: string;
  readonly sessions: Readonly<Record<string, RecommendationSession>>;
  readonly nextTabNumber: number;
  readonly setTeamSize: (teamSize: number, maximum?: number) => void;
  readonly setShuffleCandidates: (enabled: boolean) => void;
  readonly startRecommendation: (tabId?: string) => void;
  readonly completeRecommendation: (
    results: readonly BeamSearchResult[],
    inputSignature: string,
    tabId?: string,
  ) => void;
  readonly failRecommendation: (tabId?: string) => void;
  readonly invalidateRecommendation: () => void;
  readonly addTab: (maximumAdditionalTabs: number, defaultTeamSize: number) => void;
  readonly copyActiveTab: (maximumAdditionalTabs: number) => void;
  readonly activateTab: (id: string) => void;
  readonly closeTab: (id: string) => void;
  readonly applyRuntimeLimits: (defaultTeamSize: number, maximumTeamSize: number) => void;
}

const createSession = (teamSize: number): RecommendationSession => ({
  teamSize,
  teamSizeCustomized: false,
  shuffleCandidates: false,
  snapshot: null,
  loading: false,
  needsRecalculation: false,
});

const normalizeTeamSize = (teamSize: number, maximum = 15): number =>
  Math.min(maximum, Math.max(0, Math.trunc(teamSize)));

const updateActiveSession = (
  state: RecommendationState,
  patch: Partial<RecommendationSession>,
) => {
  const current = state.sessions[state.activeTabId] ?? createSession(4);
  const next = { ...current, ...patch };
  return {
    ...patch,
    sessions: { ...state.sessions, [state.activeTabId]: next },
  };
};

const updateSession = (
  state: RecommendationState,
  id: string,
  patch: Partial<RecommendationSession>,
) => {
  const current = state.sessions[id];
  if (!current) return state;
  const next = { ...current, ...patch };
  return id === state.activeTabId
    ? { ...patch, sessions: { ...state.sessions, [id]: next } }
    : { sessions: { ...state.sessions, [id]: next } };
};

const defaultSession = createSession(4);

export const useRecommendationStore = create<RecommendationState>((set, get) => ({
  ...defaultSession,
  tabIds: ["default"],
  activeTabId: "default",
  sessions: { default: defaultSession },
  nextTabNumber: 2,

  setTeamSize: (teamSize, maximum = 15) =>
    set((state) => {
      const nextTeamSize = normalizeTeamSize(teamSize, maximum);
      if (state.teamSize === nextTeamSize) return state;
      return updateActiveSession(state, {
        teamSize: nextTeamSize,
        teamSizeCustomized: true,
        snapshot: null,
        needsRecalculation: state.snapshot !== null || state.needsRecalculation,
      });
    }),

  setShuffleCandidates: (shuffleCandidates) =>
    set((state) => {
      if (state.shuffleCandidates === shuffleCandidates) return state;
      return updateActiveSession(state, {
        shuffleCandidates,
        snapshot: null,
        needsRecalculation: state.snapshot !== null || state.needsRecalculation,
      });
    }),

  startRecommendation: (tabId) =>
    set((state) => updateSession(
      state,
      tabId ?? state.activeTabId,
      { loading: true },
    )),

  completeRecommendation: (results, inputSignature, tabId) =>
    set((state) => updateSession(state, tabId ?? state.activeTabId, {
      snapshot: { results, inputSignature, generatedAt: Date.now() },
      loading: false,
      needsRecalculation: false,
    })),

  failRecommendation: (tabId) =>
    set((state) => updateSession(
      state,
      tabId ?? state.activeTabId,
      { loading: false },
    )),

  invalidateRecommendation: () =>
    set((state) => state.snapshot === null
      ? state
      : updateActiveSession(state, {
          snapshot: null,
          needsRecalculation: true,
        })),

  addTab: (maximumAdditionalTabs, defaultTeamSize) => {
    const state = get();
    if (state.tabIds.length >= 1 + Math.max(0, maximumAdditionalTabs)) return;
    const id = `recommendation-${state.nextTabNumber}`;
    const session = createSession(normalizeTeamSize(defaultTeamSize));
    useTFTBuilderStore.getState().createSelectionSession(id);
    useTFTBuilderStore.getState().activateSelectionSession(id);
    set({
      ...session,
      tabIds: [...state.tabIds, id],
      activeTabId: id,
      sessions: { ...state.sessions, [id]: session },
      nextTabNumber: state.nextTabNumber + 1,
    });
  },

  copyActiveTab: (maximumAdditionalTabs) => {
    const state = get();
    if (state.tabIds.length >= 1 + Math.max(0, maximumAdditionalTabs)) return;
    const id = `recommendation-${state.nextTabNumber}`;
    const session: RecommendationSession = {
      teamSize: state.teamSize,
      teamSizeCustomized: state.teamSizeCustomized,
      shuffleCandidates: state.shuffleCandidates,
      snapshot: null,
      loading: false,
      needsRecalculation: false,
    };
    useTFTBuilderStore.getState().createSelectionSession(
      id,
      state.activeTabId,
    );
    useTFTBuilderStore.getState().activateSelectionSession(id);
    set({
      ...session,
      tabIds: [...state.tabIds, id],
      activeTabId: id,
      sessions: { ...state.sessions, [id]: session },
      nextTabNumber: state.nextTabNumber + 1,
    });
  },

  activateTab: (id) => {
    const state = get();
    const session = state.sessions[id];
    if (!session || id === state.activeTabId) return;
    useTFTBuilderStore.getState().activateSelectionSession(id);
    set({ ...session, activeTabId: id });
  },

  closeTab: (id) => {
    const state = get();
    const index = state.tabIds.indexOf(id);
    if (id === "default" || index < 0) return;
    const tabIds = state.tabIds.filter((candidate) => candidate !== id);
    const nextId = id === state.activeTabId
      ? (tabIds[Math.max(0, index - 1)] ?? "default")
      : state.activeTabId;
    const sessions = { ...state.sessions };
    delete sessions[id];
    const nextSession = sessions[nextId] ?? sessions.default;
    useTFTBuilderStore.getState().removeSelectionSession(id, nextId);
    set({ ...nextSession, tabIds, activeTabId: nextId, sessions });
  },

  applyRuntimeLimits: (defaultTeamSize, maximumTeamSize) =>
    set((state) => {
      let changed = false;
      const sessions = Object.fromEntries(state.tabIds.map((id) => {
        const session = state.sessions[id] ?? createSession(defaultTeamSize);
        const normalized = normalizeTeamSize(
          session.teamSizeCustomized ? session.teamSize : defaultTeamSize,
          maximumTeamSize,
        );
        if (normalized === session.teamSize) return [id, session];
        changed = true;
        return [id, {
          ...session,
          teamSize: normalized,
          snapshot: null,
          needsRecalculation: session.snapshot !== null || session.needsRecalculation,
        }];
      }));
      if (!changed) return state;
      return { ...sessions[state.activeTabId], sessions };
    }),
}));

export const isRecommendationSnapshotCurrent = (
  snapshot: RecommendationSnapshot | null,
  inputSignature: string,
): snapshot is RecommendationSnapshot =>
  snapshot !== null && snapshot.inputSignature === inputSignature;
