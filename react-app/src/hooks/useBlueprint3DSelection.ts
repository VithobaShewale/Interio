/**
 * Custom hook for managing selection state in Blueprint3D
 * Tracks selected items, walls, and floors
 */

import { useState, useEffect } from 'react';
import * as BP3D from '../../types/blueprint3d';

export interface SelectionState {
  hasSelectedItem: boolean;
  hasSelectedWall: boolean;
  hasSelectedFloor: boolean;
}

export function useBlueprint3DSelection(
  blueprint3d: BP3D.Blueprint3d | null,
  activePanel: string | null
): SelectionState {
  const [hasSelectedItem, setHasSelectedItem] = useState(false);
  const [hasSelectedWall, setHasSelectedWall] = useState(false);
  const [hasSelectedFloor, setHasSelectedFloor] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(0);

  // Track if an item or wall is selected
  useEffect(() => {
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

  // Check actual selected item state when selected panel opens
  useEffect(() => {
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

  return {
    hasSelectedItem,
    hasSelectedWall,
    hasSelectedFloor
  };
}
