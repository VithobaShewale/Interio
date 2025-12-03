# React App Folder Structure Guide

## 📁 Quick Reference

### `src/api/` - Data & Backend Communication
- **`client.ts`** - HTTP client setup (handles all API calls)
- **`endpoints/`** - Organized API functions
  - `items.ts` - Furniture catalog API
  - `textures.ts` - Floor/wall textures API
  - `designs.ts` - Save/load designs API
- **When to use**: Need to fetch/save data, add new API endpoints

### `src/assets/` - Static Files
- **`data/`** - Mock JSON data (fallback when no backend)
  - `items.json` - Furniture catalog with metadata
  - `textures.json` - Floor/wall texture definitions
- **When to use**: Update item catalog, add new items/textures

### `src/components/` - UI Components
Organized by purpose for easy navigation:

#### `common/` - Reusable Across App
- `LoadingModal.tsx` - Loading spinner
- `ImportExportDialog.tsx` - File dialogs
- `KeyboardShortcutsHelp.tsx` - Help modal
- **When to use**: Create reusable popups, dialogs, buttons

#### `features/` - Specific Features
- `FloorPlanner.tsx` - 2D floor planning view
- `ThreeViewer.tsx` - 3D rendering view
- `ItemCatalog.tsx` - Furniture item browser
- `TextureSelector.tsx` - Floor/wall texture picker
- `ItemPropertiesPanel.tsx` - Edit selected items
- `MeasurementPanel.tsx` - Show room measurements
- `SettingsPanel.tsx` - App settings
- `CameraControls.tsx` - 3D camera controls
- `FloorplannerModeControl.tsx` - 2D mode controls
- **When to use**: Modify existing features, add new feature screens

#### `layout/` - App Structure
- `Toolbar.tsx` - Top toolbar with main actions
- `Sidebar.tsx` - Side panel container
- **When to use**: Change app layout, add navigation

### `src/hooks/` - Reusable React Logic
- `useBlueprint3D.ts` - Blueprint3D engine integration
- `useUndoRedo.ts` - Undo/redo functionality
- `useKeyboardShortcuts.ts` - Keyboard shortcuts handler
- **When to use**: Create reusable logic, add new shortcuts

### `src/types/` - TypeScript Definitions
- `blueprint3d.d.ts` - Blueprint3D engine types
- **When to use**: Add type definitions for new features

### Root Files
- **`App.tsx`** - Main application entry point
- **`App.css`** - Global styles
- **`index.tsx`** - React app bootstrap

---

## 🎯 Common Tasks

### Add a New Furniture Item
1. Edit `src/assets/data/items.json`
2. Add item with model path, thumbnail, dimensions

### Add a New Component
1. Choose folder: `common/`, `features/`, or `layout/`
2. Create `ComponentName.tsx` + `ComponentName.css`
3. Import in parent component

### Add a New API Endpoint
1. Edit or create file in `src/api/endpoints/`
2. Export function from `src/api/index.ts`
3. Use in component with `import { fetchXxx } from '../../api'`

### Modify Existing Feature
1. Find component in `src/components/features/`
2. Edit `.tsx` file for logic, `.css` for styling

---

## 💡 Tips

- **Finding files**: Use VS Code's `Ctrl+P` to quick search
- **Import paths**: Components use relative paths (`../../`)
- **API usage**: All API functions auto-fallback to mock data
- **Styling**: Each component has its own `.css` file

---

## 🔄 Migration Notes

This structure was created to transform the app into a professional, maintainable application with:
- Clear separation of concerns
- Easy testing and debugging
- Scalable for team development
- Industry-standard patterns
