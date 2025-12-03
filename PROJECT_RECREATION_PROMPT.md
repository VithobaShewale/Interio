# Blueprint3D - Complete Project Recreation Guide

## Project Overview
Create a 3D interior design application called Blueprint3D that allows users to create floor plans in 2D and visualize them in 3D with furniture placement. The application has both a legacy TypeScript implementation and a modern React application.

## Technology Stack
- **Core Library**: TypeScript modules with modern Three.js (latest version), Vite build system
- **React App**: React 18, TypeScript, Three.js (latest), @react-three/fiber
- **3D Graphics**: Three.js (latest version) with ES6 modules
- **Model Formats**: GLTF/GLB (primary), with import support for OBJ

---

## TODO: Project Structure Setup

### Task 1: Initialize Project Root
**Create the following directory structure:**
```
PlannerApp/
├── src/                    # TypeScript source with ES6 modules
├── public/                # Static assets (models, textures)
├── dist/                  # Compiled output
├── vite.config.ts         # Vite build configuration
├── package.json           # Dependencies (Three.js latest, React, Vite)
└── tsconfig.json          # TypeScript config
```

**Key files to create:**
- `package.json` with Three.js (latest), React 18, Vite, @react-three/fiber, @react-three/drei
- `vite.config.ts` for fast dev server and optimized builds
- `tsconfig.json` targeting ES2020+, ES6 modules

---

## TODO: Legacy Core Library (Blueprint3D)

### Task 2: Core Architecture Setup
**Create main entry point:** `src/blueprint3d.ts`
- Export ES6 modules
- Initialize core modules: Model, Floorplanner, Scene
- Use modern event system (EventEmitter or custom hooks)

### Task 3: Data Model Implementation

#### Subtask 3.1: Floorplan Module (`src/model/`)
**Files to create:**
- `model.ts` - Main model class, serialization/deserialization
- `floorplan.ts` - 2D floor plan management
- `corner.ts` - Wall intersection points
- `wall.ts` - Wall segments between corners
- `half_edge.ts` - Half-edge data structure for wall topology
- `room.ts` - Room detection from wall loops
- `scene.ts` - 3D item management with GLTFLoader

**Key functionality:**
- Half-edge data structure for walls (each wall has 2 half-edges)
- Room detection algorithm from wall loops
- Corner snapping and wall constraints
- JSON serialization: `{ floorplan: {...}, items: [...] }`
- Modern event system using EventEmitter or React context

#### Subtask 3.2: Item System (`src/items/`)
**Files to create:**
- `item.ts` - Base item class
- `floor_item.ts` - Items on floor (type 1)
- `wall_item.ts` - Items on walls (type 2)
- `in_wall_item.ts` - Items in walls like windows (type 3)
- `wall_floor_item.ts` - Items on both (type 7)
- `in_wall_floor_item.ts` - Combined (type 8)
- `factory.ts` - Item creation with GLTFLoader
- `metadata.ts` - Item properties and configuration

**Item format (modernized for GLB):**
```typescript
{
  model_url: "/models/glb/furniture.glb",
  position: { x: 100, y: 0, z: 100 },
  rotation: { x: 0, y: 0, z: 0 },
  scale: { x: 1, y: 1, z: 1 },
  fixed: false,
  name: "Item Name",
  type: 1,  // 1=Floor, 2=Wall, 3=InWall, 7=WallFloor, 8=InWallFloor
  metadata?: Record<string, any>
}
```

### Task 4: 2D Floorplanner (`src/floorplanner/`)
**Files to create:**
- `floorplanner.ts` - Main floorplanner controller
- `floorplanner_view.ts` - Canvas-based 2D rendering

**Modes to implement:**
- Mode 0: Move (pan/select)
- Mode 1: Draw (create walls)
- Mode 2: Delete (remove walls)

**Features:**
- Canvas rendering with grid
- Corner snapping (configurable tolerance)
- Wall drawing with mouse
- Real-time dimension display
- Room highlighting on hover

