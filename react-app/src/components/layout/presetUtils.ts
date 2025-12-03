/**
 * Utility functions for handling room presets
 * Includes SVG path parsing, coordinate transformation, and room creation
 */

import * as BP3D from '../../types/blueprint3d';

export interface Coordinate {
  x: number;
  y: number;
}

/**
 * Parse SVG path string to extract coordinate points
 * Supports M (moveTo) and L (lineTo) commands
 */
export function parseSvgPath(path: string): Coordinate[] {
  const coords: Coordinate[] = [];
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
}

/**
 * Convert SVG coordinates (0-60 viewBox) to Blueprint3D coordinates (centimeters)
 * @param svgCoords - Array of SVG coordinates
 * @param scale - Scale factor (default: 15, meaning 1 SVG unit = 15cm)
 * @param centerOffset - Center point of SVG viewBox (default: 30 for 60x60 viewBox)
 */
export function svgToBlueprint3D(
  svgCoords: Coordinate[], 
  scale: number = 15, 
  centerOffset: number = 30
): Coordinate[] {
  return svgCoords.map(coord => ({
    x: (coord.x - centerOffset) * scale,
    y: (coord.y - centerOffset) * scale
  }));
}

/**
 * Ensure polygon coordinates are in counter-clockwise order
 * Uses shoelace formula to calculate signed area
 * @param coords - Array of coordinates
 * @returns Coordinates in counter-clockwise order
 */
export function ensureCounterClockwise(coords: Coordinate[]): Coordinate[] {
  // Calculate signed area using shoelace formula
  let area = 0;
  for (let i = 0; i < coords.length; i++) {
    const j = (i + 1) % coords.length;
    area += coords[i].x * coords[j].y;
    area -= coords[j].x * coords[i].y;
  }
  
  // If area is negative, points are clockwise - reverse them
  if (area < 0) {
    return [...coords].reverse();
  }
  return coords;
}

/**
 * Create a room in Blueprint3D from preset coordinates
 * @param blueprint3d - Blueprint3D instance
 * @param roomCoords - Array of room corner coordinates
 * @param replaceExisting - Whether to replace existing floorplan
 */
export function createRoomFromCoordinates(
  blueprint3d: BP3D.Blueprint3d,
  roomCoords: Coordinate[],
  replaceExisting: boolean = false
): void {
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

  // Update the view
  floorplan.update();
  
  // Force floorplanner view redraw
  if (blueprint3d.floorplanner && blueprint3d.floorplanner.view) {
    blueprint3d.floorplanner.view.draw();
  }
}

/**
 * High-level function to create a room from a preset
 * Handles parsing, transformation, and validation
 */
export function createRoomFromPreset(
  blueprint3d: BP3D.Blueprint3d | null,
  presetPath: string,
  presetName: string,
  replaceExisting: boolean = false
): { success: boolean; error?: string } {
  if (!blueprint3d) {
    return { success: false, error: 'Blueprint3D not initialized' };
  }

  try {
    // Parse SVG path to coordinates
    const svgCoords = parseSvgPath(presetPath);
    
    if (svgCoords.length < 3) {
      return { success: false, error: 'Invalid preset path - need at least 3 points' };
    }

    // Convert to Blueprint3D coordinates
    const roomCoords = svgToBlueprint3D(svgCoords);
    
    // Create the room
    createRoomFromCoordinates(blueprint3d, roomCoords, replaceExisting);
    
    console.log(`${replaceExisting ? 'Replaced' : 'Added'} preset room:`, presetName);
    return { success: true };
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error creating room from preset:', error);
    return { success: false, error: errorMessage };
  }
}
