import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './ItemPropertiesPanel.css';

interface ItemPropertiesPanelProps {
  blueprint3d: any;
  onCaptureState?: (description?: string) => void;
}

const ItemPropertiesPanel: React.FC<ItemPropertiesPanelProps> = ({ blueprint3d, onCaptureState }) => {
  const { t } = useTranslation();
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const [depth, setDepth] = useState<number>(0);
  const [isFixed, setIsFixed] = useState<boolean>(false);

  useEffect(() => {
    if (!blueprint3d?.three) return;

    const handleItemSelected = (item: any) => {
      setSelectedItem(item);
      
      // Clear any stored wall/floor selection when item is selected
      (window as any).lastClickedWallEdge = null;
      (window as any).lastClickedFloor = null;
      
      // Convert from cm to inches for display
      // getWidth() returns X axis, getHeight() returns Y axis, getDepth() returns Z axis
      if (item) {
        const itemWidth = item.getWidth ? item.getWidth() : 0;
        const itemHeight = item.getHeight ? item.getHeight() : 0;
        const itemDepth = item.getDepth ? item.getDepth() : 0;
        
        setWidth(Math.round(cmToIn(itemWidth)));
        setHeight(Math.round(cmToIn(itemHeight)));
        setDepth(Math.round(cmToIn(itemDepth)));
        setIsFixed(item.fixed || false);
        
        console.log('Item dimensions (cm):', { width: itemWidth, height: itemHeight, depth: itemDepth });
        console.log('Item dimensions (inches):', { 
          width: Math.round(cmToIn(itemWidth)), 
          height: Math.round(cmToIn(itemHeight)), 
          depth: Math.round(cmToIn(itemDepth)) 
        });
      }
    };

    const handleItemUnselected = () => {
      setSelectedItem(null);
    };

    // Check if an item is already selected when panel opens
    const controller = (blueprint3d.three as any).getController?.();
    const currentItem = controller?.selectedObject?.();
    if (currentItem) {
      handleItemSelected(currentItem);
    }

    blueprint3d.three.itemSelectedCallbacks.add(handleItemSelected);
    blueprint3d.three.itemUnselectedCallbacks.add(handleItemUnselected);

    return () => {
      blueprint3d.three.itemSelectedCallbacks.remove(handleItemSelected);
      blueprint3d.three.itemUnselectedCallbacks.remove(handleItemUnselected);
    };
  }, [blueprint3d]);

  const cmToIn = (cm: number): number => {
    return cm / 2.54;
  };

  const inToCm = (inches: number): number => {
    return inches * 2.54;
  };

  const handleResize = () => {
    if (!selectedItem) return;

    try {
      // Item.resize expects (height, width, depth) parameters
      // height = Y axis, width = X axis, depth = Z axis
      selectedItem.resize(
        inToCm(height),  // Y axis
        inToCm(width),   // X axis
        inToCm(depth)    // Z axis
      );
      onCaptureState?.('Resize item');
    } catch (error) {
      console.error('Error resizing item:', error);
    }
  };

  const handleDelete = () => {
    if (!selectedItem) return;

    try {
      if (typeof selectedItem.remove === 'function') {
        selectedItem.remove();
        setSelectedItem(null);
        onCaptureState?.('Delete item');
      }
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const handleFixedChange = (fixed: boolean) => {
    if (!selectedItem) return;

    try {
      selectedItem.setFixed(fixed);
      setIsFixed(fixed);
      onCaptureState?.(fixed ? 'Lock item' : 'Unlock item');
    } catch (error) {
      console.error('Error setting fixed state:', error);
    }
  };

  const handleRotate = (degrees: number) => {
    if (!selectedItem) return;

    try {
      if (typeof selectedItem.rotate === 'function') {
        selectedItem.rotate(degrees * Math.PI / 180);
        onCaptureState?.(`Rotate item ${degrees}°`);
      }
    } catch (error) {
      console.error('Error rotating item:', error);
    }
  };

  if (!selectedItem) {
    return (
      <div className="item-properties-panel">
        <div className="no-selection">
          <div className="no-selection-icon">📦</div>
          <p>{t('properties.item.no_selection')}</p>
          <span>{t('properties.item.no_selection_hint')}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="item-properties-panel">
      <div className="properties-header">
        <h3>{selectedItem.metadata?.itemName || 'Item'}</h3>
        <button 
          className="delete-icon-btn"
          onClick={handleDelete}
          title={t('properties.item.delete')}
        >
          🗑️
        </button>
      </div>

      <div className="properties-section">
        <h4>{t('properties.item.dimensions')}</h4>
        <div className="dimension-inputs">
          <div className="dimension-input">
            <label>{t('properties.item.width')}</label>
            <input
              type="number"
              value={width}
              onChange={(e) => setWidth(Number(e.target.value))}
              onBlur={handleResize}
              min="1"
            />
          </div>
          <div className="dimension-input">
            <label>{t('properties.item.height')}</label>
            <input
              type="number"
              value={height}
              onChange={(e) => setHeight(Number(e.target.value))}
              onBlur={handleResize}
              min="1"
            />
          </div>
          <div className="dimension-input">
            <label>{t('properties.item.depth')}</label>
            <input
              type="number"
              value={depth}
              onChange={(e) => setDepth(Number(e.target.value))}
              onBlur={handleResize}
              min="1"
            />
          </div>
        </div>
      </div>

      <div className="properties-section">
        <h4>{t('properties.item.rotation')}</h4>
        <div className="rotation-buttons">
          <button 
            className="rotation-btn"
            onClick={() => handleRotate(-90)}
            title="Rotate left 90°"
          >
            ↺ 90°
          </button>
          <button 
            className="rotation-btn"
            onClick={() => handleRotate(90)}
            title="Rotate right 90°"
          >
            ↻ 90°
          </button>
          <button 
            className="rotation-btn"
            onClick={() => handleRotate(180)}
            title="Rotate 180°"
          >
            ⟳ 180°
          </button>
        </div>
      </div>

      <div className="properties-section">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={isFixed}
            onChange={(e) => handleFixedChange(e.target.checked)}
          />
          <span>{t('properties.item.lock_position', 'Lock position')}</span>
        </label>
      </div>

      <div className="properties-actions">
        <button 
          className="delete-btn"
          onClick={handleDelete}
        >
          🗑️ {t('properties.item.delete')}
        </button>
      </div>
    </div>
  );
};

export default ItemPropertiesPanel;
