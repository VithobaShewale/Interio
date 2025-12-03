import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import * as BP3D from '../../types/blueprint3d';
import './ItemList.css';

interface ItemListProps {
  blueprint3d: BP3D.Blueprint3d | null;
}

interface ItemSummary {
  id: string;
  name: string;
  quantity: number;
  price: number;
  dimensions: {
    width: number;
    height: number;
    depth: number;
  };
  category: string;
  thumbnail?: string;
}

const ItemList: React.FC<ItemListProps> = ({ blueprint3d }) => {
  const { t } = useTranslation();
  const [items, setItems] = useState<ItemSummary[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [forceUpdate, setForceUpdate] = useState(0);

  // Load items from items.json to get price and details
  const itemDatabase = require('../../assets/data/items.json');

  useEffect(() => {
    if (!blueprint3d?.model?.scene) return;

    const updateItemList = () => {
      try {
        const sceneItems = blueprint3d.model.scene.getItems();
        const itemMap = new Map<string, ItemSummary>();

        sceneItems.forEach((item: any) => {
          const itemName = item.metadata?.itemName || 'Unknown Item';
          
          // Find item in database to get price and details
          const dbItem = itemDatabase.items.find((i: any) => i.name === itemName);
          
          if (itemMap.has(itemName)) {
            const existing = itemMap.get(itemName)!;
            existing.quantity += 1;
            itemMap.set(itemName, existing);
          } else {
            itemMap.set(itemName, {
              id: itemName.toLowerCase().replace(/\s+/g, '-'),
              name: itemName,
              quantity: 1,
              price: dbItem?.price || 0,
              dimensions: dbItem?.dimensions || { width: 0, height: 0, depth: 0 },
              category: dbItem?.category || 'uncategorized',
              thumbnail: dbItem?.thumbnail
            });
          }
        });

        const itemList = Array.from(itemMap.values());
        setItems(itemList);
        
        // Calculate total
        const total = itemList.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        setTotalPrice(total);
      } catch (error) {
        console.error('Error updating item list:', error);
      }
    };

    updateItemList();

    // Listen for item changes - check if callbacks exist
    const handleItemAdded = () => {
      updateItemList();
    };

    const handleItemRemoved = () => {
      updateItemList();
    };

    // Only add callbacks if they exist
    if (blueprint3d.model.scene.itemAddedCallbacks?.add) {
      blueprint3d.model.scene.itemAddedCallbacks.add(handleItemAdded);
    }
    
    if (blueprint3d.model.scene.itemRemovedCallbacks?.add) {
      blueprint3d.model.scene.itemRemovedCallbacks.add(handleItemRemoved);
    }

    return () => {
      if (blueprint3d.model.scene.itemAddedCallbacks?.remove) {
        blueprint3d.model.scene.itemAddedCallbacks.remove(handleItemAdded);
      }
      if (blueprint3d.model.scene.itemRemovedCallbacks?.remove) {
        blueprint3d.model.scene.itemRemovedCallbacks.remove(handleItemRemoved);
      }
    };
  }, [blueprint3d, forceUpdate, itemDatabase.items]);

  const handleExportList = () => {
    const csvContent = [
      ['Item Name', 'Quantity', 'Unit Price', 'Total Price', 'Dimensions (W×H×D)', 'Category'].join(','),
      ...items.map(item => [
        item.name,
        item.quantity,
        `$${item.price}`,
        `$${item.price * item.quantity}`,
        `${item.dimensions.width}×${item.dimensions.height}×${item.dimensions.depth}cm`,
        item.category
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `furniture-list-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: string } = {
      'seating': '🪑',
      'tables': '🪑',
      'storage': '🗄️',
      'bedroom': '🛏️',
      'lighting': '💡',
      'decor': '🖼️',
      'uncategorized': '📦'
    };
    return icons[category] || '📦';
  };

  if (items.length === 0) {
    return (
      <div className="item-list-empty">
        <div className="empty-icon">🛒</div>
        <h3>{t('itemlist.empty_title') || 'No Items Added'}</h3>
        <p>{t('itemlist.empty_message') || 'Add furniture items to your design to see them here'}</p>
      </div>
    );
  }

  return (
    <div className="item-list">
      <div className="item-list-header">
        <h2>
          <span className="icon">🛒</span>
          {t('itemlist.title') || 'Shopping List'}
        </h2>
        <div className="item-list-actions">
          <button className="action-btn" onClick={handleExportList} title="Export to CSV">
            <span>📥</span> {t('itemlist.export') || 'Export'}
          </button>
          <button className="action-btn" onClick={handlePrint} title="Print">
            <span>🖨️</span> {t('itemlist.print') || 'Print'}
          </button>
        </div>
      </div>

      <div className="item-list-summary">
        <div className="summary-stat">
          <span className="stat-label">{t('itemlist.total_items') || 'Total Items'}:</span>
          <span className="stat-value">{items.reduce((sum, item) => sum + item.quantity, 0)}</span>
        </div>
        <div className="summary-stat">
          <span className="stat-label">{t('itemlist.unique_items') || 'Unique Items'}:</span>
          <span className="stat-value">{items.length}</span>
        </div>
        <div className="summary-stat total">
          <span className="stat-label">{t('itemlist.total_cost') || 'Total Cost'}:</span>
          <span className="stat-value">{formatPrice(totalPrice)}</span>
        </div>
      </div>

      <div className="item-list-content">
        {items.map((item) => (
          <div key={item.id} className="item-list-item">
            <div className="item-icon">
              {getCategoryIcon(item.category)}
            </div>
            <div className="item-details">
              <div className="item-name">{item.name}</div>
              <div className="item-meta">
                <span className="item-category">{item.category}</span>
                <span className="item-dimensions">
                  {item.dimensions.width}×{item.dimensions.height}×{item.dimensions.depth}cm
                </span>
              </div>
            </div>
            <div className="item-quantity">
              <span className="quantity-label">Qty:</span>
              <span className="quantity-value">{item.quantity}</span>
            </div>
            <div className="item-pricing">
              <div className="unit-price">{formatPrice(item.price)} ea</div>
              <div className="total-price">{formatPrice(item.price * item.quantity)}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="item-list-footer">
        <div className="footer-summary">
          <div className="footer-row">
            <span>{t('itemlist.subtotal') || 'Subtotal'}:</span>
            <span>{formatPrice(totalPrice)}</span>
          </div>
          <div className="footer-row">
            <span>{t('itemlist.tax') || 'Tax (estimated)'}:</span>
            <span>{formatPrice(totalPrice * 0.08)}</span>
          </div>
          <div className="footer-row total">
            <span>{t('itemlist.grand_total') || 'Grand Total'}:</span>
            <span>{formatPrice(totalPrice * 1.08)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemList;
