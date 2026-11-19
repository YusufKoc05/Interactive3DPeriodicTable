import { create } from 'zustand';
import elementsRaw from '../data/elements.json';
import type {
  ChemicalElement,
  ViewLayout,
  ColorMode,
  AtomViewModel,
  Language,
  ElementCategory,
  ElementBlock,
  StandardState
} from '../types/element';

const elementsData = elementsRaw as ChemicalElement[];

export interface PeriodicState {
  elements: ChemicalElement[];
  selectedElement: ChemicalElement | null;
  hoveredElement: ChemicalElement | null;
  viewLayout: ViewLayout;
  colorMode: ColorMode;
  temperature: number; // in Kelvin (0 to 6000K, default 298.15K ~ 25°C)
  atomViewModel: AtomViewModel;
  atomAnimationSpeed: number;
  isAtomSpinning: boolean;
  filterCategory: ElementCategory | 'all';
  filterBlock: ElementBlock | 'all';
  filterState: StandardState | 'all';
  searchQuery: string;
  compareElements: [ChemicalElement | null, ChemicalElement | null];
  isCompareOpen: boolean;
  isDetailOpen: boolean;
  isCompoundBuilderOpen: boolean;
  isQuizOpen: boolean;
  isSoundMuted: boolean;
  language: Language;
  performanceMode: boolean; // lowers postprocessing / lod if true

  // Actions
  setSelectedElement: (element: ChemicalElement | null) => void;
  setHoveredElement: (element: ChemicalElement | null) => void;
  setViewLayout: (layout: ViewLayout) => void;
  setColorMode: (mode: ColorMode) => void;
  setTemperature: (temp: number) => void;
  setAtomViewModel: (model: AtomViewModel) => void;
  setAtomAnimationSpeed: (speed: number) => void;
  setIsAtomSpinning: (spinning: boolean) => void;
  setFilterCategory: (category: ElementCategory | 'all') => void;
  setFilterBlock: (block: ElementBlock | 'all') => void;
  setFilterState: (state: StandardState | 'all') => void;
  setSearchQuery: (query: string) => void;
  setIsCompareOpen: (isOpen: boolean) => void;
  setIsCompoundBuilderOpen: (isOpen: boolean) => void;
  setIsQuizOpen: (isOpen: boolean) => void;
  toggleSoundMute: () => void;
  setCompareElement: (slot: 0 | 1, element: ChemicalElement | null) => void;
  setIsDetailOpen: (isOpen: boolean) => void;
  setLanguage: (lang: Language) => void;
  setPerformanceMode: (mode: boolean) => void;
  selectNextElement: () => void;
  selectPrevElement: () => void;
}

export const usePeriodicStore = create<PeriodicState>((set, get) => ({
  elements: elementsData,
  selectedElement: null,
  hoveredElement: null,
  viewLayout: 'table',
  colorMode: 'category',
  temperature: 298.15,
  atomViewModel: 'bohr',
  atomAnimationSpeed: 1,
  isAtomSpinning: true,
  filterCategory: 'all',
  filterBlock: 'all',
  filterState: 'all',
  searchQuery: '',
  compareElements: [null, null],
  isCompareOpen: false,
  isDetailOpen: false,
  isCompoundBuilderOpen: false,
  isQuizOpen: false,
  isSoundMuted: false,
  language: 'tr',
  performanceMode: false,

  setSelectedElement: (element) =>
    set({
      selectedElement: element,
      isDetailOpen: element !== null
    }),

  setHoveredElement: (element) => set({ hoveredElement: element }),
  setViewLayout: (viewLayout) => set({ viewLayout }),
  setColorMode: (colorMode) => set({ colorMode }),
  setTemperature: (temperature) => set({ temperature }),
  setAtomViewModel: (atomViewModel) => set({ atomViewModel }),
  setAtomAnimationSpeed: (atomAnimationSpeed) => set({ atomAnimationSpeed }),
  setIsAtomSpinning: (isAtomSpinning) => set({ isAtomSpinning }),
  setFilterCategory: (filterCategory) => set({ filterCategory }),
  setFilterBlock: (filterBlock) => set({ filterBlock }),
  setFilterState: (filterState) => set({ filterState }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setIsCompareOpen: (isCompareOpen) => set({ isCompareOpen }),
  setIsCompoundBuilderOpen: (isCompoundBuilderOpen) => set({ isCompoundBuilderOpen }),
  setIsQuizOpen: (isQuizOpen) => set({ isQuizOpen }),
  toggleSoundMute: () =>
    set((state) => ({ isSoundMuted: !state.isSoundMuted })),
  setCompareElement: (slot, element) =>
    set((state) => {
      const pair: [ChemicalElement | null, ChemicalElement | null] = [...state.compareElements];
      pair[slot] = element;
      return { compareElements: pair };
    }),
  setIsDetailOpen: (isDetailOpen) => set({ isDetailOpen }),
  setLanguage: (language) => set({ language }),
  setPerformanceMode: (performanceMode) => set({ performanceMode }),

  selectNextElement: () => {
    const { selectedElement, elements } = get();
    if (!selectedElement) {
      set({ selectedElement: elements[0], isDetailOpen: true });
      return;
    }
    const nextZ = selectedElement.atomicNumber >= 118 ? 1 : selectedElement.atomicNumber + 1;
    const nextElem = elements.find((e) => e.atomicNumber === nextZ) || elements[0];
    set({ selectedElement: nextElem, isDetailOpen: true });
  },

  selectPrevElement: () => {
    const { selectedElement, elements } = get();
    if (!selectedElement) {
      set({ selectedElement: elements[117], isDetailOpen: true });
      return;
    }
    const prevZ = selectedElement.atomicNumber <= 1 ? 118 : selectedElement.atomicNumber - 1;
    const prevElem = elements.find((e) => e.atomicNumber === prevZ) || elements[117];
    set({ selectedElement: prevElem, isDetailOpen: true });
  }
}));
