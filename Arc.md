# React Migration Progress and Remaining Work

## Progress So Far
- **React App Bootstrapped**: The new React app (`react-app/`) is set up with TypeScript, modern build tools, and hot reload.
- **Core Integration**: The Blueprint3D engine (`src/`) is successfully integrated and can be controlled from React components.
- **2D/3D Views**: React components for both the 2D floorplanner and 3D viewer are implemented (`FloorPlanner.tsx`, `ThreeViewer.tsx`).
- **Draft Persistence**: Auto-save/load of designs using localStorage is implemented via React hooks and utilities.
- **UI Components**: Sidebar, toolbar, and other UI elements are React-based.
- **Type Safety**: TypeScript types and custom declarations are in place for engine and UI integration.
- **Dev Workflow**: Grunt and npm scripts support hot reload, asset copying, and efficient development.
- **Floorplanner Mode Controls**: ✅ Move/Draw/Delete mode controls migrated to React with proper state sync.
- **Model Architecture Fix**: ✅ FloorplannerView now properly receives Model reference for item rendering in 2D.
- **Item Catalog**: ✅ Full furniture/item catalog with search and categories migrated to React (`ItemCatalog.tsx`).
- **Camera Controls**: ✅ 3D camera controls (zoom, pan, reset view) migrated to React component (`CameraControls.tsx`).
- **Texture Selector**: ✅ Wall and floor texture selection with live preview migrated to React (`TextureSelector.tsx`).
- **Item Properties Panel**: ✅ Item resize, rotation, lock, and delete controls migrated to React (`ItemPropertiesPanel.tsx`).
- **Event Callbacks**: ✅ All Blueprint3D event callbacks (wall/floor clicks, item selection) integrated with React hooks.
- **Loading Modal**: ✅ Loading indicator for async item loading migrated to React (`LoadingModal.tsx`).
- **Import/Export**: ✅ File management dialogs (new/load/save designs) migrated to React (`ImportExportDialog.tsx`).
- **Undo/Redo System**: ✅ Complete undo/redo functionality with keyboard shortcuts (Ctrl+Z/Ctrl+Shift+Z) implemented (`useUndoRedo.ts`).
- **Keyboard Shortcuts**: ✅ Comprehensive keyboard shortcuts system with help dialog (?, F1) for navigation, editing, and item manipulation (`useKeyboardShortcuts.ts`, `KeyboardShortcutsHelp.tsx`).
- **Measurement Tools**: ✅ Real-time measurement panel showing room area, wall lengths, and item counts with metric/imperial unit conversion (`MeasurementPanel.tsx`).
- **Settings Panel**: ✅ Comprehensive settings UI with units, theme, grid, snapping, and auto-save preferences stored in localStorage (`SettingsPanel.tsx`).
- **Floating Properties Panel**: ✅ Context-sensitive item properties panel that appears in 3D view when items are selected for quick editing.

## What Remains for Full React Standalone App

### ✅ Completed (Professional Architecture - Phase 1)
- **Folder Reorganization**: ✅ Components organized into `layout/`, `features/`, and `common/` folders.
- **API Layer**: ✅ Complete API client with axios, interceptors, and endpoints for items, textures, and designs.
- **Mock Data**: ✅ JSON-based mock data for items and textures with fallback when API unavailable.

### 🔄 In Progress (Professional Architecture - Phase 2)
- **i18n Implementation**: Set up react-i18next for multi-language support with locale files.
- **Global Window API**: Create `window.Blueprint3DApp` object for external integrations and programmatic control.
- **Container Components**: Separate presentation from logic using container pattern.
- **Redux Store**: Set up Redux Toolkit for global state management.
- **Blueprint3D Adapter**: Create adapter layer to decouple React from Blueprint3D engine.

