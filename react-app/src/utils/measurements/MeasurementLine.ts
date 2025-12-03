/**
 * Represents a measurement line between two points
 * Inspired by Mooble's distanceLines module
 */

export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

export class MeasurementLine {
  private _start: Vector3D;
  private _end: Vector3D;
  private _closures: Vector3D[] | null = null;
  public id: string;
  public label?: string;

  constructor(start: Vector3D, end: Vector3D, id?: string) {
    this._start = { ...start };
    this._end = { ...end };
    this.id = id || `measure-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  get start(): Vector3D {
    return this._start;
  }

  get end(): Vector3D {
    return this._end;
  }

  get closures(): Vector3D[] | null {
    return this._closures;
  }

  /**
   * Calculate the length of the measurement line
   */
  getLength(): number {
    const dx = this._end.x - this._start.x;
    const dy = this._end.y - this._start.y;
    const dz = this._end.z - this._start.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  /**
   * Get the midpoint of the line
   */
  getMidpoint(): Vector3D {
    return {
      x: (this._start.x + this._end.x) / 2,
      y: (this._start.y + this._end.y) / 2,
      z: (this._start.z + this._end.z) / 2,
    };
  }

  /**
   * Move the entire line by a displacement vector
   */
  move(displacement: Vector3D): void {
    this._start.x += displacement.x;
    this._start.y += displacement.y;
    this._start.z += displacement.z;

    this._end.x += displacement.x;
    this._end.y += displacement.y;
    this._end.z += displacement.z;

    if (this._closures) {
      this._closures.forEach(closure => {
        closure.x += displacement.x;
        closure.y += displacement.y;
        closure.z += displacement.z;
      });
    }
  }

  /**
   * Add closure marks (end caps) to the measurement line
   * @param direction - Direction perpendicular to the line
   * @param length - Length of the closure marks
   */
  addClosures(direction: Vector3D, length: number): void {
    const halfLength = length / 2;
    const diff = {
      x: direction.x * halfLength,
      y: direction.y * halfLength,
      z: direction.z * halfLength,
    };

    this._closures = [
      // Start closures
      {
        x: this._start.x - diff.x,
        y: this._start.y - diff.y,
        z: this._start.z - diff.z,
      },
      {
        x: this._start.x + diff.x,
        y: this._start.y + diff.y,
        z: this._start.z + diff.z,
      },
      // End closures
      {
        x: this._end.x - diff.x,
        y: this._end.y - diff.y,
        z: this._end.z - diff.z,
      },
      {
        x: this._end.x + diff.x,
        y: this._end.y + diff.y,
        z: this._end.z + diff.z,
      },
    ];
  }

  /**
   * Get all points including closures for rendering
   */
  getAllPoints(): Vector3D[] {
    const points = [this._start, this._end];
    if (this._closures) {
      points.push(...this._closures);
    }
    return points;
  }

  /**
   * Get point indices for line rendering
   * Returns pairs of indices: [0,1] for main line, [2,3], [4,5] for closures
   */
  getIndices(): number[] {
    const indices = [0, 1]; // Main line
    if (this._closures) {
      indices.push(2, 3, 4, 5); // Two closure lines
    }
    return indices;
  }

  /**
   * Convert to JSON for serialization
   */
  toJSON() {
    return {
      id: this.id,
      start: this._start,
      end: this._end,
      closures: this._closures,
      label: this.label,
      length: this.getLength(),
    };
  }

  /**
   * Create from JSON data
   */
  static fromJSON(data: any): MeasurementLine {
    const line = new MeasurementLine(data.start, data.end, data.id);
    if (data.closures) {
      line._closures = data.closures;
    }
    if (data.label) {
      line.label = data.label;
    }
    return line;
  }
}
