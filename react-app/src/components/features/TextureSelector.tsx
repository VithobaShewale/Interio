import React, { useState, useEffect } from 'react';
import './TextureSelector.css';

interface Texture {
  name: string;
  preview: string;
  url: string;
  stretch: boolean;
  scale: number;
  type: 'wall' | 'floor';
}

interface TextureSelectorProps {
  blueprint3d: any;
  onCaptureState?: (description?: string) => void;
}

const TextureSelector: React.FC<TextureSelectorProps> = ({ blueprint3d, onCaptureState }) => {
  const [currentTarget, setCurrentTarget] = useState<any>(null);
  const [targetType, setTargetType] = useState<'wall' | 'floor' | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<'wall' | 'floor'>('wall');

  const textures: Texture[] = [
    // Wall textures
    { 
      name: 'Brick Wall', 
      preview: 'rooms/thumbnails/thumbnail_light_brick.jpg',
      url: 'rooms/textures/light_brick.jpg',
      stretch: false,
      scale: 100,
      type: 'wall'
    },
    { 
      name: 'Yellow Wall', 
      preview: 'rooms/thumbnails/thumbnail_wallmap_yellow.png',
      url: 'rooms/textures/wallmap_yellow.png',
      stretch: true,
      scale: 0,
      type: 'wall'
    },
    { 
      name: 'White Wall', 
      preview: 'rooms/thumbnails/thumbnail_wallmap.png',
      url: 'rooms/textures/wallmap.png',
      stretch: true,
      scale: 0,
      type: 'wall'
    },
    { 
      name: 'Gray Wall', 
      preview: 'rooms/thumbnails/thumbnail_wallmap_gray.png',
      url: 'rooms/textures/wallmap_gray.png',
      stretch: true,
      scale: 0,
      type: 'wall'
    },
    // Floor textures
    { 
      name: 'Wood Floor', 
      preview: 'rooms/thumbnails/thumbnail_light_fine_wood.jpg',
      url: 'rooms/textures/light_fine_wood.jpg',
      stretch: false,
      scale: 400,
      type: 'floor'
    },
    { 
      name: 'Dark Wood', 
      preview: 'rooms/thumbnails/thumbnail_dark_wood.jpg',
      url: 'rooms/textures/dark_wood.jpg',
      stretch: false,
      scale: 300,
      type: 'floor'
    },
    { 
      name: 'Marble', 
      preview: 'rooms/thumbnails/thumbnail_marbletiles.jpg',
      url: 'rooms/textures/marbletiles.jpg',
      stretch: false,
      scale: 300,
      type: 'floor'
    },
    { 
      name: 'Concrete', 
      preview: 'rooms/thumbnails/thumbnail_concrete.jpg',
      url: 'rooms/textures/concrete.jpg',
      stretch: false,
      scale: 400,
      type: 'floor'
    }
  ];

  useEffect(() => {
    if (!blueprint3d?.three) return;

    const handleWallClicked = (halfEdge: any) => {
      setCurrentTarget(halfEdge);
      setTargetType('wall');
      setSelectedCategory('wall');
    };

    const handleFloorClicked = (room: any) => {
      setCurrentTarget(room);
      setTargetType('floor');
      setSelectedCategory('floor');
    };

    const handleReset = () => {
      setCurrentTarget(null);
      setTargetType(null);
    };

    blueprint3d.three.wallClicked.add(handleWallClicked);
    blueprint3d.three.floorClicked.add(handleFloorClicked);
    blueprint3d.three.itemSelectedCallbacks.add(handleReset);
    blueprint3d.three.nothingClicked.add(handleReset);

    return () => {
      blueprint3d.three.wallClicked.remove(handleWallClicked);
      blueprint3d.three.floorClicked.remove(handleFloorClicked);
      blueprint3d.three.itemSelectedCallbacks.remove(handleReset);
      blueprint3d.three.nothingClicked.remove(handleReset);
    };
  }, [blueprint3d]);

  const handleTextureClick = (texture: Texture) => {
    if (!currentTarget) {
      alert('Please click on a wall or floor in the 3D view first');
      return;
    }

    try {
      currentTarget.setTexture(texture.url, texture.stretch, texture.scale);
      onCaptureState?.(`Apply ${texture.name} texture`);
    } catch (error) {
      console.error('Error applying texture:', error);
    }
  };

  const filteredTextures = textures.filter(t => t.type === selectedCategory);

  return (
    <div className="texture-selector">
      <div className="texture-selector-header">
        <h3>Textures</h3>
        {targetType && (
          <div className="target-info">
            Click a texture to apply to selected {targetType}
          </div>
        )}
      </div>

      <div className="texture-categories">
        <button
          className={`texture-category-btn ${selectedCategory === 'wall' ? 'active' : ''}`}
          onClick={() => setSelectedCategory('wall')}
        >
          🧱 Walls
        </button>
        <button
          className={`texture-category-btn ${selectedCategory === 'floor' ? 'active' : ''}`}
          onClick={() => setSelectedCategory('floor')}
        >
          🏠 Floors
        </button>
      </div>

      {!currentTarget && (
        <div className="texture-hint">
          <p>💡 Click on a wall or floor in the 3D view to select it, then choose a texture below.</p>
        </div>
      )}

      <div className="textures-grid">
        {filteredTextures.map((texture, index) => (
          <div
            key={index}
            className={`texture-card ${currentTarget && targetType === texture.type ? 'enabled' : 'disabled'}`}
            onClick={() => handleTextureClick(texture)}
            title={currentTarget ? `Apply ${texture.name}` : `Select a ${texture.type} first`}
          >
            <div className="texture-image-container">
              <img src={texture.preview} alt={texture.name} className="texture-image" />
            </div>
            <div className="texture-name">{texture.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TextureSelector;
