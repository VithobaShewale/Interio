/// <reference path="../core/dimensioning.ts" />
/// <reference path="../model/half_edge.ts" />

/**
 * Dimension Renderer Module
 * 
 * Handles all dimension line rendering logic for the floorplanner view.
 * Separates measurement display concerns from the main view rendering.
 */
module BP3D.Floorplanner {
  
  export interface DimensionStyle {
    lineColor: string;
    lineWidth: number;
    textColor: string;
    textFont: string;
    backgroundColor: string;
    offset: number;
    tickLength: number;
    extensionOverhang: number;
  }

  export class DimensionRenderer {
    private style: DimensionStyle;

    constructor(
      private context: CanvasRenderingContext2D,
      private viewmodel: any,
      style?: any
    ) {
      // Default style
      this.style = {
        lineColor: '#333333',
        lineWidth: 1,
        textColor: '#000000',
        textFont: '12px Arial',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        offset: 100,
        tickLength: 10,
        extensionOverhang: 15
      };
      
      // Apply custom style if provided
      if (style) {
        for (var key in style) {
          if (style.hasOwnProperty(key)) {
            this.style[key] = style[key];
          }
        }
      }
    }

    /**
     * Draw dimension for an edge
     */
    public drawEdgeDimension(edge: Model.HalfEdge): void {
      const length = edge.interiorDistance();
      if (length < 60) {
        return; // Too short to display dimensions
      }

      const start = edge.interiorStart();
      const end = edge.interiorEnd();
      const normal = this.calculateOutwardNormal(edge);
      const wallDir = this.calculateWallDirection(start, end);

      // Calculate dimension line positions
      const dimStart = {
        x: start.x + normal.x * this.style.offset,
        y: start.y + normal.y * this.style.offset
      };

      const dimEnd = {
        x: end.x + normal.x * this.style.offset,
        y: end.y + normal.y * this.style.offset
      };

      // Draw extension lines
      this.drawExtensionLines(start, end, normal);

      // Draw main dimension line
      this.drawLine(dimStart.x, dimStart.y, dimEnd.x, dimEnd.y);

      // Draw tick marks
      this.drawTick(dimStart.x, dimStart.y, wallDir.x, wallDir.y);
      this.drawTick(dimEnd.x, dimEnd.y, wallDir.x, wallDir.y);

      // Draw dimension text
      const center = {
        x: (dimStart.x + dimEnd.x) / 2,
        y: (dimStart.y + dimEnd.y) / 2
      };
      const dimensionText = Core.Dimensioning.cmToMeasure(length);
      this.drawText(dimensionText, center.x, center.y);
    }

    /**
     * Calculate outward normal for a wall edge
     * Uses room center to determine which direction is "out"
     */
    private calculateOutwardNormal(edge: Model.HalfEdge): { x: number; y: number } {
      const start = edge.interiorStart();
      const end = edge.interiorEnd();

      const dx = end.x - start.x;
      const dy = end.y - start.y;
      const length = Math.sqrt(dx * dx + dy * dy);

      // Perpendicular normal (90 degree rotation)
      let normalX = -dy / length;
      let normalY = dx / length;

      // Get all room corners by traversing the edge chain
      const roomCorners: Array<{x: number, y: number}> = [];
      let currentEdge = edge;
      const maxIterations = 100; // Safety limit
      let iterations = 0;
      
      do {
        roomCorners.push(currentEdge.interiorStart());
        currentEdge = currentEdge.next;
        iterations++;
      } while (currentEdge && currentEdge !== edge && iterations < maxIterations);

      // Calculate room center
      let centerX = 0;
      let centerY = 0;
      roomCorners.forEach((corner) => {
        centerX += corner.x;
        centerY += corner.y;
      });
      centerX /= roomCorners.length;
      centerY /= roomCorners.length;

      // Vector from center to wall midpoint
      const midX = (start.x + end.x) / 2;
      const midY = (start.y + end.y) / 2;
      const toCenterX = midX - centerX;
      const toCenterY = midY - centerY;

      // Check if normal points away from center
      const dotProduct = normalX * toCenterX + normalY * toCenterY;

      if (dotProduct < 0) {
        // Normal points inward, flip it
        normalX = -normalX;
        normalY = -normalY;
      }

      return { x: normalX, y: normalY };
    }

