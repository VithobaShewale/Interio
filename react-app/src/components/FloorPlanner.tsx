import React, { useEffect, useRef, useState } from 'react';
import * as BP3D from '../types/blueprint3d';
import { FloorplannerModes } from '../constants/floorplanner';
import './FloorPlanner.css';

interface FloorPlannerProps {
  blueprint3d: BP3D.Blueprint3d | null;
  visible: boolean;
}

type FloorplannerMode = 'MOVE' | 'DRAW' | 'DELETE';

const FloorPlanner: React.FC<FloorPlannerProps> = ({ blueprint3d, visible }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<FloorplannerMode>('MOVE');

  // Subscribe to mode changes from floorplanner
  useEffect(() => {
    if (!blueprint3d) return;
    
    const bp3d = blueprint3d as any;
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
  }, [blueprint3d]);

  const handleModeChange = (newMode: FloorplannerMode) => {
    if (!blueprint3d) return;
    
    // Use type assertion since these properties are public in runtime JavaScript
    const bp3d = blueprint3d as any;
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

  return (
    <div 
      id="floorplanner" 
      ref={containerRef}
      className={`floorplanner ${visible ? 'visible' : 'hidden'}`}
    >
      <canvas id="floorplanner-canvas"></canvas>
      <div className="floorplanner-controls">
        <button 
          className={`btn ${mode === 'MOVE' ? 'active' : ''}`}
          onClick={() => handleModeChange('MOVE')}
          title="Move Walls"
        >
          <span>↔️ Move</span>
        </button>
        <button 
          className={`btn ${mode === 'DRAW' ? 'active' : ''}`}
          onClick={() => handleModeChange('DRAW')}
          title="Draw Walls"
        >
          <span>✏️ Draw</span>
        </button>
        <button 
          className={`btn ${mode === 'DELETE' ? 'active' : ''}`}
          onClick={() => handleModeChange('DELETE')}
          title="Delete"
        >
          <span>🗑️ Delete</span>
        </button>
      </div>
      {mode === 'DRAW' && (
        <div className="draw-hint">
          Press "ESC" to stop drawing walls
        </div>
      )}
    </div>
  );
};

export default FloorPlanner;
