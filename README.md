# Scale Master

A comprehensive music theory application for exploring scales, modes, triads, and harmonic relationships. Built with React, TypeScript, and modern web technologies.

## Features

### ✅ Implemented

- **Scale Catalog** - Browse all available scale types with comprehensive information
- **Interactive Display** - View scales with intervals, note names, and roman numeral degrees
- **Root Note Selection** - Choose any of the 12 chromatic notes as the root
- **Accidental Preference** - Toggle between sharp (#) and flat (♭) notation
- **Persistent Settings** - User preferences saved to localStorage
- **Design System** - Consistent theming with CSS design tokens
- **Type Safety** - Full TypeScript with strict mode
- **Schema Validation** - Runtime validation with Zod
- **Error Handling** - Graceful error boundaries

### 🚧 Planned Features

- **Scale Finder** - Find scales containing specific notes (US-07, US-08, US-09)
- **Scale Details** - Deep dive into modes, triads, and chord analysis (US-10 to US-16)
- **Triad Pair Matching** - Find scales containing two triads (US-17 to US-21)
- **Similar Scales** - Discover scales with minimal note differences (US-22 to US-26)
- **URL Sharing** - Share scales and searches via URL parameters (US-29, US-30)

## Tech Stack

- **React 19** - UI framework with modern hooks
- **TypeScript** - Type-safe development
- **React Router** - Client-side routing
- **Zustand** - Lightweight state management
- **Zod** - Schema validation
- **Vite** - Fast build tool and dev server
- **CSS Variables** - Design token system

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/dmkachko/scale-master.git
cd scale-master

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
# Build optimized production bundle
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
scale-master/
├── src/
│   ├── catalog/         # Scale catalog loading and validation
│   ├── components/      # Reusable UI components
│   ├── hooks/          # Custom React hooks
│   ├── music/          # Music theory logic (notes, degrees, etc.)
│   ├── pages/          # Page components (routes)
│   ├── schemas/        # Zod validation schemas
│   ├── store/          # Zustand state management
│   ├── styles/         # Design tokens and global styles
│   └── types/          # TypeScript type definitions
├── public/
│   └── catalog/        # scales.json - Scale type definitions
└── documents/          # Project documentation
```

## Development

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
npx tsc --noEmit # Type checking
```

### Adding New Features

1. Create a new page component in `src/pages/`
2. Add route in `src/App.tsx`
3. Add navigation link in `src/components/Layout.tsx`
4. Create Zustand store if needed in `src/store/`

See [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) for detailed architecture documentation.

## Design System

The app uses a comprehensive design token system with CSS custom properties. All colors, spacing, typography, and other design values are centralized in `src/styles/tokens.css`.

### Key Design Principles

- **Consistency** - Single source of truth for all design values
- **Accessibility** - WCAG-compliant color contrasts
- **Responsiveness** - Mobile-first responsive design
- **Maintainability** - Easy theme updates through tokens

See [src/styles/README.md](./src/styles/README.md) for complete design system documentation.

## State Management

The app uses Zustand for global state with two stores:

- **CatalogStore** - Scale catalog data and selected root note
- **PreferencesStore** - User preferences (persisted to localStorage)

See [src/store/README.md](./src/store/README.md) for state management documentation.

## Music Theory Engine

The core music theory logic is organized into focused modules:

- `src/music/notes.ts` - Note naming and pitch class utilities
- `src/music/degrees.ts` - Roman numeral degree conversion
- `src/music/characteristics.ts` - Scale characteristic analysis

All music theory functions are pure and testable.

## Documentation

- [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) - Architecture overview
- [documents/user-stories.md](./documents/user-stories.md) - Feature specifications
- [documents/design-overview.md](./documents/design-overview.md) - System design
- [documents/reqs.md](./documents/reqs.md) - Requirements

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- TypeScript strict mode enabled
- ESLint for code quality
- Prettier for formatting (optional)
- Follow existing patterns and conventions

## License

This project is open source and available under the MIT License.

## Acknowledgments

- Built with [React](https://react.dev/)
- Powered by [Vite](https://vitejs.dev/)
- State management by [Zustand](https://github.com/pmndrs/zustand)
- Validation by [Zod](https://zod.dev/)

---

**Scale Master** - Explore the world of musical scales and harmony 🎵
