import React, { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import './AreaCalculationPanel.css';

interface AreaCalculationPanelProps {
  blueprint3d: any;
}

interface RoomData {
  id: string;
  name: string;
  area: number; // in m²
  perimeter: number; // in m
  wallArea: number; // in m²
}

const AreaCalculationPanel: React.FC<AreaCalculationPanelProps> = ({ blueprint3d }) => {
  const { t } = useTranslation();
  const [rooms, setRooms] = useState<RoomData[]>([]);
  const [totalFloorArea, setTotalFloorArea] = useState(0);
  const [totalWallArea, setTotalWallArea] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<'metric' | 'imperial'>('metric');

  /**
   * Calculate room area using shoelace formula
   */
  const calculatePolygonArea = useCallback((corners: any[]): number => {
    if (corners.length < 3) return 0;

    let area = 0;
    for (let i = 0; i < corners.length; i++) {
      const current = corners[i];
      const next = corners[(i + 1) % corners.length];
      area += current.x * next.y - next.x * current.y;
    }

    // Convert from cm² to m²
    return Math.abs(area) / 20000; // Divided by 2 for shoelace, divided by 10000 for cm² to m²
  }, []);

  /**
   * Calculate perimeter
   */
  const calculatePerimeter = useCallback((corners: any[]): number => {
    if (corners.length < 2) return 0;

    let perimeter = 0;
    for (let i = 0; i < corners.length; i++) {
      const current = corners[i];
      const next = corners[(i + 1) % corners.length];
      const dx = next.x - current.x;
      const dy = next.y - current.y;
      perimeter += Math.sqrt(dx * dx + dy * dy);
    }

    // Convert from cm to m
    return perimeter / 100;
  }, []);

  /**
   * Calculate wall area (perimeter * height)
   */
  const calculateWallArea = useCallback((perimeter: number, height: number = 2.5): number => {
    return perimeter * height;
  }, []);

  /**
   * Update room measurements from Blueprint3D
   */
  const updateMeasurements = useCallback(() => {
    if (!blueprint3d?.model?.floorplan) return;

    try {
      const floorplan = blueprint3d.model.floorplan;
      const roomsData: RoomData[] = [];
      let totalFloor = 0;
      let totalWall = 0;

      // Get all rooms
      const rooms = floorplan.getRooms();
      
      rooms.forEach((room: any, index: number) => {
        const corners = room.corners || [];
        const area = calculatePolygonArea(corners);
        const perimeter = calculatePerimeter(corners);
        const wallArea = calculateWallArea(perimeter);

        roomsData.push({
          id: room.id || `room-${index}`,
          name: room.name || `${t('measurements.room')} ${index + 1}`,
          area,
          perimeter,
          wallArea,
        });

        totalFloor += area;
        totalWall += wallArea;
      });

      setRooms(roomsData);
      setTotalFloorArea(totalFloor);
      setTotalWallArea(totalWall);
    } catch (error) {
      console.error('Error calculating measurements:', error);
    }
  }, [blueprint3d, calculatePolygonArea, calculatePerimeter, calculateWallArea, t]);

  /**
   * Format area based on selected unit
   */
  const formatArea = useCallback((m2: number): string => {
    if (selectedUnit === 'imperial') {
      const ft2 = m2 * 10.764;
      return `${ft2.toFixed(2)} ft²`;
    }
    return `${m2.toFixed(2)} m²`;
  }, [selectedUnit]);

  /**
   * Format length based on selected unit
   */
  const formatLength = useCallback((m: number): string => {
    if (selectedUnit === 'imperial') {
      const ft = m * 3.281;
      return `${ft.toFixed(2)} ft`;
    }
    return `${m.toFixed(2)} m`;
  }, [selectedUnit]);

  /**
   * Export measurements to CSV
   */
  const exportToCSV = useCallback(() => {
    const csvContent = [
      ['Room', 'Floor Area', 'Perimeter', 'Wall Area'].join(','),
      ...rooms.map(room => [
        room.name,
        formatArea(room.area),
        formatLength(room.perimeter),
        formatArea(room.wallArea),
      ].join(',')),
      [],
      ['Total Floor Area', formatArea(totalFloorArea)].join(','),
      ['Total Wall Area', formatArea(totalWallArea)].join(','),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `measurements-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [rooms, totalFloorArea, totalWallArea, formatArea, formatLength]);

  /**
   * Export measurements to JSON
   */
  const exportToJSON = useCallback(() => {
    const data = {
      rooms: rooms.map(room => ({
        name: room.name,
        floorArea: { value: room.area, unit: 'm²' },
        perimeter: { value: room.perimeter, unit: 'm' },
        wallArea: { value: room.wallArea, unit: 'm²' },
      })),
      totals: {
        floorArea: { value: totalFloorArea, unit: 'm²' },
        wallArea: { value: totalWallArea, unit: 'm²' },
      },
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `measurements-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [rooms, totalFloorArea, totalWallArea]);

  /**
   * Update measurements when blueprint3d changes
   */
  useEffect(() => {
    if (!blueprint3d) return;

    updateMeasurements();

    // Listen for various model changes
    const handleUpdate = () => {
      setTimeout(updateMeasurements, 100);
    };

    // Subscribe to multiple callbacks for real-time updates
    if (blueprint3d.model?.floorplan) {
      const floorplan = blueprint3d.model.floorplan;
      
      // Room loaded
      if (floorplan.roomLoadedCallbacks) {
        floorplan.roomLoadedCallbacks.add(handleUpdate);
      }
      
      // Wall moved
      if (floorplan.wallMovedCallbacks) {
        floorplan.wallMovedCallbacks.add(handleUpdate);
      }
      
      // Corner moved (walls change when corners move)
      if (floorplan.updatedRooms) {
        floorplan.updatedRooms.add(handleUpdate);
      }
    }

    // Also use polling as fallback for real-time updates
    const pollInterval = setInterval(updateMeasurements, 1000);

    return () => {
      clearInterval(pollInterval);
      
      if (blueprint3d.model?.floorplan) {
        const floorplan = blueprint3d.model.floorplan;
        
        if (floorplan.roomLoadedCallbacks) {
          floorplan.roomLoadedCallbacks.remove(handleUpdate);
        }
        
        if (floorplan.wallMovedCallbacks) {
          floorplan.wallMovedCallbacks.remove(handleUpdate);
        }
        
        if (floorplan.updatedRooms) {
          floorplan.updatedRooms.remove(handleUpdate);
        }
      }
    };
  }, [blueprint3d, updateMeasurements]);

  return (
    <div className={`area-calculation-panel ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <div className="panel-header" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="panel-title">
          <span className="panel-icon">📐</span>
          <h3>{t('measurements.areaCalculation')}</h3>
        </div>
        <div className="panel-summary">
          <span className="total-area">{formatArea(totalFloorArea)}</span>
          <button className="expand-btn">
            {isExpanded ? '▼' : '▶'}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="panel-content">
          <div className="panel-controls">
            <div className="unit-selector">
              <button
                className={`unit-btn ${selectedUnit === 'metric' ? 'active' : ''}`}
                onClick={() => setSelectedUnit('metric')}
              >
                {t('measurements.metric')}
              </button>
              <button
                className={`unit-btn ${selectedUnit === 'imperial' ? 'active' : ''}`}
                onClick={() => setSelectedUnit('imperial')}
              >
                {t('measurements.imperial')}
              </button>
            </div>

            <button className="refresh-btn" onClick={updateMeasurements} title={t('measurements.refresh')}>
              🔄
            </button>
          </div>

          {rooms.length === 0 ? (
            <div className="empty-state">
              <p>{t('measurements.noRooms')}</p>
            </div>
          ) : (
            <>
              <div className="rooms-list">
                {rooms.map(room => (
                  <div key={room.id} className="room-item">
                    <div className="room-header">
                      <span className="room-name">{room.name}</span>
                    </div>
                    <div className="room-measurements">
                      <div className="measurement-row">
                        <span className="measurement-label">{t('measurements.floorArea')}:</span>
                        <span className="measurement-value">{formatArea(room.area)}</span>
                      </div>
                      <div className="measurement-row">
                        <span className="measurement-label">{t('measurements.perimeter')}:</span>
                        <span className="measurement-value">{formatLength(room.perimeter)}</span>
                      </div>
                      <div className="measurement-row">
                        <span className="measurement-label">{t('measurements.wallArea')}:</span>
                        <span className="measurement-value">{formatArea(room.wallArea)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="totals-section">
                <h4>{t('measurements.totals')}</h4>
                <div className="total-row">
                  <span className="total-label">{t('measurements.totalFloorArea')}:</span>
                  <span className="total-value">{formatArea(totalFloorArea)}</span>
                </div>
                <div className="total-row">
                  <span className="total-label">{t('measurements.totalWallArea')}:</span>
                  <span className="total-value">{formatArea(totalWallArea)}</span>
                </div>
              </div>

              <div className="export-actions">
                <button className="export-btn" onClick={exportToCSV}>
                  📄 {t('measurements.exportCSV')}
                </button>
                <button className="export-btn" onClick={exportToJSON}>
                  💾 {t('measurements.exportJSON')}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default AreaCalculationPanel;
