# Project Structure

Scale Master - Music Theory Application

## Directory Overview

```
scale-master/
├── public/                    # Static assets
│   └── catalog/
│       └── scales.json       # Scale type definitions
│
├── src/
│   ├── catalog/              # Catalog loading and validation
│   │   └── loader.ts         # Loads and validates scales.json
│   │
│   ├── components/           # Reusable UI components
│   │   ├── ErrorBoundary.tsx # Error boundary for React errors
│   │   ├── ErrorBoundary.css
│   │   ├── Layout.tsx        # Main layout with navigation
│   │   └── Layout.css
│   │
│   ├── hooks/                # Custom React hooks
│   │   └── useCatalogInit.ts # Catalog initialization hook
│   │
│   ├── music/                # Music theory logic
│   │   ├── characteristics.ts # Scale characteristic analysis
│   │   ├── degrees.ts        # Roman numeral conversion
│   │   └── notes.ts          # Note naming and pitch classes
│   │
│   ├── pages/                # Page components (routes)
│   │   ├── ScaleCatalogPage.tsx     # Main catalog view
│   │   ├── ScaleCatalogPage.css
│   │   ├── ScaleFinderPage.tsx      # Scale search (placeholder)
│   │   ├── ScaleDetailsPage.tsx     # Scale details (placeholder)
│   │   └── PlaceholderPage.css
│   │
│   ├── schemas/              # Zod validation schemas
│   │   └── catalog.ts        # Catalog schema definitions
│   │
│   ├── store/                # State management (Zustand)
│   │   ├── catalogStore.ts   # Catalog global state
│   │   └── README.md         # State management docs
│   │
│   ├── styles/               # Design system
│   │   ├── tokens.css        # Design tokens (CSS variables)
│   │   └── README.md         # Design system docs
│   │
│   ├── types/                # TypeScript type definitions
│   │   └── catalog.ts        # Catalog type exports
│   │
│   ├── App.tsx               # Root component with routing
│   ├── App.css               # Root styles
│   ├── main.tsx              # Application entry point
│   └── index.css             # Global styles
│
├── documents/                # Project documentation
│   ├── design-overview.md    # System design
│   ├── reqs.md              # Requirements
│   └── user-stories.md      # User stories
│
├── tsconfig.json            # TypeScript configuration
├── vite.config.js           # Vite build configuration
└── package.json             # Dependencies and scripts
```

## Architecture Layers

### 1. Presentation Layer (`pages/`, `components/`)
- **Pages**: Route-specific components
- **Components**: Reusable UI elements
- **Layout**: Navigation and page structure

### 2. State Management (`store/`)
- Global application state using Zustand
- Centralized catalog and UI state
- Action-based state updates

### 3. Business Logic (`music/`, `catalog/`)
- **Music theory**: Pure functions for note calculations
- **Catalog**: Loading, validation, indexing

### 4. Data Layer (`schemas/`, `types/`)
- **Schemas**: Runtime validation (Zod)
- **Types**: TypeScript interfaces
- **Catalog**: JSON data source

### 5. Design System (`styles/`)
- Design tokens (CSS variables)
- Consistent theming
- Component styles

## Key Technologies

- **React 19** - UI framework
- **TypeScript** - Type safety
- **React Router** - Client-side routing
- **Zustand** - State management
- **Zod** - Schema validation
- **Vite** - Build tool and dev server

## State Management Strategy

### Global State (Zustand)
- Catalog data and indexes
- Selected root note
- Future: user preferences, search state

### Local State (useState)
- Form inputs
- UI toggles
- Component-specific state

### Server State
- Not applicable (frontend-only app)

## Routing Structure

```
/                    → Scale Catalog (home)
/scale-finder        → Scale Finder (upcoming)
/scale-details       → Scale Details (upcoming)
```

## Data Flow

```
1. App loads → useCatalogInit hook
2. Load scales.json → Zod validation
3. Build indexes → Store in Zustand
4. Components subscribe → Render with data
5. User interactions → Update Zustand state
6. State changes → Components re-render
```

## Adding New Features

### 1. Create a new page

```typescript
// src/pages/NewFeaturePage.tsx
import { useCatalogInit } from '../hooks/useCatalogInit';

function NewFeaturePage() {
  useCatalogInit();
  return <div>New Feature</div>;
}
```

### 2. Add route

```typescript
// src/App.tsx
<Route path="/new-feature" element={<NewFeaturePage />} />
```

### 3. Add navigation

```typescript
// src/components/Layout.tsx
const navItems = [
  // ...
  { path: '/new-feature', label: 'New Feature' },
];
```

### 4. Add store (if needed)

```typescript
// src/store/newFeatureStore.ts
export const useNewFeatureStore = create<State>()(...);
```

## Design Patterns

### Component Organization
- **Container/Presentation**: Pages are containers, components are presentational
- **Composition**: Small, focused components composed together
- **Hooks**: Custom hooks for reusable logic

### State Updates
- **Immutable**: All state updates create new objects
- **Action-based**: Named actions in Zustand stores
- **Selective**: Components subscribe only to needed state

### Styling
- **CSS Modules**: Scoped styles per component
- **Design Tokens**: All values from CSS variables
- **Mobile-first**: Responsive design with breakpoints

## Testing Strategy (Future)

- **Unit tests**: Music theory functions (pure)
- **Integration tests**: Store actions and state changes
- **Component tests**: React Testing Library
- **E2E tests**: Playwright for user flows

## Build and Development

```bash
npm run dev      # Development server
npm run build    # Production build
npm run lint     # ESLint
npx tsc --noEmit # Type checking
```

## Next Steps

See `documents/user-stories.md` for planned features:
- US-02 to US-06: Note parsing and input
- US-07 to US-09: Scale finder
- US-10 to US-16: Scale details with modes and triads
- US-17 to US-21: Triad pair matching
- US-22 to US-26: Similar scales
- US-27 to US-30: Preferences and sharing
