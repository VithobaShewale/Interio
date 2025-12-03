/// <reference path="../../lib/jQuery.d.ts" />
/// <reference path="../core/configuration.ts" />
/// <reference path="../core/dimensioning.ts" />
/// <reference path="../core/utils.ts" />
/// <reference path="../model/floorplan.ts" />
/// <reference path="../model/half_edge.ts" />
/// <reference path="../model/model.ts" />
/// <reference path="../model/wall.ts" />
/// <reference path="floorplanner.ts" />
/// <reference path="dimension_renderer.ts" />

module BP3D.Floorplanner {
  /** */
  export const floorplannerModes = {
    MOVE: 0,
    DRAW: 1,
    DELETE: 2
  };

  // grid parameters
  const gridSpacing = 20; // pixels
  const gridWidth = 1;
  const gridColor = "#f1f1f1";

  // room config
  const roomColor = "#e8dcc4"; // Beige/tan color like architectural drawings
  const roomLabelColor = "#666666";
  const roomLabelBgColor = "rgba(255, 255, 255, 0.9)";

  // wall config
  const wallWidth = 8;
  const wallWidthHover = 8;  // Same as wallWidth for consistent edge display
  const wallColor = "#5a5a5a" // Darker gray for walls
  const wallColorHover = "#008cba"
  const edgeColor = "#2a2a2a" // Dark gray for wall edges
  const edgeColorHover = "#008cba"
  const edgeWidth = 2

  const deleteColor = "#ff0000";

  // corner config
  const cornerRadius = 0
  const cornerRadiusHover = 7
  const cornerColor = "#cccccc"
  const cornerColorHover = "#008cba"

  // item config
  const itemColor = "#b0b0b0"; // Light gray for furniture
  const itemBorderColor = "#404040"; // Dark gray border
  const itemBorderWidth = 1;

  /**
   * The View to be used by a Floorplanner to render in/interact with.
   */
  export class FloorplannerView {

    /** The canvas element. */
    private canvasElement: HTMLCanvasElement;

    /** The 2D context. */
    private context;

    /** Whether to show dimension lines */
    public showDimensions: boolean = true;

    /** Dimension renderer instance */
    private dimensionRenderer: DimensionRenderer;

    /** */
    constructor(private floorplan: Model.Floorplan, private viewmodel: Floorplanner, private canvas: string, private model?: Model.Model) {
      this.canvasElement = <HTMLCanvasElement>document.getElementById(canvas);
      this.context = this.canvasElement.getContext('2d');

      // Initialize dimension renderer
      this.dimensionRenderer = new DimensionRenderer(this.context, this.viewmodel, {
        offset: 60,
        lineColor: '#333333',
        textColor: '#000000'
      });

      var scope = this;
      $(window).resize(() => {
        scope.handleWindowResize();
      });
      this.handleWindowResize();
    }

    /** Get items from the scene */
    private getItems() {
      try {
        if (this.model && this.model.scene) {
          return this.model.scene.getItems();
        }
      } catch (e) {
        console.warn('Could not get items:', e);
      }
      return [];
    }

    /** */
    public handleWindowResize() {
      var canvasSel = $("#" + this.canvas);
      var parent = canvasSel.parent();
      canvasSel.height(parent.innerHeight());
      canvasSel.width(parent.innerWidth());
      this.canvasElement.height = parent.innerHeight();
      this.canvasElement.width = parent.innerWidth();
      this.draw();
    }

    /** */
    public draw() {
      this.context.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);

      this.drawGrid();

      this.floorplan.getRooms().forEach((room) => {
        this.drawRoom(room);
      })

      this.floorplan.getWalls().forEach((wall) => {
        this.drawWall(wall);
      });

      this.floorplan.getCorners().forEach((corner) => {
        this.drawCorner(corner);
      });

      // Draw items (furniture)
      var items = this.getItems();
      items.forEach((item) => {
        this.drawItem(item);
      });

      if (this.viewmodel.mode == floorplannerModes.DRAW) {
        this.drawTarget(this.viewmodel.targetX, this.viewmodel.targetY, this.viewmodel.lastNode);
      }

      this.floorplan.getWalls().forEach((wall) => {
        this.drawWallLabels(wall);
      });
    }

