import React from 'react';
import PropertiesPanel, { Texture } from '../layout/PropertiesPanel';

interface FloorPropertiesPanelProps {
  blueprint3d: any;
  onCaptureState?: (description?: string) => void;
}

const FloorPropertiesPanel: React.FC<FloorPropertiesPanelProps> = ({ blueprint3d, onCaptureState }) => {
  const floorTextures: Texture[] = [
    { 
      name: 'Light Wood', 
      preview: 'rooms/thumbnails/thumbnail_light_fine_wood.jpg',
      url: 'rooms/textures/light_fine_wood.jpg',
      stretch: false,
      scale: 400
    },
    { 
      name: 'Dark Wood', 
      preview: 'rooms/thumbnails/thumbnail_dark_wood.jpg',
      url: 'rooms/textures/dark_wood.jpg',
      stretch: false,
      scale: 300
    },
    { 
      name: 'Marble', 
      preview: 'rooms/thumbnails/thumbnail_marbletiles.jpg',
      url: 'rooms/textures/marbletiles.jpg',
      stretch: false,
      scale: 300
    },
    { 
      name: 'Concrete', 
      preview: 'rooms/thumbnails/thumbnail_concrete.jpg',
      url: 'rooms/textures/concrete.jpg',
      stretch: false,
      scale: 400
    },
    { 
      name: 'Hardwood', 
      preview: 'rooms/thumbnails/thumbnail_hardwood.png',
      url: 'rooms/textures/hardwood.png',
      stretch: false,
      scale: 300
    }
  ];

  const coveringTypes = ['Hardwood', 'Laminate', 'Tile', 'Carpet'];

  const getStoredFloor = () => (window as any).lastClickedFloor || null;

  const handleTextureApply = (room: any, texture: Texture) => {
    if (room?.setTexture) {
      room.setTexture(texture.url, texture.stretch, texture.scale);
    }
  };

  return (
    <PropertiesPanel
      blueprint3d={blueprint3d}
      selectionType="floor"
      onCaptureState={onCaptureState}
      getStoredSelection={getStoredFloor}
      textures={floorTextures}
      coveringTypes={coveringTypes}
      onTextureApply={handleTextureApply}
    />
  );
};

export default FloorPropertiesPanel;
