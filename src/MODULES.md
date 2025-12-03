# Blueprint3D Modular Architecture

This document describes the refactored modular architecture that separates concerns and provides reusable utilities.

## New Modules

### 1. Core Utilities

#### `src/core/geometry_utils.ts`
**Purpose**: Provides reusable geometric calculations and vector operations

**Key Functions**:
- `calculatePolygonArea()` - Shoelace formula for signed area
- `isCounterClockwise()` - Determine polygon winding order
- `ensureCounterClockwise()` - Normalize polygon orientation
- `calculateCentroid()` - Find geometric center
- `distance()`, `direction()` - Point calculations
- `perpendicular()`, `dotProduct()`, `crossProduct()` - Vector operations
- `rotate()`, `midpoint()` - Transformations
- `isPointInPolygon()` - Ray casting algorithm
- `boundingBox()` - Calculate min/max bounds

**Usage**:
```typescript
const points = [{x: 0, y: 0}, {x: 100, y: 0}, {x: 100, y: 100}];
const center = BP3D.Core.GeometryUtils.calculateCentroid(points);
const ccw = BP3D.Core.GeometryUtils.ensureCounterClockwise(points);
```

#### `src/core/svg_path_parser.ts`
**Purpose**: Parse and transform SVG path data to Blueprint3D coordinates

**Key Functions**:
- `parse()` - Parse SVG path string to points
- `parseCoordinates()` - Extract coordinate pairs
- `transform()` - Apply scale/offset transformations
- `svgToBlueprint3D()` - Convert SVG viewBox to room coordinates
- `validate()` - Validate path data integrity
- `pointsToPath()` - Generate SVG path from points
- `getPathBounds()` - Calculate path bounding box
- `normalizePath()` - Fit path to target dimensions

**Usage**:
```typescript
const svgPath = 'M10,10 L50,10 L50,50 L10,50 Z';
const points = BP3D.Core.SVGPathParser.parseAndTransform(svgPath, {
  scale: 15,
  centerX: 30,
  centerY: 30,
  ensureCounterClockwise: true
});
```

### 2. Floorplanner Rendering

#### `src/floorplanner/dimension_renderer.ts`
**Purpose**: Encapsulates all dimension line rendering logic

**Features**:
- Configurable style (colors, fonts, offsets)
- Automatic outward normal calculation using room center
- Extension lines, tick marks, and text labels
- Screen coordinate conversion

**Key Methods**:
- `drawEdgeDimension()` - Draw complete dimension for wall edge
- `calculateOutwardNormal()` - Smart normal direction (always points outward)
- `updateStyle()` - Change rendering style dynamically

**Usage**:
```typescript
const dimensionRenderer = new BP3D.Floorplanner.DimensionRenderer(
  context,
  viewmodel,
  {
    offset: 100,
    lineColor: '#333',
    textColor: '#000'
  }
);

dimensionRenderer.drawEdgeDimension(wall.frontEdge);
```

## Integration

### Updated Files

#### `src/floorplanner/floorplanner_view.ts`
- Now uses `DimensionRenderer` instead of inline dimension drawing
- Cleaner `drawWallLabels()` method delegates to dimension renderer
- Reduced code duplication

**Before**:
```typescript
private drawWallLabels(wall: Model.Wall) {
  if (!this.showDimensions) return;
  // Complex inline dimension drawing logic...
  this.drawEdgeLabel(wall.frontEdge);
}
```

**After**:
```typescript
private drawWallLabels(wall: Model.Wall) {
  if (!this.showDimensions) return;
  this.dimensionRenderer.drawEdgeDimension(wall.frontEdge);
  this.dimensionRenderer.drawEdgeDimension(wall.backEdge);
}
```

#### `react-app/src/components/layout/Sidebar.tsx`
- Can now leverage `GeometryUtils` and `SVGPathParser` for preset handling
- Current implementation uses inline functions but can be refactored to use utilities

## Benefits

### 1. **Separation of Concerns**
- Geometry calculations isolated from rendering
- SVG parsing separate from coordinate transformation
- Dimension rendering encapsulated in dedicated class

### 2. **Reusability**
- Geometry utilities can be used across entire codebase
- SVG parser works for any path data
- Dimension renderer configurable for different styles

### 3. **Testability**
- Pure functions in `GeometryUtils` easy to unit test
- `SVGPathParser` validators ensure data integrity
- `DimensionRenderer` can be tested with mock context

### 4. **Maintainability**
- Changes to dimension rendering only affect one file
- Geometry calculations have single source of truth
- Clear module boundaries and responsibilities

### 5. **Extensibility**
- Easy to add new geometric operations
- Simple to support additional SVG path commands
- Dimension renderer style can be customized per use case

## Future Enhancements

### Planned Modules

1. **`src/core/coordinate_system.ts`**
   - Coordinate transformation between screen/world/SVG spaces
   - View matrix calculations
   - Zoom and pan utilities

2. **`src/floorplanner/grid_renderer.ts`**
   - Grid drawing logic separated from main view
   - Configurable grid styles and snapping

3. **`src/floorplanner/room_renderer.ts`**
   - Room fill and border rendering
   - Room label positioning
   - Room highlighting effects

4. **`src/floorplanner/corner_renderer.ts`**
   - Corner visual representation
   - Hover and selection states
   - Corner snapping indicators

5. **`src/model/preset_manager.ts`**
   - Room preset loading and validation
   - Preset application to floorplan
   - Custom preset creation

## Migration Guide

### For New Features
When adding functionality, consider if it belongs in a utility module:

**Decision Tree**:
- **Pure calculation?** → `core/geometry_utils.ts` or new `core/*_utils.ts`
- **Coordinate parsing?** → `core/svg_path_parser.ts` or similar parser
- **Rendering logic?** → `floorplanner/*_renderer.ts`
- **Model manipulation?** → `model/*_manager.ts`

### For Existing Code
Gradually refactor to use new utilities:

1. Identify duplicate geometry calculations → use `GeometryUtils`
2. Find inline SVG parsing → replace with `SVGPathParser`
3. Locate dimension drawing → delegate to `DimensionRenderer`

## Performance Considerations

- **Geometry calculations**: Optimized algorithms (O(n) for most operations)
- **Caching**: Renderer can cache frequently used values
- **Lazy evaluation**: Parse SVG paths only when needed

## Documentation

Each module includes:
- JSDoc comments for all public methods
- Type definitions for parameters and return values
- Usage examples in code comments
- Purpose and responsibility clearly stated

## Testing Strategy

### Unit Tests (Recommended)
```typescript
// Example test for GeometryUtils
describe('GeometryUtils', () => {
  it('should calculate correct polygon area', () => {
    const square = [{x:0,y:0}, {x:10,y:0}, {x:10,y:10}, {x:0,y:10}];
    expect(GeometryUtils.calculatePolygonArea(square)).toBe(100);
  });
  
  it('should reverse clockwise polygons', () => {
    const clockwise = [{x:0,y:0}, {x:0,y:10}, {x:10,y:10}, {x:10,y:0}];
    const result = GeometryUtils.ensureCounterClockwise(clockwise);
    expect(result[0]).toEqual({x:10,y:0});
  });
});
```

## Version History

- **v1.1.0** (2025-11-29): Initial modular architecture
  - Added `geometry_utils.ts`
  - Added `svg_path_parser.ts`
  - Added `dimension_renderer.ts`
  - Refactored `floorplanner_view.ts` to use new modules
