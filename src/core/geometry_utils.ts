/**
 * Geometry Utilities Module
 * 
 * Provides reusable geometric calculation functions for the Blueprint3D system.
 * Includes vector operations, polygon utilities, and coordinate transformations.
 */
module BP3D.Core {

  export interface Point2D {
    x: number;
    y: number;
  }

  export interface Vector2D {
    x: number;
    y: number;
  }

  export class GeometryUtils {

    /**
     * Calculate the signed area of a polygon using the shoelace formula
     * Positive area = counter-clockwise, Negative area = clockwise
     */
    static calculatePolygonArea(points: Point2D[]): number {
      let area = 0;
      for (let i = 0; i < points.length; i++) {
        const j = (i + 1) % points.length;
        area += points[i].x * points[j].y;
        area -= points[j].x * points[i].y;
      }
      return area / 2;
    }

    /**
     * Determine if polygon vertices are in counter-clockwise order
     */
    static isCounterClockwise(points: Point2D[]): boolean {
      return this.calculatePolygonArea(points) > 0;
    }

    /**
     * Ensure polygon vertices are in counter-clockwise order
     * Reverses if necessary
     */
    static ensureCounterClockwise(points: Point2D[]): Point2D[] {
      if (this.isCounterClockwise(points)) {
        return points;
      }
      return [...points].reverse();
    }

    /**
     * Calculate the centroid (geometric center) of a polygon
     */
    static calculateCentroid(points: Point2D[]): Point2D {
      let sumX = 0;
      let sumY = 0;
      points.forEach(p => {
        sumX += p.x;
        sumY += p.y;
      });
      return {
        x: sumX / points.length,
        y: sumY / points.length
      };
    }

    /**
     * Calculate distance between two points
     */
    static distance(p1: Point2D, p2: Point2D): number {
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * Calculate normalized direction vector from p1 to p2
     */
    static direction(p1: Point2D, p2: Point2D): Vector2D {
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const length = Math.sqrt(dx * dx + dy * dy);
      return {
        x: dx / length,
        y: dy / length
      };
    }

    /**
     * Calculate perpendicular normal vector (90 degree rotation)
     * Returns the right-hand normal
     */
    static perpendicular(v: Vector2D): Vector2D {
      return { x: -v.y, y: v.x };
    }

    /**
     * Calculate dot product of two vectors
     */
    static dotProduct(v1: Vector2D, v2: Vector2D): number {
      return v1.x * v2.x + v1.y * v2.y;
    }

    /**
     * Calculate cross product magnitude (2D)
     */
    static crossProduct(v1: Vector2D, v2: Vector2D): number {
      return v1.x * v2.y - v1.y * v2.x;
    }

    /**
     * Scale a vector by a scalar value
     */
    static scale(v: Vector2D, scalar: number): Vector2D {
      return { x: v.x * scalar, y: v.y * scalar };
    }

    /**
     * Add two vectors
     */
    static add(v1: Vector2D, v2: Vector2D): Vector2D {
      return { x: v1.x + v2.x, y: v1.y + v2.y };
    }

    /**
     * Subtract two vectors (v1 - v2)
     */
    static subtract(v1: Vector2D, v2: Vector2D): Vector2D {
      return { x: v1.x - v2.x, y: v1.y - v2.y };
    }

    /**
     * Normalize a vector to unit length
     */
    static normalize(v: Vector2D): Vector2D {
      const length = Math.sqrt(v.x * v.x + v.y * v.y);
      if (length === 0) return { x: 0, y: 0 };
      return { x: v.x / length, y: v.y / length };
    }

    /**
     * Calculate midpoint between two points
     */
    static midpoint(p1: Point2D, p2: Point2D): Point2D {
      return {
        x: (p1.x + p2.x) / 2,
        y: (p1.y + p2.y) / 2
      };
    }

    /**
     * Check if a point is inside a polygon (ray casting algorithm)
     */
    static isPointInPolygon(point: Point2D, polygon: Point2D[]): boolean {
      let inside = false;
      for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const xi = polygon[i].x, yi = polygon[i].y;
        const xj = polygon[j].x, yj = polygon[j].y;

        const intersect = ((yi > point.y) !== (yj > point.y)) &&
          (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi);
        
        if (intersect) inside = !inside;
      }
      return inside;
    }

    /**
     * Calculate angle between two vectors in radians
     */
    static angleBetween(v1: Vector2D, v2: Vector2D): number {
      const dot = this.dotProduct(v1, v2);
      const length1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y);
      const length2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y);
      return Math.acos(dot / (length1 * length2));
    }

    /**
     * Rotate a point around origin by angle (in radians)
     */
    static rotate(point: Point2D, angle: number, origin: Point2D = { x: 0, y: 0 }): Point2D {
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      const dx = point.x - origin.x;
      const dy = point.y - origin.y;
      return {
        x: origin.x + dx * cos - dy * sin,
        y: origin.y + dx * sin + dy * cos
      };
    }

    /**
     * Calculate bounding box of points
     */
    static boundingBox(points: Point2D[]): { min: Point2D; max: Point2D } {
      if (points.length === 0) {
        return { min: { x: 0, y: 0 }, max: { x: 0, y: 0 } };
      }

      let minX = points[0].x;
      let minY = points[0].y;
      let maxX = points[0].x;
      let maxY = points[0].y;

      points.forEach(p => {
        minX = Math.min(minX, p.x);
        minY = Math.min(minY, p.y);
        maxX = Math.max(maxX, p.x);
        maxY = Math.max(maxY, p.y);
      });

      return {
        min: { x: minX, y: minY },
        max: { x: maxX, y: maxY }
      };
    }
  }
}
