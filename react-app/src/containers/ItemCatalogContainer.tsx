/**
 * Item Catalog Container
 * Connects item catalog state to components
 */

import React, { useEffect, useCallback } from 'react';
import { useItemStore } from '../store';
import { itemApiService, ItemMetadata } from '../services/api';
import { useUIStore } from '../store';

interface ItemCatalogContainerProps {
  children: (props: ItemCatalogContainerChildProps) => React.ReactNode;
}

export interface ItemCatalogContainerChildProps {
  items: ItemMetadata[];
  categories: string[];
  selectedCategory: string | null;
  searchQuery: string;
  isLoading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  
  // Actions
  loadItems: () => Promise<void>;
  setCategory: (category: string | null) => void;
  setSearch: (query: string) => void;
  nextPage: () => void;
  prevPage: () => void;
  goToPage: (page: number) => void;
}

export const ItemCatalogContainer: React.FC<ItemCatalogContainerProps> = ({ children }) => {
  const {
    items,
    categories,
    selectedCategory,
    searchQuery,
    isLoading,
    error,
    currentPage,
    totalPages,
    setItems,
    setCategories,
    setSelectedCategory,
    setSearchQuery,
    setLoading,
    setError,
  } = useItemStore();

  const { showNotification } = useUIStore();

  // Load categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await itemApiService.getCategories();
        setCategories(response.data);
      } catch (err: any) {
        console.error('Failed to load categories:', err);
      }
    };

    loadCategories();
  }, [setCategories]);

  // Load items when filters change
  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const response = await itemApiService.listItems({
        category: selectedCategory || undefined,
        search: searchQuery || undefined,
        page: currentPage,
        limit: 20,
      });

      setItems(
        response.data.items,
        response.data.total,
        response.data.page,
        response.data.totalPages
      );
    } catch (err: any) {
      const message = err.message || 'Failed to load items';
      setError(message);
      showNotification(message, 'error');
    }
  }, [selectedCategory, searchQuery, currentPage, setLoading, setItems, setError, showNotification]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const setCategory = useCallback(
    (category: string | null) => {
      setSelectedCategory(category);
    },
    [setSelectedCategory]
  );

  const setSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);
    },
    [setSearchQuery]
  );

  const nextPage = useCallback(() => {
    if (currentPage < totalPages) {
      useItemStore.setState({ currentPage: currentPage + 1 });
    }
  }, [currentPage, totalPages]);

  const prevPage = useCallback(() => {
    if (currentPage > 1) {
      useItemStore.setState({ currentPage: currentPage - 1 });
    }
  }, [currentPage]);

  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) {
      useItemStore.setState({ currentPage: page });
    }
  }, [totalPages]);

  return (
    <>
      {children({
        items,
        categories,
        selectedCategory,
        searchQuery,
        isLoading,
        error,
        currentPage,
        totalPages,
        loadItems,
        setCategory,
        setSearch,
        nextPage,
        prevPage,
        goToPage,
      })}
    </>
  );
};
