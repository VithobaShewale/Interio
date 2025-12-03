# Integration Guide - New Architecture

## Quick Start

This guide shows how to integrate the new professional architecture into your existing Blueprint3D React application.

---

## Step 1: Update App.tsx Root

Replace your current App.tsx with the new architecture:

```typescript
import React from 'react';
import { Blueprint3DProvider } from './core/blueprint3d';
import { DesignContainer, ItemCatalogContainer, AuthContainer } from './containers';
import { useUIStore, useAuthStore } from './store';
import { AuthModal } from './components/common/Auth';
import './App.css';

// Your existing components
import Toolbar from './components/layout/Toolbar';
import Sidebar from './components/layout/Sidebar';
import FloorPlanner from './components/features/FloorPlanner';
import ThreeViewer from './components/features/ThreeViewer';

const blueprint3dConfig = {
  floorplannerElement: 'floorplanner-canvas',
  threeElement: 'viewer',
  textureDir: '/rooms/textures/',
};

function AppContent() {
  const { viewMode, activePanel, showSettings } = useUIStore();
  const { isAuthenticated } = useAuthStore();
  
  return (
    <AuthContainer>
      {(authProps) => (
        <DesignContainer>
          {(designProps) => (
            <ItemCatalogContainer>
              {(itemProps) => (
                <div className="app-container">
                  <Toolbar
                    isAuthenticated={isAuthenticated}
                    onLogin={() => {/* Open auth modal */}}
                    onLogout={authProps.logout}
                  />
                  
                  <div className="main-content">
                    <Sidebar
                      activePanel={activePanel}
                      items={itemProps.items}
                      categories={itemProps.categories}
                    />
                    
                    <div className="viewer-container">
                      {viewMode === '2d' && <FloorPlanner />}
                      {viewMode === '3d' && <ThreeViewer />}
                    </div>
                  </div>
                  
                  <AuthModal
                    isOpen={!isAuthenticated}
                    onClose={() => {}}
                  />
                </div>
              )}
            </ItemCatalogContainer>
          )}
        </DesignContainer>
      )}
    </AuthContainer>
  );
}

function App() {
  return (
    <Blueprint3DProvider config={blueprint3dConfig}>
      <AppContent />
    </Blueprint3DProvider>
  );
}

export default App;
```

---

## Step 2: Update FloorPlanner Component

Replace direct Blueprint3D access with the manager:

```typescript
// OLD CODE (Remove this)
const blueprint3d = (window as any).BP3D.Blueprint3d;

// NEW CODE (Add this)
import { useBlueprint3DContext } from '../../core/blueprint3d';

const FloorPlanner: React.FC = () => {
  const { manager, isReady } = useBlueprint3DContext();
  
  useEffect(() => {
    if (!isReady) return;
    
    // Use manager instead of direct access
    manager.on('floorplannerModeChanged', (mode) => {
      console.log('Mode changed:', mode);
    });
    
    return () => {
      // Cleanup listeners
    };
  }, [manager, isReady]);
  
  const handleModeChange = (mode: 0 | 1 | 2) => {
    if (manager) {
      manager.setFloorplannerMode(mode);
    }
  };
  
  // Rest of component...
};
```

---

## Step 3: Update Sidebar to Use Item Store

```typescript
import { useItemStore } from '../../store';
import { ItemCatalogContainer } from '../../containers';

const Sidebar: React.FC = () => {
  return (
    <ItemCatalogContainer>
      {({ 
        items, 
        categories, 
        selectedCategory,
        setCategory, 
        setSearch 
      }) => (
        <div className="sidebar">
          {/* Category filter */}
          <select onChange={(e) => setCategory(e.target.value)}>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          
          {/* Search */}
          <input 
            type="text" 
            placeholder="Search items..."
            onChange={(e) => setSearch(e.target.value)}
          />
          
          {/* Item list */}
          {items.map(item => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </ItemCatalogContainer>
  );
};
```

---

## Step 4: Update Design Save/Load

Replace localStorage calls with DesignContainer:

```typescript
// OLD CODE (Remove this)
const saveDesign = () => {
  const data = blueprint3d.model.exportSerialized();
  localStorage.setItem('design', data);
};

// NEW CODE (Use this)
<DesignContainer>
  {({ saveDesign, isDirty, currentDesign }) => (
    <button 
      onClick={saveDesign} 
      disabled={!isDirty}
    >
      Save {currentDesign?.name}
      {isDirty && ' *'}
    </button>
  )}
</DesignContainer>
```

