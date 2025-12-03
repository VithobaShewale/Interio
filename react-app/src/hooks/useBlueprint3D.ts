import { useState, useEffect, useRef } from 'react';
import * as BP3D from '../types/blueprint3d';
import { loadDraft, hasDraft, saveDraft } from '../utils/storageService';
import { initializeDesign } from '../utils/designService';

export type ViewMode = '2d' | '3d' | 'wall';

// Use the proper Blueprint3D types
export type Blueprint3DInstance = BP3D.Blueprint3dInstance | null;

export const useBlueprint3D = () => {
  const [blueprint3d, setBlueprint3d] = useState<Blueprint3DInstance>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('2d');
  const [initialized, setInitialized] = useState(false);
  const instanceRef = useRef<Blueprint3DInstance>(null);

  // Auto-save functionality - save every 30 seconds if there are changes
  useEffect(() => {
    if (!blueprint3d || !initialized) return;

    let lastSavedState: string | null = null;

    const autoSaveInterval = setInterval(() => {
      try {
        const currentState = blueprint3d.model.exportSerialized();
        
        // Only save if the design has actually changed
        if (currentState !== lastSavedState) {
          console.log('Design changed, auto-saving draft...');
          saveDraft(blueprint3d);
          lastSavedState = currentState;
        } else {
          console.log('No changes detected, skipping auto-save');
        }
      } catch (error) {
        console.error('Error checking for changes:', error);
      }
    }, 30000); // 30 seconds

    return () => {
      clearInterval(autoSaveInterval);
    };
  }, [blueprint3d, initialized]);

  // Save before unload
  useEffect(() => {
    if (!blueprint3d || !initialized) return;

    const handleBeforeUnload = () => {
      console.log('Saving draft before page unload...');
      saveDraft(blueprint3d);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [blueprint3d, initialized]);

  useEffect(() => {
    // Wait for DOM and Blueprint3D to be ready
    const checkLoaded = setInterval(() => {
      if (!instanceRef.current) {
        // Check if the required DOM elements exist and Blueprint3D is loaded
        const floorplannerCanvas = document.getElementById('floorplanner-canvas');
        const viewerElement = document.getElementById('viewer');
        const bp3dLoaded = (window as any).BP3D && (window as any).BP3D.Blueprint3d;

        if (floorplannerCanvas && viewerElement && bp3dLoaded) {
          clearInterval(checkLoaded);
          console.log('DOM and Blueprint3D loaded, initializing...');
          initializeBP3D();
        }
      }
    }, 100);

    return () => {
      clearInterval(checkLoaded);
    };
  }, []);

  // Handle view mode changes
  useEffect(() => {
    if (!blueprint3d) return;

    console.log('View mode changed to:', viewMode);

    if (viewMode === '3d') {
      // Switching to 3D view
      console.log('Activating 3D view');
      
      // Small delay to ensure floorplanner data is synced to model
      setTimeout(() => {
        if (blueprint3d.model && blueprint3d.model.floorplan) {
          // Trigger update to regenerate rooms from walls/corners
          blueprint3d.model.floorplan.update();
        }
        
        if (blueprint3d.three) {
          try {
            blueprint3d.three.updateWindowSize();
            blueprint3d.three.centerCamera();

            // Ensure wheel zoom is enabled when switching to 3D
            if (blueprint3d.three.controls) {
              const controls = blueprint3d.three.controls as any;
              controls.noZoom = false;
              controls.zoomSpeed = 1.0;
              controls.enabled = true;
              console.log('Mouse wheel zoom enabled for 3D view');
            }

            console.log('3D view activated successfully');
          } catch (error) {
            console.error('Error activating 3D view:', error);
          }
        }
      }, 100);
    } else if (viewMode === '2d') {
      // Switching to 2D view
      console.log('Activating 2D view');
      
      // Update the floorplan to sync items from 3D view
      if (blueprint3d.model && blueprint3d.model.floorplan) {
        blueprint3d.model.floorplan.update();
      }
      
      if (blueprint3d.floorplanner) {
        setTimeout(() => {
          try {
            // Trigger a redraw of the 2D view
            if (blueprint3d.floorplanner.view) {
              blueprint3d.floorplanner.view.handleWindowResize();
              blueprint3d.floorplanner.view.draw();
            }
            console.log('2D view activated successfully');
          } catch (error) {
            console.error('Error activating 2D view:', error);
          }
        }, 100);
      }
    }
  }, [viewMode, blueprint3d]);

  const initializeBP3D = () => {
    try {
      // Wait for Blueprint3D to be loaded from script tag
      if (!(window as any).BP3D || !(window as any).BP3D.Blueprint3d) {
        console.error('Blueprint3D not loaded yet');
        return;
      }

      const instance = new (window as any).BP3D.Blueprint3d({
        floorplannerElement: 'floorplanner-canvas',
        threeElement: '#viewer',
        threeCanvasElement: 'three-canvas',
        textureDir: '/rooms/textures/',
        widget: false
      }) as unknown as Blueprint3DInstance;

      instanceRef.current = instance;
      setBlueprint3d(instance);
      setInitialized(true);
      console.log('Blueprint3D initialized successfully');

      // Enable mouse wheel zoom on the 3D controls - delayed to ensure three.js is ready
      setTimeout(() => {
        if (instance.three && instance.three.controls) {
          const controls = instance.three.controls as any;
          controls.noZoom = false;
          controls.zoomSpeed = 1.0;
          controls.enabled = true;
          console.log('Mouse wheel zoom enabled on controls:', controls);
        } else {
          console.warn('Controls not available yet');
        }
      }, 500);

      // Set up texture application listeners
      interface WindowWithTexture extends Window {
        selectedTexture?: { name: string; url: string; stretch: boolean; scale: number } | null;
      }
      const windowExt = window as unknown as WindowWithTexture;

      instance.three.wallClicked.add((halfEdge: any) => {
        const selectedTexture = windowExt.selectedTexture;
        if (selectedTexture) {
          console.log('Applying texture to wall:', selectedTexture.name);
          halfEdge.setTexture(selectedTexture.url, selectedTexture.stretch, selectedTexture.scale);
          windowExt.selectedTexture = null;
        }
      });

      instance.three.floorClicked.add((room: any) => {
        const selectedTexture = windowExt.selectedTexture;
        if (selectedTexture) {
          console.log('Applying texture to floor:', selectedTexture.name);
          room.setTexture(selectedTexture.url, selectedTexture.stretch, selectedTexture.scale);
          windowExt.selectedTexture = null;
        }
      });

      // Load design from draft or default after initialization
      setTimeout(() => {
        console.log('Checking for draft...');
        const draftExists = hasDraft();
        let draft = draftExists ? loadDraft() : null;
        
        // Validate draft - if it's empty, treat it as no draft
        if (draft && draft.floorplan) {
          try {
            const floorplanData = typeof draft.floorplan === 'string' 
              ? JSON.parse(draft.floorplan) 
              : draft.floorplan;
            
            const hasCorners = floorplanData.corners && Object.keys(floorplanData.corners).length > 0;
            const hasWalls = floorplanData.walls && floorplanData.walls.length > 0;
            
            if (!hasCorners || !hasWalls) {
              console.log('Draft is empty, will load default design instead');
              draft = null;
            } else {
              console.log('Draft found with data, loading from local storage');
            }
          } catch (e) {
            console.error('Error parsing draft:', e);
            draft = null;
          }
        }
        
        if (!draft) {
          console.log('No valid draft found, loading default design');
        }
        
        initializeDesign(instance, draft, () => {
          console.log('Design initialization complete');
        });
      }, 500);
    } catch (error) {
      console.error('Failed to initialize Blueprint3D:', error);
    }
  };

  return {
    blueprint3d,
    viewMode,
    setViewMode,
    initialized,
    saveDraft: () => blueprint3d ? saveDraft(blueprint3d) : false
  };
};