### Task 5: 3D Viewer (`src/three/`)
**Files to create:**
- `main.ts` - Three.js scene setup, WebGLRenderer, PerspectiveCamera
- `controller.ts` - Item selection, movement, rotation with TransformControls
- `controls.ts` - OrbitControls from three/examples
- `floorplan.ts` - 3D representation of walls (ExtrudeGeometry)
- `floor.ts` - Room floor meshes with PBR textures
- `edge.ts` - Wall edge meshes
- `environment.ts` - HDR environment mapping
- `lights.ts` - Modern lighting (DirectionalLight, AmbientLight, shadows)
- `hud.ts` - On-screen UI elements (CSS2DRenderer)

**Key features:**
- Latest Three.js Scene/Camera/WebGLRenderer
- GLTFLoader for modern GLB models
- Raycaster for item picking
- TransformControls for manipulation (move/rotate/scale)
- PBR materials with physically-based textures
- OrbitControls from three/examples/jsm/controls
- Optional: @react-three/fiber for React integration

### Task 6: Configuration & Utilities (`src/core/`)
**Files to create:**
- `configuration.ts` - Global settings (units, snapping, etc.)
- `dimensioning.ts` - Unit conversion (cm/m/ft/in)
- `utils.ts` - Helper functions
- `log.ts` - Debug logging
- `version.ts` - Version info

### Task 7: Build System
**Configure Vite:**
- Fast HMR (Hot Module Replacement) for development
- Optimized production builds with code splitting
- TypeScript compilation with type checking
- Asset handling (GLB models, textures, images)
- Library mode for standalone distribution (optional)
- Source maps for debugging

---

## TODO: Modern Furniture Models (GLB Format)

### Task 8: GLB Model Creation/Acquisition
**Store models in:** `public/models/`

**GLB advantages:**
- Single file with embedded geometry and textures
- PBR materials (Metallic-Roughness workflow)
- Smaller file sizes with compression
- Industry standard format
- Direct loading with GLTFLoader

**Model requirements:**
- GLTF 2.0 format (GLB binary)
- PBR materials with proper channels:
  - Base Color (with alpha if needed)
  - Metallic-Roughness
  - Normal maps
  - Occlusion maps
- Baked textures should use CLAMP_TO_EDGE wrapping
- Tiling textures should use REPEAT wrapping
- Optimized poly count for web performance

### Task 9: Model Library
**Create/acquire models for:**
- **Furniture**: beds, tables, chairs, sofas, dressers, shelves
- **Doors and windows**: various styles and sizes
- **Decorative items**: lamps, posters, plants, rugs
- **Kitchen**: cabinets, appliances, counters
- **Bathroom**: fixtures, vanities, mirrors

**Sources:**
- Create in Blender and export as GLB
- Use free model libraries (Sketchfab, Polyhaven)
- Commission custom models
- Convert existing models using Blender scripts

---

## TODO: React Application (Main App)

### Task 10: React App with @react-three/fiber
**Main application structure:**
- Single-page React app
- @react-three/fiber for 3D rendering
- @react-three/drei for helpers (OrbitControls, Environment, etc.)
- State management with Context API or Zustand
- Modern UI with Tailwind CSS or Material-UI

**Core features:**
- 2D Floorplanner (Canvas API or SVG)
- 3D Viewer with @react-three/fiber
- View mode switching (2D/3D/Wall)
- Furniture catalog with search/filter
- Drag-and-drop item placement
- Save/load designs (localStorage + cloud)
- Export to GLB, PNG screenshot
- Undo/redo system
- Keyboard shortcuts

---

## TODO: Model Management

### Task 11: Model Import Pipeline
**If you have existing models in other formats:**

**Blender batch conversion script (Python):**
- Import OBJ/FBX/DAE models
- Apply PBR materials
- Set texture wrapping (clamp for baked, repeat for tiling)
- Optimize geometry (decimate if needed)
- Export as GLB with Draco compression
- Generate thumbnail images

