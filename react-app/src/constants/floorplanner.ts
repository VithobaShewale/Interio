/**
 * Floorplanner constants
 */

/** Floorplanner modes */
export const FloorplannerModes = {
  MOVE: 0,
  DRAW: 1,
  DELETE: 2
} as const;

export type FloorplannerMode = typeof FloorplannerModes[keyof typeof FloorplannerModes];

