/**
 * Designs API Endpoints
 * Handle saving, loading, and managing floor plan designs
 */

import { api } from '../client';
import { AxiosResponse } from 'axios';

export interface Design {
  id: string;
  name: string;
  description?: string;
  thumbnail?: string;
  data: any; // Blueprint3D serialized data
  createdAt: string;
  updatedAt: string;
  userId?: string;
}

export interface CreateDesignRequest {
  name: string;
  description?: string;
  data: any;
  thumbnail?: string;
}

export interface UpdateDesignRequest {
  name?: string;
  description?: string;
  data?: any;
  thumbnail?: string;
}

/**
 * Fetch all designs for current user
 */
export const fetchDesigns = async (): Promise<Design[]> => {
  try {
    const response: AxiosResponse<Design[]> = await api.get('/designs');
    return response.data;
  } catch (error) {
    // Fallback to localStorage
    console.warn('API not available, using localStorage');
    const savedDesigns = localStorage.getItem('saved_designs');
    return savedDesigns ? JSON.parse(savedDesigns) : [];
  }
};

/**
 * Fetch design by ID
 */
export const fetchDesignById = async (designId: string): Promise<Design> => {
  try {
    const response: AxiosResponse<Design> = await api.get(`/designs/${designId}`);
    return response.data;
  } catch (error) {
    // Fallback to localStorage
    console.warn('API not available, using localStorage');
    const savedDesigns = localStorage.getItem('saved_designs');
    if (savedDesigns) {
      const designs = JSON.parse(savedDesigns);
      const design = designs.find((d: Design) => d.id === designId);
      if (design) return design;
    }
    throw new Error(`Design with ID ${designId} not found`);
  }
};

/**
 * Create new design
 */
export const createDesign = async (design: CreateDesignRequest): Promise<Design> => {
  try {
    const response: AxiosResponse<Design> = await api.post('/designs', design);
    return response.data;
  } catch (error) {
    // Fallback to localStorage
    console.warn('API not available, using localStorage');
    const newDesign: Design = {
      id: Date.now().toString(),
      ...design,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const savedDesigns = localStorage.getItem('saved_designs');
    const designs = savedDesigns ? JSON.parse(savedDesigns) : [];
    designs.push(newDesign);
    localStorage.setItem('saved_designs', JSON.stringify(designs));

    return newDesign;
  }
};

/**
 * Update existing design
 */
export const updateDesign = async (
  designId: string,
  updates: UpdateDesignRequest
): Promise<Design> => {
  try {
    const response: AxiosResponse<Design> = await api.put(`/designs/${designId}`, updates);
    return response.data;
  } catch (error) {
    // Fallback to localStorage
    console.warn('API not available, using localStorage');
    const savedDesigns = localStorage.getItem('saved_designs');
    if (savedDesigns) {
      const designs = JSON.parse(savedDesigns);
      const index = designs.findIndex((d: Design) => d.id === designId);
      if (index !== -1) {
        designs[index] = {
          ...designs[index],
          ...updates,
          updatedAt: new Date().toISOString(),
        };
        localStorage.setItem('saved_designs', JSON.stringify(designs));
        return designs[index];
      }
    }
    throw new Error(`Design with ID ${designId} not found`);
  }
};

/**
 * Delete design
 */
export const deleteDesign = async (designId: string): Promise<void> => {
  try {
    await api.delete(`/designs/${designId}`);
  } catch (error) {
    // Fallback to localStorage
    console.warn('API not available, using localStorage');
    const savedDesigns = localStorage.getItem('saved_designs');
    if (savedDesigns) {
      const designs = JSON.parse(savedDesigns);
      const filtered = designs.filter((d: Design) => d.id !== designId);
      localStorage.setItem('saved_designs', JSON.stringify(filtered));
    }
  }
};
