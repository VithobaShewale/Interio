import React from 'react';
import { useTranslation } from 'react-i18next';
import './Toolbar.css';

interface ToolbarProps {
  viewMode: '2d' | '3d' | 'wall';
  onViewModeChange: (mode: '2d' | '3d' | 'wall') => void;
  blueprint3d: any;
  onPanelChange: (panel: 'floor-plan' | 'auto-design' | 'add-items' | 'view' | 'settings' | 'selected' | null) => void;
  activePanel: string | null;
}

const Toolbar: React.FC<ToolbarProps> = ({ viewMode, onViewModeChange, blueprint3d, onPanelChange, activePanel }) => {
  const { t } = useTranslation();
  
  const handleSave = () => {
    if (blueprint3d && blueprint3d.model) {
      const data = blueprint3d.model.exportSerialized();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'floorplan.json';
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleLoad = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file && blueprint3d && blueprint3d.model) {
        const reader = new FileReader();
        reader.onload = (event: any) => {
          try {
            blueprint3d.model.loadSerialized(event.target.result);
          } catch (error) {
            console.error('Error loading file:', error);
            alert('Failed to load floor plan');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  return (
    <div className="toolbar-vertical">
      <div className="toolbar-section">
        <button 
          className={`toolbar-icon-btn ${activePanel === 'floor-plan' ? 'active' : ''}`}
          onClick={() => {
            onPanelChange(activePanel === 'floor-plan' ? null : 'floor-plan');
            if (activePanel !== 'floor-plan') {
              onViewModeChange('2d');
            }
          }}
        >
          <span className="icon">📐</span>
          <span className="label">{t('floorplanner.title')}</span>
        </button>
        
        <button 
          className={`toolbar-icon-btn ${activePanel === 'auto-design' ? 'active' : ''}`}
          onClick={() => onPanelChange(activePanel === 'auto-design' ? null : 'auto-design')}
        >
          <span className="icon">📏</span>
          <span className="label">{t('measurements.title')}</span>
        </button>
        
        <button 
          className={`toolbar-icon-btn ${activePanel === 'add-items' ? 'active' : ''}`}
          onClick={() => onPanelChange(activePanel === 'add-items' ? null : 'add-items')}
        >
          <span className="icon">🛋️</span>
          <span className="label">{t('sidebar.items')}</span>
        </button>
        
        <button 
          className={`toolbar-icon-btn ${activePanel === 'selected' ? 'active' : ''}`}
          onClick={() => onPanelChange(activePanel === 'selected' ? null : 'selected')}
        >
          <span className="icon">🖱️</span>
          <span className="label">{t('sidebar.selected')}</span>
        </button>
        
        <button 
          className={`toolbar-icon-btn ${activePanel === 'view' ? 'active' : ''}`}
          onClick={() => onPanelChange(activePanel === 'view' ? null : 'view')}
        >
          <span className="icon">👁️</span>
          <span className="label">{t('toolbar.view_3d')}</span>
        </button>
      </div>
      
      <div className="toolbar-section toolbar-bottom">
        <button 
          className={`toolbar-icon-btn ${activePanel === 'settings' ? 'active' : ''}`}
          onClick={() => onPanelChange(activePanel === 'settings' ? null : 'settings')}
        >
          <span className="icon">⚙️</span>
          <span className="label">{t('common.settings')}</span>
        </button>
      </div>
    </div>
  );
};

export default Toolbar;
