/**
 * Floor Plan Panel Component
 * Handles drawing tools and room preset selection
 */

import React from 'react';
import * as BP3D from '../../types/blueprint3d';
import { roomPresets } from './roomPresets';
import { createRoomFromPreset } from './presetUtils';

interface FloorPlanPanelProps {
  blueprint3d: BP3D.Blueprint3d | null;
}

const FloorPlanPanel: React.FC<FloorPlanPanelProps> = ({ blueprint3d }) => {
  const [selectedPreset, setSelectedPreset] = React.useState<number | null>(null);

  const handleAddPreset = () => {
    if (!selectedPreset || !blueprint3d) return;
    
    const preset = roomPresets.find(p => p.id === selectedPreset);
    if (preset) {
      createRoomFromPreset(blueprint3d, preset.path, preset.name, false);
    }
  };

  const handleReplacePreset = () => {
    if (!selectedPreset || !blueprint3d) return;
    
    const preset = roomPresets.find(p => p.id === selectedPreset);
    if (preset) {
      createRoomFromPreset(blueprint3d, preset.path, preset.name, true);
    }
  };

  return (
    <div className="panel-content">
      <h3 className="section-title">Draw walls and dividers</h3>
      <div className="drawing-tools">
        <div className="tool-item">
          <div className="tool-icon">
            <svg width="60" height="60" viewBox="0 0 60 60">
              <path d="M15 45 L45 15" stroke="#333" strokeWidth="3" fill="none"/>
              <circle cx="15" cy="45" r="3" fill="#333"/>
              <circle cx="45" cy="15" r="3" fill="#333"/>
            </svg>
          </div>
          <p>Draw Walls</p>
        </div>
        <div className="tool-item">
          <div className="tool-icon">
            <svg width="60" height="60" viewBox="0 0 60 60">
              <circle cx="30" cy="30" r="20" stroke="#333" strokeWidth="2" fill="none"/>
              <circle cx="30" cy="30" r="3" fill="#333"/>
              <line x1="30" y1="10" x2="30" y2="20" stroke="#333" strokeWidth="2"/>
              <line x1="30" y1="40" x2="30" y2="50" stroke="#333" strokeWidth="2"/>
              <line x1="10" y1="30" x2="20" y2="30" stroke="#333" strokeWidth="2"/>
              <line x1="40" y1="30" x2="50" y2="30" stroke="#333" strokeWidth="2"/>
            </svg>
          </div>
          <p>LiDAR Scan</p>
        </div>
        <div className="tool-item">
          <div className="tool-icon">
            <svg width="60" height="60" viewBox="0 0 60 60">
              <path d="M15 45 L45 15" stroke="#333" strokeWidth="2" strokeDasharray="4,3"/>
              <circle cx="15" cy="45" r="3" fill="#333"/>
              <circle cx="45" cy="15" r="3" fill="#333"/>
            </svg>
          </div>
          <p>Draw Dividers</p>
        </div>
      </div>
      
      <h3 className="section-title">Room presets</h3>
      <div className="presets-grid">
        {roomPresets.map((preset) => (
          <div 
            key={preset.id} 
            className={`preset-item ${selectedPreset === preset.id ? 'selected' : ''}`}
            onClick={() => setSelectedPreset(preset.id)}
            title={preset.description}
          >
            <div className="preset-thumbnail">
              <svg width="80" height="80" viewBox="0 0 60 60">
                <path 
                  d={preset.path} 
                  fill="#d4a574" 
                  stroke="#8b7355" 
                  strokeWidth="2"
                />
              </svg>
            </div>
            <p>{preset.name}</p>
          </div>
        ))}
      </div>
      
      <div className="preset-actions">
        <button 
          className="preset-btn add-btn"
          disabled={!selectedPreset}
          onClick={handleAddPreset}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add
        </button>
        <button 
          className="preset-btn replace-btn"
          disabled={!selectedPreset}
          onClick={handleReplacePreset}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="8" height="8"/>
            <rect x="13" y="13" width="8" height="8"/>
            <path d="M21 11V9M21 9H19M21 9L17 13"/>
          </svg>
          Replace
        </button>
      </div>
    </div>
  );
};

export default FloorPlanPanel;
