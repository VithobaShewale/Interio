# Blueprint3D React Migration

This React application is a modern migration of the Blueprint3D floor planning library.

## What's Been Migrated

### 1. Blueprint3D Source Code
The original TypeScript source code from `D:\MyLearning\PlannerApp\src` has been copied to:
```
react-app/src/blueprint3d/
├── blueprint3d.ts
├── core/
│   ├── configuration.ts
│   ├── dimensioning.ts
│   ├── log.ts
│   ├── utils.ts
│   └── version.ts
├── floorplanner/
│   ├── floorplanner.ts
│   └── floorplanner_view.ts
├── items/
│   ├── factory.ts
│   ├── floor_item.ts
│   ├── in_wall_floor_item.ts
│   ├── in_wall_item.ts
│   ├── item.ts
│   ├── metadata.ts
│   ├── on_floor_item.ts
│   ├── wall_floor_item.ts
│   └── wall_item.ts
├── model/
│   ├── corner.ts
│   ├── floorplan.ts
│   ├── half_edge.ts
│   ├── model.ts
│   ├── room.ts
│   ├── scene.ts
│   └── wall.ts
└── three/
    ├── controller.ts
    ├── controls.ts
    ├── edge.ts
    ├── floor.ts
    ├── floorplan.ts
    ├── hud.ts
    ├── lights.ts
    ├── main.ts
    └── skybox.ts
```

### 2. TypeScript Type Definitions
Created comprehensive type definitions in `src/types/blueprint3d.d.ts` providing:
- Full TypeScript support for BP3D namespace
- Type safety for Blueprint3D API
- IntelliSense support in VS Code
- Proper typing for:
  - Model classes (Model, Floorplan, Scene, Wall, Corner, Room, Item)
  - Three.js integration (Main, Controller)
  - Floorplanner (modes, methods)
  - Item metadata and options

### 3. React Components

#### **Custom Hooks**
- **useBlueprint3D** - Blueprint3D lifecycle, initialization, view modes (2D/3D/Wall), auto-save
- **useUndoRedo** - Undo/redo state management with history
- **useKeyboardShortcuts** - Keyboard navigation and shortcuts
- **useItemDrag** - Drag-and-drop item placement

#### **Layout Components**
- **Toolbar** - Left vertical navigation with icons
- **Sidebar** - Dynamic panels (catalog, properties, settings, selected item)
- **PropertiesPanel** - Unified wall/floor/item property editor

#### **Feature Components**
- **FloorPlanner** - 2D editor with Move/Draw/Delete modes, dimension toggle
- **ThreeViewer** - 3D visualization with camera controls
- **WallElevation** - Wall elevation view mode
- **ItemCatalog** - 25+ furniture items with search, drag-and-drop
- **ItemPropertiesPanel** - Item dimensions, rotation, delete controls
- **CameraControls** - Zoom, pan, reset controls for both 2D and 3D
- **FloorplannerCameraControls** - Dedicated 2D camera controls
- **WallElevationController** - Toggle wall elevation view

#### **Common Components**
- **LoadingModal** - Loading progress overlay
- **ImportExportDialog** - Design import/export with file/clipboard
- **LanguageSwitcher** - 4-language dropdown with flags
- **KeyboardShortcutsHelp** - Keyboard shortcuts reference

### 4. Dependencies Installed
```json
{
  "jquery": "^2.1.3",
  "@types/jquery": "latest",
  "underscore": "latest",
  "@types/underscore": "latest",
  "vec2": "^1.6.0",
  "polygon": "^0.1.0",
  "segseg": "^0.2.1",
  "i18next": "^23.16.5",
  "react-i18next": "^16.3.5",
  "i18next-browser-languagedetector": "^8.0.2"
}
```

### 5. Assets Migrated
- **Models**: All 3D furniture models from `models/js/` → `public/models/js/`
- **Textures**: Room textures from `rooms/textures/` → `public/rooms/textures/`
- **Thumbnails**: Item and room thumbnails → `public/models/thumbnails/` and `public/rooms/thumbnails/`
- **Libraries**: jquery.js, three.min.js, blueprint3d.js → `public/`

## Current Architecture

### Integration Approach
The React app uses the **compiled Blueprint3D library** (`blueprint3d.js`) loaded via script tags in `public/index.html`, rather than trying to recompile the TypeScript source. This approach:
- ✅ Maintains compatibility with the original code
- ✅ Avoids complex module system conversion
- ✅ Works with the existing build pipeline
- ✅ Provides TypeScript support via declaration files

### Type Safety
The `src/types/blueprint3d.d.ts` file provides:
- Full TypeScript definitions for the global BP3D namespace
- Type checking for all Blueprint3D APIs
- IntelliSense autocomplete
- Compile-time error detection

### Component Structure
```
App.tsx (root)
├── Toolbar (left vertical navigation)
│   ├── Floor Planner (2D mode toggle)
│   ├── Auto Design (placeholder)
│   ├── Items (catalog toggle)
│   ├── Selected (properties toggle)
│   ├── View (3D mode toggle)
│   ├── Settings (future)
│   └── LanguageSwitcher (language selector)
├── Sidebar (dynamic content based on active panel)
│   ├── ItemCatalog (25+ furniture items with search)
│   ├── PropertiesPanel (wall/floor/item editor)
│   └── ItemPropertiesPanel (item-specific properties)
└── viewer-container
    ├── FloorPlanner (2D editor)
    │   ├── CameraControls (zoom, pan, reset)
    │   └── Mode buttons (Move, Draw, Delete)
    ├── ThreeViewer (3D view)
    │   └── CameraControls (zoom, pan, reset)
    └── WallElevationController (wall view toggle)
```

