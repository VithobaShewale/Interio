import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as BP3D from '../../types/blueprint3d';
import './WallElevation.css';

interface WallElevationProps {
  blueprint3d: BP3D.Blueprint3d | null;
  visible: boolean;
}

type ResolutionType = '1080p' | '2K' | '4K';

// Resolution presets
const RESOLUTIONS = {
  '1080p': { width: 1920, height: 1080 },
  '2K': { width: 2560, height: 1440 },
  '4K': { width: 3840, height: 2160 }
} as const;

// Camera and rendering constants
const CONSTANTS = {
  WALL_HEIGHT: 275,
  VIEW_SIZE_MULTIPLIER: 0.55,
  CAMERA_DISTANCE_MULTIPLIER: 2.5,
  WALL_THICKNESS_MULTIPLIER: 10,
  ITEM_PROXIMITY_THRESHOLD: 150, // 1.5m in cm
  BACKGROUND_COLOR: 0xcccccc,
  CLIPPING_NEAR: 1,
  CLIPPING_FAR: 10000
} as const;

/**
 * Calculate distance from a point to a line segment
 */
const distancePointToLine = (
  px: number, py: number,
  x1: number, y1: number,
  x2: number, y2: number
): number => {
  const A = px - x1;
  const B = py - y1;
  const C = x2 - x1;
  const D = y2 - y1;
  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  
  if (lenSq === 0) return Math.sqrt(A * A + B * B);
  
  const param = Math.max(0, Math.min(1, dot / lenSq));
  const dx = A - param * C;
  const dy = B - param * D;
  return Math.sqrt(dx * dx + dy * dy);
};

/**
 * Calculate perpendicular viewing angle for wall
 */
const calculateViewAngle = (wall: any, wallAngle: number): number => {
  const frontEdge = wall.frontEdge;
  const backEdge = wall.backEdge;
  
  if (frontEdge && frontEdge.front) {
    // View from interior (perpendicular CCW)
    return wallAngle + Math.PI / 2;
  } else if (backEdge && !backEdge.front) {
    // View from exterior (perpendicular CW)
    return wallAngle - Math.PI / 2;
  }
  
  // Default: interior view
  return wallAngle + Math.PI / 2;
};

