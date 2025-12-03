import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as BP3D from '../../types/blueprint3d';
import { FloorplannerModes } from '../../constants/floorplanner';
import FloorplannerCameraControls from './FloorplannerCameraControls';
import { featureFlags } from '../../config/featureFlags';
import { useBlueprint3DContext } from '../../core/blueprint3d';
import './FloorPlanner.css';

interface FloorPlannerProps {
  blueprint3d: BP3D.Blueprint3d | null;
  visible: boolean;
}

type FloorplannerMode = 'MOVE' | 'DRAW' | 'DELETE';

const FloorPlanner: React.FC<FloorPlannerProps> = ({ blueprint3d, visible }) => {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<FloorplannerMode>('MOVE');
  const [showDimensions, setShowDimensions] = useState<boolean>(true);
  
  // Use the blueprint3d prop as bp3dInstance for consistency
  const bp3dInstance = blueprint3d;
  
  // Subscribe to mode changes from floorplanner
  useEffect(() => {
    if (!bp3dInstance) return;
    
    const bp3d = bp3dInstance as any;
    if (!bp3d.floorplanner) return;
    
    const handleModeReset = (modeNum: number) => {
      if (modeNum === FloorplannerModes.MOVE) setMode('MOVE');
      else if (modeNum === FloorplannerModes.DRAW) setMode('DRAW');
      else if (modeNum === FloorplannerModes.DELETE) setMode('DELETE');
    };

    bp3d.floorplanner.modeResetCallbacks.add(handleModeReset);

    return () => {
      bp3d.floorplanner.modeResetCallbacks.remove(handleModeReset);
    };
  }, [bp3dInstance]);

  // Update dimension visibility when state changes
  useEffect(() => {
    if (!bp3dInstance) return;
    const bp3d = bp3dInstance as any;
    if (bp3d.floorplanner?.view) {
      bp3d.floorplanner.view.showDimensions = showDimensions;
      bp3d.floorplanner.view.draw();
    }
  }, [bp3dInstance, showDimensions]);

  const handleModeChange = (newMode: FloorplannerMode) => {
    if (!bp3dInstance) return;
    
    // Use type assertion since these properties are public in runtime JavaScript
    const bp3d = bp3dInstance as any;
    if (!bp3d.floorplanner) return;
    
    switch(newMode) {
      case 'MOVE':
        bp3d.floorplanner.setMode(FloorplannerModes.MOVE);
        break;
      case 'DRAW':
        bp3d.floorplanner.setMode(FloorplannerModes.DRAW);
        break;
      case 'DELETE':
        bp3d.floorplanner.setMode(FloorplannerModes.DELETE);
        break;
    }
  };

  // Ensure floorplanner centers on mount and when visible
  useEffect(() => {
    if (!bp3dInstance || !visible) return;
    
    const bp3d = bp3dInstance as any;
    if (!bp3d.floorplanner) return;
    
    // Reset view to center the floorplan
    setTimeout(() => {
      bp3d.floorplanner.reset();
    }, 100);
  }, [blueprint3d, visible]);

  // Add native wheel event listener to allow preventDefault
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const wheelHandler = (e: WheelEvent) => {
      if (!blueprint3d) return;
      
      e.preventDefault();
      const bp3d = blueprint3d as any;
      if (!bp3d.floorplanner) return;
      
      const canvas = bp3d.floorplanner.canvas || bp3d.floorplanner;
      const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
      
      if (canvas.cmPerPixel !== undefined) {
        // Get mouse position relative to canvas
        const rect = (e.target as HTMLElement).getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        // Calculate world coordinates at mouse position before zoom
        const worldX = (mouseX + canvas.originX) * canvas.cmPerPixel;
        const worldY = (mouseY + canvas.originY) * canvas.cmPerPixel;
        
        // Apply zoom
        const oldCmPerPixel = canvas.cmPerPixel;
        canvas.cmPerPixel = canvas.cmPerPixel / zoomFactor;
        canvas.pixelsPerCm = 1.0 / canvas.cmPerPixel;
        
        // Adjust origin to keep mouse position at same world coordinates
        const newOriginX = worldX / canvas.cmPerPixel - mouseX;
        const newOriginY = worldY / canvas.cmPerPixel - mouseY;
        
        canvas.originX = newOriginX;
        canvas.originY = newOriginY;
        
        if (canvas.view && canvas.view.draw) {
          canvas.view.draw();
        }
      }
    };

    container.addEventListener('wheel', wheelHandler, { passive: false });

    return () => {
      container.removeEventListener('wheel', wheelHandler);
    };
  }, [blueprint3d]);

  return (
    <div 
      id="floorplanner" 
      ref={containerRef}
      className={`floorplanner ${visible ? 'visible' : 'hidden'}`}
    >
      <canvas id="floorplanner-canvas"></canvas>
      {featureFlags.showFloorPlannerInlineControls && (
        <div className="floorplanner-controls">
          <button 
            className={`btn ${mode === 'MOVE' ? 'active' : ''}`}
            onClick={() => handleModeChange('MOVE')}
            title={t('floorplanner.move_walls')}
          >
            <span>↔️ {t('floorplanner.mode_move')}</span>
          </button>
          <button 
            className={`btn ${mode === 'DRAW' ? 'active' : ''}`}
            onClick={() => handleModeChange('DRAW')}
            title={t('floorplanner.draw_walls')}
          >
            <span>✏️ {t('floorplanner.mode_draw')}</span>
          </button>
          <button 
            className={`btn ${mode === 'DELETE' ? 'active' : ''}`}
            onClick={() => handleModeChange('DELETE')}
            title={t('floorplanner.mode_delete')}
          >
            <span>🗑️ {t('floorplanner.mode_delete')}</span>
          </button>
          {featureFlags.showDimensionToggle && (
            <button 
              className={`btn ${showDimensions ? 'active' : ''}`}
              onClick={() => setShowDimensions(!showDimensions)}
              title={t('floorplanner.toggle_dimensions')}
            >
              <span>📏 {showDimensions ? t('floorplanner.hide_dimensions') : t('floorplanner.show_dimensions')}</span>
            </button>
          )}
        </div>
      )}
      {visible && <FloorplannerCameraControls blueprint3d={blueprint3d} />}
      {mode === 'DRAW' && (
        <div className="draw-hint">
          {t('floorplanner.draw_hint')}
        </div>
      )}
    </div>
  );
};

export default FloorPlanner;
