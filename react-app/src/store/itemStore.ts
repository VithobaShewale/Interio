/**
 * Item Store
 * Manages furniture item catalog state
 */

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { ItemMetadata } from '../services/api';

interface ItemState {
  items: ItemMetadata[];
  categories: string[];
  selectedCategory: string | null;
  searchQuery: string;
  isLoading: boolean;
  error: string | null;

  // Pagination
  currentPage: number;
  totalPages: number;
  totalItems: number;

  // Actions
  setItems: (items: ItemMetadata[], total: number, page: number, totalPages: number) => void;
  setCategories: (categories: string[]) => void;
  setSelectedCategory: (category: string | null) => void;
  setSearchQuery: (query: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearItems: () => void;
}

export const useItemStore = create<ItemState>()(
  immer((set) => ({
    // Initial state
    items: [],
    categories: [],
    selectedCategory: null,
    searchQuery: '',
    isLoading: false,
    error: null,
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,

    // Actions
    setItems: (items, total, page, totalPages) =>
      set((state) => {
        state.items = items;
        state.totalItems = total;
        state.currentPage = page;
        state.totalPages = totalPages;
        state.isLoading = false;
        state.error = null;
      }),

    setCategories: (categories) =>
      set((state) => {
        state.categories = categories;
      }),

    setSelectedCategory: (category) =>
      set((state) => {
        state.selectedCategory = category;
        state.currentPage = 1;
      }),

    setSearchQuery: (query) =>
      set((state) => {
        state.searchQuery = query;
        state.currentPage = 1;
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

    clearItems: () =>
      set((state) => {
        state.items = [];
        state.totalItems = 0;
        state.currentPage = 1;
        state.totalPages = 1;
      }),
  }))
);
