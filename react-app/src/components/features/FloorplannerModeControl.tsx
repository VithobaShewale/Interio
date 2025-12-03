import React, { useEffect, useState } from 'react';
import './FloorplannerModeControl.css';

interface FloorplannerModeControlProps {
  blueprint3d: any;
}

const FloorplannerModeControl: React.FC<FloorplannerModeControlProps> = ({ blueprint3d }) => {
  const [mode, setMode] = useState<number>(0); // 0 = MOVE, 1 = DRAW, 2 = DELETE

  useEffect(() => {
    if (!blueprint3d?.floorplanner) return;

    const floorplanner = blueprint3d.floorplanner;
    
    // Subscribe to mode changes
    const handleModeChange = (newMode: number) => {
      setMode(newMode);
    };

    floorplanner.modeResetCallbacks.add(handleModeChange);

    return () => {
      floorplanner.modeResetCallbacks.remove(handleModeChange);
    };
  }, [blueprint3d]);

  const setFloorplannerMode = (newMode: number) => {
    if (blueprint3d?.floorplanner) {
      blueprint3d.floorplanner.setMode(newMode);
    }
  };

  return (
    <div className="floorplanner-mode-control">
      <button
        className={`mode-button ${mode === 0 ? 'active' : ''}`}
        onClick={() => setFloorplannerMode(0)}
        title="Move/Select Mode"
      >
        <span>✋</span> Move
      </button>
      <button
        className={`mode-button ${mode === 1 ? 'active' : ''}`}
        onClick={() => setFloorplannerMode(1)}
        title="Draw Walls Mode"
      >
        <span>✏️</span> Draw
      </button>
      <button
        className={`mode-button ${mode === 2 ? 'active' : ''}`}
        onClick={() => setFloorplannerMode(2)}
        title="Delete Mode"
      >
        <span>🗑️</span> Delete
      </button>
      {mode === 1 && (
        <div className="draw-hint">
          Click to add corners and draw walls. Click on the first corner to close the room.
        </div>
      )}
    </div>
  );
};

export default FloorplannerModeControl;
