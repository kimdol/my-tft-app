import { create } from 'zustand';

export type SelectorMode = 'intro' | 'result' | 'candidate' | 'fixed' | 'trait';
export type SelectorQueryMode = Extract<
  SelectorMode,
  "candidate" | "fixed" | "trait"
>;

const isSelectorQueryMode = (
  mode: SelectorMode,
): mode is SelectorQueryMode =>
  mode === "candidate" || mode === "fixed" || mode === "trait";

interface SelectorModeState {
  mode: SelectorMode;
  selectorQueries: Readonly<Record<SelectorQueryMode, string>>;
  setMode: (mode: SelectorMode) => void;
  setSelectorQuery: (mode: SelectorQueryMode, query: string) => void;
}

export const useSelectorModeStore = create<SelectorModeState>((set) => ({
  mode: 'intro',
  selectorQueries: {
    candidate: "",
    fixed: "",
    trait: "",
  },
  setMode: (mode) =>
    set((state) => {
      if (mode === state.mode) return state;
      if (!isSelectorQueryMode(state.mode)) return { mode };

      return {
        mode,
        selectorQueries: {
          ...state.selectorQueries,
          [state.mode]: "",
        },
      };
    }),
  setSelectorQuery: (mode, query) =>
    set((state) => ({
      selectorQueries: {
        ...state.selectorQueries,
        [mode]: query,
      },
    })),
}));
