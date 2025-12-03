import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './WallElevationController.css';

interface WallElevationControllerProps {
  onToggleView: () => void;
  isWallView: boolean;
}

const WallElevationController: React.FC<WallElevationControllerProps> = ({ 
  onToggleView,
  isWallView 
}) => {
  const { t } = useTranslation();
  const controllerRef = useRef<HTMLDivElement>(null);

  return (
    <div className="wall-elevation-controller" ref={controllerRef}>
      <button 
        className={`wall-control-btn ${isWallView ? 'active' : ''}`}
        onClick={onToggleView}
        title={isWallView ? t('viewer.exit_wall_view') : t('viewer.view_wall_elevations')}
      >
        <span className="wall-icon">📏</span>
        <span className="wall-label">{isWallView ? t('viewer.exit_wall_view') : t('viewer.wall_view')}</span>
      </button>
    </div>
  );
};

export default WallElevationController;