const WallElevation: React.FC<WallElevationProps> = ({ blueprint3d, visible }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [selectedWall, setSelectedWall] = useState<any>(null);
  const [walls, setWalls] = useState<any[]>([]);
  const [resolution, setResolution] = useState<ResolutionType>('4K');

  /**
   * Main function to render wall elevation
   */
  const renderWallElevation = useCallback((
    wall: any,
    canvas: HTMLCanvasElement,
    bp3d: any,
    THREE: any
  ) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return false;

    const wallIndex = walls.indexOf(wall);
    if (wallIndex === -1) return false;

    // Extract wall properties
    const wallStart = wall.getStart();
    const wallEnd = wall.getEnd();
    const wallLength = wall.frontEdge ? 
      wall.frontEdge.interiorDistance() : 
      wall.backEdge.interiorDistance();
    const wallThickness = wall.thickness || 10;
    
    // Calculate wall geometry
    const wallCenterX = (wallStart.x + wallEnd.x) / 2;
    const wallCenterY = (wallStart.y + wallEnd.y) / 2;
    const wallDx = wallEnd.x - wallStart.x;
    const wallDy = wallEnd.y - wallStart.y;
    const wallAngle = Math.atan2(wallDy, wallDx);
    const perpAngle = calculateViewAngle(wall, wallAngle);

    // Get Blueprint3D renderer and scene
    const mainRenderer = bp3d.three.getRenderer();
    const mainCamera = bp3d.three.getCamera();
    const sceneWrapper = bp3d.three.getScene();
    const mainScene = sceneWrapper.getScene();
    
    if (!mainRenderer || !mainScene || !mainCamera) return false;

    // Save original state
    const original = {
      position: mainCamera.position.clone(),
      rotation: mainCamera.rotation.clone(),
      up: mainCamera.up.clone(),
      target: bp3d.three.controls.target.clone(),
      clearColor: mainRenderer.getClearColor().getHex(),
      clearAlpha: mainRenderer.getClearAlpha(),
      width: bp3d.three.elementWidth,
      height: bp3d.three.elementHeight
    };

    try {
      // Setup orthographic camera
      const aspect = canvas.width / canvas.height;
      const viewSize = Math.max(wallLength, CONSTANTS.WALL_HEIGHT) * CONSTANTS.VIEW_SIZE_MULTIPLIER;
      const tempCamera = new THREE.OrthographicCamera(
        -viewSize * aspect, viewSize * aspect,
        viewSize, -viewSize,
        CONSTANTS.CLIPPING_NEAR, CONSTANTS.CLIPPING_FAR
      );

      // Position camera
      const cameraDistance = Math.max(
        wallLength,
        CONSTANTS.WALL_HEIGHT,
        wallThickness * CONSTANTS.WALL_THICKNESS_MULTIPLIER
      ) * CONSTANTS.CAMERA_DISTANCE_MULTIPLIER;
      
      const lookAtHeight = CONSTANTS.WALL_HEIGHT / 2;
      
      tempCamera.position.set(
        wallCenterX + Math.cos(perpAngle) * cameraDistance,
        lookAtHeight,
        wallCenterY + Math.sin(perpAngle) * cameraDistance
      );
      tempCamera.up.set(0, 1, 0);
      tempCamera.lookAt(new THREE.Vector3(wallCenterX, lookAtHeight, wallCenterY));
      tempCamera.updateProjectionMatrix();

      // Setup rendering environment
      mainRenderer.setClearColor(CONSTANTS.BACKGROUND_COLOR, 1);
      (window as any).BP3D.Three.setEdgeAutoVisibility(false);

      // Control wall visibility
      const floorplanRenderer = bp3d.three.getFloorplan();
      const originalWallVisibility: any[] = [];
      
      if (floorplanRenderer?.edges) {
        floorplanRenderer.edges.forEach((edge: any, index: number) => {
          originalWallVisibility[index] = edge.visible;
          const isTargetWall = (index === wallIndex);
          edge.visible = isTargetWall;
          
          edge.planes?.forEach((plane: any) => { plane.visible = isTargetWall; });
          edge.basePlanes?.forEach((plane: any) => { plane.visible = isTargetWall; });
        });
      }

      // Filter items by proximity
      const items = bp3d.model.scene.getItems();
      const originalItemVisibility: any[] = [];
      
      items.forEach((item: any, index: number) => {
        originalItemVisibility[index] = item.visible;
        
        if (item.position) {
          const distance = distancePointToLine(
            item.position.x, item.position.z,
            wallStart.x, wallStart.y,
            wallEnd.x, wallEnd.y
          );
          item.visible = distance < CONSTANTS.ITEM_PROXIMITY_THRESHOLD;
        } else {
          item.visible = false;
        }
      });

      // Render to canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      mainRenderer.setSize(canvas.width, canvas.height);
      mainRenderer.clear();
      mainRenderer.render(mainScene, tempCamera);
      ctx.drawImage(mainRenderer.domElement, 0, 0);

      // Restore state
      mainRenderer.setClearColor(original.clearColor, original.clearAlpha);
      
      if (floorplanRenderer?.edges) {
        floorplanRenderer.edges.forEach((edge: any, index: number) => {
          if (originalWallVisibility[index] !== undefined) {
            edge.visible = originalWallVisibility[index];
          }
        });
      }
      
      (window as any).BP3D.Three.setEdgeAutoVisibility(true);
      
      mainRenderer.setSize(original.width, original.height);
      mainCamera.position.copy(original.position);
      mainCamera.rotation.copy(original.rotation);
      mainCamera.up.copy(original.up);
      bp3d.three.controls.target.copy(original.target);
      bp3d.three.controls.update();
      
      items.forEach((item: any, index: number) => {
        item.visible = originalItemVisibility[index];
      });

      mainRenderer.clear();
      mainRenderer.render(mainScene, mainCamera);

      return true;
    } catch (error) {
      console.error('Error rendering wall elevation:', error);
      return false;
    }
  }, [walls]);

  // Get all walls when blueprint3d loads
  useEffect(() => {
    if (!blueprint3d) return;
    
    const bp3d = blueprint3d as any;
    if (bp3d.model?.floorplan) {
      const allWalls = bp3d.model.floorplan.getWalls();
      setWalls(allWalls);
      if (allWalls.length > 0) {
        setSelectedWall(allWalls[0]);
      }
    }
  }, [blueprint3d, visible]);

  // Initialize canvas for elevation view
  useEffect(() => {
    if (!containerRef.current || !visible) return;

    const container = containerRef.current;
    const canvas = document.createElement('canvas');
    canvas.className = 'elevation-canvas';
    // Set canvas resolution based on selection
    const res = RESOLUTIONS[resolution];
    canvas.width = res.width;
    canvas.height = res.height;
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    container.appendChild(canvas);
    canvasRef.current = canvas;

    return () => {
      if (canvas && container) {
        try {
          container.removeChild(canvas);
        } catch (e) {
          // Already removed
        }
      }
    };
  }, [visible, resolution]);

  // Render elevation view when selected wall changes
  useEffect(() => {
    if (!selectedWall || !blueprint3d || !visible || !canvasRef.current) {
      return;
    }

    const bp3d = blueprint3d as any;
    const THREE = (window as any).THREE;
    
    if (!THREE) {
      console.error('THREE.js not loaded');
      return;
    }

    renderWallElevation(selectedWall, canvasRef.current, bp3d, THREE);
  }, [selectedWall, blueprint3d, visible, renderWallElevation]);

  // Expose console API for generating images programmatically
  useEffect(() => {
    if (!blueprint3d) return;

    const api = {
      /**
       * Generate elevation image for a specific wall
       * @param wallIndex - Index of the wall (0-based)
       * @param res - Resolution ('1080p' | '2K' | '4K')
       * @returns Promise with image data URL
       */
      generateElevation: async (wallIndex: number, res: ResolutionType = '4K'): Promise<string | null> => {
        const bp3d = blueprint3d as any;
        const THREE = (window as any).THREE;
        
        if (!bp3d.model?.floorplan) {
          console.error('No floorplan available');
          return null;
        }

        const allWalls = bp3d.model.floorplan.getWalls();
        if (wallIndex < 0 || wallIndex >= allWalls.length) {
          console.error(`Invalid wall index. Valid range: 0-${allWalls.length - 1}`);
          return null;
        }

        const wall = allWalls[wallIndex];
        const resolution = RESOLUTIONS[res];
        
        // Create temporary canvas
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = resolution.width;
        tempCanvas.height = resolution.height;

        const success = renderWallElevation(wall, tempCanvas, bp3d, THREE);
        
        if (success) {
          const dataUrl = tempCanvas.toDataURL('image/png');
          console.log(`✓ Generated elevation for Wall ${wallIndex + 1} at ${res}`);
          return dataUrl;
        }

        console.error('Failed to generate elevation');
        return null;
      },

      /**
       * Generate elevations for all walls
       * @param res - Resolution ('1080p' | '2K' | '4K')
       * @returns Promise with array of image data URLs
       */
      generateAllElevations: async (res: ResolutionType = '4K'): Promise<string[]> => {
        const bp3d = blueprint3d as any;
        
        if (!bp3d.model?.floorplan) {
          console.error('No floorplan available');
          return [];
        }

        const allWalls = bp3d.model.floorplan.getWalls();
        const results: string[] = [];

        console.log(`Generating elevations for ${allWalls.length} walls...`);

        for (let i = 0; i < allWalls.length; i++) {
          const dataUrl = await api.generateElevation(i, res);
          if (dataUrl) {
            results.push(dataUrl);
          }
        }

        console.log(`✓ Generated ${results.length}/${allWalls.length} elevations`);
        return results;
      },

      /**
       * Download elevation image for a specific wall
       * @param wallIndex - Index of the wall (0-based)
       * @param res - Resolution ('1080p' | '2K' | '4K')
       */
      downloadElevation: async (wallIndex: number, res: ResolutionType = '4K'): Promise<void> => {
        const dataUrl = await api.generateElevation(wallIndex, res);
        if (dataUrl) {
          const link = document.createElement('a');
          link.download = `wall-elevation-${wallIndex + 1}-${res}.png`;
          link.href = dataUrl;
          link.click();
          console.log(`✓ Downloaded elevation for Wall ${wallIndex + 1}`);
        }
      },

      /**
       * Download all wall elevations as separate files
       * @param res - Resolution ('1080p' | '2K' | '4K')
       */
      downloadAllElevations: async (res: ResolutionType = '4K'): Promise<void> => {
        const bp3d = blueprint3d as any;
        const allWalls = bp3d.model?.floorplan?.getWalls() || [];
        
        console.log(`Downloading ${allWalls.length} elevations...`);

        for (let i = 0; i < allWalls.length; i++) {
          await api.downloadElevation(i, res);
          // Add small delay between downloads
          await new Promise(resolve => setTimeout(resolve, 500));
        }

        console.log(`✓ Downloaded all elevations`);
      },

      /**
       * Get available wall count
       */
      getWallCount: (): number => {
        const bp3d = blueprint3d as any;
        return bp3d.model?.floorplan?.getWalls().length || 0;
      }
    };

    // Expose API to window for console access
    (window as any).WallElevationAPI = api;
    
    console.log('%cWall Elevation API Available!', 'color: #4CAF50; font-weight: bold');
    console.log('Usage examples:');
    console.log('  WallElevationAPI.generateElevation(0, "4K")  - Generate Wall 1 elevation');
    console.log('  WallElevationAPI.generateAllElevations("2K") - Generate all walls');
    console.log('  WallElevationAPI.downloadElevation(0, "4K")  - Download Wall 1');
    console.log('  WallElevationAPI.downloadAllElevations()     - Download all walls');
    console.log('  WallElevationAPI.getWallCount()              - Get total walls');

    return () => {
      delete (window as any).WallElevationAPI;
    };
  }, [blueprint3d, renderWallElevation]);
  // Export elevation view as image
  const exportElevation = () => {
    if (!canvasRef.current) return;
    
    const link = document.createElement('a');
    const wallIndex = walls.indexOf(selectedWall);
    link.download = `wall-elevation-${wallIndex + 1}.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  return (
    <div className={`wall-elevation ${visible ? 'visible' : 'hidden'}`}>
      <div ref={containerRef} className="wall-elevation-canvas"></div>
      {walls.length > 0 && (
        <>
          <div className="wall-selector">
            <label>Select Wall: </label>
            <select
              value={walls.indexOf(selectedWall)}
              onChange={(e) => setSelectedWall(walls[parseInt(e.target.value)])}
            >
              {walls.map((wall, index) => {
                const length = wall.frontEdge ? wall.frontEdge.interiorDistance() : wall.backEdge.interiorDistance();
                return (
                  <option key={index} value={index}>
                    Wall {index + 1} ({(length / 100).toFixed(2)}m)
                  </option>
                );
              })}
            </select>
            <label style={{ marginLeft: '20px' }}>Resolution: </label>
            <select
              value={resolution}
              onChange={(e) => setResolution(e.target.value as '1080p' | '2K' | '4K')}
            >
              <option value="1080p">1080p (1920×1080)</option>
              <option value="2K">2K (2560×1440)</option>
              <option value="4K">4K (3840×2160)</option>
            </select>
            <button 
              onClick={exportElevation}
              className="export-button"
              title="Export elevation as PNG"
            >
              📥 Export
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default WallElevation;
