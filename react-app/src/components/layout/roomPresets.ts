/**
 * Room preset configurations with SVG path definitions
 * Each preset defines a room shape using SVG path commands
 */

export interface RoomPreset {
  id: number;
  name: string;
  path: string;
  description?: string;
}

export const roomPresets: RoomPreset[] = [
  { id: 1, name: 'Preset 1', path: 'M10,10 L50,10 L50,50 L10,50 Z', description: 'Square room' },
  { id: 2, name: 'Preset 2', path: 'M10,10 L50,10 L50,35 L35,35 L35,50 L10,50 Z', description: 'L-shape right' },
  { id: 3, name: 'Preset 3', path: 'M10,10 L35,10 L35,25 L50,25 L50,50 L10,50 Z', description: 'L-shape stepped' },
  { id: 4, name: 'Preset 4', path: 'M10,25 L25,25 L25,10 L50,10 L50,50 L10,50 Z', description: 'L-shape top-left' },
  { id: 5, name: 'Preset 5', path: 'M25,10 L50,10 L50,50 L25,50 L25,35 L10,35 L10,25 L25,25 Z', description: 'T-shape left' },
  { id: 6, name: 'Preset 6', path: 'M10,10 L50,10 L50,50 L35,50 L35,35 L10,35 Z', description: 'L-shape bottom-right' },
  { id: 7, name: 'Preset 7', path: 'M10,10 L35,10 L50,25 L50,50 L10,50 Z', description: 'Pentagon angle top-right' },
  { id: 8, name: 'Preset 8', path: 'M10,10 L50,10 L50,35 L35,50 L10,50 Z', description: 'Pentagon angle bottom-right' },
  { id: 9, name: 'Preset 9', path: 'M10,10 L50,10 L35,25 L35,50 L10,50 Z', description: 'Pentagon angle top-right inset' },
  { id: 10, name: 'Preset 10', path: 'M10,10 L35,10 L35,25 L50,25 L35,40 L35,50 L10,50 Z', description: 'Complex stepped' },
  { id: 11, name: 'Preset 11', path: 'M25,10 L50,10 L50,35 L35,50 L10,50 L10,25 L25,10 Z', description: 'Hexagon-like' },
  { id: 12, name: 'Preset 12', path: 'M25,10 L50,10 L50,50 L10,50 L10,25 L25,25 Z', description: 'L-shape inverted' },
  { id: 13, name: 'Preset 13', path: 'M25,10 L50,25 L50,50 L10,50 L10,10 L25,10 Z', description: 'Pentagon angle top' },
];