**Automated pipeline:**
```bash
# Example: Convert all FBX to GLB
for file in models/*.fbx; do
  blender --background --python convert_to_glb.py -- "$file"
done
```

### Task 12: Model Optimization
**Optimize GLB models for web:**
- **gltf-pipeline**: Draco compression, texture resizing
- **gltfpack**: Meshoptimizer compression
- **TextureOptimizer**: Compress textures (WebP, KTX2)
- Target: <2MB per model, <1024px textures

**Example workflow:**
```bash
# Install tools
npm install -g gltf-pipeline

# Optimize model
gltf-pipeline -i model.glb -o model-optimized.glb -d
```

---

## TODO: React Application

### Task 13: React App Setup (`react-app/`)
**Initialize with Create React App + TypeScript**

**Project structure:**
```
react-app/
├── public/
│   ├── blueprint3d.js      # Compiled legacy library
│   ├── jquery.js
│   ├── three.min.js
│   ├── models/             # Furniture models
│   └── rooms/              # Room textures
├── src/
│   ├── components/
│   │   ├── common/         # Reusable components
│   │   ├── features/       # Feature-specific
│   │   └── layout/         # App structure
│   ├── hooks/
│   │   ├── useBlueprint3D.ts
│   │   ├── useUndoRedo.ts
│   │   └── useKeyboardShortcuts.ts
│   ├── utils/
│   │   ├── storageService.ts
│   │   ├── designService.ts
│   │   └── glbExporter.ts
│   ├── types/
│   │   └── blueprint3d.d.ts
│   └── assets/
│       └── data/
│           └── items.json
```

### Task 14: React Three Fiber Integration

**Create 3D viewer with @react-three/fiber:**
```typescript
// src/components/Scene3D.tsx
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment } from '@react-three/drei'

function Scene3D() {
  return (
    <Canvas shadows camera={{ position: [5, 5, 5], fov: 60 }}>
      <Environment preset="apartment" />
      <OrbitControls />
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} castShadow />
      
      {/* Walls component */}
      <Walls floorplan={floorplan} />
      
      {/* Furniture items */}
      {items.map(item => (
        <FurnitureItem key={item.id} item={item} />
      ))}
    </Canvas>
  )
}
```

**Key features:**
- Declarative 3D scene with JSX
- Automatic disposal of resources
- Built-in hooks: useFrame, useThree, useLoader
- GLTFLoader via useLoader hook
- Transform controls via @react-three/drei

### Task 15: Core Components

#### Subtask 15.1: Layout Components
**Create:**
- `Toolbar.tsx` - Top toolbar (save, load, export, undo/redo)
- `Sidebar.tsx` - Left panel (furniture catalog with thumbnails)
- `StatusBar.tsx` - Bottom info bar (selected item, camera position)

#### Subtask 15.2: 3D Scene Components
**Furniture Item:**
```typescript
// src/components/FurnitureItem.tsx
import { useGLTF } from '@react-three/drei'

function FurnitureItem({ item, selected, onSelect }) {
  const { scene } = useGLTF(item.modelUrl) // Loads .glb file
  
  return (
    <primitive
      object={scene.clone()}
      position={item.position}
      rotation={item.rotation}
      scale={item.scale}
      onClick={onSelect}
    />
  )
}
```

**Floor & Walls:**
```typescript
// Create procedural geometry from floorplan data
function Floor({ corners }) {
  const shape = new THREE.Shape()
  corners.forEach((c, i) => {
    if (i === 0) shape.moveTo(c.x, c.y)
    else shape.lineTo(c.x, c.y)
  })
  
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <shapeGeometry args={[shape]} />
      <meshStandardMaterial color="#cccccc" />
    </mesh>
  )
}
```

#### Subtask 15.3: UI Components
**Create:**
- `ItemPropertiesPanel.tsx` - Edit position, rotation, scale with sliders
- `FurnitureCatalog.tsx` - Grid of thumbnails, click to add to scene
- `LoadingModal.tsx` - Show while GLB models load
- `ImportExportDialog.tsx` - Save/load designs (JSON), export to GLB

