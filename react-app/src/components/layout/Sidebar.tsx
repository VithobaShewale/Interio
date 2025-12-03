import React from 'react';
import { useTranslation } from 'react-i18next';
import * as BP3D from '../../types/blueprint3d';
import { FloorplannerModes } from '../../constants/floorplanner';
import ItemCatalog from '../features/ItemCatalog';
import ItemList from '../features/ItemList';
import TextureSelector from '../features/TextureSelector';
import ItemPropertiesPanel from '../features/ItemPropertiesPanel';
import WallPropertiesPanel from '../features/WallPropertiesPanel';
import FloorPropertiesPanel from '../features/FloorPropertiesPanel';
import MeasurementPanel from '../features/MeasurementPanel';
import SettingsPanel from '../features/SettingsPanel';
import './Sidebar.css';

interface SidebarProps {
  blueprint3d: BP3D.Blueprint3d | null;
  activePanel: 'floor-plan' | 'auto-design' | 'add-items' | 'item-list' | 'view' | 'settings' | 'selected' | null;
  onClose: () => void;
  onCaptureState?: (description?: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ blueprint3d, activePanel, onClose, onCaptureState }) => {
  const { t } = useTranslation();
  const [hasSelectedItem, setHasSelectedItem] = React.useState(false);
  const [hasSelectedWall, setHasSelectedWall] = React.useState(false);
  const [hasSelectedFloor, setHasSelectedFloor] = React.useState(false);
  const [forceUpdate, setForceUpdate] = React.useState(0);
  const [selectedPreset, setSelectedPreset] = React.useState<number | null>(null);
  const [floorplannerMode, setFloorplannerMode] = React.useState<number>(0); // 0=MOVE, 1=DRAW, 2=DELETE

  // Room preset configurations with SVG paths
  const roomPresets = [
    { id: 1, name: 'Preset 1', path: 'M10,10 L50,10 L50,50 L10,50 Z' }, // Square
    { id: 2, name: 'Preset 2', path: 'M10,10 L50,10 L50,35 L35,35 L35,50 L10,50 Z' }, // L-shape right
    { id: 3, name: 'Preset 3', path: 'M10,10 L35,10 L35,25 L50,25 L50,50 L10,50 Z' }, // L-shape stepped
    { id: 4, name: 'Preset 4', path: 'M10,25 L25,25 L25,10 L50,10 L50,50 L10,50 Z' }, // L-shape top-left
    { id: 5, name: 'Preset 5', path: 'M25,10 L50,10 L50,50 L25,50 L25,35 L10,35 L10,25 L25,25 Z' }, // T-shape left
    { id: 6, name: 'Preset 6', path: 'M10,10 L50,10 L50,50 L35,50 L35,35 L10,35 Z' }, // L-shape bottom-right
    { id: 7, name: 'Preset 7', path: 'M10,10 L35,10 L50,25 L50,50 L10,50 Z' }, // Pentagon angle top-right
    { id: 8, name: 'Preset 8', path: 'M10,10 L50,10 L50,35 L35,50 L10,50 Z' }, // Pentagon angle bottom-right
    { id: 9, name: 'Preset 9', path: 'M10,10 L50,10 L35,25 L35,50 L10,50 Z' }, // Pentagon angle top-right inset
    { id: 10, name: 'Preset 10', path: 'M10,10 L35,10 L35,25 L50,25 L35,40 L35,50 L10,50 Z' }, // Complex stepped
    { id: 11, name: 'Preset 11', path: 'M25,10 L50,10 L50,35 L35,50 L10,50 L10,25 L25,10 Z' }, // Hexagon-like
    { id: 12, name: 'Preset 12', path: 'M25,10 L50,10 L50,50 L10,50 L10,25 L25,25 Z' }, // L-shape inverted
    { id: 13, name: 'Preset 13', path: 'M25,10 L50,25 L50,50 L10,50 L10,10 L25,10 Z' }, // Pentagon angle top
  ];

  // Parse SVG path to coordinates
  const parseSvgPath = (path: string): Array<{ x: number; y: number }> => {
    const coords: Array<{ x: number; y: number }> = [];
    const commands = path.match(/[ML]\s*[\d.]+\s*,\s*[\d.]+/g) || [];
    
    commands.forEach(cmd => {
      const match = cmd.match(/[\d.]+/g);
      if (match && match.length >= 2) {
        const x = parseFloat(match[0]);
        const y = parseFloat(match[1]);
        coords.push({ x, y });
      }
    });
    
    return coords;
  };

  // Convert SVG coordinates to Blueprint3D coordinates
  const svgToBlueprint3D = (svgCoords: Array<{ x: number; y: number }>) => {
    const scale = 15;
    const centerOffset = 30; // Center of 60x60 viewBox
    
    return svgCoords.map(coord => ({
      x: (coord.x - centerOffset) * scale,
      y: (coord.y - centerOffset) * scale
    }));
  };

  // Ensure coordinates are in counter-clockwise order
  const ensureCounterClockwise = (coords: Array<{ x: number; y: number }>) => {
    // Calculate signed area
    let area = 0;
    for (let i = 0; i < coords.length; i++) {
      const j = (i + 1) % coords.length;
      area += coords[i].x * coords[j].y - coords[j].x * coords[i].y;
    }
    
    // Reverse if clockwise (negative area)
    return area < 0 ? [...coords].reverse() : coords;
  };

  // Create room from preset
  const createRoomFromPreset = (presetId: number, replaceExisting: boolean = false) => {
    if (!blueprint3d) {
      console.error('Blueprint3D not initialized');
      return;
    }

    const preset = roomPresets.find(p => p.id === presetId);
    if (!preset) {
      console.error('Preset not found:', presetId);
      return;
    }

    try {
      // Parse SVG path to coordinates
      const svgCoords = parseSvgPath(preset.path);
      if (svgCoords.length < 3) {
        console.error('Invalid preset path - need at least 3 points');
        return;
      }

      // Convert to Blueprint3D coordinates and ensure counter-clockwise order
      let roomCoords = svgToBlueprint3D(svgCoords);
      roomCoords = ensureCounterClockwise(roomCoords);
      
      // If replacing, clear existing floorplan
      if (replaceExisting) {
        const floorplan = blueprint3d.model.floorplan;
        const corners = floorplan.getCorners();
        const walls = floorplan.getWalls();
        
        // Remove all existing walls and corners
        [...walls].forEach(wall => wall.remove());
        [...corners].forEach(corner => corner.remove());
      }

      // Create corners
      const floorplan = blueprint3d.model.floorplan;
      const corners: any[] = [];
      
      roomCoords.forEach(coord => {
        const corner = floorplan.newCorner(coord.x, coord.y);
        corners.push(corner);
      });

      // Create walls connecting consecutive corners
      for (let i = 0; i < corners.length; i++) {
        const start = corners[i];
        const end = corners[(i + 1) % corners.length]; // Wrap around to first corner
        floorplan.newWall(start, end);
      }

      console.log(`${replaceExisting ? 'Replaced' : 'Added'} preset room:`, preset.name);
      
      // Update the view
      floorplan.update();
      
      // Force floorplanner view redraw
      if (blueprint3d.floorplanner && blueprint3d.floorplanner.view) {
        blueprint3d.floorplanner.view.draw();
      }
      
    } catch (error) {
      console.error('Error creating room from preset:', error);
    }
  };

  // Track if an item or wall is selected
  React.useEffect(() => {
    if (!blueprint3d?.three) return;

    const handleItemSelected = () => {
      setHasSelectedItem(true);
      setHasSelectedWall(false);
      setForceUpdate(prev => prev + 1);
    };
    
    const handleItemUnselected = () => {
      setHasSelectedItem(false);
      setForceUpdate(prev => prev + 1);
    };

    const handleWallClicked = () => {
      setHasSelectedWall(true);
      setHasSelectedItem(false);
      setHasSelectedFloor(false);
      setForceUpdate(prev => prev + 1);
    };

    const handleFloorClicked = () => {
      setHasSelectedFloor(true);
      setHasSelectedWall(false);
      setHasSelectedItem(false);
      setForceUpdate(prev => prev + 1);
    };

    blueprint3d.three.itemSelectedCallbacks.add(handleItemSelected);
    blueprint3d.three.itemUnselectedCallbacks.add(handleItemUnselected);
    
    if ((blueprint3d.three as any).wallClicked) {
      (blueprint3d.three as any).wallClicked.add(handleWallClicked);
    }
    if ((blueprint3d.three as any).floorClicked) {
      (blueprint3d.three as any).floorClicked.add(handleFloorClicked);
    }

    return () => {
      blueprint3d.three.itemSelectedCallbacks.remove(handleItemSelected);
      blueprint3d.three.itemUnselectedCallbacks.remove(handleItemUnselected);
      if ((blueprint3d.three as any).wallClicked) {
        (blueprint3d.three as any).wallClicked.remove(handleWallClicked);
      }
      if ((blueprint3d.three as any).floorClicked) {
        (blueprint3d.three as any).floorClicked.remove(handleFloorClicked);
      }
    };
  }, [blueprint3d]);

  // Track floorplanner mode changes
  React.useEffect(() => {
    if (!blueprint3d?.floorplanner) return;

    const handleModeReset = (mode: number) => {
      setFloorplannerMode(mode);
    };

    blueprint3d.floorplanner.modeResetCallbacks.add(handleModeReset);

    return () => {
      blueprint3d.floorplanner.modeResetCallbacks.remove(handleModeReset);
    };
  }, [blueprint3d]);

  // Check actual selected item state when selected panel opens
  React.useEffect(() => {
    if (activePanel === 'selected' && blueprint3d?.three) {
      // Small delay to ensure selection has been processed
      const timer = setTimeout(() => {
        const controller = (blueprint3d.three as any).getController?.();
        const currentSelectedItem = controller?.selectedObject?.() || null;
        setHasSelectedItem(!!currentSelectedItem);
        // hasSelectedWall is already set by wallClicked callback
        setForceUpdate(prev => prev + 1);
      }, 50);
      
      return () => clearTimeout(timer);
    }
  }, [activePanel, blueprint3d]);

  const items = [
    { name: 'Closed Door', image: 'models/thumbnails/thumbnail_Screen_Shot_2014-10-27_at_8.04.12_PM.png', model: 'models/js/closed-door28x80_baked.js', type: 7 },
    { name: 'Open Door', image: 'models/thumbnails/thumbnail_Screen_Shot_2014-10-27_at_8.22.46_PM.png', model: 'models/js/open_door.js', type: 7 },
    { name: 'Window', image: 'models/thumbnails/thumbnail_window.png', model: 'models/js/whitewindow.js', type: 3 },
    { name: 'Chair', image: 'models/thumbnails/thumbnail_Church-Chair-oak-white_1024x1024.jpg', model: 'models/js/gus-churchchair-whiteoak.js', type: 1 },
    { name: 'Red Chair', image: 'models/thumbnails/thumbnail_tn-orange.png', model: 'models/js/ik-ekero-orange_baked.js', type: 1 },
    { name: 'Blue Chair', image: 'models/thumbnails/thumbnail_ekero-blue3.png', model: 'models/js/ik-ekero-blue_baked.js', type: 1 },
    { name: 'Dresser - Dark Wood', image: 'models/thumbnails/thumbnail_matera_dresser_5.png', model: 'models/js/DWR_MATERA_DRESSER2.js', type: 1 },
    { name: 'Dresser - White', image: 'models/thumbnails/thumbnail_img25o.jpg', model: 'models/js/we-narrow6white_baked.js', type: 1 },
    { name: 'Bedside table - Shale', image: 'models/thumbnails/thumbnail_Blu-Dot-Shale-Bedside-Table.jpg', model: 'models/js/bd-shalebedside-smoke_baked.js', type: 1 },
    { name: 'Bedside table - White', image: 'models/thumbnails/thumbnail_arch-white-oval-nightstand.jpg', model: 'models/js/cb-archnight-white_baked.js', type: 1 },
    { name: 'Wardrobe - White', image: 'models/thumbnails/thumbnail_TN-ikea-kvikine.png', model: 'models/js/ik-kivine_baked.js', type: 1 },
    { name: 'Full Bed', image: 'models/thumbnails/thumbnail_nordli-bed-frame__0159270_PE315708_S4.JPG', model: 'models/js/ik_nordli_full.js', type: 1 },
    { name: 'Bookshelf', image: 'models/thumbnails/thumbnail_kendall-walnut-bookcase.jpg', model: 'models/js/cb-kendallbookcasewalnut_baked.js', type: 1 },
    { name: 'Media Console - White', image: 'models/thumbnails/thumbnail_clapboard-white-60-media-console-1.jpg', model: 'models/js/cb-clapboard_baked.js', type: 1 },
    { name: 'Media Console - Black', image: 'models/thumbnails/thumbnail_moore-60-media-console-1.jpg', model: 'models/js/cb-moore_baked.js', type: 1 },
    { name: 'Sectional - Olive', image: 'models/thumbnails/thumbnail_img21o.jpg', model: 'models/js/we-crosby2piece-greenbaked.js', type: 1 },
    { name: 'Sofa - Grey', image: 'models/thumbnails/thumbnail_rochelle-sofa-3.jpg', model: 'models/js/cb-rochelle-gray_baked.js', type: 1 },
    { name: 'Wooden Trunk', image: 'models/thumbnails/thumbnail_teca-storage-trunk.jpg', model: 'models/js/cb-tecs_baked.js', type: 1 },
    { name: 'Floor Lamp', image: 'models/thumbnails/thumbnail_ore-white.png', model: 'models/js/ore-3legged-white_baked.js', type: 1 },
    { name: 'Coffee Table - Wood', image: 'models/thumbnails/thumbnail_stockholm-coffee-table__0181245_PE332924_S4.JPG', model: 'models/js/ik-stockholmcoffee-brown.js', type: 1 },
    { name: 'Side Table', image: 'models/thumbnails/thumbnail_Screen_Shot_2014-02-21_at_1.24.58_PM.png', model: 'models/js/GUSossingtonendtable.js', type: 1 },
    { name: 'Dining Table', image: 'models/thumbnails/thumbnail_scholar-dining-table.jpg', model: 'models/js/cb-scholartable_baked.js', type: 1 },
    { name: 'Dining table', image: 'models/thumbnails/thumbnail_Screen_Shot_2014-01-28_at_6.49.33_PM.png', model: 'models/js/BlakeAvenuejoshuatreecheftable.js', type: 1 },
    { name: 'Blue Rug', image: 'models/thumbnails/thumbnail_cb-blue-block60x96.png', model: 'models/js/cb-blue-block-60x96.js', type: 8 },
    { name: 'NYC Poster', image: 'models/thumbnails/thumbnail_nyc2.jpg', model: 'models/js/nyc-poster2.js', type: 2 }
  ];

  // Items are now handled by ItemCatalog component
  const _unused_handleAddItem = (item: typeof items[0]) => {
    if (!blueprint3d) {
      console.warn('Blueprint3D not initialized yet');
      return;
    }

    const metadata: BP3D.ItemMetadata = {
      itemName: item.name,
      resizable: true,
      modelUrl: item.model,
      itemType: item.type
    };

    try {
      blueprint3d.model.scene.addItem(item.type, item.model, metadata);
      console.log('Item added:', item.name);
    } catch (error) {
      console.error('Error adding item:', error);
    }
  };

  const textures = [
    { 
      name: 'Wood Floor', 
      preview: 'rooms/thumbnails/thumbnail_light_fine_wood.jpg',
      url: 'rooms/textures/light_fine_wood.jpg',
      stretch: false,
      scale: 400
    },
    { 
      name: 'Marble', 
      preview: 'rooms/thumbnails/thumbnail_marbletiles.jpg',
      url: 'rooms/textures/marbletiles.jpg',
      stretch: false,
      scale: 300
    },
    { 
      name: 'Brick Wall', 
      preview: 'rooms/thumbnails/thumbnail_light_brick.jpg',
      url: 'rooms/textures/light_brick.jpg',
      stretch: false,
      scale: 100
    },
    { 
      name: 'Yellow Wall', 
      preview: 'rooms/thumbnails/thumbnail_wallmap_yellow.png',
      url: 'rooms/textures/wallmap_yellow.png',
      stretch: true,
      scale: 0
    },
  ];

  const handleTextureClick = (texture: typeof textures[0]) => {
    if (!blueprint3d) {
      console.warn('Blueprint3D not initialized yet');
      return;
    }

    // Store the selected texture for when user clicks on a wall or floor
    (window as any).selectedTexture = texture;
    console.log('Texture selected:', texture.name, '- Click on a wall or floor to apply');
  };

  return (
    <div className="sidebar-panel">
      <div className="sidebar-header">
        <h2 className="sidebar-title">
          {activePanel === 'floor-plan' && t('sidebar.floorPlan')}
          {activePanel === 'add-items' && t('sidebar.items')}
          {activePanel === 'item-list' && (t('itemlist.shopping_list') || 'Shopping List')}
          {activePanel === 'auto-design' && t('sidebar.autoDesign')}
          {activePanel === 'view' && t('sidebar.view')}
          {activePanel === 'settings' && t('common.settings')}
          {activePanel === 'selected' && (hasSelectedWall ? t('properties.wall.title') : hasSelectedFloor ? t('properties.floor.title') : hasSelectedItem ? t('properties.item.title') : t('sidebar.selected'))}
        </h2>
        <button className="close-btn" onClick={onClose} title={t('common.close')}>×</button>
      </div>

      {activePanel === 'floor-plan' && (
          <div className="panel-content">
            <h3 className="section-title">{t('floorplanner.tools')}</h3>
            <div className="drawing-tools">
              <div 
                className={`tool-item clickable ${floorplannerMode === FloorplannerModes.MOVE ? 'active' : ''}`}
                onClick={() => {
                  if (blueprint3d?.floorplanner) {
                    blueprint3d.floorplanner.setMode(FloorplannerModes.MOVE);
                  }
                }}
              >
                <div className="tool-icon">
                  <svg width="60" height="60" viewBox="0 0 60 60">
                    <path d="M15 45 L45 15" stroke="#333" strokeWidth="3" fill="none"/>
                    <circle cx="15" cy="45" r="3" fill="#333"/>
                    <circle cx="45" cy="15" r="3" fill="#333"/>
                  </svg>
                </div>
                <p>{t('floorplanner.mode_move')}</p>
              </div>
              <div 
                className={`tool-item clickable ${floorplannerMode === FloorplannerModes.DRAW ? 'active' : ''}`}
                onClick={() => {
                  if (blueprint3d?.floorplanner) {
                    blueprint3d.floorplanner.setMode(FloorplannerModes.DRAW);
                  }
                }}
              >
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
                <p>{t('floorplanner.mode_draw')}</p>
              </div>
              <div 
                className={`tool-item clickable ${floorplannerMode === FloorplannerModes.DELETE ? 'active' : ''}`}
                onClick={() => {
                  if (blueprint3d?.floorplanner) {
                    blueprint3d.floorplanner.setMode(FloorplannerModes.DELETE);
                  }
                }}
              >
                <div className="tool-icon">
                  <svg width="60" height="60" viewBox="0 0 60 60">
                    <path d="M15 45 L45 15" stroke="#333" strokeWidth="2" strokeDasharray="4,3"/>
                    <circle cx="15" cy="45" r="3" fill="#333"/>
                    <circle cx="45" cy="15" r="3" fill="#333"/>
                  </svg>
                </div>
                <p>{t('floorplanner.mode_delete')}</p>
              </div>
            </div>
            
            <h3 className="section-title">{t('sidebar.floorPlan')}</h3>
            <div className="presets-grid">
              {roomPresets.map((preset) => (
                <div 
                  key={preset.id} 
                  className={`preset-item ${selectedPreset === preset.id ? 'selected' : ''}`}
                  onClick={() => setSelectedPreset(preset.id)}
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
                onClick={() => {
                  if (selectedPreset && blueprint3d) {
                    createRoomFromPreset(selectedPreset, false);
                  }
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                {t('import_export.import.button')}
              </button>
              <button 
                className="preset-btn replace-btn"
                disabled={!selectedPreset}
                onClick={() => {
                  if (selectedPreset && blueprint3d) {
                    createRoomFromPreset(selectedPreset, true);
                  }
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="8" height="8"/>
                  <rect x="13" y="13" width="8" height="8"/>
                  <path d="M21 11V9M21 9H19M21 9L17 13"/>
                </svg>
                {t('common.apply')}
              </button>
            </div>
          </div>
        )}

      {activePanel === 'add-items' && (
          <div className="panel-content catalog-panel">
            <ItemCatalog blueprint3d={blueprint3d} onCaptureState={onCaptureState} />
          </div>
        )}

      {activePanel === 'item-list' && (
          <div className="panel-content catalog-panel">
            <ItemList blueprint3d={blueprint3d} />
          </div>
        )}

      {activePanel === 'auto-design' && (
          <div className="panel-content catalog-panel">
            <MeasurementPanel blueprint3d={blueprint3d} />
          </div>
        )}

      {activePanel === 'view' && (
          <div className="panel-content catalog-panel">
            <TextureSelector blueprint3d={blueprint3d} onCaptureState={onCaptureState} />
          </div>
        )}

      {activePanel === 'settings' && (
          <div className="panel-content catalog-panel">
            <SettingsPanel blueprint3d={blueprint3d} />
          </div>
        )}

      {activePanel === 'selected' && (
          <div className="panel-content catalog-panel">
            {hasSelectedWall ? (
              <WallPropertiesPanel blueprint3d={blueprint3d} onCaptureState={onCaptureState} />
            ) : hasSelectedFloor ? (
              <FloorPropertiesPanel blueprint3d={blueprint3d} onCaptureState={onCaptureState} />
            ) : (
              <ItemPropertiesPanel blueprint3d={blueprint3d} onCaptureState={onCaptureState} />
            )}
          </div>
        )}
    </div>
  );
};

export default Sidebar;
