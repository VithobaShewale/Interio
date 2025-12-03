import { useState, useCallback, useEffect, useRef } from 'react';

interface Command {
  id: string;
  timestamp: number;
  state: string; // Serialized Blueprint3D state
  description?: string;
}

interface UseUndoRedoProps {
  blueprint3d: any;
  maxHistory?: number;
}

export const useUndoRedo = ({ blueprint3d, maxHistory = 50 }: UseUndoRedoProps) => {
  const [history, setHistory] = useState<Command[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const isApplyingState = useRef(false);

  // Capture current state as a command
  const captureState = useCallback((description?: string) => {
    if (!blueprint3d?.model || isApplyingState.current) return;

    try {
      const state = blueprint3d.model.exportSerialized();
      const command: Command = {
        id: `cmd-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
        state,
        description
      };

      setHistory(prev => {
        // Remove any history after current index (branching)
        const newHistory = prev.slice(0, currentIndex + 1);
        // Add new command
        newHistory.push(command);
        // Limit history size
        if (newHistory.length > maxHistory) {
          newHistory.shift();
        }
        return newHistory;
      });

      setCurrentIndex(prev => {
        const newIndex = Math.min(prev + 1, maxHistory - 1);
        return newIndex;
      });
    } catch (error) {
      console.error('Failed to capture state:', error);
    }
  }, [blueprint3d, currentIndex, maxHistory]);

  // Undo to previous state
  const undo = useCallback(() => {
    if (currentIndex <= 0 || !blueprint3d?.model) return false;

    try {
      isApplyingState.current = true;
      const prevCommand = history[currentIndex - 1];
      blueprint3d.model.loadSerialized(prevCommand.state);
      setCurrentIndex(prev => prev - 1);
      isApplyingState.current = false;
      return true;
    } catch (error) {
      console.error('Failed to undo:', error);
      isApplyingState.current = false;
      return false;
    }
  }, [blueprint3d, currentIndex, history]);

  // Redo to next state
  const redo = useCallback(() => {
    if (currentIndex >= history.length - 1 || !blueprint3d?.model) return false;

    try {
      isApplyingState.current = true;
      const nextCommand = history[currentIndex + 1];
      blueprint3d.model.loadSerialized(nextCommand.state);
      setCurrentIndex(prev => prev + 1);
      isApplyingState.current = false;
      return true;
    } catch (error) {
      console.error('Failed to redo:', error);
      isApplyingState.current = false;
      return false;
    }
  }, [blueprint3d, currentIndex, history]);

  // Check if undo/redo is available
  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  // Initialize with current state
  useEffect(() => {
    if (blueprint3d?.model && history.length === 0) {
      captureState('Initial state');
    }
  }, [blueprint3d, history.length, captureState]);

  // Setup keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Z or Cmd+Z for undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      // Ctrl+Shift+Z or Cmd+Shift+Z or Ctrl+Y for redo
      if (((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z') || 
          (e.ctrlKey && e.key === 'y')) {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  return {
    undo,
    redo,
    canUndo,
    canRedo,
    captureState,
    history,
    currentIndex
  };
};