### Task 16: State Management with Zustand

#### Subtask 16.1: Design Store
```typescript
// src/store/designStore.ts
import create from 'zustand'

interface DesignStore {
  floorplan: { corners: Corner[], walls: Wall[] }
  items: FurnitureItem[]
  selectedItemId: string | null
  history: DesignState[]
  historyIndex: number
  
  addItem: (item: FurnitureItem) => void
  updateItem: (id: string, changes: Partial<FurnitureItem>) => void
  deleteItem: (id: string) => void
  selectItem: (id: string | null) => void
  undo: () => void
  redo: () => void
  saveToLocalStorage: () => void
  loadFromLocalStorage: () => void
}

const useDesignStore = create<DesignStore>((set, get) => ({
  floorplan: { corners: [], walls: [] },
  items: [],
  selectedItemId: null,
  history: [],
  historyIndex: -1,
  
  addItem: (item) => set((state) => {
    const newState = { ...state, items: [...state.items, item] }
    return pushHistory(newState)
  }),
  
  updateItem: (id, changes) => set((state) => ({
    items: state.items.map(item => 
      item.id === id ? { ...item, ...changes } : item
    )
  })),
  
  undo: () => { /* Navigate history backwards */ },
  redo: () => { /* Navigate history forwards */ }
}))
```

#### Subtask 16.2: UI Store
```typescript
// src/store/uiStore.ts
interface UIStore {
  viewMode: '2D' | '3D' | 'wall'
  toolMode: 'move' | 'draw' | 'delete'
  showGrid: boolean
  showDimensions: boolean
  cameraPosition: [number, number, number]
  
  setViewMode: (mode: '2D' | '3D' | 'wall') => void
  setToolMode: (mode: string) => void
  toggleGrid: () => void
}
```

**Auto-save:** Use `useEffect` with 30s interval calling `saveToLocalStorage()`

### Task 17: Export Functionality

#### Subtask 17.1: GLB Export (Primary)
```typescript
// src/utils/exportScene.ts
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter'

export async function exportToGLB(scene: THREE.Scene): Promise<Blob> {
  const exporter = new GLTFExporter()
  
  return new Promise((resolve, reject) => {
    exporter.parse(
      scene,
      (result) => {
        const blob = new Blob([result as ArrayBuffer], { 
          type: 'model/gltf-binary' 
        })
        resolve(blob)
      },
      (error) => reject(error),
      { binary: true } // GLB format
    )
  })
}

// Usage in component:
async function handleExport() {
  const blob = await exportToGLB(sceneRef.current)
  downloadBlob(blob, 'design.glb')
}
```

#### Subtask 17.2: Design JSON Export
```typescript
// Export floorplan + item positions as JSON
export function exportDesignJSON(store: DesignStore): string {
  return JSON.stringify({
    version: '2.0',
    floorplan: store.floorplan,
    items: store.items.map(item => ({
      id: item.id,
      modelUrl: item.modelUrl,
      position: item.position,
      rotation: item.rotation,
      scale: item.scale
    }))
  }, null, 2)
}
```

#### Subtask 17.3: OBJ Export (Optional)
Use `OBJExporter` from three/examples for compatibility with older tools

### Task 18: Keyboard Shortcuts

```typescript
// src/hooks/useKeyboardShortcuts.ts
export function useKeyboardShortcuts(designStore: DesignStore) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Z: Undo
      if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        designStore.undo()
      }
      
      // Ctrl+Shift+Z or Ctrl+Y: Redo
      if ((e.ctrlKey && e.shiftKey && e.key === 'z') || 
          (e.ctrlKey && e.key === 'y')) {
        e.preventDefault()
        designStore.redo()
      }
      
      // Ctrl+S: Save
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault()
        designStore.saveToLocalStorage()
      }
      
      // Delete/Backspace: Remove selected
      if ((e.key === 'Delete' || e.key === 'Backspace') && 
          designStore.selectedItemId) {
        e.preventDefault()
        designStore.deleteItem(designStore.selectedItemId)
      }
      
      // Esc: Deselect
      if (e.key === 'Escape') {
        designStore.selectItem(null)
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [designStore])
}
```

