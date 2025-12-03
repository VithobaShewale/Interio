import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './LoadingModal.css';

interface LoadingModalProps {
  blueprint3d: any;
}

const LoadingModal: React.FC<LoadingModalProps> = ({ blueprint3d }) => {
  const { t } = useTranslation();
  const [itemsLoading, setItemsLoading] = useState(0);

  useEffect(() => {
    if (!blueprint3d?.model?.scene) return;

    const handleItemLoading = () => {
      setItemsLoading(prev => prev + 1);
    };

    const handleItemLoaded = () => {
      setItemsLoading(prev => Math.max(0, prev - 1));
    };

    blueprint3d.model.scene.itemLoadingCallbacks.add(handleItemLoading);
    blueprint3d.model.scene.itemLoadedCallbacks.add(handleItemLoaded);

    return () => {
      blueprint3d.model.scene.itemLoadingCallbacks.remove(handleItemLoading);
      blueprint3d.model.scene.itemLoadedCallbacks.remove(handleItemLoaded);
    };
  }, [blueprint3d]);

  if (itemsLoading === 0) return null;

  return (
    <div className="loading-modal-overlay">
      <div className="loading-modal">
        <div className="loading-spinner"></div>
        <h3>{t('loading.loading_items')}</h3>
        <p>{t('loading.please_wait')}</p>
      </div>
    </div>
  );
};

export default LoadingModal;
