import React from 'react';
import { useTranslation } from 'react-i18next';
import './CameraControls.css';

interface CameraControlsProps {
  blueprint3d: any;
}

const CameraControls: React.FC<CameraControlsProps> = ({ blueprint3d }) => {
  const { t } = useTranslation();
  const [showNavigate, setShowNavigate] = React.useState(false);
  const [zoomLevel, setZoomLevel] = React.useState(50);
  const prevZoomRef = React.useRef(50);

  const handleZoomClick = (level: number) => {
    if (!blueprint3d?.three?.controls) return;
    
    const diff = level - prevZoomRef.current;
    if (diff === 0) return;

    const steps = Math.abs(diff);
    const zoomFn = diff > 0 ? 'dollyIn' : 'dollyOut';
    
    for (let i = 0; i < steps; i++) {
      blueprint3d.three.controls[zoomFn](1.05);
    }
    
    blueprint3d.three.controls.update();
    setZoomLevel(level);
    prevZoomRef.current = level;
  };

  const handleZoomButton = (direction: 'in' | 'out') => {
    if (!blueprint3d?.three?.controls) return;
    
    const zoomFn = direction === 'in' ? 'dollyIn' : 'dollyOut';
    blueprint3d.three.controls[zoomFn](1.1);
    blueprint3d.three.controls.update();
    
    const newLevel = direction === 'in' 
      ? Math.min(100, zoomLevel + 5) 
      : Math.max(0, zoomLevel - 5);
    
    setZoomLevel(newLevel);
    prevZoomRef.current = newLevel;
  };

  const pan = (direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') => {
    if (!blueprint3d?.three?.controls) return;
    
    const panSpeed = 30;
    const controls = blueprint3d.three.controls;
    
    switch (direction) {
      case 'UP':
        controls.panXY(0, panSpeed);
        break;
      case 'DOWN':
        controls.panXY(0, -panSpeed);
        break;
      case 'LEFT':
        controls.panXY(panSpeed, 0);
        break;
      case 'RIGHT':
        controls.panXY(-panSpeed, 0);
        break;
    }
  };

  const resetView = () => {
    if (!blueprint3d?.three) return;
    blueprint3d.three.centerCamera();
  };

  const stopPropagation = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
  };

  return (
    <>
      {/* Zoom Controls */}
      {showNavigate && (
        <div 
          className="zoom-slider-container"
          onMouseDown={stopPropagation}
          onMouseMove={stopPropagation}
          onMouseUp={stopPropagation}
          onClick={stopPropagation}
          onPointerDown={stopPropagation}
          onPointerMove={stopPropagation}
          onPointerUp={stopPropagation}
        >
          <div className="zoom-slider-track">
            <button 
              className="zoom-btn zoom-in-btn"
              onMouseDown={stopPropagation}
              onClick={(e) => {
                stopPropagation(e);
                handleZoomButton('in');
              }}
              title="Zoom In"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            </button>
            
            {/* Vertical zoom steps */}
            <div className="zoom-steps">
              {[90, 80, 70, 60, 50, 40, 30, 20, 10].map((level) => (
                <div 
                  key={level}
                  className={`zoom-step ${zoomLevel >= level ? 'active' : ''}`}
                  onClick={(e) => {
                    stopPropagation(e);
                    handleZoomClick(level);
                  }}
                />
              ))}
            </div>
            
            <button 
              className="zoom-btn zoom-out-btn"
              onMouseDown={stopPropagation}
              onClick={(e) => {
                stopPropagation(e);
                handleZoomButton('out');
              }}
              title="Zoom Out"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Close Button */}
      {showNavigate && (
        <button 
          className="close-nav-btn" 
          onClick={() => setShowNavigate(false)}
          title="Close"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      )}

      {/* Circular Navigation Pad */}
      {showNavigate && (
        <div className="navigation-circle">
          <button className="nav-arrow nav-up" onClick={() => pan('UP')} title="Pan Up">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"/>
            </svg>
          </button>
          
          <button className="nav-arrow nav-left" onClick={() => pan('LEFT')} title="Pan Left">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6z"/>
            </svg>
          </button>
          
          {/* Center Button - Click to close navigation */}
          <button 
            className="nav-center-btn" 
            onClick={() => resetView()}
            title="Reset View"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </button>
          
          <button className="nav-arrow nav-right" onClick={() => pan('RIGHT')} title="Pan Right">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z"/>
            </svg>
          </button>
          
          <button className="nav-arrow nav-down" onClick={() => pan('DOWN')} title="Pan Down">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6z"/>
            </svg>
          </button>
        </div>
      )}

      {/* Action Buttons */}
      {!showNavigate && (
        <>
          <button className="reset-view-btn" onClick={resetView} title="Reset View">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
              <path d="M21 3v5h-5"/>
            </svg>
            Reset View
          </button>

          <button 
            className="navigate-btn" 
            onClick={() => setShowNavigate(true)} 
            title="Navigate"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 9l-3 3 3 3M9 5l3-3 3 3M15 19l-3 3-3-3M19 9l3 3-3 3M2 12h20M12 2v20"/>
            </svg>
            Navigate
          </button>
        </>
      )}
    </>
  );
};

export default CameraControls;