### Task 19: Storage Service

```typescript
// src/utils/storageService.ts
const STORAGE_KEY = 'blueprint3d_designs'
const AUTOSAVE_KEY = 'blueprint3d_autosave'

export const storageService = {
  // Save design with name
  save(name: string, design: DesignState): void {
    const designs = this.listAll()
    designs[name] = {
      ...design,
      savedAt: Date.now()
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(designs))
  },
  
  // Auto-save current state
  autoSave(design: DesignState): void {
    localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(design))
  },
  
  // Load design by name
  load(name: string): DesignState | null {
    const designs = this.listAll()
    return designs[name] || null
  },
  
  // List all saved designs
  listAll(): Record<string, DesignState> {
    const json = localStorage.getItem(STORAGE_KEY)
    return json ? JSON.parse(json) : {}
  },
  
  // Delete design
  delete(name: string): void {
    const designs = this.listAll()
    delete designs[name]
    localStorage.setItem(STORAGE_KEY, JSON.stringify(designs))
  },
  
  // Export to JSON file
  exportToFile(design: DesignState, filename: string): void {
    const json = JSON.stringify(design, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    downloadBlob(blob, filename)
  },
  
  // Import from JSON file
  async importFromFile(file: File): Promise<DesignState> {
    const text = await file.text()
    return JSON.parse(text)
  }
}

---

## TODO: Documentation

### Task 20: Architecture Documentation
**Create:**
- `ARCHITECTURE.md` - Modern Three.js + React architecture overview
- `README.md` - Project setup with Vite, model loading, deployment
- `CONTRIBUTING.md` - Coding style, PR guidelines

**Key sections:**
- React Three Fiber integration patterns
- GLB model loading and caching
- State management with Zustand
- Export/import workflows
- Performance optimization (LOD, instancing, frustum culling)

### Task 21: API Documentation
**Document:**
- GLB model structure and requirements
- Design JSON format specification
- Item metadata schema (position, rotation, scale, modelUrl)
- Zustand store API
- React component props and interfaces

**Example:**
```typescript
// Item interface
interface FurnitureItem {
  id: string
  name: string
  modelUrl: string // Path to .glb file
  position: [number, number, number]
  rotation: [number, number, number] // Euler angles
  scale: [number, number, number]
  metadata?: {
    category: string
    manufacturer: string
    dimensions: { width: number, height: number, depth: number }
  }
}
```

### Task 22: Component Documentation
**Create README files:**
- `src/components/README.md` - Component tree, props, usage examples
- `src/hooks/README.md` - Custom hooks (useDesignStore, useGLTFPreload)
- `src/utils/README.md` - Utility functions (export, storage, validation)
- Type definitions

---

## TODO: Testing & Quality

### Task 23: GLB Model Validation
**Verify:**
- All GLB models load without errors
- Textures render correctly with PBR materials
- Bounding boxes are accurate
- Polygon counts are reasonable (<50k triangles)
- Materials have proper metalness/roughness values
- No missing texture warnings
- Models are properly centered and scaled

**Tools:**
- glTF Validator: https://github.khronos.org/glTF-Validator/
- Blender GLB import test
- Three.js GLTFLoader in dev environment
- Regular textures use REPEAT wrapping

### Task 24: React App Testing

**Unit Tests (Vitest):**
```typescript
// src/store/designStore.test.ts
describe('Design Store', () => {
  it('adds item to scene', () => {
    const store = useDesignStore.getState()
    store.addItem({ id: '1', modelUrl: '/models/chair.glb', ... })
    expect(store.items).toHaveLength(1)
  })
  
  it('handles undo/redo', () => {
    const store = useDesignStore.getState()
    store.addItem(item1)
    store.undo()
    expect(store.items).toHaveLength(0)
    store.redo()
    expect(store.items).toHaveLength(1)
  })
})
```

**Integration Tests:**
- GLB model loading
- Item selection and transformation
- Export to GLB functionality
- Save/load from localStorage
- Keyboard shortcut triggers

**E2E Tests (Playwright):**
- Add furniture from catalog
- Move/rotate/scale items
- Export design as GLB
- Load saved design

### Task 25: Browser Compatibility
**Test in:**
- Chrome/Edge (Chromium) - Primary target
- Firefox - WebGL compatibility
- Safari - M1/M2 GPU performance
- Mobile browsers (iOS/Android) - Touch controls

**WebGL Requirements:**
- Check WebGL 2.0 support
- Fallback message for unsupported browsers
- Memory limit handling for mobile

---

## TODO: Deployment & Build

### Task 26: Production Build with Vite

**Optimize:**
```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'three-vendor': ['three', '@react-three/fiber', '@react-three/drei'],
          'ui-vendor': ['react', 'react-dom', 'zustand']
        }
      }
    },
    chunkSizeWarningLimit: 1000 // GLB models may be large
  },
  assetsInclude: ['**/*.glb', '**/*.gltf'], // Include 3D models
  server: {
    headers: {
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin'
    }
  }
})
```

**Optimization checklist:**
- Code splitting by route
- GLB compression with Draco
- Lazy load models on demand
- Service worker for model caching
- Generate source maps for debugging

### Task 27: Hosting & CDN

**Netlify/Vercel:**
```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = "dist"

