/**
 * Feature Flags Configuration
 * 
 * Enable or disable features throughout the application.
 * Set to false to hide features from the UI.
 */

export const featureFlags = {
  // Floor Planner Controls
  showFloorPlannerInlineControls: false, // Move/Draw/Delete buttons in floor planner view
  showDimensionToggle: false, // Show/hide dimensions button
  showWallElevationToggle: false, // Wall elevation view toggle button
  
  // Measurement Features
  showMeasurementTools: false,
  showAreaCalculation: false,
  showWallLengthOverlay: false,
  showRoomLabelOverlay: false,
  
  // Advanced Features
  showAutoDesign: true,
  showWallElevation: true,
  
  // Developer/Debug Features
  enableDebugMode: false,
} as const;

export type FeatureFlags = typeof featureFlags;

/**
 * Check if a feature is enabled
 */
export const isFeatureEnabled = (flag: keyof FeatureFlags): boolean => {
  return featureFlags[flag] === true;
};
