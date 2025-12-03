/**
 * Manages all measurement operations in the planner
 * Coordinates measurement creation, storage, and rendering
 */

import { MeasurementLine, Vector3D } from './MeasurementLine';

export interface RoomMeasurement {
  roomId: string;
  roomName: string;
  area: number; // in square meters
  perimeter: number; // in meters
  corners: Vector3D[];
}

export interface WallMeasurement {
  wallId: string;
  length: number;
  height: number;
  thickness: number;
  area: number; // length * height
}

export class MeasurementManager {
  private measurements: Map<string, MeasurementLine> = new Map();
  private roomMeasurements: Map<string, RoomMeasurement> = new Map();
  private wallMeasurements: Map<string, WallMeasurement> = new Map();
  private isActive: boolean = false;
  private tempStartPoint: Vector3D | null = null;

  /**
   * Start measurement mode
   */
  startMeasuring(): void {
    this.isActive = true;
    this.tempStartPoint = null;
  }

  /**
   * Stop measurement mode
   */
  stopMeasuring(): void {
    this.isActive = false;
    this.tempStartPoint = null;
  }

  /**
   * Check if measurement mode is active
   */
  isMeasuring(): boolean {
    return this.isActive;
  }

  /**
   * Handle click for measurement creation
   * First click sets start point, second click creates measurement
   */
  handleClick(point: Vector3D): MeasurementLine | null {
    if (!this.isActive) return null;

    if (!this.tempStartPoint) {
      // First click - set start point
      this.tempStartPoint = { ...point };
      return null;
    } else {
      // Second click - create measurement
      const measurement = new MeasurementLine(this.tempStartPoint, point);
      
      // Add perpendicular closures (end caps)
      const dx = point.x - this.tempStartPoint.x;
      const dy = point.y - this.tempStartPoint.y;
      const length = Math.sqrt(dx * dx + dy * dy);
      
      if (length > 0) {
        // Perpendicular direction
        const perpDir = {
          x: -dy / length,
          y: dx / length,
          z: 0,
        };
        measurement.addClosures(perpDir, 20); // 20 units closure length
      }

      this.measurements.set(measurement.id, measurement);
      this.tempStartPoint = null;
      
      return measurement;
    }
  }

  /**
   * Get temporary preview line while measuring
   */
  getPreviewLine(currentPoint: Vector3D): MeasurementLine | null {
    if (!this.tempStartPoint) return null;
    return new MeasurementLine(this.tempStartPoint, currentPoint);
  }

  /**
   * Add a measurement line manually
   */
  addMeasurement(line: MeasurementLine): void {
    this.measurements.set(line.id, line);
  }

  /**
   * Remove a measurement by ID
   */
  removeMeasurement(id: string): boolean {
    return this.measurements.delete(id);
  }

  /**
   * Clear all measurements
   */
  clearAllMeasurements(): void {
    this.measurements.clear();
    this.roomMeasurements.clear();
    this.wallMeasurements.clear();
  }

  /**
   * Get all measurement lines
   */
  getAllMeasurements(): MeasurementLine[] {
    return Array.from(this.measurements.values());
  }

  /**
   * Calculate and store room measurements
   */
  calculateRoomMeasurement(
    roomId: string,
    roomName: string,
    corners: Vector3D[]
  ): RoomMeasurement {
    const area = this.calculatePolygonArea(corners);
    const perimeter = this.calculatePerimeter(corners);

    const measurement: RoomMeasurement = {
      roomId,
      roomName,
      area,
      perimeter,
      corners: [...corners],
    };

    this.roomMeasurements.set(roomId, measurement);
    return measurement;
  }

  /**
   * Calculate area of a polygon using the Shoelace formula
   */
  private calculatePolygonArea(corners: Vector3D[]): number {
    if (corners.length < 3) return 0;

    let area = 0;
    for (let i = 0; i < corners.length; i++) {
      const current = corners[i];
      const next = corners[(i + 1) % corners.length];
      area += current.x * next.y - next.x * current.y;
    }

    return Math.abs(area) / 2;
  }

  /**
   * Calculate perimeter of a polygon
   */
  private calculatePerimeter(corners: Vector3D[]): number {
    if (corners.length < 2) return 0;

    let perimeter = 0;
    for (let i = 0; i < corners.length; i++) {
      const current = corners[i];
      const next = corners[(i + 1) % corners.length];
      const dx = next.x - current.x;
      const dy = next.y - current.y;
      perimeter += Math.sqrt(dx * dx + dy * dy);
    }

    return perimeter;
  }

  /**
   * Add wall measurement
   */
  addWallMeasurement(
    wallId: string,
    length: number,
    height: number = 250, // default height in cm
    thickness: number = 10 // default thickness in cm
  ): WallMeasurement {
    const measurement: WallMeasurement = {
      wallId,
      length,
      height,
      thickness,
      area: (length * height) / 10000, // convert to m²
    };

    this.wallMeasurements.set(wallId, measurement);
    return measurement;
  }

  /**
   * Get all room measurements
   */
  getAllRoomMeasurements(): RoomMeasurement[] {
    return Array.from(this.roomMeasurements.values());
  }

  /**
   * Get all wall measurements
   */
  getAllWallMeasurements(): WallMeasurement[] {
    return Array.from(this.wallMeasurements.values());
  }

  /**
   * Get measurement by ID
   */
  getMeasurement(id: string): MeasurementLine | undefined {
    return this.measurements.get(id);
  }

  /**
   * Get room measurement by ID
   */
  getRoomMeasurement(roomId: string): RoomMeasurement | undefined {
    return this.roomMeasurements.get(roomId);
  }

  /**
   * Get wall measurement by ID
   */
  getWallMeasurement(wallId: string): WallMeasurement | undefined {
    return this.wallMeasurements.get(wallId);
  }

  /**
   * Calculate total floor area
   */
  getTotalFloorArea(): number {
    return Array.from(this.roomMeasurements.values())
      .reduce((sum, room) => sum + room.area, 0);
  }

  /**
   * Calculate total wall area
   */
  getTotalWallArea(): number {
    return Array.from(this.wallMeasurements.values())
      .reduce((sum, wall) => sum + wall.area, 0);
  }

  /**
   * Export all measurements as JSON
   */
  exportToJSON() {
    return {
      measurements: Array.from(this.measurements.values()).map(m => m.toJSON()),
      rooms: Array.from(this.roomMeasurements.values()),
      walls: Array.from(this.wallMeasurements.values()),
      totals: {
        floorArea: this.getTotalFloorArea(),
        wallArea: this.getTotalWallArea(),
        measurementCount: this.measurements.size,
        roomCount: this.roomMeasurements.size,
        wallCount: this.wallMeasurements.size,
      },
    };
  }

  /**
   * Import measurements from JSON
   */
  importFromJSON(data: any): void {
    this.clearAllMeasurements();

    if (data.measurements) {
      data.measurements.forEach((m: any) => {
        const line = MeasurementLine.fromJSON(m);
        this.measurements.set(line.id, line);
      });
    }

    if (data.rooms) {
      data.rooms.forEach((room: RoomMeasurement) => {
        this.roomMeasurements.set(room.roomId, room);
      });
    }

    if (data.walls) {
      data.walls.forEach((wall: WallMeasurement) => {
        this.wallMeasurements.set(wall.wallId, wall);
      });
    }
  }
}
