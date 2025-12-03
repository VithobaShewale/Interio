import React, { useState } from 'react';
import './FloatingControls3D.css';

interface FloatingControls3DProps {
  blueprint3d: any;
}

const FloatingControls3D: React.FC<FloatingControls3DProps> = ({ blueprint3d }) => {
  const [zoomLevel, setZoomLevel] = useState(50);

  const handleResetView = () => {
    if (blueprint3d?.three) {
      // Reset camera to default position using centerCamera
      blueprint3d.three.centerCamera();
    }
  };

  const handleZoomIn = () => {
    if (blueprint3d?.three) {
      const controls = (blueprint3d.three as any).controls;
      if (controls && typeof controls.dollyIn === 'function') {
        controls.dollyIn(1.1);
        controls.update();
        // Update zoom level display
        setZoomLevel(Math.min(100, zoomLevel + 5));
      }
    }
  };

  const handleZoomOut = () => {
    if (blueprint3d?.three) {
      const controls = (blueprint3d.three as any).controls;
      if (controls && typeof controls.dollyOut === 'function') {
        controls.dollyOut(1.1);
        controls.update();
        // Update zoom level display
        setZoomLevel(Math.max(10, zoomLevel - 5));
      }
    }
  };

  const handleTranslate = (direction: 'up' | 'down' | 'left' | 'right') => {
    if (blueprint3d?.three) {
      const controls = (blueprint3d.three as any).controls;
      if (!controls) return;

      const panDistance = 0.5; // Adjust for smoother panning

      switch (direction) {
        case 'up':
          controls.panUp(panDistance);
          break;
        case 'down':
          controls.panUp(-panDistance);
          break;
        case 'left':
          controls.panLeft(panDistance);
          break;
        case 'right':
          controls.panLeft(-panDistance);
          break;
      }
      controls.update();
    }
  };

  const handleRotate = (direction: 'left' | 'right') => {
    if (blueprint3d?.three) {
      const controls = (blueprint3d.three as any).controls;
      if (!controls) return;

      const rotateAmount = 0.1;

      if (direction === 'left') {
        controls.rotateLeft(rotateAmount);
      } else {
        controls.rotateLeft(-rotateAmount);
      }
      controls.update();
    }
  };

  return (
    <div className="floating-controls-3d">
      {/* Reset Button - Bottom Left */}
      <button className="reset-view-btn" onClick={handleResetView}>
        <span className="icon">🔄</span>
        <span className="label">Reset View</span>
      </button>

      {/* Translate Control - Center */}
      <div className="translate-control">
        <button
          className="translate-btn translate-up"
          onClick={() => handleTranslate('up')}
          title="Move Up"
        >
          ▲
        </button>
        <div className="translate-middle">
          <button
            className="translate-btn translate-left"
            onClick={() => handleTranslate('left')}
            title="Move Left"
          >
            ◀
          </button>
          <div className="translate-center">
            <span className="icon">✥</span>
          </div>
          <button
            className="translate-btn translate-right"
            onClick={() => handleTranslate('right')}
            title="Move Right"
          >
            ▶
          </button>
        </div>
        <button
          className="translate-btn translate-down"
          onClick={() => handleTranslate('down')}
          title="Move Down"
        >
          ▼
        </button>
      </div>

      {/* Rotate Control - Right of Translate */}
      <div className="rotate-control">
        <button
          className="rotate-btn"
          onClick={() => handleRotate('left')}
          title="Rotate Left"
        >
          ↺
        </button>
        <div className="rotate-center">
          <span className="icon">⟳</span>
        </div>
        <button
          className="rotate-btn"
          onClick={() => handleRotate('right')}
          title="Rotate Right"
        >
          ↻
        </button>
      </div>

      {/* Zoom Control - Right Side */}
      <div className="zoom-control">
        <div className="zoom-label">Zoom</div>
        <button
          className="zoom-btn zoom-in"
          onClick={handleZoomIn}
          title="Zoom In"
        >
          +
        </button>
        <div className="zoom-value">{zoomLevel}%</div>
        <button
          className="zoom-btn zoom-out"
          onClick={handleZoomOut}
          title="Zoom Out"
        >
          −
        </button>
      </div>
    </div>
  );
};

export default FloatingControls3D;
