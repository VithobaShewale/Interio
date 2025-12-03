import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './PropertiesPanel.css';

export interface Texture {
  name: string;
  preview: string;
  url: string;
  stretch: boolean;
  scale: number;
}

export type SelectionType = 'wall' | 'floor' | 'item';

interface PropertiesPanelProps {
  blueprint3d: any;
  selectionType: SelectionType;
  onCaptureState?: (description?: string) => void;
  getStoredSelection: () => any;
  textures?: Texture[];
  coveringTypes?: string[];
  onTextureApply: (selection: any, texture: Texture) => void;
  renderCustomContent?: (selection: any) => React.ReactNode;
}

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  blueprint3d,
  selectionType,
  onCaptureState,
  getStoredSelection,
  textures = [],
  coveringTypes = [],
  onTextureApply,
  renderCustomContent
}) => {
  const { t } = useTranslation();
  const [selection, setSelection] = useState<any>(() => getStoredSelection());
  const [selectedTexture, setSelectedTexture] = useState<string>(() => {
    const stored = getStoredSelection();
    if (selectionType === 'wall' && stored?.wall?.frontTexture?.url) {
      return stored.wall.frontTexture.url;
    }
    if (selectionType === 'floor' && stored?.texture?.url) {
      return stored.texture.url;
    }
    return '';
  });

  useEffect(() => {
    if (!blueprint3d?.three) return;

    const handleSelection = (data: any) => {
      setSelection(data);
      
      if (selectionType === 'wall' && data?.wall?.frontTexture?.url) {
        setSelectedTexture(data.wall.frontTexture.url);
      } else if (selectionType === 'floor' && data?.texture?.url) {
        setSelectedTexture(data.texture.url);
      }
    };

    const eventName = selectionType === 'wall' ? 'wallClicked' : 'floorClicked';
    if ((blueprint3d.three as any)[eventName]) {
      (blueprint3d.three as any)[eventName].add(handleSelection);
    }

    return () => {
      if ((blueprint3d.three as any)[eventName]) {
        (blueprint3d.three as any)[eventName].remove(handleSelection);
      }
    };
  }, [blueprint3d, selectionType]);

  const handleTextureChange = (texture: Texture) => {
    if (!selection) return;

    try {
      onTextureApply(selection, texture);
      setSelectedTexture(texture.url);
      onCaptureState?.(`Apply ${texture.name} to ${selectionType}`);
    } catch (error) {
      console.error(`Error applying texture to ${selectionType}:`, error);
    }
  };

  const getEmptyStateConfig = () => {
    switch (selectionType) {
      case 'wall':
        return {
          icon: '🧱',
          title: t('properties.wall.no_selection'),
          subtitle: t('properties.wall.no_selection_hint')
        };
      case 'floor':
        return {
          icon: '🏠',
          title: t('properties.floor.no_selection'),
          subtitle: t('properties.floor.no_selection_hint')
        };
      default:
        return {
          icon: '📦',
          title: t('properties.item.no_selection'),
          subtitle: t('properties.item.no_selection_hint')
        };
    }
  };

  const getTitleText = () => {
    switch (selectionType) {
      case 'wall':
        return t('properties.wall.title');
      case 'floor':
        return t('properties.floor.title');
      default:
        return t('sidebar.properties');
    }
  };

  if (!selection) {
    const emptyState = getEmptyStateConfig();
    return (
      <div className="properties-panel">
        <div className="no-selection">
          <div className="no-selection-icon">{emptyState.icon}</div>
          <p>{emptyState.title}</p>
          <span>{emptyState.subtitle}</span>
        </div>
      </div>
    );
  }

  // If custom content is provided (for items), render that
  if (renderCustomContent) {
    return <div className="properties-panel">{renderCustomContent(selection)}</div>;
  }

  // Default rendering for wall/floor textures
  return (
    <div className="properties-panel">
      <div className="properties-header">
        <h3>{getTitleText()}</h3>
      </div>

      {coveringTypes.length > 0 && (
        <div className="covering-type-section">
          <label className="section-label">{t(`properties.${selectionType}.covering_type`)}</label>
          <select className="covering-type-select">
            {coveringTypes.map((type, index) => (
              <option key={index}>{type}</option>
            ))}
          </select>
        </div>
      )}

      <div className="textures-grid">
        {textures.map((texture, index) => (
          <div
            key={index}
            className={`texture-card ${selectedTexture === texture.url ? 'selected' : ''}`}
            onClick={() => handleTextureChange(texture)}
          >
            <div className="texture-preview">
              <img src={texture.preview} alt={texture.name} />
              {selectedTexture === texture.url && (
                <div className="selected-indicator">✓</div>
              )}
            </div>
            <div className="texture-name">{texture.name}</div>
          </div>
        ))}
      </div>

      <div className="rotation-section">
        <label className="section-label">{t('properties.item.rotation')}</label>
        <select className="rotation-select">
          <option>0°</option>
          <option>90°</option>
          <option>180°</option>
          <option>270°</option>
        </select>
      </div>

      <div className="current-covering-section">
        <div className="current-covering-header">
          <span className="section-label">{t(`properties.${selectionType}.current_covering`)}</span>
          <button className="arrow-btn">→</button>
        </div>
        {selectedTexture && (
          <div className="current-covering-preview">
            <img src={selectedTexture} alt="Current" />
            <span>{selectionType === 'wall' ? t('properties.wall.types.wallpaper') : t('properties.floor.title')} - 1</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertiesPanel;