**Rendering Strategy:**
- Both FloorPlanner and ThreeViewer are always rendered in the DOM
- Visibility controlled via CSS classes based on active view mode
- Prevents canvas reinitialization issues and state loss
- Mode switching (2D/3D/Wall) managed by `useBlueprint3D` hook

**State Management:**
- No Redux/Context - Blueprint3D library maintains internal state
- React components subscribe to Blueprint3D callbacks
- `useBlueprint3D` hook provides centralized BP3D lifecycle management
- `useUndoRedo` hook manages undo/redo history
- Auto-save to localStorage every 30 seconds

### Internationalization (i18n)

**Technology Stack:**
- **i18next v23.16.5** - Core internationalization framework
- **react-i18next v16.3.5** - React integration with hooks
- **i18next-browser-languagedetector v8.0.2** - Auto language detection

**Supported Languages:**
- 🇺🇸 English (en) - Default/fallback
- 🇪🇸 Spanish (es)
- 🇫🇷 French (fr)
- 🇩🇪 German (de)

**Translation Structure:**
```
assets/locales/
├── en/translation.json (160+ keys)
├── es/translation.json (160+ keys)
├── fr/translation.json (160+ keys)
└── de/translation.json (160+ keys)
```

**Translation Namespaces:**
- `common` - App name, save, load, login, buttons
- `toolbar` - View modes, design notes, design assistance
- `sidebar` - Sidebar sections (Floor Planner, Auto Design, Items, etc.)
- `floorplanner` - Mode buttons (Move, Draw, Delete), camera controls, dimensions
- `viewer` - 3D viewer controls, help, wall view
- `properties` - Wall/floor/item property editors
- `catalog` - Item catalog, search, loading messages
- `textures` - Texture selection UI
- `import_export` - Import/export dialog
- `messages` - Success/error messages
- `loading` - Loading modal messages

**Features:**
- Language switcher with flag emojis (🇺🇸 🇪🇸 🇫🇷 🇩🇪)
- Auto-detection from browser settings
- Preference saved in localStorage
- All UI elements fully translated (160+ keys)
- Dynamic language switching without page reload
- TypeScript support with proper typing

**Usage Pattern:**
```typescript
import { useTranslation } from 'react-i18next';

const MyComponent = () => {
  const { t } = useTranslation();
  
  return (
    <button>{t('common.save')}</button>
  );
};
```

## Current Features

### Working ✅
- Project initialization and build
- Blueprint3D integration via custom React hook
- 2D floor plan editor with drawing tools
- 3D visualization with Three.js
- View mode switching (2D ↔ 3D ↔ Wall Elevation)
- Drawing modes (Move, Draw, Delete)
- Dimension toggle (Show/Hide measurements)
- Item catalog with 25+ furniture items
- Click-to-add items to scene
- Drag-and-drop item placement
- Default room loading
- Proper TypeScript typing throughout
- **Internationalization (i18n)** 🌐
  - 4 languages: English, Spanish, French, German
  - 160+ translation keys
  - Language switcher with persistence
  - All UI elements fully translated
- Camera controls (zoom, pan, reset) for 2D and 3D views
- Item selection and property editing
- Item dimensions editor (width, height, depth)
- Wall and floor texture selection
- Undo/Redo functionality
- Keyboard shortcuts (Ctrl+Z, Ctrl+S, ESC, 1/2/3 for views)
- Auto-save to localStorage (30s intervals)
- Import/Export designs (JSON format)
- Wall elevation view mode
- Mouse scroll wheel zoom
- Loading modal with progress
- Item rotation and position locking

### Partially Complete 🔄
- Advanced texture customization UI (basic selection works)
- Design templates library
- Auto-design feature panel (UI placeholder exists)

### To Do ❌
- Multi-select for items
- Context menu for items
- Export to image/PDF
- Advanced measurement tools
- Room dimension editing UI
- Cloud storage integration
- Version history for designs
- Real-time collaboration
- AI design assistance integration
- Advanced material editor

## Development

### Start the React app
```bash
cd react-app
npm start
```

### Build for production
```bash
cd react-app
npm run build
```

### Type checking
TypeScript will automatically check types during development. The Blueprint3D types are available globally via the `BP3D` namespace.

## Item Types Reference

- **Type 1**: Floor items (chairs, tables, beds, sofas, dressers, bookcases, lamps, etc.)
- **Type 2**: Wall items (posters, artwork)
- **Type 3**: Windows
- **Type 7**: Doors
- **Type 8**: Floor items (rugs, carpets)

## Notes

### Why Not Recompile TypeScript Source?
The Blueprint3D source uses:
- Old TypeScript module syntax (`module BP3D {}`)
- Triple-slash reference directives
- Global namespace pattern
- Browserify for bundling

Converting this to modern ES6 modules would require:
- Rewriting all module declarations
- Converting global namespaces to exports
- Updating all internal references
- Significant refactoring risk

Using the pre-built library with TypeScript declarations provides the best of both worlds:
- Works immediately without code changes
- Maintains compatibility
- Provides full TypeScript support
- Reduces migration risk

### Future Improvements
If a full TypeScript source integration is needed in the future:
1. Convert Blueprint3D modules to ES6 syntax
2. Replace triple-slash directives with imports
3. Export classes/functions instead of global namespaces
4. Update React components to import directly
5. Remove script tag dependencies

However, the current approach is production-ready and provides excellent developer experience with full TypeScript support.
