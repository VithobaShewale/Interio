import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { getLengthDisplay } from '../../utils/measurements';
import './WallLengthOverlay.css';

interface WallLengthOverlayProps {
  blueprint3d: any;
  visible: boolean;
}

interface WallLabel {
  id: string;
  x: number;
  y: number;
  length: number;
  angle: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

const WallLengthOverlay: React.FC<WallLengthOverlayProps> = ({ blueprint3d, visible }) => {
  const { t } = useTranslation();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [wallLabels, setWallLabels] = useState<WallLabel[]>([]);
  const [hoveredWall, setHoveredWall] = useState<string | null>(null);

  /**
   * Convert Blueprint3D world coordinates to canvas screen coordinates
   */
  const convertToScreenCoords = useCallback((worldX: number, worldY: number) => {
    if (!blueprint3d?.floorplanner?.view) return { x: 0, y: 0 };
    
    const view = blueprint3d.floorplanner.view;
    const canvas = view.canvas || blueprint3d.floorplanner.canvas || blueprint3d.floorplanner;
    
    // Get canvas transformation parameters
    const cmPerPixel = canvas.cmPerPixel || 1;
    const originX = canvas.originX || 0;
    const originY = canvas.originY || 0;
    
    // Convert world coordinates (in cm) to screen pixels
    // Using Blueprint3D's formula: screenCoord = (worldCoord - origin * cmPerPixel) * pixelsPerCm
    const pixelsPerCm = 1 / cmPerPixel;
    const screenX = (worldX - originX * cmPerPixel) * pixelsPerCm;
    const screenY = (worldY - originY * cmPerPixel) * pixelsPerCm;
    
    return { x: screenX, y: screenY };
  }, [blueprint3d]);

  /**
   * Extract wall data from Blueprint3D
   */
  const extractWallData = useCallback(() => {
    if (!blueprint3d?.model?.floorplan) return [];

    try {
      const floorplan = blueprint3d.model.floorplan;
      const walls = floorplan.getWalls();
      const canvas = canvasRef.current;
      
      return walls.map((wall: any, index: number) => {
        // Get exact wall coordinates using Blueprint3D methods
        const startWorldX = typeof wall.getStartX === 'function' ? wall.getStartX() : wall.getStart().x;
        const startWorldY = typeof wall.getStartY === 'function' ? wall.getStartY() : wall.getStart().y;
        const endWorldX = typeof wall.getEndX === 'function' ? wall.getEndX() : wall.getEnd().x;
        const endWorldY = typeof wall.getEndY === 'function' ? wall.getEndY() : wall.getEnd().y;
        
        // Convert to screen coordinates using Blueprint3D's formula
        const view = blueprint3d.floorplanner?.view;
        const canvas = view?.canvas || blueprint3d.floorplanner?.canvas || blueprint3d.floorplanner;
        const cmPerPixel = canvas.cmPerPixel || 1;
        const originX = canvas.originX || 0;
        const originY = canvas.originY || 0;
        const pixelsPerCm = 1 / cmPerPixel;
        
        const startScreenX = (startWorldX - originX * cmPerPixel) * pixelsPerCm;
        const startScreenY = (startWorldY - originY * cmPerPixel) * pixelsPerCm;
        const endScreenX = (endWorldX - originX * cmPerPixel) * pixelsPerCm;
        const endScreenY = (endWorldY - originY * cmPerPixel) * pixelsPerCm;
        
        // Calculate midpoint in screen space
        const midX = (startScreenX + endScreenX) / 2;
        const midY = (startScreenY + endScreenY) / 2;
        
        // Calculate angle for label rotation
        const angle = Math.atan2(endScreenY - startScreenY, endScreenX - startScreenX);
        
        // Get wall length - try multiple methods
        let length = 0;
        if (typeof wall.wallLength === 'function') {
          length = wall.wallLength();
        } else if (wall.length !== undefined) {
          length = wall.length;
        } else {
          // Calculate from start/end points (in cm)
          const dx = endWorldX - startWorldX;
          const dy = endWorldY - startWorldY;
          length = Math.sqrt(dx * dx + dy * dy);
        }
        
        return {
          id: wall.id || `wall-${index}`,
          x: midX,
          y: midY,
          length,
          angle,
          startX: startScreen.x,
          startY: startScreen.y,
          endX: endScreen.x,
          endY: endScreen.y,
        };
      }).filter(wall => {
        // Keep walls that have at least part visible on canvas
        if (!canvas) return true;
        const margin = 100; // Allow some margin for labels
        return (wall.x > -margin && wall.x < canvas.width + margin &&
                wall.y > -margin && wall.y < canvas.height + margin);
      });
    } catch (error) {
      console.error('Error extracting wall data:', error);
      return [];
    }
  }, [blueprint3d, convertToScreenCoords]);

  /**
   * Update wall labels
   */
  const updateWallLabels = useCallback(() => {
    const labels = extractWallData();
    setWallLabels(labels);
  }, [extractWallData]);

  /**
   * Draw wall labels on canvas
   */
  const drawWallLabels = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !visible) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Get canvas dimensions
    const rect = canvas.getBoundingClientRect();
    
