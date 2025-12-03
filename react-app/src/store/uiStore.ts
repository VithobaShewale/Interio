/**
 * UI Store
 * Manages UI state (panels, modals, view modes, etc.)
 */

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

export type ViewMode = '3d' | '2d' | 'wall';
export type PanelType = 'floor-plan' | 'items' | 'properties' | null;

interface UIState {
  // View mode
  viewMode: ViewMode;
  
  // Panels
  activePanel: PanelType;
  isPanelCollapsed: boolean;
  
  // Modals
  showSettings: boolean;
  showImportExport: boolean;
  showNewDesign: boolean;
  showLoadDesign: boolean;
  
  // Loading states
  isGlobalLoading: boolean;
  loadingMessage: string | null;
  
  // Notifications
  notification: {
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
  } | null;

  // Actions
  setViewMode: (mode: ViewMode) => void;
  setActivePanel: (panel: PanelType) => void;
  togglePanel: () => void;
  openModal: (modal: 'settings' | 'importExport' | 'newDesign' | 'loadDesign') => void;
  closeModal: (modal: 'settings' | 'importExport' | 'newDesign' | 'loadDesign') => void;
  closeAllModals: () => void;
  setGlobalLoading: (loading: boolean, message?: string) => void;
  showNotification: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
  clearNotification: () => void;
}

export const useUIStore = create<UIState>()(
  immer((set) => ({
    // Initial state
    viewMode: '3d',
    activePanel: null,
    isPanelCollapsed: false,
    showSettings: false,
    showImportExport: false,
    showNewDesign: false,
    showLoadDesign: false,
    isGlobalLoading: false,
    loadingMessage: null,
    notification: null,

    // Actions
    setViewMode: (mode) =>
      set((state) => {
        state.viewMode = mode;
      }),

    setActivePanel: (panel) =>
      set((state) => {
        state.activePanel = panel;
        if (panel !== null) {
          state.isPanelCollapsed = false;
        }
      }),

    togglePanel: () =>
      set((state) => {
        state.isPanelCollapsed = !state.isPanelCollapsed;
      }),

    openModal: (modal) =>
      set((state) => {
        switch (modal) {
          case 'settings':
            state.showSettings = true;
            break;
          case 'importExport':
            state.showImportExport = true;
            break;
          case 'newDesign':
            state.showNewDesign = true;
            break;
          case 'loadDesign':
            state.showLoadDesign = true;
            break;
        }
      }),

    closeModal: (modal) =>
      set((state) => {
        switch (modal) {
          case 'settings':
            state.showSettings = false;
            break;
          case 'importExport':
            state.showImportExport = false;
            break;
          case 'newDesign':
            state.showNewDesign = false;
            break;
          case 'loadDesign':
            state.showLoadDesign = false;
            break;
        }
      }),

    closeAllModals: () =>
      set((state) => {
        state.showSettings = false;
        state.showImportExport = false;
        state.showNewDesign = false;
        state.showLoadDesign = false;
      }),

    setGlobalLoading: (loading, message) =>
      set((state) => {
        state.isGlobalLoading = loading;
        state.loadingMessage = message || null;
      }),

    showNotification: (message, type) =>
      set((state) => {
        state.notification = { message, type };
      }),

    clearNotification: () =>
      set((state) => {
        state.notification = null;
      }),
  }))
);
