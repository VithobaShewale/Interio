/**
 * Design Service
 * Handles design initialization and loading logic
 */

import { DesignDraft } from './storageService';

/**
 * Default room design to load when no draft exists
 */
export const getDefaultDesign = (): string => {
  return JSON.stringify({
    floorplan: {
      corners: {
        'f90da5e3-9e0e-eba7-173d-eb0b071e838e': { x: 204.851, y: 289.052 },
        'da026c08-d76a-a944-8e7b-096b752da9ed': { x: 672.211, y: 289.052 },
        '4e3d65cb-54c0-0681-28bf-bddcc7bdb571': { x: 672.211, y: -178.308 },
        '71d4f128-ae80-3d58-9bd2-711c6ce6cdf2': { x: 204.851, y: -178.308 }
      },
      walls: [
        {
          corner1: 'f90da5e3-9e0e-eba7-173d-eb0b071e838e',
          corner2: 'da026c08-d76a-a944-8e7b-096b752da9ed',
          frontTexture: { url: '/rooms/textures/wallmap.png', stretch: true, scale: 0 },
          backTexture: { url: '/rooms/textures/wallmap.png', stretch: true, scale: 0 }
        },
        {
          corner1: 'da026c08-d76a-a944-8e7b-096b752da9ed',
          corner2: '4e3d65cb-54c0-0681-28bf-bddcc7bdb571',
          frontTexture: { url: '/rooms/textures/wallmap.png', stretch: true, scale: 0 },
          backTexture: { url: '/rooms/textures/wallmap.png', stretch: true, scale: 0 }
        },
        {
          corner1: '4e3d65cb-54c0-0681-28bf-bddcc7bdb571',
          corner2: '71d4f128-ae80-3d58-9bd2-711c6ce6cdf2',
          frontTexture: { url: '/rooms/textures/wallmap.png', stretch: true, scale: 0 },
          backTexture: { url: '/rooms/textures/wallmap.png', stretch: true, scale: 0 }
        },
        {
          corner1: '71d4f128-ae80-3d58-9bd2-711c6ce6cdf2',
          corner2: 'f90da5e3-9e0e-eba7-173d-eb0b071e838e',
          frontTexture: { url: '/rooms/textures/wallmap.png', stretch: true, scale: 0 },
          backTexture: { url: '/rooms/textures/wallmap.png', stretch: true, scale: 0 }
        }
      ],
      wallTextures: [],
      floorTextures: {},
      newFloorTextures: {}
    },
    items: []
  });
};

/**
 * Load design from draft or return default design
 */
export const loadDesign = (draft: DesignDraft | null): string => {
  if (draft && draft.floorplan) {
    console.log('Loading design from draft');
    return JSON.stringify({
      floorplan: draft.floorplan,
      items: draft.items || []
    });
  }

  console.log('No draft found, loading default design');
  return getDefaultDesign();
};

/**
 * Apply design to Blueprint3D instance
 */
export const applyDesign = (
  blueprint3d: any, 
  designData: string, 
  onComplete?: () => void
): void => {
  try {
    if (!blueprint3d || !blueprint3d.model) {
      console.error('Blueprint3D instance not available');
      return;
    }

    blueprint3d.model.loadSerialized(designData);
    console.log('Design applied successfully');

    // Update the scene and center camera after a short delay
    setTimeout(() => {
      if (blueprint3d.model && blueprint3d.model.floorplan) {
        blueprint3d.model.floorplan.update();
      }
      if (blueprint3d.three) {
        blueprint3d.three.updateWindowSize();
        blueprint3d.three.centerCamera();
      }
      
      if (onComplete) {
        onComplete();
      }
    }, 300);
  } catch (error) {
    console.error('Error applying design:', error);
  }
};

/**
 * Initialize design with draft or default
 */
export const initializeDesign = (
  blueprint3d: any,
  draft: DesignDraft | null,
  onComplete?: () => void
): void => {
  const designData = loadDesign(draft);
  applyDesign(blueprint3d, designData, onComplete);
};
