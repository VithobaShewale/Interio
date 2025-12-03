import React, { useState, useEffect } from 'react';
import './SettingsPanel.css';
import LanguageSwitcher from '../common/LanguageSwitcher';

interface SettingsPanelProps {
  blueprint3d: any;
}

interface Settings {
  units: 'metric' | 'imperial';
  theme: 'light' | 'dark' | 'auto';
  gridVisible: boolean;
  gridSize: number;
  snapToGrid: boolean;
  autoSave: boolean;
  autoSaveInterval: number;
  showDimensions: boolean;
  showWallElevationButton: boolean;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ blueprint3d }) => {
  const [settings, setSettings] = useState<Settings>({
    units: 'imperial',
    theme: 'light',
    gridVisible: true,
    gridSize: 50,
    snapToGrid: true,
    autoSave: true,
    autoSaveInterval: 60,
    showDimensions: true,
    showWallElevationButton: true
  });

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('blueprint3d-settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    }
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('blueprint3d-settings', JSON.stringify(settings));
  }, [settings]);

  const handleSettingChange = <K extends keyof Settings>(
    key: K,
    value: Settings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));

    // Apply settings to Blueprint3D if needed
    if (key === 'gridVisible' && blueprint3d?.floorplanner) {
      // Toggle grid visibility in floorplanner
      try {
        blueprint3d.floorplanner.view.grid.visible = value;
      } catch (error) {
        console.log('Grid visibility control not available');
      }
    }
  };

  const handleReset = () => {
    // eslint-disable-next-line no-restricted-globals
    if (confirm('Reset all settings to defaults?')) {
      const defaults: Settings = {
        units: 'imperial',
        theme: 'light',
        gridVisible: true,
        gridSize: 50,
        snapToGrid: true,
        autoSave: true,
        autoSaveInterval: 60,
        showDimensions: true,
        showWallElevationButton: true
      };
      setSettings(defaults);
    }
  };

  return (
    <div className="settings-panel">
      <div className="settings-header">
        <h3>⚙️ Settings</h3>
      </div>

      <div className="settings-content">
        {/* Units */}
        <div className="setting-section">
          <h4 className="setting-title">📏 Measurement Units</h4>
          <div className="setting-item">
            <label className="setting-label">Default Units:</label>
            <div className="radio-group">
              <label className="radio-option">
                <input
                  type="radio"
                  name="units"
                  value="imperial"
                  checked={settings.units === 'imperial'}
                  onChange={() => handleSettingChange('units', 'imperial')}
                />
                <span>Imperial (ft/in)</span>
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  name="units"
                  value="metric"
                  checked={settings.units === 'metric'}
                  onChange={() => handleSettingChange('units', 'metric')}
                />
                <span>Metric (m/cm)</span>
              </label>
            </div>
          </div>
        </div>

        {/* Language */}
        <div className="setting-section">
          <h4 className="setting-title">🌐 Language</h4>
          <div className="setting-item">
            <label className="setting-label">Select Language:</label>
            <LanguageSwitcher />
          </div>
        </div>

        {/* Theme */}
        <div className="setting-section">
          <h4 className="setting-title">🎨 Appearance</h4>
          <div className="setting-item">
            <label className="setting-label">Theme:</label>
            <select
              className="setting-select"
              value={settings.theme}
              onChange={(e) => handleSettingChange('theme', e.target.value as 'light' | 'dark' | 'auto')}
            >
              <option value="light">Light</option>
              <option value="dark">Dark (Coming Soon)</option>
              <option value="auto">Auto (System)</option>
            </select>
          </div>
        </div>

        {/* Grid Settings */}
        <div className="setting-section">
          <h4 className="setting-title">📐 Grid & Snapping</h4>
          <div className="setting-item">
            <label className="setting-label">
              <input
                type="checkbox"
                checked={settings.gridVisible}
                onChange={(e) => handleSettingChange('gridVisible', e.target.checked)}
              />
              <span>Show Grid</span>
            </label>
          </div>
          <div className="setting-item">
            <label className="setting-label">
              <input
                type="checkbox"
                checked={settings.snapToGrid}
                onChange={(e) => handleSettingChange('snapToGrid', e.target.checked)}
              />
              <span>Snap to Grid</span>
            </label>
          </div>
          <div className="setting-item">
            <label className="setting-label">Grid Size:</label>
            <div className="slider-container">
              <input
                type="range"
                min="10"
                max="100"
                step="10"
                value={settings.gridSize}
                onChange={(e) => handleSettingChange('gridSize', parseInt(e.target.value))}
                className="setting-slider"
              />
              <span className="slider-value">{settings.gridSize} cm</span>
            </div>
          </div>
        </div>

        {/* Display Options */}
        <div className="setting-section">
          <h4 className="setting-title">👁️ Display Options</h4>
          <div className="setting-item">
            <label className="setting-label">
              <input
                type="checkbox"
                checked={settings.showDimensions}
                onChange={(e) => handleSettingChange('showDimensions', e.target.checked)}
              />
              <span>Show Dimensions Toggle Button</span>
            </label>
          </div>
          <div className="setting-item">
            <label className="setting-label">
              <input
                type="checkbox"
                checked={settings.showWallElevationButton}
                onChange={(e) => handleSettingChange('showWallElevationButton', e.target.checked)}
              />
              <span>Show Wall Elevation Toggle Button</span>
            </label>
          </div>
        </div>

        {/* Auto-Save */}
        <div className="setting-section">
          <h4 className="setting-title">💾 Auto-Save</h4>
          <div className="setting-item">
            <label className="setting-label">
              <input
                type="checkbox"
                checked={settings.autoSave}
                onChange={(e) => handleSettingChange('autoSave', e.target.checked)}
              />
              <span>Enable Auto-Save</span>
            </label>
          </div>
          {settings.autoSave && (
            <div className="setting-item">
              <label className="setting-label">Interval:</label>
              <select
                className="setting-select"
                value={settings.autoSaveInterval}
                onChange={(e) => handleSettingChange('autoSaveInterval', parseInt(e.target.value))}
              >
                <option value="30">30 seconds</option>
                <option value="60">1 minute</option>
                <option value="120">2 minutes</option>
                <option value="300">5 minutes</option>
              </select>
            </div>
          )}
        </div>

        {/* Reset */}
        <div className="setting-section">
          <button className="reset-btn" onClick={handleReset}>
            🔄 Reset to Defaults
          </button>
        </div>

        {/* Info */}
        <div className="settings-info">
          <p>💡 Settings are automatically saved to your browser's local storage.</p>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