    /** */
    private drawWallLabels(wall: Model.Wall) {
      if (!this.showDimensions) return;
      
      // Use dimension renderer for both edges
      if (wall.frontEdge) {
        this.dimensionRenderer.drawEdgeDimension(wall.frontEdge);
      }
      if (wall.backEdge) {
        this.dimensionRenderer.drawEdgeDimension(wall.backEdge);
      }
    }

    /** */
    private drawWall(wall: Model.Wall) {
      var hover = (wall === this.viewmodel.activeWall);
      var color = wallColor;
      if (hover && this.viewmodel.mode == floorplannerModes.DELETE) {
        color = deleteColor;
      } else if (hover) {
        color = wallColorHover;
      }
      this.drawLine(
        this.viewmodel.convertX(wall.getStartX()),
        this.viewmodel.convertY(wall.getStartY()),
        this.viewmodel.convertX(wall.getEndX()),
        this.viewmodel.convertY(wall.getEndY()),
        hover ? wallWidthHover : wallWidth,
        color
      );
      if (wall.frontEdge) {
        this.drawEdge(wall.frontEdge, hover);
      }
      if (wall.backEdge) {
        this.drawEdge(wall.backEdge, hover);
      }
    }

    /** */
    private drawEdge(edge: Model.HalfEdge, hover) {
      var color = edgeColor;
      if (hover && this.viewmodel.mode == floorplannerModes.DELETE) {
        color = deleteColor;
      } else if (hover) {
        color = edgeColorHover;
      }
      var corners = edge.corners();

      var scope = this;
      this.drawPolygon(
        Core.Utils.map(corners, function (corner) {
          return scope.viewmodel.convertX(corner.x);
        }),
        Core.Utils.map(corners, function (corner) {
          return scope.viewmodel.convertY(corner.y);
        }),
        false,
        null,
        true,
        color,
        edgeWidth
      );
    }

    /** */
    private drawRoom(room: Model.Room) {
      var scope = this;
      this.drawPolygon(
        Core.Utils.map(room.corners, (corner: Model.Corner) => {
          return scope.viewmodel.convertX(corner.x);
        }),
        Core.Utils.map(room.corners, (corner: Model.Corner) =>  {
          return scope.viewmodel.convertY(corner.y);
        }),
        true,
        roomColor
      );
    }

    /** */
    private drawCorner(corner: Model.Corner) {
      var hover = (corner === this.viewmodel.activeCorner);
      var color = cornerColor;
      if (hover && this.viewmodel.mode == floorplannerModes.DELETE) {
        color = deleteColor;
      } else if (hover) {
        color = cornerColorHover;
      }
      this.drawCircle(
        this.viewmodel.convertX(corner.x),
        this.viewmodel.convertY(corner.y),
        hover ? cornerRadiusHover : cornerRadius,
        color
      );
    }

    /** */
    private drawTarget(x: number, y: number, lastNode) {
      this.drawCircle(
        this.viewmodel.convertX(x),
        this.viewmodel.convertY(y),
        cornerRadiusHover,
        cornerColorHover
      );
      if (this.viewmodel.lastNode) {
        this.drawLine(
          this.viewmodel.convertX(lastNode.x),
          this.viewmodel.convertY(lastNode.y),
          this.viewmodel.convertX(x),
          this.viewmodel.convertY(y),
          wallWidthHover,
          wallColorHover
        );
      }
    }