### 📋 Remaining Tasks
- **Authentication System**: User login, JWT tokens, protected routes, and session management.
- **Database Integration**: Backend API integration for persistent storage.
- **Enhanced Import/Export**: Add export to image/PDF formats, 3D model exports, and design templates.
- **Dark Theme Implementation**: Complete dark theme support (UI framework ready, needs styling).
- **Grid Overlay Visualization**: Add visual grid overlay in 2D floorplanner view.
- **Testing and QA**: Add automated tests for React components and integration points (unit tests, E2E tests).
- **Documentation**: Update user and developer docs to focus on the React app as the primary UI.
- **Polish and UX**: Refine UI/UX with animations, tooltips, and accessibility features.
- **Deprecate Legacy Demo**: Once feature parity and stability are achieved, deprecate or remove the `example/` JS demo.

## Aim: Full Blueprint3D Migration
The ultimate goal is to have all user interaction, UI, and state management handled by the React app, with the Blueprint3D engine providing only core geometry, rendering, and model logic. This will maximize maintainability, extensibility, and modern development practices.

---
# Migration to React App

## Migration Intent
The project is in the process of migrating from the legacy JavaScript-based UI (found in the `example/` folder and classic JS files) to a modern React-based frontend (`react-app/`).

### Why Migrate?
- **Maintainability**: React and TypeScript provide better structure, type safety, and scalability for future development.
- **Modern UI/UX**: React enables a more dynamic, responsive, and user-friendly interface.
- **Separation of Concerns**: The React app cleanly separates UI logic from the core Blueprint3D engine, making it easier to extend and test.

### Migration Approach
- **Core Logic Reuse**: The core engine (`src/`) remains in TypeScript/JS and is reused by both the legacy and React apps.
- **Component Rewrite**: UI, event handling, and state management are being rewritten as React components in `react-app/src/components/` and hooks in `react-app/src/hooks/`.
- **Gradual Transition**: Features are ported incrementally. During migration, both the legacy demo (`example/`) and the React app may coexist for validation.
- **Type Safety**: New code and migrated logic should use TypeScript and leverage type declarations in `react-app/src/types/` and `lib/`.

### Guidance for Contributors
- For new features or UI changes, prefer working in the React app.
- Reference the legacy JS code in `example/js/` for migration patterns, but implement new logic using React paradigms.
- Ensure that core engine changes remain compatible with both UIs until migration is complete.

---
# Arc.md

# Blueprint3D Project Architecture Documentation

This document provides a comprehensive overview of the Blueprint3D project structure, explaining the purpose and relationships of every folder and file. It is designed for AI agents and developers to understand, extend, or automate work on this codebase.

---

## Root Directory

