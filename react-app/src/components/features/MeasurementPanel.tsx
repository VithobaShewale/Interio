import React, { useState, useEffect } from 'react';
import './MeasurementPanel.css';

interface MeasurementPanelProps {
  blueprint3d: any;
}

const MeasurementPanel: React.FC<MeasurementPanelProps> = ({ blueprint3d }) => {
  const [measurements, setMeasurements] = useState<{
    roomArea: number;
    wallLengths: Array<{ id: string; length: number }>;
    itemCount: number;
  }>({
    roomArea: 0,
    wallLengths: [],
    itemCount: 0
  });

  const [units, setUnits] = useState<'metric' | 'imperial'>('imperial');

  useEffect(() => {
    if (!blueprint3d?.model) return;

    const updateMeasurements = () => {
      try {
        const floorplan = blueprint3d.model.floorplan;
        const scene = blueprint3d.model.scene;

        // Calculate room area
        let totalArea = 0;
        const rooms = floorplan.getRooms();
        rooms.forEach((room: any) => {
          totalArea += room.area;
        });

        // Get wall lengths
        const walls = floorplan.getWalls();
        const wallLengths = walls.map((wall: any, index: number) => ({
          id: `Wall ${index + 1}`,
          length: wall.wallLength()
        }));

        // Get item count
        const items = scene.getItems();
        const itemCount = items.length;

        setMeasurements({
          roomArea: totalArea,
          wallLengths,
          itemCount
        });
      } catch (error) {
        console.error('Error updating measurements:', error);
      }
    };

    // Update measurements when model changes
    updateMeasurements();

    // Listen for model updates
    const interval = setInterval(updateMeasurements, 2000);

    return () => clearInterval(interval);
  }, [blueprint3d]);

  const convertLength = (cm: number): string => {
    if (units === 'metric') {
      const meters = cm / 100;
      return `${meters.toFixed(2)} m`;
    } else {
      const inches = cm / 2.54;
      const feet = Math.floor(inches / 12);
      const remainingInches = Math.round(inches % 12);
      return `${feet}' ${remainingInches}"`;
    }
  };

  const convertArea = (cm2: number): string => {
    if (units === 'metric') {
      const m2 = cm2 / 10000;
      return `${m2.toFixed(2)} m²`;
    } else {
      const sqInches = cm2 / 6.4516;
      const sqFeet = sqInches / 144;
      return `${sqFeet.toFixed(2)} ft²`;
    }
  };

  return (
    <div className="measurement-panel">
      <div className="measurement-header">
        <h3>📏 Measurements</h3>
        <div className="unit-toggle">
          <button
            className={`unit-btn ${units === 'imperial' ? 'active' : ''}`}
            onClick={() => setUnits('imperial')}
          >
            Imperial
          </button>
          <button
            className={`unit-btn ${units === 'metric' ? 'active' : ''}`}
            onClick={() => setUnits('metric')}
          >
            Metric
          </button>
        </div>
      </div>

      <div className="measurement-content">
        <div className="measurement-section">
          <h4 className="section-title">Room Summary</h4>
          <div className="measurement-item">
            <span className="label">Total Area:</span>
            <span className="value">{convertArea(measurements.roomArea)}</span>
          </div>
          <div className="measurement-item">
            <span className="label">Items:</span>
            <span className="value">{measurements.itemCount}</span>
          </div>
          <div className="measurement-item">
            <span className="label">Walls:</span>
            <span className="value">{measurements.wallLengths.length}</span>
          </div>
        </div>

        {measurements.wallLengths.length > 0 && (
          <div className="measurement-section">
            <h4 className="section-title">Wall Lengths</h4>
            <div className="wall-list">
              {measurements.wallLengths.map((wall, index) => (
                <div key={index} className="measurement-item">
                  <span className="label">{wall.id}:</span>
                  <span className="value">{convertLength(wall.length)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="measurement-info">
          <p>
            💡 <strong>Tip:</strong> Click on walls or items in the 3D view to see detailed measurements
          </p>
        </div>
      </div>
    </div>
  );
};

export default MeasurementPanel;
