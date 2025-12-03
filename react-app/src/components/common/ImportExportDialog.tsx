import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { exportToGLB, exportToOBJ, canExportGLB, canExport3D } from '../../utils/glbExporter';
import './ImportExportDialog.css';

interface ImportExportDialogProps {
  blueprint3d: any;
  onClose: () => void;
}

const ImportExportDialog: React.FC<ImportExportDialogProps> = ({ blueprint3d, onClose }) => {
  const { t } = useTranslation();
  const [mode, setMode] = useState<'main' | 'import' | 'export'>('main');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleNewDesign = () => {
    if (!blueprint3d?.model) return;
    
    const defaultDesign = '{"floorplan":{"corners":{"f90da5e3-9e0e-eba7-173d-eb0b071e838e":{"x":204.85099999999989,"y":289.052},"da026c08-d76a-a944-8e7b-096b752da9ed":{"x":672.2109999999999,"y":289.052},"4e3d65cb-54c0-0681-28bf-bddcc7bdb571":{"x":672.2109999999999,"y":-178.308},"71d4f128-ae80-3d58-9bd2-711c6ce6cdf2":{"x":204.85099999999989,"y":-178.308}},"walls":[{"corner1":"71d4f128-ae80-3d58-9bd2-711c6ce6cdf2","corner2":"f90da5e3-9e0e-eba7-173d-eb0b071e838e","frontTexture":{"url":"rooms/textures/wallmap.png","stretch":true,"scale":0},"backTexture":{"url":"rooms/textures/wallmap.png","stretch":true,"scale":0}},{"corner1":"f90da5e3-9e0e-eba7-173d-eb0b071e838e","corner2":"da026c08-d76a-a944-8e7b-096b752da9ed","frontTexture":{"url":"rooms/textures/wallmap.png","stretch":true,"scale":0},"backTexture":{"url":"rooms/textures/wallmap.png","stretch":true,"scale":0}},{"corner1":"da026c08-d76a-a944-8e7b-096b752da9ed","corner2":"4e3d65cb-54c0-0681-28bf-bddcc7bdb571","frontTexture":{"url":"rooms/textures/wallmap.png","stretch":true,"scale":0},"backTexture":{"url":"rooms/textures/wallmap.png","stretch":true,"scale":0}},{"corner1":"4e3d65cb-54c0-0681-28bf-bddcc7bdb571","corner2":"71d4f128-ae80-3d58-9bd2-711c6ce6cdf2","frontTexture":{"url":"rooms/textures/wallmap.png","stretch":true,"scale":0},"backTexture":{"url":"rooms/textures/wallmap.png","stretch":true,"scale":0}}],"wallTextures":[],"floorTextures":{},"newFloorTextures":{}},"items":[]}';
    
    // eslint-disable-next-line no-restricted-globals
    if (confirm(t('messages.confirm_new'))) {
      blueprint3d.model.loadSerialized(defaultDesign);
      onClose();
    }
  };

  const handleLoadFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !blueprint3d?.model) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = event.target?.result as string;
        blueprint3d.model.loadSerialized(data);
        onClose();
      } catch (error) {
        alert(t('messages.error_loading'));
        console.error('Load error:', error);
      }
    };
    reader.readAsText(file);
  };

  const handleSaveFile = () => {
    if (!blueprint3d?.model) return;

    try {
      const data = blueprint3d.model.exportSerialized();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `blueprint3d-design-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      onClose();
    } catch (error) {
      alert(t('messages.error_saving'));
      console.error('Save error:', error);
    }
  };

  const handleExportOBJ = async () => {
    if (!blueprint3d) return;

    try {
      await exportToOBJ(blueprint3d);
      alert(t('import_export.export.glb_success')); // Reuse success message
      onClose();
    } catch (error) {
      alert(t('import_export.export.glb_error')); // Reuse error message
      console.error('OBJ export error:', error);
    }
  };

  const handleExportGLB = async () => {
    if (!blueprint3d) return;

    try {
      await exportToGLB(blueprint3d);
      alert(t('import_export.export.glb_success'));
      onClose();
    } catch (error) {
      alert(t('import_export.export.glb_error'));
      console.error('GLB export error:', error);
    }
  };

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="dialog" onClick={(e) => e.stopPropagation()}>
        {mode === 'main' && (
          <>
            <div className="dialog-header">
              <h2>{t('import_export.title')}</h2>
              <button className="close-btn" onClick={onClose}>×</button>
            </div>
            <div className="dialog-content">
              <div className="dialog-options">
                <button className="dialog-option" onClick={handleNewDesign}>
                  <span className="option-icon">📄</span>
                  <div className="option-text">
                    <h3>{t('toolbar.new_design')}</h3>
                    <p>{t('import_export.new_hint', 'Start with a blank room')}</p>
                  </div>
                </button>
                <button className="dialog-option" onClick={() => setMode('import')}>
                  <span className="option-icon">📂</span>
                  <div className="option-text">
                    <h3>{t('toolbar.load_design')}</h3>
                    <p>{t('import_export.import.hint')}</p>
                  </div>
                </button>
                <button className="dialog-option" onClick={() => setMode('export')}>
                  <span className="option-icon">💾</span>
                  <div className="option-text">
                    <h3>{t('toolbar.save_design')}</h3>
                    <p>{t('import_export.export.hint', 'Export to file')}</p>
                  </div>
                </button>
              </div>
            </div>
          </>
        )}

        {mode === 'import' && (
          <>
            <div className="dialog-header">
              <button className="back-btn" onClick={() => setMode('main')}>←</button>
              <h2>{t('toolbar.load_design')}</h2>
              <button className="close-btn" onClick={onClose}>×</button>
            </div>
            <div className="dialog-content">
              <div className="import-section">
                <p>{t('import_export.import.hint')}</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
                <button className="primary-btn" onClick={handleLoadFile}>
                  📂 {t('import_export.import.button')}
                </button>
              </div>
            </div>
          </>
        )}

        {mode === 'export' && (
          <>
            <div className="dialog-header">
              <button className="back-btn" onClick={() => setMode('main')}>←</button>
              <h2>{t('toolbar.save_design')}</h2>
              <button className="close-btn" onClick={onClose}>×</button>
            </div>
            <div className="dialog-content">
              <div className="export-section">
                <h3>{t('import_export.export.title')}</h3>
                <p>{t('import_export.export.hint')}</p>
                
                <button className="primary-btn" onClick={handleSaveFile} style={{ marginBottom: '10px' }}>
                  💾 {t('import_export.export.download_button')}
                </button>

                {canExport3D(blueprint3d) && (
                  <>
                    <p style={{ marginTop: '20px' }}>{t('import_export.export.glb_hint')}</p>
                    <button className="primary-btn" onClick={handleExportOBJ} style={{ marginBottom: '10px' }}>
                      📦 Download 3D Model (OBJ)
                    </button>
                    {canExportGLB(blueprint3d) && (
                      <button className="primary-btn" onClick={handleExportGLB}>
                        🎨 {t('import_export.export.download_glb_button')}
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ImportExportDialog;
