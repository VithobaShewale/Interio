/**
 * Mock Item API Service
 * Simulates API calls with local data until backend is ready
 */

import { ApiResponse } from './BaseApiService';
import { ItemMetadata, ListItemsParams, ListItemsResponse } from './ItemApiService';
import { mockItems, mockCategories } from '../../data/mockItems';

class MockItemApiService {
  private readonly ITEMS_PER_PAGE = 20;

  async listItems(params?: ListItemsParams): Promise<ApiResponse<ListItemsResponse>> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    let filteredItems = [...mockItems];

    // Filter by category
    if (params?.category && params.category !== 'All') {
      filteredItems = filteredItems.filter(item => item.category === params.category);
    }

    // Filter by type
    if (params?.type !== undefined) {
      filteredItems = filteredItems.filter(item => item.type === params.type);
    }

    // Filter by search
    if (params?.search) {
      const search = params.search.toLowerCase();
      filteredItems = filteredItems.filter(
        item =>
          item.name.toLowerCase().includes(search) ||
          item.category.toLowerCase().includes(search) ||
          item.tags?.some(tag => tag.toLowerCase().includes(search))
      );
    }

    // Filter by tags
    if (params?.tags && params.tags.length > 0) {
      filteredItems = filteredItems.filter(item =>
        params.tags!.some(tag => item.tags?.includes(tag))
      );
    }

    // Pagination
    const page = params?.page || 1;
    const limit = params?.limit || this.ITEMS_PER_PAGE;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedItems = filteredItems.slice(startIndex, endIndex);
    const totalPages = Math.ceil(filteredItems.length / limit);

    return {
      data: {
        items: paginatedItems,
        total: filteredItems.length,
        page,
        totalPages,
        categories: mockCategories,
      },
      status: 200,
    };
  }

  async getItem(id: string): Promise<ApiResponse<ItemMetadata>> {
    await new Promise(resolve => setTimeout(resolve, 100));

    const item = mockItems.find(i => i.id === id);
    if (!item) {
      throw new Error('Item not found');
    }

    return {
      data: item,
      status: 200,
    };
  }

  async getCategories(): Promise<ApiResponse<string[]>> {
    await new Promise(resolve => setTimeout(resolve, 50));

    return {
      data: mockCategories,
      status: 200,
    };
  }

  async searchItems(query: string): Promise<ApiResponse<ItemMetadata[]>> {
    await new Promise(resolve => setTimeout(resolve, 200));

    const search = query.toLowerCase();
    const results = mockItems.filter(
      item =>
        item.name.toLowerCase().includes(search) ||
        item.category.toLowerCase().includes(search) ||
        item.tags?.some(tag => tag.toLowerCase().includes(search))
    );

    return {
      data: results,
      status: 200,
    };
  }
}

export const mockItemApiService = new MockItemApiService();
