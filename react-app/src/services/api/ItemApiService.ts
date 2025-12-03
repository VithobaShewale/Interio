/**
 * Item API Service
 * Handles furniture item catalog API calls
 */

import { apiService, ApiResponse } from './BaseApiService';
import { mockItemApiService } from './MockItemApiService';

export interface ItemMetadata {
  id: string;
  name: string;
  model: string;
  type: number;
  category: string;
  thumbnail?: string;
  dimensions?: {
    width: number;
    height: number;
    depth: number;
  };
  price?: number;
  description?: string;
  tags?: string[];
}

export interface ListItemsParams {
  category?: string;
  type?: number;
  search?: string;
  page?: number;
  limit?: number;
  tags?: string[];
}

export interface ListItemsResponse {
  items: ItemMetadata[];
  total: number;
  page: number;
  totalPages: number;
  categories: string[];
}

class ItemApiService {
  private readonly endpoint = '/items';
  private readonly useMock = true; // TODO: Set to false when backend is ready

  async listItems(params?: ListItemsParams): Promise<ApiResponse<ListItemsResponse>> {
    if (this.useMock) {
      return mockItemApiService.listItems(params);
    }
    return apiService.get<ListItemsResponse>(this.endpoint, params);
  }

  async getItem(id: string): Promise<ApiResponse<ItemMetadata>> {
    if (this.useMock) {
      return mockItemApiService.getItem(id);
    }
    return apiService.get<ItemMetadata>(`${this.endpoint}/${id}`);
  }

  async getCategories(): Promise<ApiResponse<string[]>> {
    if (this.useMock) {
      return mockItemApiService.getCategories();
    }
    return apiService.get<string[]>(`${this.endpoint}/categories`);
  }

  async searchItems(query: string): Promise<ApiResponse<ItemMetadata[]>> {
    if (this.useMock) {
      return mockItemApiService.searchItems(query);
    }
    return apiService.get<ItemMetadata[]>(`${this.endpoint}/search`, { q: query });
  }
}

export const itemApiService = new ItemApiService();
