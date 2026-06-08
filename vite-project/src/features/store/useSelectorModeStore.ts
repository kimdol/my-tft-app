import { create } from 'zustand';

export type SelectorMode = 'intro' | 'result' | 'candidate' | 'fixed' | 'trait';

interface SelectorModeState {
  mode: SelectorMode;
  setMode: (mode: SelectorMode) => void;
}

export const useSelectorModeStore = create<SelectorModeState>((set) => ({
  mode: 'intro',
  setMode: (mode) => set({ mode }),
}));