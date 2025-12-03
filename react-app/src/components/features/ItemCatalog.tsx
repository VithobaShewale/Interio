import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { fetchItems, fetchCategories, ItemMetadata, ItemCategory } from '../../api';
import './ItemCatalog.css';

interface Item {
  name: string;
  image: string;
  model: string;
  type: string;
}

interface ItemCatalogProps {
  blueprint3d: any;
  onItemSelect?: (item: Item) => void;
  onCaptureState?: (description?: string) => void;
}

const ItemCatalog: React.FC<ItemCatalogProps> = ({ blueprint3d, onItemSelect, onCaptureState }) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [items, setItems] = useState<ItemMetadata[]>([]);
  const [categories, setCategories] = useState<ItemCategory[]>([]);
  const [loading, setLoading] = useState(true);

  // Load items and categories from API
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [itemsData, categoriesData] = await Promise.all([
          fetchItems(),
          fetchCategories()
        ]);
        setItems(itemsData);
        setCategories([{ id: 'all', name: 'All Items', icon: 'grid', itemCount: itemsData.length }, ...categoriesData]);
      } catch (error) {
        console.error('Failed to load catalog data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleItemClick = (item: ItemMetadata) => {
    if (!blueprint3d?.model?.scene) return;
    
    // Default to furniture type (1) for all items
    const itemType = 1;
    
    const metadata = {
      itemName: item.name,
      itemType: itemType,
      modelUrl: item.model,
      resizable: true,
      image: item.thumbnail, // Add thumbnail to metadata
      // Store dimensions in metadata so they can be applied after loading
      dimensions: item.dimensions
    };
    
    // Set up a one-time callback to resize item after it's loaded
    const itemLoadedCallback = (loadedItem: any) => {
      if (item.dimensions && loadedItem.metadata === metadata) {
        // Apply the correct dimensions from items.json
        // Dimensions are in cm: { width, height, depth }
        // Item.resize expects (height, width, depth) in cm
        setTimeout(() => {
          try {
            loadedItem.resize(
              item.dimensions.height,
              item.dimensions.width,
              item.dimensions.depth
            );
            console.log(`Applied dimensions to ${item.name}:`, item.dimensions);
          } catch (error) {
            console.error(`Failed to resize ${item.name}:`, error);
          }
        }, 50);
        
        // Remove this callback after use
        blueprint3d.model.scene.itemLoadedCallbacks.remove(itemLoadedCallback);
      }
    };
    
    // Register the callback
    if (item.dimensions) {
      blueprint3d.model.scene.itemLoadedCallbacks.add(itemLoadedCallback);
    }
    
    // addItem signature: (itemType, fileName, metadata, position, rotation, scale, fixed)
    blueprint3d.model.scene.addItem(
      itemType,
      item.model,
      metadata,
      undefined, // position (will be set by mouse click)
      undefined, // rotation
      undefined, // scale (will be set via resize after loading)
      false      // fixed
    );
    
    // Capture state for undo/redo after a longer delay to ensure item is resized
    setTimeout(() => {
      onCaptureState?.(`Add ${item.name}`);
    }, 200);
    
    if (onItemSelect) {
      const legacyItem: Item = {
        name: item.name,
        image: item.thumbnail,
        model: item.model,
        type: '1'
      };
      onItemSelect(legacyItem);
    }
  };

  if (loading) {
    return (
      <div className="item-catalog">
        <div className="catalog-header">
          <h3>{t('catalog.title')}</h3>
        </div>
        <div className="loading-message">{t('loading.loading_items')}</div>
      </div>
    );
  }

  return (
    <div className="item-catalog">
      <div className="catalog-header">
        <h3>{t('catalog.title')}</h3>
        <input
          type="text"
          className="search-input"
          placeholder={t('catalog.search')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="category-tabs">
        {categories.map(cat => (
          <button
            key={cat.id}
            className={`category-tab ${selectedCategory === cat.id ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat.id)}
          >
            {cat.name}
          </button>
        ))}
      </div>

      <div className="items-grid">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="item-card"
            onClick={() => handleItemClick(item)}
            title={`Click to add ${item.name}`}
          >
            <div className="item-image-container">
              <img src={item.thumbnail} alt={item.name} className="item-image" />
            </div>
            <div className="item-name">{item.name}</div>
          </div>
        ))}
      </div>

      {filteredItems.length === 0 && !loading && (
        <div className="no-results">
          {t('catalog.no_results', { searchTerm })}
        </div>
      )}
    </div>
  );
};

export default ItemCatalog;
