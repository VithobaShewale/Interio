# Professional Architecture Plan for Blueprint3D

## 🏗️ Architecture Overview

### Current State
- React components with direct Blueprint3D integration
- Hardcoded content and UI strings
- Mixed business logic and UI logic
- No API layer or data abstraction

### Target Architecture
```
┌─────────────────────────────────────────────────────────┐
│                     Presentation Layer                   │
│  ├─ React Components (UI only)                          │
│  ├─ Internationalization (i18n)                         │
│  └─ Styling & Themes                                    │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│                    Application Layer                     │
│  ├─ State Management (Redux/Zustand)                   │
│  ├─ Business Logic (Services)                          │
│  ├─ API Client (Axios/Fetch)                           │
│  └─ Global Commands (Window API)                       │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│                      Core Layer                          │
│  ├─ Blueprint3D Engine Adapter                         │
│  ├─ Domain Models                                       │
│  └─ Type Definitions                                    │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│                      Data Layer                          │
│  ├─ API Services (REST/GraphQL)                        │
│  ├─ Authentication                                      │
│  ├─ Local Storage / IndexedDB                          │
│  └─ Database Integration (Future)                      │
└─────────────────────────────────────────────────────────┘
```

## 📁 New Folder Structure

```
src/
├── api/                          # API Layer
│   ├── client.ts                # Axios/Fetch configuration
│   ├── endpoints/
│   │   ├── items.ts            # Item catalog API
│   │   ├── textures.ts         # Texture assets API
│   │   ├── designs.ts          # Save/load designs
│   │   └── auth.ts             # Authentication
│   └── types.ts                # API response types
│
├── assets/                      # Static assets
│   ├── locales/                # i18n translation files
│   │   ├── en.json
│   │   ├── es.json
│   │   ├── fr.json
│   │   └── de.json
│   └── data/                   # Mock JSON data
│       ├── items.json
│       ├── textures.json
│       └── config.json
│
├── components/                  # Presentational Components
│   ├── common/                 # Reusable UI components
│   ├── layout/                 # Layout components
│   └── features/               # Feature-specific components
│
├── containers/                  # Container Components (logic)
│   ├── FloorPlannerContainer.tsx
│   ├── ItemCatalogContainer.tsx
│   └── SettingsContainer.tsx
│
├── core/                        # Core Business Logic
│   ├── adapters/               # Blueprint3D adapters
│   │   ├── Blueprint3DAdapter.ts
│   │   └── CommandAdapter.ts
│   ├── models/                 # Domain models
│   │   ├── Item.ts
│   │   ├── Design.ts
│   │   └── User.ts
│   └── services/               # Business services
│       ├── DesignService.ts
│       ├── ItemService.ts
│       └── AuthService.ts
│
├── store/                       # State Management
│   ├── slices/                 # Redux slices / Zustand stores
│   │   ├── designSlice.ts
│   │   ├── uiSlice.ts
│   │   ├── authSlice.ts
│   │   └── catalogSlice.ts
│   └── index.ts                # Store configuration
│
├── hooks/                       # Custom React Hooks
│   ├── useBlueprint3D.ts
│   ├── useApi.ts
│   └── useAuth.ts
│
├── utils/                       # Utility functions
│   ├── i18n.ts                 # i18n setup
│   ├── constants.ts
│   └── helpers.ts
│
├── global/                      # Global Window API
│   └── WindowAPI.ts            # Exposed global commands
│
└── App.tsx                      # Root component

```

## 🌍 Internationalization (i18n)

### Implementation with react-i18next
```typescript
// Supports multiple languages
// Easy content management
// Dynamic language switching
// Pluralization & formatting
```

## 🔌 Global Window API

### Exposed Commands
```javascript
window.Blueprint3DApp = {
  design: {
    addItem(itemId, position),
    removeItem(itemId),
    save(),
    load(designId),
    export(format),
    undo(),
    redo()
  },
  camera: {
    reset(),
    setView(view),
    zoom(level)
  },
  ui: {
    openPanel(panelName),
    closePanel(),
    setLanguage(lang),
    setTheme(theme)
  },
  auth: {
    login(credentials),
    logout(),
    getCurrentUser()
  }
}
```

## 🔐 Authentication & Authorization

### Features
- JWT-based authentication
- Role-based access control (RBAC)
- Protected routes
- Session management
- OAuth integration ready

## 💾 Data Management

### API Integration
- RESTful API endpoints
- GraphQL support (optional)
- Request/Response interceptors
- Error handling
- Caching strategy
- Offline support

### Database Integration (Future)
- User profiles
- Design storage
- Collaboration features
- Version history
- Asset management

## 📦 State Management

### Redux Toolkit / Zustand
- Centralized state
- Predictable updates
- DevTools integration
- Middleware support
- Async actions

## 🎨 Separation of Concerns

### Presentational vs Container Components
- **Presentational**: Pure UI, no business logic
- **Container**: Data fetching, state management, logic
- **Services**: Business logic, API calls
- **Adapters**: Engine integration

## 🚀 Implementation Phases

### Phase 1: Foundation (Week 1-2)
1. Setup i18n with react-i18next
2. Create API client infrastructure
3. Implement state management
4. Setup folder structure

### Phase 2: Core Services (Week 3-4)
1. Create Blueprint3D adapter
2. Build API services layer
3. Implement global Window API
4. Refactor existing components

### Phase 3: Features (Week 5-6)
1. Add authentication
2. Implement API integration
3. Add database support
4. Create admin panel

### Phase 4: Polish (Week 7-8)
1. Performance optimization
2. Testing & documentation
3. Deployment setup
4. Monitoring & analytics

## 🛠️ Technology Stack

### Core
- React 18 + TypeScript
- Redux Toolkit / Zustand
- React Router v6

### API & Data
- Axios
- React Query (data fetching)
- Zod (validation)

### i18n
- react-i18next
- i18next

### Authentication
- JWT
- React OAuth2
- Auth0 / Firebase Auth

### Testing
- Jest
- React Testing Library
- Cypress (E2E)

### Build & Deploy
- Vite
- Docker
- CI/CD (GitHub Actions)

## 📝 Benefits

✅ **Maintainability**: Clear separation of concerns
✅ **Scalability**: Easy to add features
✅ **Testability**: Isolated components and services
✅ **Flexibility**: API-driven content
✅ **International**: Multi-language support
✅ **Extensibility**: Plugin architecture
✅ **Professional**: Enterprise-ready patterns
✅ **Collaboration**: Multiple developers can work
✅ **Integration**: Easy to integrate with backend

## 🎯 Next Steps

1. Review and approve architecture
2. Install required dependencies
3. Create base infrastructure
4. Migrate existing code incrementally
5. Add new features

Would you like me to proceed with implementation?
