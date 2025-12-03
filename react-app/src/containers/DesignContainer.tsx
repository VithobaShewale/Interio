/**
 * Design Container
 * Connects design state to components
 */

import React, { useEffect, useCallback } from 'react';
import { useDesignStore } from '../store';
import { designApiService, Design } from '../services/api';
import { useBlueprint3DContext } from '../core/blueprint3d';
import { useUIStore } from '../store';

interface DesignContainerProps {
  children: (props: DesignContainerChildProps) => React.ReactNode;
}

export interface DesignContainerChildProps {
  currentDesign: Design | null;
  isLoading: boolean;
  error: string | null;
  isDirty: boolean;
  lastSaved: Date | null;
  
  // Actions
  loadDesign: (id: string) => Promise<void>;
  saveDesign: () => Promise<void>;
  createNewDesign: (name: string, description?: string) => Promise<void>;
  deleteDesign: (id: string) => Promise<void>;
  exportDesign: () => void;
  importDesign: (data: any) => void;
}

export const DesignContainer: React.FC<DesignContainerProps> = ({ children }) => {
  const { manager } = useBlueprint3DContext();
  const {
    currentDesign,
    isLoading,
    error,
    isDirty,
    lastSaved,
    setCurrentDesign,
    updateDesignData,
    markClean,
    markDirty,
    setLoading,
    setError,
  } = useDesignStore();

  const { showNotification } = useUIStore();

  // Auto-save on changes
  useEffect(() => {
    if (!manager || !isDirty) return;

    const autoSaveInterval = setInterval(async () => {
      if (isDirty && currentDesign) {
        try {
          const designData = manager.exportDesign();
          await designApiService.updateDesign(currentDesign.id, {
            floorplan: designData.floorplan,
            items: designData.items,
          });
          markClean();
        } catch (err) {
          console.error('Auto-save failed:', err);
        }
      }
    }, 30000); // Auto-save every 30 seconds

    return () => clearInterval(autoSaveInterval);
  }, [manager, isDirty, currentDesign, markClean]);

  // Listen to Blueprint3D changes
  useEffect(() => {
    if (!manager) return;

    const handleChange = () => {
      const designData = manager.exportDesign();
      updateDesignData(designData.floorplan, designData.items);
    };

    manager.on('itemAdded', handleChange);
    manager.on('itemRemoved', handleChange);
    manager.on('roomLoaded', handleChange);

    return () => {
      manager.off('itemAdded', handleChange);
      manager.off('itemRemoved', handleChange);
      manager.off('roomLoaded', handleChange);
    };
  }, [manager, updateDesignData]);

  const loadDesign = useCallback(
    async (id: string) => {
      if (!manager) return;

      setLoading(true);
      try {
        const response = await designApiService.getDesign(id);
        const design = response.data;
        
        manager.loadDesign({
          floorplan: design.floorplan,
          items: design.items,
        });
        
        setCurrentDesign(design);
        showNotification('Design loaded successfully', 'success');
      } catch (err: any) {
        const message = err.message || 'Failed to load design';
        setError(message);
        showNotification(message, 'error');
      }
    },
    [manager, setLoading, setCurrentDesign, setError, showNotification]
  );

  const saveDesign = useCallback(async () => {
    if (!manager || !currentDesign) return;

    setLoading(true);
    try {
      const designData = manager.exportDesign();
      await designApiService.updateDesign(currentDesign.id, {
        floorplan: designData.floorplan,
        items: designData.items,
      });
      
      markClean();
      showNotification('Design saved successfully', 'success');
    } catch (err: any) {
      const message = err.message || 'Failed to save design';
      setError(message);
      showNotification(message, 'error');
    } finally {
      setLoading(false);
    }
  }, [manager, currentDesign, setLoading, markClean, setError, showNotification]);

  const createNewDesign = useCallback(
    async (name: string, description?: string) => {
      if (!manager) return;

      setLoading(true);
      try {
        manager.newDesign();
        
        const designData = manager.exportDesign();
        const response = await designApiService.createDesign({
          name,
          description,
          floorplan: designData.floorplan,
          items: designData.items,
        });
        
        setCurrentDesign(response.data);
        showNotification('New design created', 'success');
      } catch (err: any) {
        const message = err.message || 'Failed to create design';
        setError(message);
        showNotification(message, 'error');
      } finally {
        setLoading(false);
      }
    },
    [manager, setLoading, setCurrentDesign, setError, showNotification]
  );

  const deleteDesign = useCallback(
    async (id: string) => {
      setLoading(true);
      try {
        await designApiService.deleteDesign(id);
        
        if (currentDesign?.id === id) {
          setCurrentDesign(null);
          if (manager) {
            manager.newDesign();
          }
        }
        
        showNotification('Design deleted', 'success');
      } catch (err: any) {
        const message = err.message || 'Failed to delete design';
        setError(message);
        showNotification(message, 'error');
      } finally {
        setLoading(false);
      }
    },
    [currentDesign, manager, setLoading, setCurrentDesign, setError, showNotification]
  );

  const exportDesign = useCallback(() => {
    if (!manager) return;

    const designData = manager.exportDesign();
    const json = JSON.stringify(designData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${currentDesign?.name || 'design'}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    showNotification('Design exported', 'success');
  }, [manager, currentDesign, showNotification]);

  const importDesign = useCallback(
    (data: any) => {
      if (!manager) return;

      try {
        manager.loadDesign(data);
        markDirty();
        showNotification('Design imported', 'success');
      } catch (err: any) {
        showNotification('Failed to import design', 'error');
      }
    },
    [manager, markDirty, showNotification]
  );

  return (
    <>
      {children({
        currentDesign,
        isLoading,
        error,
        isDirty,
        lastSaved,
        loadDesign,
        saveDesign,
        createNewDesign,
        deleteDesign,
        exportDesign,
        importDesign,
      })}
    </>
  );
};