    /** Draw an item (furniture) */
    private drawItem(item: any) {
      try {
        // Get item position in 3D space
        var pos = item.position;
        if (!pos) return;

        // Check if this item is active
        var isActive = (item === this.viewmodel.activeItem);

        // Convert 3D position to 2D canvas coordinates
        var x = this.viewmodel.convertX(pos.x);
        var y = this.viewmodel.convertY(pos.z);

        // Get item bounding box or use default size
        var halfSizeX = 15; // default size in pixels
        var halfSizeZ = 15;
        if (item.halfSize) {
          // Get the correct scale factor from the floorplanner
          var pixelsPerCm = this.viewmodel.getPixelsPerCm();
          // Calculate half-size in pixels using the proper scale
          // item.halfSize is in cm, multiply by pixelsPerCm to get pixels
          halfSizeX = item.halfSize.x * pixelsPerCm;
          halfSizeZ = item.halfSize.z * pixelsPerCm;
        }

        // Draw item as a rectangle with rotation
        this.context.save();
        this.context.translate(x, y);
        
        // Apply rotation if item has one
        if (item.rotation && item.rotation.y) {
          this.context.rotate(-item.rotation.y); // negative because canvas Y is inverted
        }

        // Draw filled rectangle with semi-transparency
        this.context.fillStyle = isActive ? "#008cba" : itemColor;
        this.context.globalAlpha = isActive ? 0.8 : 0.7;
        this.context.fillRect(-halfSizeX, -halfSizeZ, halfSizeX * 2, halfSizeZ * 2);
        this.context.globalAlpha = 1.0;

        // Draw border
        this.context.strokeStyle = itemBorderColor;
        this.context.lineWidth = itemBorderWidth;
        this.context.strokeRect(-halfSizeX, -halfSizeZ, halfSizeX * 2, halfSizeZ * 2);

        // Draw direction indicator (small line showing front)
        this.context.strokeStyle = "#ffffff";
        this.context.lineWidth = 3;
        this.context.beginPath();
        this.context.moveTo(0, 0);
        this.context.lineTo(0, -halfSizeZ);
        this.context.stroke();

        // Draw item name if available
        if (item.metadata && item.metadata.itemName) {
          this.context.fillStyle = "#ffffff";
          this.context.font = "12px Arial";
          this.context.textAlign = "center";
          this.context.textBaseline = "middle";
          
          // Draw text background for better readability
          var textWidth = this.context.measureText(item.metadata.itemName).width;
          this.context.fillStyle = "rgba(0, 0, 0, 0.7)";
          this.context.fillRect(-textWidth / 2 - 4, -8, textWidth + 8, 16);
          
          // Draw text
          this.context.fillStyle = "#ffffff";
          this.context.fillText(item.metadata.itemName, 0, 0);
        }

        this.context.restore();
      } catch (e) {
        console.warn('Error drawing item:', e);
      }
    }

    /** */
    private drawLine(startX: number, startY: number, endX: number, endY: number, width: number, color) {
      // width is an integer
      // color is a hex string, i.e. #ff0000
      this.context.beginPath();
      this.context.moveTo(startX, startY);
      this.context.lineTo(endX, endY);
      this.context.lineWidth = width;
      this.context.strokeStyle = color;
      this.context.lineCap = "round";  // Smooth circular ends at corners
      this.context.lineJoin = "round"; // Smooth joins at corners
      this.context.stroke();
    }

    /** */
    private drawPolygon(xArr, yArr, fill, fillColor, stroke?, strokeColor?, strokeWidth?) {
      // fillColor is a hex string, i.e. #ff0000
      fill = fill || false;
      stroke = stroke || false;
      this.context.beginPath();
      this.context.moveTo(xArr[0], yArr[0]);
      for (var i = 1; i < xArr.length; i++) {
        this.context.lineTo(xArr[i], yArr[i]);
      }
      this.context.closePath();
      if (fill) {
        this.context.fillStyle = fillColor;
        this.context.fill();
      }
      if (stroke) {
        this.context.lineWidth = strokeWidth;
        this.context.strokeStyle = strokeColor;
        this.context.lineJoin = "round";  // Smooth rounded corners
        this.context.lineCap = "round";   // Smooth line ends
        this.context.stroke();
      }
    }

    /** */
    private drawCircle(centerX, centerY, radius, fillColor) {
      this.context.beginPath();
      this.context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
      this.context.fillStyle = fillColor;
      this.context.fill();
    }

    /** returns n where -gridSize/2 < n <= gridSize/2  */
    private calculateGridOffset(n) {
      if (n >= 0) {
        return (n + gridSpacing / 2.0) % gridSpacing - gridSpacing / 2.0;
      } else {
        return (n - gridSpacing / 2.0) % gridSpacing + gridSpacing / 2.0;
      }
    }

    /** */
    private drawGrid() {
      var offsetX = this.calculateGridOffset(-this.viewmodel.originX);
      var offsetY = this.calculateGridOffset(-this.viewmodel.originY);
      var width = this.canvasElement.width;
      var height = this.canvasElement.height;
      for (var x = 0; x <= (width / gridSpacing); x++) {
        this.drawLine(gridSpacing * x + offsetX, 0, gridSpacing * x + offsetX, height, gridWidth, gridColor);
      }
      for (var y = 0; y <= (height / gridSpacing); y++) {
        this.drawLine(0, gridSpacing * y + offsetY, width, gridSpacing * y + offsetY, gridWidth, gridColor);
      }
    }
  }
}