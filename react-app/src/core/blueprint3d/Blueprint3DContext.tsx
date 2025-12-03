/**
 * Blueprint3D Context Provider
 * Provides Blueprint3D manager instance throughout the app
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Blueprint3DManager, Blueprint3DConfig } from './Blueprint3DManager';

interface Blueprint3DContextValue {
  manager: Blueprint3DManager | null;
  isReady: boolean;
  error: string | null;
}

const Blueprint3DContext = createContext<Blueprint3DContextValue>({
  manager: null,
  isReady: false,
  error: null,
});

interface Blueprint3DProviderProps {
  children: ReactNode;
  config: Blueprint3DConfig;
}

export const Blueprint3DProvider: React.FC<Blueprint3DProviderProps> = ({ children, config }) => {
  const [manager, setManager] = useState<Blueprint3DManager | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initManager = async () => {
      try {
        const bp3dManager = new Blueprint3DManager(config);
        await bp3dManager.initialize();
        setManager(bp3dManager);
        setIsReady(true);
      } catch (err: any) {
        setError(err.message || 'Failed to initialize Blueprint3D');
        console.error('Blueprint3D initialization error:', err);
      }
    };

    initManager();

    return () => {
      if (manager) {
        manager.destroy();
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Blueprint3DContext.Provider value={{ manager, isReady, error }}>
      {children}
    </Blueprint3DContext.Provider>
  );
};

export const useBlueprint3DContext = () => {
  const context = useContext(Blueprint3DContext);
  if (!context) {
    throw new Error('useBlueprint3DContext must be used within Blueprint3DProvider');
  }
  return context;
};