---

## Step 5: Add Authentication UI

Add login/logout buttons to Toolbar:

```typescript
import { AuthContainer } from '../../containers';
import { AuthModal } from '../common/Auth';

const Toolbar: React.FC = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  return (
    <AuthContainer>
      {({ user, isAuthenticated, logout }) => (
        <div className="toolbar">
          {isAuthenticated ? (
            <>
              <span>Welcome, {user?.name}</span>
              <button onClick={logout}>Logout</button>
            </>
          ) : (
            <button onClick={() => setShowAuthModal(true)}>
              Login
            </button>
          )}
          
          <AuthModal
            isOpen={showAuthModal}
            onClose={() => setShowAuthModal(false)}
          />
        </div>
      )}
    </AuthContainer>
  );
};
```

---

## Step 6: Use UI Store for View Modes

Replace local state with UI store:

```typescript
import { useUIStore } from '../../store';

const ViewModeToggle: React.FC = () => {
  const { viewMode, setViewMode } = useUIStore();
  const { manager } = useBlueprint3DContext();
  
  const handleViewChange = (mode: '2d' | '3d' | 'wall') => {
    setViewMode(mode);
    manager?.setViewMode(mode);
  };
  
  return (
    <div>
      <button 
        className={viewMode === '3d' ? 'active' : ''}
        onClick={() => handleViewChange('3d')}
      >
        3D View
      </button>
      <button 
        className={viewMode === '2d' ? 'active' : ''}
        onClick={() => handleViewChange('2d')}
      >
        2D View
      </button>
    </div>
  );
};
```

---

## Step 7: Add Global Notifications

Use UI store for notifications:

```typescript
import { useUIStore } from '../../store';

const NotificationBar: React.FC = () => {
  const { notification, clearNotification } = useUIStore();
  
  if (!notification) return null;
  
  return (
    <div className={`notification ${notification.type}`}>
      {notification.message}
      <button onClick={clearNotification}>×</button>
    </div>
  );
};

// Usage in any component:
const SomeComponent = () => {
  const { showNotification } = useUIStore();
  
  const handleAction = () => {
    showNotification('Action completed!', 'success');
  };
  
  return <button onClick={handleAction}>Do Something</button>;
};
```

---

## Step 8: Environment Configuration

Create `.env` file:

```env
REACT_APP_API_BASE_URL=http://localhost:3001/api
REACT_APP_USE_MOCK_API=true
```

---

## Step 9: Update Package.json Scripts

Add development and production scripts:

```json
{
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "build:dev": "REACT_APP_USE_MOCK_API=true react-scripts build",
    "build:prod": "REACT_APP_USE_MOCK_API=false react-scripts build",
    "test": "react-scripts test",
    "lint": "eslint src --ext .ts,.tsx"
  }
}
```

---

## Step 10: Backend API Setup (When Ready)

Switch from mock to real API:

```typescript
// In src/services/api/ItemApiService.ts
class ItemApiService {
  private readonly endpoint = '/items';
  private readonly useMock = false; // Change to false when backend is ready
  
  // Rest of the code...
}
```

Create backend endpoints:

```typescript
// Backend API (Node.js/Express example)
app.get('/api/items', async (req, res) => {
  const { category, search, page = 1, limit = 20 } = req.query;
  const items = await db.items.find({ category, search })
    .skip((page - 1) * limit)
    .limit(limit);
  res.json({ items, total: items.length, page, totalPages: Math.ceil(items.length / limit) });
});

app.get('/api/designs/:id', async (req, res) => {
  const design = await db.designs.findById(req.params.id);
  res.json(design);
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await authenticateUser(email, password);
  const token = generateToken(user);
  res.json({ user, token });
});
```

---

## Common Patterns

### Pattern 1: Fetch Data on Mount
```typescript
const MyComponent = () => {
  return (
    <ItemCatalogContainer>
      {({ items, loadItems, isLoading }) => {
        useEffect(() => {
          loadItems();
        }, [loadItems]);
        
        if (isLoading) return <LoadingSpinner />;
        return <ItemList items={items} />;
      }}
    </ItemCatalogContainer>
  );
};
```