- **CODING_STYLE.md**: Coding conventions and style guide for contributors.
- **gruntfile.js**: Grunt build configuration for tasks like copying, watching, and building assets.
- **LICENSE.txt**: Project license.
- **package.json / package-lock.json**: Node.js dependencies and scripts.
- **README.md**: Project overview and basic usage instructions.
- **dist/**: Build output directory.
- **example/**: Standalone HTML/JS demo of Blueprint3D (see below for details).
- **lib/**: TypeScript type declarations for external libraries (e.g., jQuery, Three.js).
- **node_modules/**: Installed dependencies.
- **react-app/**: React-based frontend application (see below).
- **src/**: Main source code for Blueprint3D engine (see below).

---

## src/ (Blueprint3D Engine)

### blueprint3d.ts
- **Entry point for the Blueprint3D engine.**
- Initializes the core model, 3D view, and 2D floorplanner.
- Exports the main `Blueprint3d` class and `Options` interface.

### core/
- **configuration.ts**: Global configuration constants and settings.
- **dimensioning.ts**: Utility functions for unit conversion and measurement.
- **log.ts**: Logging utilities.
- **utils.ts**: General-purpose helper functions.
- **version.ts**: Version information for the engine.

### floorplanner/
- **floorplanner.ts**: Implements the interactive 2D floorplan editor (controller, state, user input).
- **floorplanner_view.ts**: Renders the 2D floorplan to a canvas, including rooms, walls, corners, and items.

### items/
- **factory.ts**: Factory for creating item (furniture) instances.
- **floor_item.ts**: Base class for items placed on the floor.
- **in_wall_floor_item.ts**: Items embedded in both wall and floor.
- **in_wall_item.ts**: Items embedded in walls.
- **item.ts**: Core item (furniture) logic and properties.
- **metadata.ts**: Metadata definitions for items.
- **on_floor_item.ts**: Items placed on the floor only.
- **wall_floor_item.ts**: Items embedded in wall and floor.
- **wall_item.ts**: Items embedded in walls only.

### model/
- **corner.ts**: Corner geometry and logic.
- **floorplan.ts**: Main data structure for the floorplan (walls, rooms, corners, serialization).
- **half_edge.ts**: Half-edge data structure for wall geometry.
- **model.ts**: Root model class, contains the floorplan and scene.
- **room.ts**: Room geometry and logic.
- **scene.ts**: 3D scene graph and item management.
- **wall.ts**: Wall geometry and logic.

### three/
- **controller.ts**: 3D camera and scene controller.
- **controls.ts**: User controls for 3D navigation (orbit, pan, zoom).
- **edge.ts**: 3D wall edge rendering.
- **floor.ts**: 3D floor rendering.
- **floorplan.ts**: 3D floorplan visualization.
- **hud.ts**: Heads-up display overlays in 3D.
- **lights.ts**: Lighting setup for 3D scene.
- **main.ts**: Main 3D scene setup and rendering loop.
- **skybox.ts**: 3D skybox/environment rendering.

---

## react-app/ (React Frontend)

### src/
- **App.tsx**: Main React app, manages state and view mode (2D/3D).
- **App.css, index.css**: Global styles.
- **index.tsx**: React entry point.
- **global.d.ts**: Global type declarations for Blueprint3D, Three.js, etc.
- **components/**: React UI components:
  - **FloorPlanner.tsx / FloorPlanner.css**: Embeds and manages the 2D floorplanner view.
  - **ThreeViewer.tsx / ThreeViewer.css**: Embeds and manages the 3D view.
  - **Sidebar.tsx / Sidebar.css**: UI for tool selection, item lists, etc.
  - **Toolbar.tsx / Toolbar.css**: UI for main actions (save, load, etc.).
- **hooks/**:
  - **useBlueprint3D.ts**: Custom React hook for managing Blueprint3D instance, state, and draft logic.
- **types/**:
  - **blueprint3d.d.ts**: TypeScript type declarations for Blueprint3D engine.
- **utils/**:
  - **designService.ts**: Utility for design serialization, comparison, and change detection.
  - **storageService.ts**: Utility for localStorage persistence of drafts.

---

## example/
- **index.html**: Standalone demo page for Blueprint3D.
- **css/**: Styles for the demo.
- **fonts/**: Fonts for the demo UI.
- **js/**: Blueprint3D engine and dependencies for demo usage.
- **models/**: 3D model files and thumbnails for demo.
- **rooms/**: Room textures and thumbnails for demo.

---

## lib/
- **jquery.d.ts**: TypeScript declarations for jQuery.
- **three.d.ts**: TypeScript declarations for Three.js.

---

## How Everything Connects
- The **Blueprint3D engine** (`src/`) provides the core logic for 2D/3D floor planning, geometry, and item management.
- The **React app** (`react-app/`) provides a modern UI, embedding the engine and managing user interaction, state, and persistence.
- The **example/** folder demonstrates standalone usage without React.
- **Grunt** automates build and asset copying for development and deployment.

---

## For AI Agents
- Use this document to understand the role of each file and folder.
- For UI changes, work in `react-app/src/components/` and `react-app/src/hooks/`.
- For engine changes, work in `src/` (see subfolders for geometry, rendering, and logic).
- For persistence or draft logic, see `react-app/src/utils/`.
- For adding new items/furniture, see `src/items/` and update both 2D and 3D rendering.
- For type safety, update or add `.d.ts` files in `lib/` or `react-app/src/types/`.

---

## Contribution Guidelines
- Follow `CODING_STYLE.md` for code formatting and conventions.
- Write or update type declarations for new code.
- Test changes in both the React app and the standalone example if relevant.

---

*This document is auto-generated for AI and developer reference. Update as the project evolves.*