    /**
     * Calculate normalized wall direction
     */
    private calculateWallDirection(
      start: { x: number; y: number },
      end: { x: number; y: number }
    ): { x: number; y: number } {
      const dx = end.x - start.x;
      const dy = end.y - start.y;
      const length = Math.sqrt(dx * dx + dy * dy);
      return { x: dx / length, y: dy / length };
    }

    /**
     * Draw extension lines from wall to dimension line
     */
    private drawExtensionLines(
      start: { x: number; y: number },
      end: { x: number; y: number },
      normal: { x: number; y: number }
    ): void {
      const extOffset = this.style.offset + this.style.extensionOverhang;

      const extStart = {
        x: start.x + normal.x * extOffset,
        y: start.y + normal.y * extOffset
      };

      const extEnd = {
        x: end.x + normal.x * extOffset,
        y: end.y + normal.y * extOffset
      };

      this.context.strokeStyle = this.style.lineColor;
      this.context.lineWidth = this.style.lineWidth;
      this.context.setLineDash([2, 2]); // Dashed line

      this.drawLine(start.x, start.y, extStart.x, extStart.y);
      this.drawLine(end.x, end.y, extEnd.x, extEnd.y);

      this.context.setLineDash([]); // Reset to solid
    }

    /**
     * Draw a line with screen coordinate conversion
     */
    private drawLine(x1: number, y1: number, x2: number, y2: number): void {
      const screenX1 = this.viewmodel.convertX(x1);
      const screenY1 = this.viewmodel.convertY(y1);
      const screenX2 = this.viewmodel.convertX(x2);
      const screenY2 = this.viewmodel.convertY(y2);

      this.context.beginPath();
      this.context.moveTo(screenX1, screenY1);
      this.context.lineTo(screenX2, screenY2);
      this.context.stroke();
    }

    /**
     * Draw tick mark perpendicular to dimension line
     */
    private drawTick(
      x: number,
      y: number,
      dirX: number,
      dirY: number
    ): void {
      // Perpendicular to wall direction
      const perpX = -dirY;
      const perpY = dirX;

      const x1 = x - perpX * this.style.tickLength;
      const y1 = y - perpY * this.style.tickLength;
      const x2 = x + perpX * this.style.tickLength;
      const y2 = y + perpY * this.style.tickLength;

      this.context.strokeStyle = this.style.lineColor;
      this.context.lineWidth = this.style.lineWidth;
      this.drawLine(x1, y1, x2, y2);
    }

    /**
     * Draw dimension text with background
     */
    private drawText(text: string, x: number, y: number): void {
      const screenX = this.viewmodel.convertX(x);
      const screenY = this.viewmodel.convertY(y);

      this.context.font = this.style.textFont;
      this.context.textAlign = 'center';
      this.context.textBaseline = 'middle';

      // Measure text for background
      const metrics = this.context.measureText(text);
      const padding = 4;
      const bgWidth = metrics.width + padding * 2;
      const bgHeight = 16;

      // Draw background
      this.context.fillStyle = this.style.backgroundColor;
      this.context.fillRect(
        screenX - bgWidth / 2,
        screenY - bgHeight / 2,
        bgWidth,
        bgHeight
      );

      // Draw text
      this.context.strokeStyle = this.style.textColor;
      this.context.fillStyle = this.style.textColor;
      this.context.lineWidth = 0.5;
      this.context.strokeText(text, screenX, screenY);
      this.context.fillText(text, screenX, screenY);
    }

    /**
     * Update style properties
     */
    public updateStyle(style: any): void {
      for (var key in style) {
        if (style.hasOwnProperty(key)) {
          this.style[key] = style[key];
        }
      }
    }

    /**
     * Get current style
     */
    public getStyle(): DimensionStyle {
      var styleCopy: DimensionStyle = {
        lineColor: this.style.lineColor,
        lineWidth: this.style.lineWidth,
        textColor: this.style.textColor,
        textFont: this.style.textFont,
        backgroundColor: this.style.backgroundColor,
        offset: this.style.offset,
        tickLength: this.style.tickLength,
        extensionOverhang: this.style.extensionOverhang
      };
      return styleCopy;
    }
  }
}