    // Get the 2D canvas from floorplanner for coordinate conversion
    const floorplannerCanvas = document.getElementById('floorplanner-canvas') as HTMLCanvasElement;
    if (!floorplannerCanvas) return;

    wallLabels.forEach(wall => {
      const isHovered = hoveredWall === wall.id;
      
      // Convert Blueprint3D coordinates to screen coordinates
      // Assuming floorplanner uses same coordinate system
      const screenX = wall.x;
      const screenY = wall.y;

      ctx.save();
      
      // Style with better visibility
      ctx.fillStyle = isHovered ? '#1e40af' : '#1f2937';
      ctx.strokeStyle = isHovered ? '#3b82f6' : '#4b5563';
      ctx.lineWidth = isHovered ? 2 : 1.5;
      ctx.font = isHovered ? 'bold 13px system-ui, -apple-system, Arial' : 'bold 12px system-ui, -apple-system, Arial';

      // Draw label background
      const labelText = getLengthDisplay(wall.length);
      const textWidth = ctx.measureText(labelText).width;
      const padding = 8;
      const bgWidth = textWidth + padding * 2;
      const bgHeight = 24;

      // Translate to wall midpoint
      ctx.translate(screenX, screenY);
      
      // Rotate to align with wall (keep text readable)
      let textAngle = wall.angle;
      if (textAngle > Math.PI / 2 || textAngle < -Math.PI / 2) {
        textAngle += Math.PI; // Flip text if upside down
      }
      ctx.rotate(textAngle);

      // Draw background rounded rectangle with shadow
      ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
      ctx.shadowBlur = isHovered ? 6 : 3;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 1;
      
      const radius = 5;
      ctx.fillStyle = isHovered ? 'rgba(219, 234, 254, 0.98)' : 'rgba(255, 255, 255, 0.95)';
      ctx.beginPath();
      ctx.roundRect(-bgWidth / 2, -bgHeight / 2, bgWidth, bgHeight, radius);
      ctx.fill();
      ctx.stroke();
      
      // Reset shadow
      ctx.shadowColor = 'transparent';

      // Draw text
      ctx.fillStyle = isHovered ? '#1e40af' : '#1f2937';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(labelText, 0, 0);

      ctx.restore();

      // Draw dimension lines (if hovered)
      if (isHovered) {
        ctx.save();
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);

        // Draw line from wall start to end
        ctx.beginPath();
        ctx.moveTo(wall.startX, wall.startY);
        ctx.lineTo(wall.endX, wall.endY);
        ctx.stroke();

        // Draw end caps
        const capLength = 8;
        const perpAngle = wall.angle + Math.PI / 2;

        // Start cap
        ctx.beginPath();
        ctx.moveTo(
          wall.startX + Math.cos(perpAngle) * capLength,
          wall.startY + Math.sin(perpAngle) * capLength
        );
        ctx.lineTo(
          wall.startX - Math.cos(perpAngle) * capLength,
          wall.startY - Math.sin(perpAngle) * capLength
        );
        ctx.stroke();

        // End cap
        ctx.beginPath();
        ctx.moveTo(
          wall.endX + Math.cos(perpAngle) * capLength,
          wall.endY + Math.sin(perpAngle) * capLength
        );
        ctx.lineTo(
          wall.endX - Math.cos(perpAngle) * capLength,
          wall.endY - Math.sin(perpAngle) * capLength
        );
        ctx.stroke();

        ctx.restore();
      }
    });
  }, [wallLabels, hoveredWall, visible]);

  /**
   * Handle mouse move for hover detection
   */
  const handleMouseMove = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Find if mouse is near any wall label
    let foundHover = false;
    for (const wall of wallLabels) {
      const distance = Math.sqrt(
        Math.pow(x - wall.x, 2) + Math.pow(y - wall.y, 2)
      );

      if (distance < 30) {
        setHoveredWall(wall.id);
        foundHover = true;
        break;
      }
    }

    if (!foundHover) {
      setHoveredWall(null);
    }
  }, [wallLabels]);

  /**
   * Resize canvas to match container
   */
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const floorplannerCanvas = document.getElementById('floorplanner-canvas') as HTMLCanvasElement;
    
    if (!canvas || !floorplannerCanvas) return;

    canvas.width = floorplannerCanvas.width;
    canvas.height = floorplannerCanvas.height;
    canvas.style.width = `${floorplannerCanvas.clientWidth}px`;
    canvas.style.height = `${floorplannerCanvas.clientHeight}px`;
    
    drawWallLabels();
  }, [drawWallLabels]);

  /**
   * Update labels when blueprint changes
   */
  useEffect(() => {
    if (!blueprint3d || !visible) return;

    updateWallLabels();
    resizeCanvas();

    // Listen for changes
    const handleUpdate = () => {
      setTimeout(() => {
        updateWallLabels();
        drawWallLabels();
      }, 50);
    };

    // Listen for floorplan events
    if (blueprint3d.model?.floorplan) {
      const floorplan = blueprint3d.model.floorplan;
      
      if (floorplan.wallMovedCallbacks) {
        floorplan.wallMovedCallbacks.add(handleUpdate);
      }
      if (floorplan.roomLoadedCallbacks) {
        floorplan.roomLoadedCallbacks.add(handleUpdate);
      }
    }

    // Listen for view updates (zoom, pan)
    if (blueprint3d.floorplanner?.view) {
      const view = blueprint3d.floorplanner.view;
      if (view.drawCallbacks) {
        view.drawCallbacks.add(handleUpdate);
      }
    }

    // Polling for real-time updates
    const interval = setInterval(handleUpdate, 1000);

    // Window resize
    window.addEventListener('resize', resizeCanvas);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', resizeCanvas);
      
      if (blueprint3d.model?.floorplan) {
        const floorplan = blueprint3d.model.floorplan;
        
        if (floorplan.wallMovedCallbacks) {
          floorplan.wallMovedCallbacks.remove(handleUpdate);
        }
        if (floorplan.roomLoadedCallbacks) {
          floorplan.roomLoadedCallbacks.remove(handleUpdate);
        }
      }
      
      if (blueprint3d.floorplanner?.view) {
        const view = blueprint3d.floorplanner.view;
        if (view.drawCallbacks) {
          view.drawCallbacks.remove(handleUpdate);
        }
      }
    };
  }, [blueprint3d, visible, updateWallLabels, drawWallLabels, resizeCanvas]);

  /**
   * Redraw when labels or hover changes
   */
  useEffect(() => {
    drawWallLabels();
  }, [drawWallLabels]);

  if (!visible) return null;

  return (
    <canvas
      ref={canvasRef}
      className="wall-length-overlay"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setHoveredWall(null)}
    />
  );
};

export default WallLengthOverlay;
