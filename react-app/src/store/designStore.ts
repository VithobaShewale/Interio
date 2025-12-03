/**
 * Design Store
 * Manages design state (floorplan, items, metadata)
 */

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { Design } from '../services/api';

interface DesignState {
  // Current design
  currentDesign: Design | null;
  isLoading: boolean;
  error: string | null;
  isDirty: boolean;
  lastSaved: Date | null;

  // Design list
  designs: Design[];
  totalDesigns: number;
  currentPage: number;

  // Actions
  setCurrentDesign: (design: Design | null) => void;
  updateDesignData: (floorplan: any, items: any[]) => void;
  markDirty: () => void;
  markClean: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setDesigns: (designs: Design[], total: number, page: number) => void;
  addDesign: (design: Design) => void;
  removeDesign: (id: string) => void;
  updateDesignInList: (id: string, updates: Partial<Design>) => void;
}

export const useDesignStore = create<DesignState>()(
  immer((set) => ({
    // Initial state
    currentDesign: null,
    isLoading: false,
    error: null,
    isDirty: false,
    lastSaved: null,
    designs: [],
    totalDesigns: 0,
    currentPage: 1,

    // Actions
    setCurrentDesign: (design) =>
      set((state) => {
        state.currentDesign = design;
        state.isDirty = false;
        state.lastSaved = design ? new Date() : null;
        state.error = null;
      }),

    updateDesignData: (floorplan, items) =>
      set((state) => {
        if (state.currentDesign) {
          state.currentDesign.floorplan = floorplan;
          state.currentDesign.items = items;
          state.currentDesign.updatedAt = new Date().toISOString();
          state.isDirty = true;
        }
      }),

    markDirty: () =>
      set((state) => {
        state.isDirty = true;
      }),

    markClean: () =>
      set((state) => {
        state.isDirty = false;
        state.lastSaved = new Date();
      }),

    setLoading: (loading) =>
      set((state) => {
        state.isLoading = loading;
      }),

    setError: (error) =>
      set((state) => {
        state.error = error;
        state.isLoading = false;
      }),

    setDesigns: (designs, total, page) =>
      set((state) => {
        state.designs = designs;
        state.totalDesigns = total;
        state.currentPage = page;
      }),

    addDesign: (design) =>
      set((state) => {
        state.designs.unshift(design);
        state.totalDesigns += 1;
      }),

    removeDesign: (id) =>
      set((state) => {
        state.designs = state.designs.filter((d) => d.id !== id);
        state.totalDesigns -= 1;
      }),

    updateDesignInList: (id, updates) =>
      set((state) => {
        const index = state.designs.findIndex((d) => d.id === id);
        if (index !== -1) {
          state.designs[index] = { ...state.designs[index], ...updates };
        }
      }),
  }))
);
