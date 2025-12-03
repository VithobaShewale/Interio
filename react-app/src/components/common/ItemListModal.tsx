import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import * as BP3D from '../../types/blueprint3d';
import pdfMake from 'pdfmake/build/pdfmake';
import './ItemListModal.css';

// Import fonts - using require to handle module structure
const pdfFonts = require('pdfmake/build/vfs_fonts');
if (pdfFonts && pdfFonts.pdfMake && pdfFonts.pdfMake.vfs) {
  (pdfMake as any).vfs = pdfFonts.pdfMake.vfs;
}

interface ItemListModalProps {
  blueprint3d: BP3D.Blueprint3d | null;
  isOpen: boolean;
  onClose: () => void;
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

const ItemListModal: React.FC<ItemListModalProps> = ({ blueprint3d, isOpen, onClose }) => {
  const { t } = useTranslation();
  const [items, setItems] = useState<ItemSummary[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [forceUpdate, setForceUpdate] = useState(0);

  // Load items from items.json to get price and details
  const itemDatabase = require('../../assets/data/items.json');

  useEffect(() => {
    if (!blueprint3d?.model?.scene || !isOpen) return;

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
              thumbnail: item.metadata?.image || dbItem?.thumbnail // Use metadata image first
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
  }, [blueprint3d, isOpen, forceUpdate, itemDatabase.items]);

  const handleExportList = () => {
    const csvContent = [
      ['Item Name', 'Quantity', 'Unit Price', 'Total Price', 'Dimensions (W×H×D)', 'Category'].join(','),
      ...items.map(item => [
        `"${item.name}"`,
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

  const handlePrint = async () => {
    // Convert all images to base64
    const itemsWithImages = await Promise.all(
      items.map(async (item) => {
        const dbItem = itemDatabase.items.find((i: any) => i.name === item.name);
        const imageUrl = item.thumbnail || dbItem?.thumbnail;
        const base64Image = imageUrl ? await convertImageToBase64(imageUrl) : '';
        return { ...item, base64Image };
      })
    );

    const docDefinition: any = {
      pageSize: 'A4',
      pageMargins: [40, 60, 40, 60],
      content: [
        {
          text: 'Shopping List',
          style: 'header',
          margin: [0, 0, 0, 20]
        },
        {
          text: `Generated on ${new Date().toLocaleDateString()}`,
          style: 'subheader',
          margin: [0, 0, 0, 30]
        },
        {
          style: 'tableExample',
          table: {
            headerRows: 1,
            widths: [40, '*', 80, 60, 50, 70],
            body: [
              [
                { text: 'Image', style: 'tableHeader' },
                { text: 'Product', style: 'tableHeader' },
                { text: 'Dimensions', style: 'tableHeader' },
                { text: 'Price', style: 'tableHeader', alignment: 'right' },
                { text: 'Qty', style: 'tableHeader', alignment: 'center' },
                { text: 'Sub Total', style: 'tableHeader', alignment: 'right' }
              ],
              ...itemsWithImages.map((item, index) => [
                item.base64Image ? { image: item.base64Image, width: 35, height: 35, margin: [0, 2] } : { text: '—', alignment: 'center', style: 'tableCell' },
                { 
                  stack: [
                    { text: item.name, bold: true },
                    { text: item.category, style: 'category' }
                  ]
                },
                { text: `${item.dimensions.width}×${item.dimensions.height}×${item.dimensions.depth}cm`, style: 'tableCell' },
                { text: formatPrice(item.price), style: 'tableCell', alignment: 'right' },
                { text: item.quantity.toString(), style: 'tableCell', alignment: 'center' },
                { text: formatPrice(item.price * item.quantity), style: 'tableCell', alignment: 'right', bold: true }
              ])
            ]
          },
          layout: {
            hLineWidth: (i: number) => (i === 0 || i === 1) ? 2 : 1,
            vLineWidth: () => 0,
            hLineColor: (i: number) => (i === 0 || i === 1) ? '#333' : '#e0e0e0',
            paddingLeft: () => 8,
            paddingRight: () => 8,
            paddingTop: () => 8,
            paddingBottom: () => 8
          }
        },
        {
          columns: [
            { width: '*', text: '' },
            {
              width: 200,
              stack: [
                {
                  columns: [
                    { text: 'Subtotal:', alignment: 'left' },
                    { text: formatPrice(totalPrice), alignment: 'right' }
                  ],
                  margin: [0, 20, 0, 5]
                },
                {
                  columns: [
                    { text: 'Tax (8%):', alignment: 'left' },
                    { text: formatPrice(totalPrice * 0.08), alignment: 'right' }
                  ],
                  margin: [0, 0, 0, 10]
                },
                {
                  columns: [
                    { text: 'Grand Total:', alignment: 'left', bold: true, fontSize: 14 },
                    { text: formatPrice(totalPrice * 1.08), alignment: 'right', bold: true, fontSize: 14 }
                  ],
                  margin: [0, 5, 0, 0]
                }
              ]
            }
          ]
        }
      ],
      styles: {
        header: {
          fontSize: 22,
          bold: true,
          color: '#333'
        },
        subheader: {
          fontSize: 10,
          color: '#666'
        },
        tableHeader: {
          bold: true,
          fontSize: 11,
          color: '#666',
          fillColor: '#f8f8f8'
        },
        tableCell: {
          fontSize: 10,
          color: '#333'
        },
        category: {
          fontSize: 9,
          color: '#999',
          italics: true,
          margin: [0, 2, 0, 0]
        }
      },
      defaultStyle: {
        font: 'Roboto'
      }
    };

    pdfMake.createPdf(docDefinition).download(`shopping-list-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const convertImageToBase64 = async (imageUrl: string): Promise<string> => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error converting image to base64:', error);
      return ''; // Return empty string on error
    }
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

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="item-list-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            <span className="icon">🛒</span>
            {t('itemlist.title') || 'Shopping List'}
          </h2>
          <button className="close-btn" onClick={onClose} title="Close">
            ×
          </button>
        </div>

        {items.length === 0 ? (
          <div className="modal-body">
            <div className="item-list-empty">
              <div className="empty-icon">🛒</div>
              <h3>{t('itemlist.empty_title') || 'No Items Added'}</h3>
              <p>{t('itemlist.empty_message') || 'Add furniture items to your design to see them here'}</p>
            </div>
          </div>
        ) : (
          <>
            <div className="modal-subheader">
              <div className="item-list-actions">
                <button className="action-btn" onClick={handleExportList} title="Export to CSV">
                  <span>📥</span> {t('itemlist.export') || 'Export CSV'}
                </button>
                <button className="action-btn" onClick={handlePrint} title="Download PDF">
                  <span>📄</span> {t('itemlist.download_pdf') || 'Download PDF'}
                </button>
              </div>
            </div>

            <div className="modal-body">
              <table className="item-table">
                <thead>
                  <tr>
                    <th className="col-number">#</th>
                    <th className="col-product">Product</th>
                    <th className="col-details">Details</th>
                    <th className="col-dimensions">Dimensions</th>
                    <th className="col-price">Price</th>
                    <th className="col-quantity">Quantity</th>
                    <th className="col-subtotal">Sub Total</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={item.id} className="item-row">
                      <td className="col-number">{index + 1}</td>
                      <td className="col-product">
                        <div className="product-cell">
                          {item.thumbnail ? (
                            <img 
                              src={item.thumbnail.startsWith('http') ? item.thumbnail : `/${item.thumbnail}`} 
                              alt={item.name}
                              className="product-image"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                                (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                              }}
                            />
                          ) : null}
                          <div className={`product-icon ${item.thumbnail ? 'hidden' : ''}`}>
                            {getCategoryIcon(item.category)}
                          </div>
                        </div>
                      </td>
                      <td className="col-details">
                        <div className="product-name">{item.name}</div>
                        <div className="product-category">{item.category}</div>
                      </td>
                      <td className="col-dimensions">
                        {item.dimensions.width}×{item.dimensions.height}×{item.dimensions.depth}cm
                      </td>
                      <td className="col-price">{formatPrice(item.price)}</td>
                      <td className="col-quantity">{item.quantity}</td>
                      <td className="col-subtotal">{formatPrice(item.price * item.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="modal-footer">
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
          </>
        )}
      </div>
    </div>
  );
};

export default ItemListModal;
