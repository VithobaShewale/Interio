# Blueprint3D Coding Agent Instructions

## Project Overview
Blueprint3D is a Three.js-based 3D interior design application with two parallel implementations:
- **Legacy**: TypeScript modules (`src/`) compiled with Grunt → used in vanilla JS example (`example/`)
- **React App**: Modern React/TypeScript app (`react-app/`) that loads compiled `blueprint3d.js` via script tag

**Key architectural decision**: React app uses the ORIGINAL compiled library (not ES6 modules) due to rendering/compatibility issues encountered during migration. Migrated TS modules exist in `react-app/src/core/blueprint3d/` but are NOT active.

## Critical Build & Run Commands

### Legacy Library Build
```bash
# From root directory
npm install
grunt              # Compiles src/ → dist/blueprint3d.js + copies to example/js/ and react-app/public/
grunt watch        # Auto-recompile on src/ changes
```

### React App
```bash
cd react-app
npm install
npm start          # Runs on http://localhost:3000
npm run build      # Production build
```

**Before running React app**: Must run `grunt` from root to generate `blueprint3d.js` library first.

## Architecture Patterns

### Module System (Legacy `src/`)
Uses TypeScript **module pattern** (not ES6):
```typescript
/// <reference path="other_file.ts" />  // Order matters for dependencies
module BP3D.Model {
  export class Floorplan { ... }
}
```
- Files use `/// <reference path>` for dependencies (sequence critical to avoid bootstrap issues)
- Compiled into single `blueprint3d.js` with all namespaces
- Global `BP3D` namespace accessed via `window.BP3D` in React

### React Integration Pattern
```typescript
// react-app/src/hooks/useBlueprint3D.ts
const bp3d = new (window as any).BP3D.Blueprint3d({
  floorplannerElement: 'floorplanner-canvas',
  threeElement: 'viewer',
  textureDir: '/rooms/textures/'
});
```
- DOM elements (`#floorplanner-canvas`, `#viewer`) must exist before initialization
- Uses polling interval to wait for library load + DOM ready
- `useBlueprint3D` hook manages lifecycle, view modes (2D/3D/Wall), auto-save

### Event System
jQuery callbacks pattern throughout legacy code:
```typescript
private roomLoadedCallbacks = $.Callbacks();
// Fire: this.roomLoadedCallbacks.fire()
// Subscribe: model.roomLoadedCallbacks.add(callback)
```
React components subscribe to these callbacks in `useEffect` hooks.

### Data Model Flow
```
BP3D.Model.Model
├── floorplan: Floorplan (2D walls, corners, rooms via half-edge data structure)
└── scene: Scene (3D items, textures)
    
BP3D.Floorplanner (2D editor)
└── modes: 0=Move, 1=Draw, 2=Delete walls

BP3D.Three.Main (3D renderer)
└── controller: handles item selection/movement
```

## File Naming Conventions (Legacy)
- Lowercase with underscores: `HalfEdge` → `half_edge.ts`
- 2 spaces (no tabs)
- Follows Google JavaScript Style Guide

## React App Structure
```
react-app/src/
├── components/
│   ├── common/        # Reusable: LoadingModal, ImportExportDialog
│   ├── features/      # Feature-specific: FloorPlanner, ThreeViewer, ItemPropertiesPanel
│   └── layout/        # App structure: Toolbar, Sidebar
├── hooks/
│   ├── useBlueprint3D.ts      # Core BP3D integration (initialization, view modes, auto-save)
│   ├── useUndoRedo.ts         # State management for undo/redo
│   └── useKeyboardShortcuts.ts
├── types/blueprint3d.d.ts     # TypeScript definitions for BP3D namespace
└── utils/
    ├── storageService.ts      # localStorage persistence
    └── designService.ts       # Design load/save logic
```

## Common Development Tasks

### Adding New Furniture Items
1. Add 3D model: `example/models/js/{name}.js` (Three.js geometry format)
2. Add thumbnail: `example/models/thumbnails/{name}.png`
3. Update item catalog in React: `react-app/src/assets/data/items.json` or fetch via API
4. Item metadata structure:
```typescript
{
  name: "Item Name",
  model: "/models/js/model-file.js",
  type: 1 // 1=Floor, 2=Wall, 3=InWall, 7=WallFloor, 8=InWallFloor
}
```

### Modifying 2D/3D Views
- **2D Editor**: `src/floorplanner/floorplanner_view.ts` (canvas drawing), `floorplanner.ts` (modes/logic)
- **3D Renderer**: `src/three/main.ts` (scene setup), `controller.ts` (item interaction), `controls.ts` (camera)
- React wrappers: `react-app/src/components/features/FloorPlanner.tsx` and `ThreeViewer.tsx`

### Save/Load Format
Serialization uses custom JSON format (see `model.ts`):
```json
{
  "floorplan": { /* corners, walls as half-edge graph */ },
  "items": [ /* 3D item placements */ ]
}
```
- `exportSerialized()` → JSON string
- `loadSerialized(json)` → restores state
- React auto-saves to localStorage every 30s via `useBlueprint3D`

## Important Technical Constraints

### Three.js Version Lock
Uses **Three.js r69** (very old, from 2015). Models and renderer code depend on this version's API. Upgrading requires extensive refactoring.

### jQuery Dependency
Core library depends on jQuery for events and DOM manipulation. Removal is TODO but impacts many modules.

### TypeScript Compilation
- No ES6 modules in legacy code (predates modern TS)
- `target: "es5"` in Grunt config
- Type definitions in separate `lib/*.d.ts` files

### React-Blueprint3D Boundary
React app treats Blueprint3D as black box:
- No direct access to internal classes beyond public API
- Communication via callbacks and method calls on `blueprint3d` instance
- Type safety via `react-app/src/types/blueprint3d.d.ts` declarations

## Development Workflow Tips

1. **Changing Core Logic**: Edit `src/` → run `grunt` → refresh React app (no hot reload for library changes)
2. **React UI Changes**: Hot reload works normally via `npm start`
3. **Debugging**: Use browser DevTools; BP3D instance available as `window.blueprint3d` when in dev mode
4. **Testing Changes**: Use `example/index.html` for quick vanilla JS testing before integrating into React

## Migration Context (Important)
A full ES6 module migration was attempted (`react-app/src/core/blueprint3d/`) but **reverted** due to:
- Wall rendering issues (visibility/geometry bugs)
- Camera control incompatibilities
- EventEmitter conversion problems

**Do not assume** migrated modules are active. Current implementation uses compiled `blueprint3d.js`.

## References to Key Files
- Build config: `gruntfile.js`
- Main entry: `src/blueprint3d.ts`
- Data model: `src/model/model.ts`, `floorplan.ts`, `scene.ts`
- React integration: `react-app/src/hooks/useBlueprint3D.ts`
- Architecture docs: `ARCHITECTURE.md`, `react-app/MIGRATION.md`, `react-app/BLUEPRINT3D_MIGRATION.md`