### Pattern 2: Handle User Actions
```typescript
<DesignContainer>
  {({ saveDesign, deleteDesign, isDirty }) => (
    <div>
      <button onClick={saveDesign} disabled={!isDirty}>
        Save
      </button>
      <button onClick={() => deleteDesign(id)}>
        Delete
      </button>
    </div>
  )}
</DesignContainer>
```

### Pattern 3: Listen to Blueprint3D Events
```typescript
const { manager, isReady } = useBlueprint3DContext();

useEffect(() => {
  if (!isReady) return;
  
  const handleItemSelected = (item) => {
    console.log('Selected:', item);
  };
  
  manager.on('itemSelected', handleItemSelected);
  
  return () => {
    manager.off('itemSelected', handleItemSelected);
  };
}, [manager, isReady]);
```

### Pattern 4: Access Store Directly
```typescript
import { useDesignStore } from './store';

const MyComponent = () => {
  const { currentDesign, markDirty } = useDesignStore();
  
  const handleChange = () => {
    markDirty(); // Update store directly
  };
  
  return <div>{currentDesign?.name}</div>;
};
```

---

## Testing Examples

### Test Service
```typescript
import { designApiService } from './services/api';

jest.mock('./services/api/BaseApiService');

test('should load design', async () => {
  const mockDesign = { id: '1', name: 'Test' };
  jest.spyOn(designApiService, 'getDesign').mockResolvedValue({ data: mockDesign });
  
  const result = await designApiService.getDesign('1');
  expect(result.data.name).toBe('Test');
});
```

### Test Store
```typescript
import { useDesignStore } from './store';
import { renderHook, act } from '@testing-library/react';

test('should mark design as dirty', () => {
  const { result } = renderHook(() => useDesignStore());
  
  act(() => {
    result.current.markDirty();
  });
  
  expect(result.current.isDirty).toBe(true);
});
```

### Test Component with Container
```typescript
import { render, screen } from '@testing-library/react';
import { DesignContainer } from './containers';

test('should display design name', () => {
  render(
    <DesignContainer>
      {({ currentDesign }) => (
        <div>{currentDesign?.name}</div>
      )}
    </DesignContainer>
  );
  
  expect(screen.getByText(/Design Name/)).toBeInTheDocument();
});
```

---

## Troubleshooting

### Issue: "Blueprint3D not initialized"
**Solution**: Ensure Blueprint3DProvider wraps your app and wait for `isReady` flag.

### Issue: "Cannot read property 'data' of undefined"
**Solution**: Check if API response follows the expected format. Add error handling.

### Issue: "Store updates not triggering re-render"
**Solution**: Make sure you're using the hook correctly: `const { value } = useStore()`, not `const store = useStore()`.

### Issue: "Mock data not loading"
**Solution**: Check `useMock` flag in ItemApiService is set to `true`.

---

## Migration Checklist

- [ ] Wrap App with Blueprint3DProvider
- [ ] Add AuthContainer, DesignContainer, ItemCatalogContainer
- [ ] Update FloorPlanner to use Blueprint3DContext
- [ ] Update ThreeViewer to use Blueprint3DContext
- [ ] Update Sidebar to use ItemStore
- [ ] Replace localStorage calls with stores
- [ ] Add authentication UI (login/logout)
- [ ] Update view mode controls to use UIStore
- [ ] Add notification bar
- [ ] Test all workflows
- [ ] Setup backend API
- [ ] Switch from mock to real API
- [ ] Add error boundaries
- [ ] Add loading states

---

## Performance Tips

1. **Memoize expensive computations**:
```typescript
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(items);
}, [items]);
```

2. **Use selective store subscriptions**:
```typescript
// Only re-render when currentDesign changes
const currentDesign = useDesignStore(state => state.currentDesign);
```

3. **Debounce search inputs**:
```typescript
const debouncedSearch = useDebounce(searchQuery, 300);
useEffect(() => {
  loadItems();
}, [debouncedSearch]);
```

---

## Conclusion

This integration guide provides step-by-step instructions for migrating your existing Blueprint3D React app to the new professional architecture. Follow each step carefully, test thoroughly, and you'll have a production-ready, maintainable application.

For questions or issues, refer to:
- `PROFESSIONAL_ARCHITECTURE.md` - Architecture details
- `TECHNICAL_DEBT_RESOLUTION.md` - What was fixed and why
- Individual service/store files - API documentation in comments
