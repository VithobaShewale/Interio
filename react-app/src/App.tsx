import React from 'react';
import { useTranslation } from 'react-i18next';
import './App.css';
import { featureFlags } from './config/featureFlags';
import FloorPlanner from './components/features/FloorPlanner';
import ThreeViewer from './components/features/ThreeViewer';
import WallElevation from './components/features/WallElevation';
import Toolbar from './components/layout/Toolbar';
import Sidebar from './components/layout/Sidebar';
import LoadingModal from './components/common/LoadingModal';
import ImportExportDialog from './components/common/ImportExportDialog';
import ItemListModal from './components/common/ItemListModal';
import KeyboardShortcutsHelp from './components/common/KeyboardShortcutsHelp';
import WallElevationController from './components/common/WallElevationController';
import { AuthModal } from './components/common/Auth';
import { useBlueprint3D } from './hooks/useBlueprint3D';
import { useUndoRedo } from './hooks/useUndoRedo';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { Blueprint3DProvider } from './core/blueprint3d';
import { DesignContainer, ItemCatalogContainer, AuthContainer } from './containers';
import { useUIStore, useDesignStore } from './store';

const blueprint3dConfig = {
  floorplannerElement: 'floorplanner-canvas',
  threeElement: 'viewer',
  textureDir: '/rooms/textures/',
};

