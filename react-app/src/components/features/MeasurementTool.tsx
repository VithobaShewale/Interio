import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import './MeasurementTool.css';

interface MeasurementToolProps {
  blueprint3d: any;
  isActive: boolean;
  onClose: () => void;
}

interface Measurement {
  id: string;
  start: { x: number; y: number };
  end: { x: number; y: number };
  length: number;
  label?: string;
}

const MeasurementTool: React.FC<MeasurementToolProps> = ({ blueprint3d, isActive, onClose }) => {
  const { t } = useTranslation();
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [tempStart, setTempStart] = useState<{ x: number; y: number } | null>(null);
  const [tempEnd, setTempEnd] = useState<{ x: number; y: number } | null>(null);
  const [hoveredMeasurement, setHoveredMeasurement] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  /**
   * Calculate distance between two points
   */
  const calculateDistance = useCallback((p1: { x: number; y: number }, p2: { x: number; y: number }): number => {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }, []);

  /**
   * Format distance for display (convert from pixels to meters/cm)
   */
  const formatDistance = useCallback((pixels: number): string => {
    // Assuming 1 pixel = 2.5 cm (adjust based on your scale)
    const cm = pixels * 2.5;
    
    if (cm < 100) {
      return `${cm.toFixed(1)} cm`;
    } else {
      return `${(cm / 100).toFixed(2)} m`;
    }
  }, []);

  /**
   * Handle canvas click for measurement
   */
  const handleCanvasClick = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isActive || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    if (!tempStart) {
      // First click - set start point
      setTempStart({ x, y });
      setTempEnd({ x, y });
    } else {
      // Second click - create measurement
      const length = calculateDistance(tempStart, { x, y });
      const newMeasurement: Measurement = {
        id: `m-${Date.now()}`,
        start: tempStart,
        end: { x, y },
        length,
      };

      setMeasurements(prev => [...prev, newMeasurement]);
      setTempStart(null);
      setTempEnd(null);
    }
  }, [isActive, tempStart, calculateDistance]);

  /**
   * Handle mouse move for preview
   */
  const handleMouseMove = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isActive || !tempStart || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    setTempEnd({ x, y });
  }, [isActive, tempStart]);

  /**
   * Draw measurement lines on canvas
   */
  const drawMeasurements = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw existing measurements
    measurements.forEach(measurement => {
      const isHovered = hoveredMeasurement === measurement.id;
      
      ctx.save();
      
      // Line style
      ctx.strokeStyle = isHovered ? '#2563eb' : '#dc2626';
      ctx.lineWidth = isHovered ? 3 : 2;
      ctx.lineCap = 'round';

      // Draw main line
      ctx.beginPath();
      ctx.moveTo(measurement.start.x, measurement.start.y);
      ctx.lineTo(measurement.end.x, measurement.end.y);
      ctx.stroke();

      // Draw end caps
      const angle = Math.atan2(
        measurement.end.y - measurement.start.y,
        measurement.end.x - measurement.start.x
      );
      const capLength = 10;

      // Start cap
      ctx.beginPath();
      ctx.moveTo(
        measurement.start.x + Math.cos(angle + Math.PI / 2) * capLength,
        measurement.start.y + Math.sin(angle + Math.PI / 2) * capLength
      );
      ctx.lineTo(
        measurement.start.x - Math.cos(angle + Math.PI / 2) * capLength,
        measurement.start.y - Math.sin(angle + Math.PI / 2) * capLength
      );
      ctx.stroke();

      // End cap
      ctx.beginPath();
      ctx.moveTo(
        measurement.end.x + Math.cos(angle + Math.PI / 2) * capLength,
        measurement.end.y + Math.sin(angle + Math.PI / 2) * capLength
      );
      ctx.lineTo(
        measurement.end.x - Math.cos(angle + Math.PI / 2) * capLength,
        measurement.end.y - Math.sin(angle + Math.PI / 2) * capLength
      );
      ctx.stroke();

      // Draw label with distance
      const midX = (measurement.start.x + measurement.end.x) / 2;
      const midY = (measurement.start.y + measurement.end.y) / 2;
      const distance = formatDistance(measurement.length);

      ctx.font = isHovered ? 'bold 14px Arial' : '12px Arial';
      ctx.fillStyle = isHovered ? '#1e40af' : '#991b1b';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';

      // Background for text
      const textWidth = ctx.measureText(distance).width;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.fillRect(midX - textWidth / 2 - 4, midY - 18, textWidth + 8, 18);

      ctx.fillStyle = isHovered ? '#1e40af' : '#991b1b';
      ctx.fillText(distance, midX, midY - 4);

      ctx.restore();
    });

    // Draw temporary measurement preview
    if (tempStart && tempEnd) {
      ctx.save();
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.lineCap = 'round';

      ctx.beginPath();
      ctx.moveTo(tempStart.x, tempStart.y);
      ctx.lineTo(tempEnd.x, tempEnd.y);
      ctx.stroke();

      // Draw start point
      ctx.fillStyle = '#3b82f6';
      ctx.beginPath();
      ctx.arc(tempStart.x, tempStart.y, 4, 0, Math.PI * 2);
      ctx.fill();

      // Draw preview distance
      const midX = (tempStart.x + tempEnd.x) / 2;
      const midY = (tempStart.y + tempEnd.y) / 2;
      const previewDistance = calculateDistance(tempStart, tempEnd);
      const distance = formatDistance(previewDistance);

      ctx.font = '12px Arial';
      ctx.fillStyle = '#1e40af';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText(distance, midX, midY - 4);

      ctx.restore();
    }
  }, [measurements, tempStart, tempEnd, hoveredMeasurement, calculateDistance, formatDistance]);

  /**
   * Delete measurement
   */
  const deleteMeasurement = useCallback((id: string) => {
    setMeasurements(prev => prev.filter(m => m.id !== id));
  }, []);

  /**
   * Clear all measurements
   */
  const clearAllMeasurements = useCallback(() => {
    setMeasurements([]);
    setTempStart(null);
    setTempEnd(null);
  }, []);

  /**
   * Resize canvas to match container
   */
  useEffect(() => {
    const resizeCanvas = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
      drawMeasurements();
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [drawMeasurements]);

  /**
   * Redraw when measurements change
   */
  useEffect(() => {
    drawMeasurements();
  }, [drawMeasurements]);

  /**
   * Cancel measurement on Escape
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (tempStart) {
          setTempStart(null);
          setTempEnd(null);
        } else {
          onClose();
        }
      }
    };

    if (isActive) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isActive, tempStart, onClose]);

  if (!isActive) return null;

  return (
    <div className="measurement-tool-container" ref={containerRef}>
      <canvas
        ref={canvasRef}
        className="measurement-canvas"
        onClick={handleCanvasClick}
        onMouseMove={handleMouseMove}
      />

      <div className="measurement-toolbar">
        <div className="measurement-info">
          <span className="measurement-mode-indicator">
            📏 {tempStart ? t('measurements.clickSecondPoint') : t('measurements.clickFirstPoint')}
          </span>
          <span className="measurement-count">
            {measurements.length} {t('measurements.measurementCount', { count: measurements.length })}
          </span>
        </div>

        <div className="measurement-actions">
          {measurements.length > 0 && (
            <button
              className="measurement-btn clear-btn"
              onClick={clearAllMeasurements}
              title={t('measurements.clearAll')}
            >
              🗑️ {t('measurements.clearAll')}
            </button>
          )}
          <button
            className="measurement-btn close-btn"
            onClick={onClose}
            title={t('common.close')}
          >
            ✕ {t('common.close')}
          </button>
        </div>
      </div>

      {measurements.length > 0 && (
        <div className="measurement-list">
          <h4>{t('measurements.title')}</h4>
          {measurements.map(measurement => (
            <div
              key={measurement.id}
              className="measurement-item"
              onMouseEnter={() => setHoveredMeasurement(measurement.id)}
              onMouseLeave={() => setHoveredMeasurement(null)}
            >
              <span className="measurement-distance">
                {formatDistance(measurement.length)}
              </span>
              <button
                className="delete-measurement-btn"
                onClick={() => deleteMeasurement(measurement.id)}
                title={t('common.delete')}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MeasurementTool;
