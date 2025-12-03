/// <reference path="geometry_utils.ts" />

/**
 * SVG Path Parser Module
 * 
 * Provides utilities for parsing SVG path data and converting it to
 * Blueprint3D coordinate systems.
 */
module BP3D.Core {

  export interface PathPoint extends Point2D {
    command?: string; // M, L, C, etc.
  }

  export interface SVGTransformOptions {
    scale?: number;
    offsetX?: number;
    offsetY?: number;
    centerX?: number;
    centerY?: number;
    ensureCounterClockwise?: boolean;
  }

  export class SVGPathParser {

    /**
     * Parse SVG path string to array of points
     * Supports M (moveto) and L (lineto) commands
     */
    static parse(pathData: string): PathPoint[] {
      const points: PathPoint[] = [];
      
      // Match M and L commands with their coordinates
      const commandRegex = /([ML])\s*([\d.]+)\s*,\s*([\d.]+)/gi;
      let match;

      while ((match = commandRegex.exec(pathData)) !== null) {
        const command = match[1].toUpperCase();
        const x = parseFloat(match[2]);
        const y = parseFloat(match[3]);

        if (!isNaN(x) && !isNaN(y)) {
          points.push({ x, y, command });
        }
      }

      return points;
    }

    /**
     * Parse SVG path and extract only coordinate pairs (no commands)
     */
    static parseCoordinates(pathData: string): Point2D[] {
      const pathPoints = this.parse(pathData);
      return pathPoints.map(p => ({ x: p.x, y: p.y }));
    }

    /**
     * Transform SVG coordinates to Blueprint3D coordinate system
     */
    static transform(
      points: Point2D[],
      options: SVGTransformOptions = {}
    ): Point2D[] {
      const {
        scale = 1,
        offsetX = 0,
        offsetY = 0,
        centerX = 0,
        centerY = 0,
        ensureCounterClockwise = true
      } = options;

      // Apply transformation
      let transformed = points.map(p => ({
        x: (p.x - centerX) * scale + offsetX,
        y: (p.y - centerY) * scale + offsetY
      }));

      // Ensure counter-clockwise if requested
      if (ensureCounterClockwise) {
        transformed = GeometryUtils.ensureCounterClockwise(transformed);
      }

      return transformed;
    }

    /**
     * Parse and transform SVG path in one step
     */
    static parseAndTransform(
      pathData: string,
      options: SVGTransformOptions = {}
    ): Point2D[] {
      const points = this.parseCoordinates(pathData);
      return this.transform(points, options);
    }

    /**
     * Convert SVG viewBox coordinates to Blueprint3D room coordinates
     * Typical SVG viewBox is 0-60, Blueprint3D uses centimeters
     */
    static svgToBlueprint3D(
      points: Point2D[],
      svgViewBoxSize: number = 60,
      roomScale: number = 15
    ): Point2D[] {
      const center = svgViewBoxSize / 2;
      return this.transform(points, {
        scale: roomScale,
        centerX: center,
        centerY: center,
        ensureCounterClockwise: true
      });
    }

    /**
     * Validate SVG path data
     */
    static validate(pathData: string): {
      valid: boolean;
      errors: string[];
      pointCount: number;
    } {
      const errors: string[] = [];
      const points = this.parseCoordinates(pathData);

      if (!pathData || pathData.trim() === '') {
        errors.push('Path data is empty');
      }

      if (points.length < 3) {
        errors.push(`Insufficient points: ${points.length} (minimum 3 required)`);
      }

      // Check for duplicate consecutive points
      for (let i = 1; i < points.length; i++) {
        if (points[i].x === points[i-1].x && points[i].y === points[i-1].y) {
          errors.push(`Duplicate point at index ${i}`);
        }
      }

      return {
        valid: errors.length === 0,
        errors,
        pointCount: points.length
      };
    }

    /**
     * Generate SVG path string from points
     */
    static pointsToPath(points: Point2D[]): string {
      if (points.length === 0) return '';

      const pathCommands: string[] = [];
      
      // Start with Move command
      pathCommands.push(`M${points[0].x},${points[0].y}`);
      
      // Add Line commands for remaining points
      for (let i = 1; i < points.length; i++) {
        pathCommands.push(`L${points[i].x},${points[i].y}`);
      }
      
      // Close path
      pathCommands.push('Z');
      
      return pathCommands.join(' ');
    }

    /**
     * Calculate path bounds
     */
    static getPathBounds(pathData: string): { min: Point2D; max: Point2D; width: number; height: number } {
      const points = this.parseCoordinates(pathData);
      const bbox = GeometryUtils.boundingBox(points);
      
      return {
        min: bbox.min,
        max: bbox.max,
        width: bbox.max.x - bbox.min.x,
        height: bbox.max.y - bbox.min.y
      };
    }

    /**
     * Normalize path to fit within specified bounds
     */
    static normalizePath(
      pathData: string,
      targetWidth: number,
      targetHeight: number,
      maintainAspectRatio: boolean = true
    ): Point2D[] {
      const points = this.parseCoordinates(pathData);
      const bbox = GeometryUtils.boundingBox(points);
      
      const currentWidth = bbox.max.x - bbox.min.x;
      const currentHeight = bbox.max.y - bbox.min.y;
      
      let scaleX = targetWidth / currentWidth;
      let scaleY = targetHeight / currentHeight;
      
      if (maintainAspectRatio) {
        const scale = Math.min(scaleX, scaleY);
        scaleX = scale;
        scaleY = scale;
      }
      
      return points.map(p => ({
        x: (p.x - bbox.min.x) * scaleX,
        y: (p.y - bbox.min.y) * scaleY
      }));
    }
  }
}
