import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { getAreaDisplay } from '../../utils/measurements';
import './RoomLabelOverlay.css';

interface RoomLabelOverlayProps {
  blueprint3d: any;
  visible: boolean;
}

interface RoomLabel {
  id: string;
  name: string;
  centerX: number;
  centerY: number;
  area: number;
  width: number;
  height: number;
}

const RoomLabelOverlay: React.FC<RoomLabelOverlayProps> = ({ blueprint3d, visible }) => {
  const { t } = useTranslation();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [roomLabels, setRoomLabels] = useState<RoomLabel[]>([]);
  const [hoveredRoom, setHoveredRoom] = useState<string | null>(null);

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
    const screenX = (worldX / cmPerPixel) - originX;
    const screenY = (worldY / cmPerPixel) - originY;
    
    return { x: screenX, y: screenY };
  }, [blueprint3d]);

  /**
   * Extract room data from Blueprint3D
   */
  const extractRoomData = useCallback(() => {
    if (!blueprint3d?.model?.floorplan) return [];

    try {
      const floorplan = blueprint3d.model.floorplan;
      const rooms = floorplan.getRooms();
      const canvas = canvasRef.current;
      
      // Get canvas transformation parameters inline to avoid dependency issues
      const view = blueprint3d.floorplanner?.view;
      const canvasObj = view?.canvas || blueprint3d.floorplanner?.canvas || blueprint3d.floorplanner;
      const cmPerPixel = canvasObj?.cmPerPixel || 1;
      const originX = canvasObj?.originX || 0;
      const originY = canvasObj?.originY || 0;
      
      console.log('Extracting room data, room count:', rooms.length);
      
      return rooms.map((room: any, index: number) => {
        // Get room center in world coordinates using proper polygon centroid
        const corners = room.corners || [];
        let centerWorldX = 0;
        let centerWorldY = 0;
        
        if (corners.length > 0) {
          // Calculate polygon centroid using exact floor plan coordinates
          let signedArea = 0;
          let cx = 0;
          let cy = 0;
          
          for (let i = 0; i < corners.length; i++) {
            const j = (i + 1) % corners.length;
            // Use getX() and getY() methods if available, otherwise use properties
            const xi = typeof corners[i].getX === 'function' ? corners[i].getX() : corners[i].x;
            const yi = typeof corners[i].getY === 'function' ? corners[i].getY() : corners[i].y;
            const xj = typeof corners[j].getX === 'function' ? corners[j].getX() : corners[j].x;
            const yj = typeof corners[j].getY === 'function' ? corners[j].getY() : corners[j].y;
            
            const cross = xi * yj - xj * yi;
            signedArea += cross;
            cx += (xi + xj) * cross;
            cy += (yi + yj) * cross;
          }
          
          signedArea *= 0.5;
          
          if (Math.abs(signedArea) > 0.001) {
            centerWorldX = cx / (6 * signedArea);
            centerWorldY = cy / (6 * signedArea);
          } else {
            // Fallback to simple average if area is too small
            corners.forEach((corner: any) => {
              const x = typeof corner.getX === 'function' ? corner.getX() : corner.x;
              const y = typeof corner.getY === 'function' ? corner.getY() : corner.y;
              centerWorldX += x;
              centerWorldY += y;
            });
            centerWorldX /= corners.length;
            centerWorldY /= corners.length;
          }
        }
        
        // Convert to screen coordinates using Blueprint3D's formula
        // screenCoord = (worldCoord - origin * cmPerPixel) * pixelsPerCm
        const pixelsPerCm = 1 / cmPerPixel;
        const centerX = (centerWorldX - originX * cmPerPixel) * pixelsPerCm;
        const centerY = (centerWorldY - originY * cmPerPixel) * pixelsPerCm;
        
        // Get room area - call getArea() method if available, otherwise use property
        const area = typeof room.getArea === 'function' ? room.getArea() : (room.area || 0);
        
        console.log(`Room ${index}: name=${room.name}, area=${area}, centerWorld=(${centerWorldX.toFixed(1)}, ${centerWorldY.toFixed(1)}), centerScreen=(${centerX.toFixed(1)}, ${centerY.toFixed(1)})`);
        
        // Get room name
        const name = room.name || `${t('measurements.room')} ${index + 1}`;
        
        const labelWidth = 130;
        const labelHeight = 65;
        
        return {
          id: room.id || `room-${index}`,
          name,
          centerX: centerX,
          centerY: centerY,
          area,
          width: labelWidth,
          height: labelHeight,
        };
      }).filter(room => {
        // Only show rooms that are visible on canvas
        if (!canvas) return true;
        const margin = 65; // Half of label height to ensure label fits
        const isVisible = room.centerX > margin && room.centerX < canvas.width - margin &&
               room.centerY > margin && room.centerY < canvas.height - margin;
        console.log(`Room ${room.name} visibility:`, isVisible, `(${room.centerX}, ${room.centerY}) vs canvas (${canvas.width}, ${canvas.height})`);
        return isVisible;
      });
    } catch (error) {
      console.error('Error extracting room data:', error);
      return [];
    }
  }, [blueprint3d, t]);

  /**
   * Update room labels
   */
  const updateRoomLabels = useCallback(() => {
    const labels = extractRoomData();
    console.log('Room labels updated:', labels.length, labels);
    setRoomLabels(labels);
  }, [extractRoomData]);

  /**
   * Draw room labels on canvas
   */
  const drawRoomLabels = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !visible) {
      console.log('Room label draw skipped - canvas:', !!canvas, 'visible:', visible);
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    console.log('Drawing room labels:', roomLabels.length, 'Canvas size:', canvas.width, 'x', canvas.height);

    roomLabels.forEach((room, idx) => {
      console.log(`Drawing room ${idx}:`, room.name, 'at', room.centerX, room.centerY, 'area:', room.area);
      const isHovered = hoveredRoom === room.id;
      
      ctx.save();

      // Label dimensions
      const width = room.width;
      const height = room.height;
      const x = room.centerX - width / 2;
      const y = room.centerY - height / 2;

      // Background with shadow for better visibility
      ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
      ctx.shadowBlur = isHovered ? 8 : 4;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 2;
      
      ctx.fillStyle = isHovered 
        ? 'rgba(239, 246, 255, 0.98)' 
        : 'rgba(255, 255, 255, 0.95)';
      ctx.strokeStyle = isHovered ? '#3b82f6' : '#9ca3af';
      ctx.lineWidth = isHovered ? 2.5 : 1.5;

      // Draw rounded rectangle
      const radius = 8;
      ctx.beginPath();
      ctx.roundRect(x, y, width, height, radius);
      ctx.fill();
      ctx.stroke();
      
      // Reset shadow for text
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;

      // Room name
      ctx.fillStyle = isHovered ? '#1e40af' : '#1f2937';
      ctx.font = isHovered ? 'bold 15px system-ui, -apple-system, Arial' : 'bold 14px system-ui, -apple-system, Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(room.name, room.centerX, room.centerY - 8);

      // Room area
      const areaText = getAreaDisplay(room.area);
      ctx.fillStyle = isHovered ? '#2563eb' : '#6b7280';
      ctx.font = isHovered ? 'bold 13px system-ui, -apple-system, Arial' : '12px system-ui, -apple-system, Arial';
      ctx.fillText(areaText, room.centerX, room.centerY + 12);

      ctx.restore();
    });
  }, [roomLabels, hoveredRoom, visible]);

  /**
   * Handle mouse move for hover detection
   */
  const handleMouseMove = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Find if mouse is over any room label
    let foundHover = false;
    for (const room of roomLabels) {
      const labelX = room.centerX - room.width / 2;
      const labelY = room.centerY - room.height / 2;

      if (
        x >= labelX &&
        x <= labelX + room.width &&
        y >= labelY &&
        y <= labelY + room.height
      ) {
        setHoveredRoom(room.id);
        foundHover = true;
        break;
      }
    }

    if (!foundHover) {
      setHoveredRoom(null);
    }
  }, [roomLabels]);

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
    
    drawRoomLabels();
  }, [drawRoomLabels]);

  /**
   * Update labels when blueprint changes
   */
  useEffect(() => {
    if (!blueprint3d || !visible) return;

    updateRoomLabels();
    resizeCanvas();

    // Listen for changes
    const handleUpdate = () => {
      setTimeout(() => {
        updateRoomLabels();
        drawRoomLabels();
      }, 50);
    };

    // Listen for floorplan events
    if (blueprint3d.model?.floorplan) {
      const floorplan = blueprint3d.model.floorplan;
      
      if (floorplan.roomLoadedCallbacks) {
        floorplan.roomLoadedCallbacks.add(handleUpdate);
      }
      if (floorplan.updatedRooms) {
        floorplan.updatedRooms.add(handleUpdate);
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
        
        if (floorplan.roomLoadedCallbacks) {
          floorplan.roomLoadedCallbacks.remove(handleUpdate);
        }
        if (floorplan.updatedRooms) {
          floorplan.updatedRooms.remove(handleUpdate);
        }
      }
      
      if (blueprint3d.floorplanner?.view) {
        const view = blueprint3d.floorplanner.view;
        if (view.drawCallbacks) {
          view.drawCallbacks.remove(handleUpdate);
        }
      }
    };
  }, [blueprint3d, visible, updateRoomLabels, drawRoomLabels, resizeCanvas]);

  /**
   * Redraw when labels or hover changes
   */
  useEffect(() => {
    drawRoomLabels();
  }, [drawRoomLabels]);

  if (!visible) return null;

  return (
    <canvas
      ref={canvasRef}
      className="room-label-overlay"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setHoveredRoom(null)}
    />
  );
};

export default RoomLabelOverlay;
