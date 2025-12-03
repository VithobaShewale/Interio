# Folder Structure Migration

## ✅ New Folder Structure Created

```
src/
├── api/                          # API Layer
│   ├── endpoints/                # API endpoint modules
│   ├── client.ts                 # API client configuration
│   └── types.ts                  # API type definitions
│
├── assets/                       # Static Assets
│   ├── locales/                  # i18n translation files
│   │   ├── en.json
│   │   ├── es.json
│   │   └── ...
│   └── data/                     # JSON data files
│       ├── items.json
│       ├── textures.json
│       └── config.json
│
├── components/                   # React Components
│   ├── common/                   # Shared/reusable components
│   ├── layout/                   # Layout components
│   ├── features/                 # Feature-specific components
│   └── [existing files]          # Current components
│
├── containers/                   # Container Components (NEW)
│   └── [Smart components with logic]
│
├── core/                         # Core Business Logic (NEW)
│   ├── adapters/                 # Blueprint3D adapters
│   ├── models/                   # Domain models
│   └── services/                 # Business services
│
├── store/                        # State Management (NEW)
│   ├── slices/                   # State slices
│   └── index.ts                  # Store config
│
├── global/                       # Global Window API (NEW)
│   └── WindowAPI.ts
│
├── hooks/                        # Custom Hooks (existing)
├── types/                        # Type Definitions (existing)
└── utils/                        # Utilities (existing)
```

## 📋 Migration Plan

### Phase 1: Move Components (Current)
- [x] Create new folder structure
- [ ] Move components to appropriate folders:
  - Common: Buttons, Inputs, Modals
  - Layout: Toolbar, Sidebar, TopBar
  - Features: ItemCatalog, TextureSelector, etc.

### Phase 2: Create Core Layer
- [ ] Blueprint3D Adapter
- [ ] Domain Models
- [ ] Services Layer

### Phase 3: API Integration
- [ ] API Client
- [ ] Endpoint Modules
- [ ] Data Models

### Phase 4: State Management
- [ ] Store Setup
- [ ] Create Slices
- [ ] Connect Components

### Phase 5: Global API
- [ ] Window API
- [ ] Command Interface
- [ ] Documentation

## 🔄 Component Organization

### Common Components (Reusable)
- Button
- Input
- Modal
- Loading
- Spinner

### Layout Components
- AppLayout
- TopBar
- Sidebar
- Toolbar
- Footer

### Feature Components
- FloorPlanner
- ThreeViewer
- ItemCatalog
- TextureSelector
- ItemPropertiesPanel
- MeasurementPanel
- SettingsPanel
- CameraControls
- KeyboardShortcutsHelp

## 🚀 Next Steps

1. Organize existing components into new folders
2. Create container components for logic separation
3. Build core services and adapters
4. Setup state management
5. Implement API layer
6. Create global Window API
