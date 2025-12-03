/**
 * Storage Service
 * Handles local storage operations for saving and loading designs
 */

const STORAGE_KEY = 'blueprint3d_draft';

export interface DesignDraft {
  floorplan: any;
  items: any[];
  timestamp: number;
  version: string;
}

/**
 * Save the current design to local storage
 */
export const saveDraft = (blueprint3d: any): boolean => {
  try {
    if (!blueprint3d || !blueprint3d.model) {
      console.warn('Blueprint3D instance not available for saving');
      return false;
    }

    const designData = blueprint3d.model.exportSerialized();
    const draft: DesignDraft = {
      floorplan: JSON.parse(designData).floorplan,
      items: JSON.parse(designData).items || [],
      timestamp: Date.now(),
      version: '1.0'
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
    console.log('Draft saved successfully', draft);
    return true;
  } catch (error) {
    console.error('Error saving draft:', error);
    return false;
  }
};

/**
 * Load a draft from local storage
 */
export const loadDraft = (): DesignDraft | null => {
  try {
    const draftStr = localStorage.getItem(STORAGE_KEY);
    if (!draftStr) {
      console.log('No draft found in local storage');
      return null;
    }

    const draft: DesignDraft = JSON.parse(draftStr);
    console.log('Draft loaded successfully', draft);
    return draft;
  } catch (error) {
    console.error('Error loading draft:', error);
    return null;
  }
};

/**
 * Check if a draft exists
 */
export const hasDraft = (): boolean => {
  try {
    const draftStr = localStorage.getItem(STORAGE_KEY);
    return draftStr !== null && draftStr.length > 0;
  } catch (error) {
    console.error('Error checking for draft:', error);
    return false;
  }
};

/**
 * Clear the draft from local storage
 */
export const clearDraft = (): boolean => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    console.log('Draft cleared from local storage');
    return true;
  } catch (error) {
    console.error('Error clearing draft:', error);
    return false;
  }
};

/**
 * Get draft metadata without loading the full design
 */
export const getDraftMetadata = (): { timestamp: number; version: string } | null => {
  try {
    const draftStr = localStorage.getItem(STORAGE_KEY);
    if (!draftStr) return null;

    const draft: DesignDraft = JSON.parse(draftStr);
    return {
      timestamp: draft.timestamp,
      version: draft.version
    };
  } catch (error) {
    console.error('Error getting draft metadata:', error);
    return null;
  }
};
