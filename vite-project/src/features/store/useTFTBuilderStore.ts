import { create } from 'zustand';
import type { Champion } from '../selector/champion-selector/types';
import { fetchTFTData, type Trait } from '../api/tftApi';

interface State {
  champions: Champion[];
  traits: Trait[];
  selectedChampions: Set<string>;
  fixedChampions: Set<string>;
  selectedTraits: Map<string, number>;
  loading: boolean;
  error: string | null;

  fetchAll: () => Promise<void>;
  toggle: (id: string) => void;
  toggleFixed: (id: string) => void;
  updateTraitCount: (name: string, count: number) => void;
  clear: () => void;
  clearSelected: () => void;
  clearFixed: () => void;
  clearTraits: () => void;
  selectTeam: (ids: string[]) => void;
}

export const useTFTBuilderStore = create<State>((set, get) => ({
  champions: [],
  traits: [],
  selectedChampions: new Set(),
  fixedChampions: new Set(),
  selectedTraits: new Map(),
  loading: false,
  error: null,

  fetchAll: async () => {
    if (get().champions.length > 0) return;

    set({ loading: true, error: null });

    try {
      const { champions, traits } = await fetchTFTData();
      const validTraits = traits.filter((t) => t.name !== '특성 선택');

      if (import.meta.env.DEV) {
        console.group('📊 [TFT DATA FETCH SUCCESS]');
        console.log(`🦸‍♂️ Champions Loaded: %c${champions.length}개`, 'color: #3b82f6; font-weight: bold');
        console.log(`🧬 Total Traits Fetched: ${traits.length}개`);
        console.log(`✨ Valid Traits Filtered: %c${validTraits.length}개`, 'color: #10b981; font-weight: bold');
        console.dir({ champions, traits: traits });
        console.groupEnd();
      }

      set({ champions, traits: validTraits });
    } 
    catch (err) {
      set({ error: '데이터 불러오기 실패' });
    } 
    finally {
      set({ loading: false });
    }
  },

  toggle: (id) =>
    set((state) => {
      const next = new Set(state.selectedChampions);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
        const nextFixed = new Set(state.fixedChampions);
        nextFixed.delete(id);
        return { selectedChampions: next, fixedChampions: nextFixed };
      }
      return { selectedChampions: next };
    }),

  toggleFixed: (id) =>
    set((state) => {
      const nextFixed = new Set(state.fixedChampions);
      if (nextFixed.has(id)) {
        nextFixed.delete(id);
      } else {
        nextFixed.add(id);
        const nextSelected = new Set(state.selectedChampions);
        nextSelected.delete(id);
        return { fixedChampions: nextFixed, selectedChampions: nextSelected };
      }
      return { fixedChampions: nextFixed };
    }),

  updateTraitCount: (name, count) =>
    set((state) => {
      const next = new Map(state.selectedTraits);
      if (count <= 0) {
        next.delete(name);
      } else {
        next.set(name, count);
      }
      return { selectedTraits: next };
    }),

  clear: () => set({ 
    selectedChampions: new Set(), 
    fixedChampions: new Set(), 
    selectedTraits: new Map()
  }),

  clearSelected: () => set({ selectedChampions: new Set() }),

  clearFixed: () => set({ fixedChampions: new Set() }),

  clearTraits: () => set({ selectedTraits: new Map() }),

  selectTeam: (ids: string[]) => 
    set((state) => {
      const nextSelected = new Set<string>();
      
      ids.forEach((id) => {
        if (!state.fixedChampions.has(id)) {
          nextSelected.add(id);
        }
      });
      
      return { selectedChampions: nextSelected };
    }),
}));
