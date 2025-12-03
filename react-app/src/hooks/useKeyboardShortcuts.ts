import { useEffect } from 'react';

interface KeyboardShortcutsProps {
  blueprint3d: any;
  viewMode: '2d' | '3d' | 'wall';
  setViewMode: (mode: '2d' | '3d' | 'wall') => void;
  saveDraft: () => boolean;
}

export const useKeyboardShortcuts = ({
  blueprint3d,
  viewMode,
  setViewMode,
  saveDraft
}: KeyboardShortcutsProps) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }

      // Save with Ctrl+S
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveDraft();
        return;
      }

      // Switch views
      if (e.key === '2') {
        setViewMode('2d');
        return;
      }
      if (e.key === '3') {
        setViewMode('3d');
        return;
      }

      // Reset camera view with R
      if (e.key === 'r' || e.key === 'R') {
        if (blueprint3d?.three) {
          blueprint3d.three.centerCamera();
        }
        return;
      }

      // Delete selected item
      if (e.key === 'Delete' && blueprint3d?.three?.selectedItem) {
        const item = blueprint3d.three.selectedItem;
        if (item && typeof item.remove === 'function') {
          item.remove();
        }
        return;
      }

      // Lock/unlock selected item with L
      if ((e.key === 'l' || e.key === 'L') && blueprint3d?.three?.selectedItem) {
        const item = blueprint3d.three.selectedItem;
        if (item && typeof item.setFixed === 'function') {
          item.setFixed(!item.fixed);
        }
        return;
      }

      // Rotate selected item
      if (blueprint3d?.three?.selectedItem) {
        const item = blueprint3d.three.selectedItem;
        if (typeof item.rotate === 'function') {
          if (e.key === '[') {
            e.preventDefault();
            item.rotate(-90 * Math.PI / 180);
            return;
          }
          if (e.key === ']') {
            e.preventDefault();
            item.rotate(90 * Math.PI / 180);
            return;
          }
        }
      }

      // Move selected item with arrow keys
      if (blueprint3d?.three?.selectedItem) {
        const item = blueprint3d.three.selectedItem;
        const moveSpeed = e.shiftKey ? 50 : 10; // Hold Shift for faster movement

        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || 
            e.key === 'ArrowUp' || e.key === 'ArrowDown') {
          e.preventDefault();
          
          const currentPos = item.position;
          let newX = currentPos.x;
          let newZ = currentPos.z;

          switch (e.key) {
            case 'ArrowLeft':
              newX -= moveSpeed;
              break;
            case 'ArrowRight':
              newX += moveSpeed;
              break;
            case 'ArrowUp':
              newZ -= moveSpeed;
              break;
            case 'ArrowDown':
              newZ += moveSpeed;
              break;
          }

          try {
            item.setPosition(newX, item.position.y, newZ);
          } catch (error) {
            console.error('Error moving item:', error);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [blueprint3d, viewMode, setViewMode, saveDraft]);
};
