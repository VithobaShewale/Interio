/**
 * Design API Service
 * Handles all design-related API calls (save, load, list)
 */

import { apiService, ApiResponse } from './BaseApiService';

export interface Design {
  id: string;
  name: string;
  description?: string;
  floorplan: any;
  items: any[];
  thumbnail?: string;
  createdAt: string;
  updatedAt: string;
  userId?: string;
}

export interface CreateDesignDto {
  name: string;
  description?: string;
  floorplan: any;
  items: any[];
  thumbnail?: string;
}

export interface UpdateDesignDto {
  name?: string;
  description?: string;
  floorplan?: any;
  items?: any[];
  thumbnail?: string;
}

export interface ListDesignsParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: 'name' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

export interface ListDesignsResponse {
  designs: Design[];
  total: number;
  page: number;
  totalPages: number;
}

class DesignApiService {
  private readonly endpoint = '/designs';

  async listDesigns(params?: ListDesignsParams): Promise<ApiResponse<ListDesignsResponse>> {
    return apiService.get<ListDesignsResponse>(this.endpoint, params);
  }

  async getDesign(id: string): Promise<ApiResponse<Design>> {
    return apiService.get<Design>(`${this.endpoint}/${id}`);
  }

  async createDesign(data: CreateDesignDto): Promise<ApiResponse<Design>> {
    return apiService.post<Design>(this.endpoint, data);
  }

  async updateDesign(id: string, data: UpdateDesignDto): Promise<ApiResponse<Design>> {
    return apiService.put<Design>(`${this.endpoint}/${id}`, data);
  }

  async deleteDesign(id: string): Promise<ApiResponse<void>> {
    return apiService.delete<void>(`${this.endpoint}/${id}`);
  }

  async duplicateDesign(id: string, name: string): Promise<ApiResponse<Design>> {
    return apiService.post<Design>(`${this.endpoint}/${id}/duplicate`, { name });
  }
}

export const designApiService = new DesignApiService();