[[headers]]
  for = "/*.glb"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
    Content-Type = "model/gltf-binary"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
```

**CDN Setup:**
- Upload GLB models to CDN (Cloudflare R2, AWS S3)
- Configure CORS headers for cross-origin model loading
- Use CDN URLs in item catalog: `https://cdn.example.com/models/chair.glb`
- Implement progressive loading for large models

---

## Key Technical Decisions Explained

### Why Latest Three.js + @react-three/fiber?
- **Modern API**: Latest Three.js has better performance, WebGPU support, improved PBR
- **React Integration**: @react-three/fiber provides declarative 3D scene management
- **Ecosystem**: Access to drei helpers (OrbitControls, TransformControls, useGLTF)
- **Maintainability**: Active development, better TypeScript support
- **Community**: Large user base, extensive examples, regular updates

### Why GLB Over Other Formats?
- **Binary Efficiency**: Faster loading than text-based formats
- **Embedded Assets**: Textures included in single file
- **PBR Support**: Built-in metalness/roughness workflow
- **Industry Standard**: glTF 2.0 is Khronos standard for web 3D
- **Tooling**: Excellent Blender export, validation tools

### Why Zustand for State?
- **Simple API**: Less boilerplate than Redux
- **React Integration**: Hooks-first design
- **Performance**: Selective subscriptions, no unnecessary re-renders
- **DevTools**: Time-travel debugging with Redux DevTools
- **TypeScript**: Excellent type inference

### Why Vite Over Webpack?
- **Speed**: 10-100x faster dev server startup
- **HMR**: Instant hot module replacement
- **Modern**: Native ES modules, no bundling in dev
- **Simple Config**: Less configuration needed
- **Optimized**: Better tree-shaking and code splitting

---

## Critical Implementation Notes

### GLB Model Requirements
**File structure:**
- Binary glTF 2.0 format (.glb extension)
- Embedded textures (PNG/JPEG)
- Single mesh per file (or multiple named meshes)
- PBR materials with metalness/roughness workflow
- Vertex data: positions, normals, UVs, (optional) tangents

**Material setup:**
- `baseColorFactor`: [1, 1, 1, 1] (white, full opacity)
- `metallicFactor`: 0.0 (non-metallic furniture)
- `roughnessFactor`: 1.0 (matte finish)
- `baseColorTexture`: Points to embedded image
- Texture sampler: CLAMP_TO_EDGE for baked, REPEAT for tiling

### React Three Fiber Patterns
**Loading models:**
```typescript
const { scene } = useGLTF('/models/chair.glb')
// Clone for multiple instances:
<primitive object={scene.clone()} />
```

