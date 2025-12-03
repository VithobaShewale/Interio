/**
 * Textures API Endpoints
 * Handle floor and wall textures
 */

import { api } from '../client';
import { AxiosResponse } from 'axios';

// Mock data fallback
import texturesData from '../../assets/data/textures.json';

export interface TextureMetadata {
  id: string;
  name: string;
  type: 'floor' | 'wall';
  url: string;
  thumbnail: string;
  dimensions?: {
    width: number;
    height: number;
  };
  price?: number;
  material?: string;
}

/**
 * Fetch all textures
 */
export const fetchTextures = async (): Promise<TextureMetadata[]> => {
  // Using local JSON data only
  return texturesData.textures as TextureMetadata[];
  
  /* API call disabled - uncomment to use API server
  try {
    const response: AxiosResponse<TextureMetadata[]> = await api.get('/textures');
    return response.data;
  } catch (error) {
    console.warn('API not available, using mock data');
    return texturesData.textures as TextureMetadata[];
  }
  */
};

/**
 * Fetch textures by type (floor or wall)
 */
export const fetchTexturesByType = async (type: 'floor' | 'wall'): Promise<TextureMetadata[]> => {
  try {
    const response: AxiosResponse<TextureMetadata[]> = await api.get(`/textures/${type}`);
    return response.data;
  } catch (error) {
    console.warn('API not available, using mock data');
    return (texturesData.textures as TextureMetadata[]).filter((t: any) => t.type === type);
  }
};

/**
 * Fetch texture by ID
 */
export const fetchTextureById = async (textureId: string): Promise<TextureMetadata> => {
  try {
    const response: AxiosResponse<TextureMetadata> = await api.get(`/textures/${textureId}`);
    return response.data;
  } catch (error) {
    console.warn('API not available, using mock data');
    const texture = (texturesData.textures as TextureMetadata[]).find((t: any) => t.id === textureId);
    if (!texture) {
      throw new Error(`Texture with ID ${textureId} not found`);
    }
    return texture;
  }
};
