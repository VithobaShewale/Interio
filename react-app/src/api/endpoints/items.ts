/**
 * Items API Endpoints
 * Handle furniture items, catalog, and metadata
 */

import { api } from '../client';
import { AxiosResponse } from 'axios';

// Mock data fallback (when API is not available)
import itemsData from '../../assets/data/items.json';

export interface ItemMetadata {
  id: string;
  name: string;
  category: string;
  model: string;
  thumbnail: string;
  dimensions: {
    width: number;
    height: number;
    depth: number;
  };
  price?: number;
  material?: string;
  tags?: string[];
}

export interface ItemCategory {
  id: string;
  name: string;
  icon: string;
  itemCount: number;
}

/**
 * Fetch all available items from the catalog
 */
export const fetchItems = async (): Promise<ItemMetadata[]> => {
  // Using local JSON data only
  return itemsData.items as ItemMetadata[];
  
  /* API call disabled - uncomment to use API server
  try {
    const response: AxiosResponse<ItemMetadata[]> = await api.get('/items');
    return response.data;
  } catch (error) {
    console.warn('API not available, using mock data');
    return itemsData.items as ItemMetadata[];
  }
  */
};

/**
 * Fetch items by category
 */
export const fetchItemsByCategory = async (categoryId: string): Promise<ItemMetadata[]> => {
  try {
    const response: AxiosResponse<ItemMetadata[]> = await api.get(`/items/category/${categoryId}`);
    return response.data;
  } catch (error) {
    // Fallback to mock data
    console.warn('API not available, using mock data');
    return (itemsData.items as ItemMetadata[]).filter(
      (item: any) => item.category === categoryId
    );
  }
};

/**
 * Fetch all categories
 */
export const fetchCategories = async (): Promise<ItemCategory[]> => {
  // Using local JSON data only
  return itemsData.categories as ItemCategory[];
  
  /* API call disabled - uncomment to use API server
  try {
    const response: AxiosResponse<ItemCategory[]> = await api.get('/items/categories');
    return response.data;
  } catch (error) {
    console.warn('API not available, using mock data');
    return itemsData.categories as ItemCategory[];
  }
  */
};

/**
 * Fetch item details by ID
 */
export const fetchItemById = async (itemId: string): Promise<ItemMetadata> => {
  try {
    const response: AxiosResponse<ItemMetadata> = await api.get(`/items/${itemId}`);
    return response.data;
  } catch (error) {
    // Fallback to mock data
    console.warn('API not available, using mock data');
    const item = (itemsData.items as ItemMetadata[]).find((i: any) => i.id === itemId);
    if (!item) {
      throw new Error(`Item with ID ${itemId} not found`);
    }
    return item;
  }
};

/**
 * Search items by query
 */
export const searchItems = async (query: string): Promise<ItemMetadata[]> => {
  try {
    const response: AxiosResponse<ItemMetadata[]> = await api.get('/items/search', {
      params: { q: query },
    });
    return response.data;
  } catch (error) {
    // Fallback to mock data
    console.warn('API not available, using mock data');
    const lowerQuery = query.toLowerCase();
    return (itemsData.items as ItemMetadata[]).filter((item: any) =>
      item.name.toLowerCase().includes(lowerQuery) ||
      item.category.toLowerCase().includes(lowerQuery) ||
      item.tags?.some((tag: string) => tag.toLowerCase().includes(lowerQuery))
    );
  }
};
