import React from 'react';
import PropertiesPanel, { Texture } from '../layout/PropertiesPanel';

interface WallPropertiesPanelProps {
  blueprint3d: any;
  onCaptureState?: (description?: string) => void;
}

const WallPropertiesPanel: React.FC<WallPropertiesPanelProps> = ({ blueprint3d, onCaptureState }) => {
  const wallTextures: Texture[] = [
    { 
      name: 'Brick', 
      preview: 'rooms/thumbnails/thumbnail_light_brick.jpg',
      url: 'rooms/textures/light_brick.jpg',
      stretch: false,
      scale: 100
    },
    { 
      name: 'Yellow Wall', 
      preview: 'rooms/thumbnails/thumbnail_wallmap_yellow.png',
      url: 'rooms/textures/wallmap_yellow.png',
      stretch: true,
      scale: 0
    },
    { 
      name: 'White Wall', 
      preview: 'rooms/thumbnails/thumbnail_wallmap.png',
      url: 'rooms/textures/wallmap.png',
      stretch: true,
      scale: 0
    },
    { 
      name: 'Gray Wall', 
      preview: 'rooms/thumbnails/thumbnail_wallmap_gray.png',
      url: 'rooms/textures/wallmap_gray.png',
      stretch: true,
      scale: 0
    },
    { 
      name: 'Merbau Wood', 
      preview: 'rooms/thumbnails/thumbnail_merbau.jpg',
      url: 'rooms/textures/merbau.jpg',
      stretch: false,
      scale: 100
    }
  ];

  const coveringTypes = ['Wallpaper', 'Paint', 'Tile'];

  const getStoredWall = () => (window as any).lastClickedWallEdge || null;

  const handleTextureApply = (edge: any, texture: Texture) => {
    if (edge?.wall) {
      const textureObj = {
        url: texture.url,
        stretch: texture.stretch,
        scale: texture.scale
      };
      
      edge.wall.frontTexture = textureObj;
      edge.wall.backTexture = textureObj;
      
      if (edge.wall.fireRedraw) {
        edge.wall.fireRedraw();
      }
      
      if (edge.redrawCallbacks) {
        edge.redrawCallbacks.fire();
      }
    }

    if (blueprint3d.model?.floorplan) {
      blueprint3d.model.floorplan.update();
      if (blueprint3d.model.floorplan.fireOnUpdatedRooms) {
        blueprint3d.model.floorplan.fireOnUpdatedRooms();
      }
    }
  };

  return (
    <PropertiesPanel
      blueprint3d={blueprint3d}
      selectionType="wall"
      onCaptureState={onCaptureState}
      getStoredSelection={getStoredWall}
      textures={wallTextures}
      coveringTypes={coveringTypes}
      onTextureApply={handleTextureApply}
    />
  );
};

export default WallPropertiesPanel;