function AppContent() {
  const { t } = useTranslation();
  const {
    blueprint3d,
    viewMode,
    setViewMode,
    saveDraft
  } = useBlueprint3D();

  const {
    undo,
    redo,
    canUndo,
    canRedo,
    captureState
  } = useUndoRedo({ blueprint3d });

  // Initialize keyboard shortcuts
  useKeyboardShortcuts({
    blueprint3d,
    viewMode,
    setViewMode,
    saveDraft
  });

  const [activePanel, setActivePanel] = React.useState<'floor-plan' | 'auto-design' | 'add-items' | 'item-list' | 'view' | 'settings' | 'selected' | null>(null);
  const [showImportExport, setShowImportExport] = React.useState(false);
  const [showAuthModal, setShowAuthModal] = React.useState(false);
  const [showItemList, setShowItemList] = React.useState(false);
  
  // Use new stores
  const { showNotification } = useUIStore();
  const { isDirty } = useDesignStore();

  // Track item and wall selection to auto-open selected panel
  React.useEffect(() => {
    if (!blueprint3d?.three) return;
    (window as any).bp3d = blueprint3d; // Expose for debugging
    
    const handleItemSelected = () => {
      setActivePanel('selected');
    };

    const handleItemUnselected = () => {
      // Panel stays open even when item is unselected
    };

    const handleWallClicked = (edge: any) => {
      // Store the wall edge immediately when clicked
      (window as any).lastClickedWallEdge = edge;
      (window as any).lastClickedFloor = null; // Clear floor selection
      setActivePanel('selected');
    };

    const handleFloorClicked = (room: any) => {
      // Store the floor/room immediately when clicked
      (window as any).lastClickedFloor = room;
      (window as any).lastClickedWallEdge = null; // Clear wall selection
      setActivePanel('selected');
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

  const handleSave = () => {
    if (saveDraft()) {
      console.log('Design saved successfully');
      showNotification('Design saved to draft!', 'success');
    } else {
      console.error('Failed to save design');
      showNotification('Failed to save design', 'error');
    }
  };

  return (
    <AuthContainer>
      {({ user, isAuthenticated, logout }) => (
        <DesignContainer>
          {({ saveDesign: saveToBackend, exportDesign, importDesign }) => (
            <ItemCatalogContainer>
              {({ items, categories }) => (
                <div className="app">
                  <div className="top-bar">
                    <div className="top-bar-left">
                      <span className="app-logo">{t('common.app_name')}</span>
                      <button className="top-btn" onClick={() => setShowImportExport(true)}>
                        <span>📄</span> {t('common.open')}
                      </button>
                      <button className="top-btn" onClick={handleSave}>
                        <span>💾</span> {t('common.save')}
                      </button>
                      <button 
                        className="top-btn" 
                        onClick={undo} 
                        disabled={!canUndo}
                        title={`${t('common.undo')} (Ctrl+Z)`}
                      >
                        <span>↶</span> {t('common.undo')}
                      </button>
                      <button 
                        className="top-btn" 
                        onClick={redo} 
                        disabled={!canRedo}
                        title={`${t('common.redo')} (Ctrl+Shift+Z)`}
                      >
                        <span>↷</span> {t('common.redo')}
                      </button>
                    </div>
                    <div className="top-bar-center">
                      <button 
                        className={`top-btn ${viewMode === '2d' ? 'active' : ''}`}
                        onClick={() => setViewMode('2d')}
                      >
                        {t('toolbar.view_2d')}
                      </button>
                      <button 
                        className={`top-btn ${viewMode === '3d' ? 'active' : ''}`}
                        onClick={() => {
                          setViewMode('3d');
                          if (activePanel === 'floor-plan') {
                            setActivePanel(null);
                          }
                        }}
                      >
                        {t('toolbar.view_3d')}
                      </button>
                    </div>
                    <div className="top-bar-right">
                      <button 
                        className="top-btn"
                        onClick={() => setShowItemList(true)}
                      >
                        <span>🛒</span> {t('itemlist.shopping_list') || 'Shopping List'}
                      </button>
                      {isAuthenticated ? (
                        <>
                          <span className="user-info">
                            <span>👤</span> {user?.name}
                          </span>
                          <button className="top-btn" onClick={logout}>
                            {t('auth.logout')}
                          </button>
                        </>
                      ) : (
                        <button className="top-btn" onClick={() => setShowAuthModal(true)}>
                          <span>👤</span> {t('common.login')}
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="main-content">
                    <Toolbar 
                      viewMode={viewMode}
                      onViewModeChange={setViewMode}
                      blueprint3d={blueprint3d}
                      onPanelChange={setActivePanel}
                      activePanel={activePanel}
                    />
                    <div className="content-area">
                      <FloorPlanner 
                        blueprint3d={blueprint3d}
                        visible={viewMode === '2d'}
                      />
                      <ThreeViewer 
                        blueprint3d={blueprint3d}
                        visible={viewMode === '3d'}
                      />
                      <WallElevation 
                        blueprint3d={blueprint3d}
                        visible={viewMode === 'wall'}
                      />
                      {/* Floating Wall Elevation Controller */}
                      {featureFlags.showWallElevationToggle && (
                        <WallElevationController 
                          onToggleView={() => setViewMode(viewMode === 'wall' ? '3d' : 'wall')}
                          isWallView={viewMode === 'wall'}
                        />
                      )}
                    </div>
                    
                    {activePanel && (
                      <Sidebar 
                        blueprint3d={blueprint3d} 
                        activePanel={activePanel}
                        onPanelChange={setActivePanel}
                        onStateChange={captureState}
                      />
                    )}
                  </div>
                  
                  <LoadingModal blueprint3d={blueprint3d} />
                  
                  {showImportExport && (
                    <ImportExportDialog 
                      blueprint3d={blueprint3d}
                      onClose={() => setShowImportExport(false)}
                    />
                  )}

                  <KeyboardShortcutsHelp />
                  
                  <ItemListModal
                    blueprint3d={blueprint3d}
                    isOpen={showItemList}
                    onClose={() => setShowItemList(false)}
                  />
                  
                  {showAuthModal && (
                    <AuthModal
                      isOpen={showAuthModal}
                      onClose={() => setShowAuthModal(false)}
                    />
                  )}
                </div>
              )}
            </ItemCatalogContainer>
          )}
        </DesignContainer>
      )}
    </AuthContainer>
  );
}

function App() {
  return (
    <Blueprint3DProvider config={blueprint3dConfig}>
      <AppContent />
    </Blueprint3DProvider>
  );
}

export default App;