**Performance:**
- Preload models: `useGLTF.preload(url)`
- Use `<Instances>` from drei for repeated items
- Implement frustum culling for large scenes
- Consider LOD (Level of Detail) for complex models

### State Management Best Practices
**Zustand store:**
- Split into domain-specific stores (design, ui, catalog)
- Use immer middleware for immutable updates
- Persist to localStorage with persist middleware
- Subscribe to slices, not entire store

**Undo/Redo:**
- Store state snapshots in circular buffer (max 50)
- Skip intermediate states during continuous operations (dragging)
- Debounce auto-save to avoid excessive writes

---

## Success Criteria

✅ **Core Functionality:**
- Vite dev server starts and runs smoothly
- GLB models load without errors
- Can add furniture from catalog to 3D scene
- Items can be selected, moved, rotated, scaled
- Camera controls work (orbit, zoom, pan)
- Floor and walls render correctly

✅ **State Management:**
- Undo/redo works for all operations
- Auto-save triggers every 30s
- Designs persist to localStorage
- Import/export JSON works

✅ **Export:**
- Can export entire scene as GLB
- Exported GLB opens in Blender/other viewers
- Textures are included in export

✅ **Performance:**
- 60 FPS with 20+ furniture items
- Models load within 2 seconds
- No memory leaks after repeated add/remove
- Responsive on mobile devices

✅ **Code Quality:**
- TypeScript types for all components
- Unit tests for stores and utils
- E2E tests for critical workflows
- Clean console (no errors/warnings)

---

## Estimated Timeline

**Phase 1: Foundation (2-3 weeks)**
- Tasks 1-3: Project setup, Vite config, TypeScript
- Tasks 4-6: Core data structures (Floorplan, Scene)

**Phase 2: Model Management (1-2 weeks)**
- Task 7: Acquire/create GLB model library
- Task 8: Model optimization pipeline
- Task 9: Item catalog system

**Phase 3: React App (3-4 weeks)**
- Tasks 10-12: Vite app, React Three Fiber setup
- Tasks 13-17: Components, state, export
- Tasks 18-19: Keyboard shortcuts, storage

**Phase 4: Polish (2-3 weeks)**
- Tasks 20-22: Documentation
- Tasks 23-25: Testing, browser compatibility
- Tasks 26-27: Production build, deployment

**Total**: 8-12 weeks depending on team size and GLB model availability

---

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Basic understanding of Three.js concepts (scenes, meshes, materials)
- Familiarity with React and hooks
- Access to 3D models in GLB format or Blender for conversion

### Step-by-Step
1. **Initialize project**: `npm create vite@latest blueprint3d-app -- --template react-ts`
2. **Install dependencies**: Three.js, @react-three/fiber, @react-three/drei, zustand
3. **Set up basic 3D scene**: Create Canvas component with OrbitControls
4. **Load first GLB model**: Test with simple chair model
5. **Implement item placement**: Click to add, drag to move
6. **Build incrementally**: Add features one at a time with tests
7. **Document decisions**: Update README as architecture evolves

### Testing Your Setup
```bash
# Quick validation
npm run dev
# Open http://localhost:5173
# You should see: 3D canvas, basic lighting, one GLB model loaded
```

## Modern Technology Benefits

**Compared to legacy r69 approach:**
- ✅ 10x faster development with React Three Fiber
- ✅ Smaller bundle size with tree-shaking
- ✅ Better performance with modern Three.js optimizations
- ✅ Easier debugging with React DevTools
- ✅ Future-proof with active ecosystem
- ✅ WebGPU ready for next-gen graphics

## Resources

- **Three.js Docs**: https://threejs.org/docs/
- **React Three Fiber**: https://docs.pmnd.rs/react-three-fiber
- **Drei Helpers**: https://github.com/pmndrs/drei
- **glTF Validator**: https://github.khronos.org/glTF-Validator/
- **Blender GLB Export**: https://docs.blender.org/manual/en/latest/addons/import_export/scene_gltf2.html
