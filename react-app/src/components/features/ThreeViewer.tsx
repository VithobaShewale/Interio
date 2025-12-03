import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import * as BP3D from '../../types/blueprint3d';
import CameraControls from './CameraControls';
import { useBlueprint3DContext } from '../../core/blueprint3d';
import './ThreeViewer.css';

interface ThreeViewerProps {
  blueprint3d: BP3D.Blueprint3d | null;
  visible: boolean;
}

const ThreeViewer: React.FC<ThreeViewerProps> = ({ blueprint3d, visible }) => {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Use new Blueprint3D context (optional fallback to prop)
  const { manager } = useBlueprint3DContext();
  const bp3dInstance = manager?.getInstance() || blueprint3d;

  useEffect(() => {
    if (!bp3dInstance) return;
  }, [bp3dInstance]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    
    if (!bp3dInstance) {
      console.warn('Blueprint3D not initialized');
      return;
    }

    try {
      const itemData = JSON.parse(e.dataTransfer.getData('application/json'));
      
      const metadata: BP3D.ItemMetadata = {
        itemName: itemData.name,
        resizable: true,
        modelUrl: itemData.model,
        itemType: itemData.type
      };

      // Add item to the scene
      bp3dInstance.model.scene.addItem(itemData.type, itemData.model, metadata);
      console.log('Item dropped and added:', itemData.name);
    } catch (error) {
      console.error('Error handling drop:', error);
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (!blueprint3d?.three?.controls) return;
    
    e.preventDefault();
    const controls = blueprint3d.three.controls as any;
    
    if (e.deltaY < 0) {
      // Scroll up - zoom in
      controls.dollyIn(1.1);
    } else {
      // Scroll down - zoom out
      controls.dollyOut(1.1);
    }
    
    controls.update();
    if (controls.needsUpdate !== undefined) {
      controls.needsUpdate = true;
    }
  };

  return (
    <div 
      id="viewer" 
      ref={containerRef}
      className={`three-viewer ${visible ? 'visible' : 'hidden'}`}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onWheel={handleWheel}
    >
      <button className="help-btn" title={t('viewer.help')}>
        <span>❓</span>
        <span className="help-text">{t('viewer.help')}</span>
      </button>
      
      {visible && <CameraControls blueprint3d={blueprint3d} />}
    </div>
  );
};

export default ThreeViewer;
