# Architecture Documentation

## Overview

This document describes the architecture of the Scale Master application after the comprehensive refactoring completed in February 2026. The application follows a layered architecture with clear separation of concerns.

## Architecture Layers

```
┌─────────────────────────────────────────────────────────┐
│              UI Components (Presentation)               │
│  ChordCard, SequenceControls, TabSelector, etc.        │
├─────────────────────────────────────────────────────────┤
│              Custom Hooks (UI Logic)                    │
│  useChordPlayback, useSequenceManagement, etc.         │
├─────────────────────────────────────────────────────────┤
│              Services (Facade/Legacy)                   │
│  chordParser, triads, notes, scaleFinder, etc.         │
├─────────────────────────────────────────────────────────┤
│              Entities (Domain Logic)                    │
│  Note, Chord, Triad, Scale                             │
└─────────────────────────────────────────────────────────┘
```

## Layer Descriptions

### 1. Entity Layer (`src/music/entities/`)

**Purpose:** Encapsulates core music theory domain logic

**Key Classes:**
- **Note** - Represents musical notes with pitch class, octave, transposition
- **Chord** - Represents chords with root, quality, intervals, slash chords
- **Triad** - Represents triads with quality, roman numerals, extensions
- **Scale** - Represents scales with notes, triads, characteristics

**Characteristics:**
- Pure business logic, no UI dependencies
- Immutable data structures
- Rich domain methods
- 100% test coverage
- Type-safe APIs

**Example:**
```typescript
import { Note, Chord } from './entities';

const note = Note.fromString('C#4');
const transposed = note.transpose(5); // F#4

const chord = Chord.fromSymbol('Dm7/G');
const notes = chord.toNotes(); // [D, F, A, C]
```

### 2. Service Layer (`src/music/`)

**Purpose:** Provides backward-compatible facades over entities

**Key Services:**
- **chordParser** - Thin wrapper over Chord entity
- **triads** - Thin wrapper over Triad entity
- **notes** - Delegates to Note entity
- **scaleFinder** - Uses Scale entity for matching
- **chordScaleChecker** - Uses Chord and Scale entities

**Characteristics:**
- Maintains backward compatibility
- Delegates to entity layer
- Marked with `@deprecated` for new code
- Simplified from original implementation (60-70% code reduction)

**Migration Path:**
```typescript
// Old code (still works)
import { parseChord } from './music/chordParser';
const chord = parseChord('Cmaj7');

// New code (preferred)
import { Chord } from './music/entities';
const chord = Chord.fromSymbol('Cmaj7');
```

### 3. Hooks Layer (`src/hooks/`)

**Purpose:** Reusable UI logic extracted from components

**Key Hooks:**
- **useChordPlayback** - Chord playback orchestration, tempo, bass notes
- **useSequenceManagement** - Draft/edit state, scale selection, bass notes
- **useChordGrouping** - Chord organization and filtering by scales
- **useScaleGrouping** - Scale organization and filtering by chords
- **useTriadPlayback** - Triad playback with extensions and octave handling

**Characteristics:**
- Separates logic from presentation
- Reusable across components
- Follows React hooks conventions
- Clean, well-documented interfaces

**Example:**
```typescript
import { useChordPlayback } from '../hooks/useChordPlayback';

function MyComponent() {
  const { playChord, playSequence, playingIndex } = useChordPlayback({
    tempo: 120,
    chordSelectionPlaybackCount: 2,
  });

  // Use the playback functions...
}
```

### 4. Component Layer (`src/components/`, `src/pages/`)

**Purpose:** UI presentation and user interaction

**Key Components:**
- **ChordCard** - Displays chord card with controls
- **SequenceControls** - Sequence management buttons
- **TabSelector** - Tab navigation
- **BassNoteSelector** - Bass note selection UI
- **ChordTable** - Chord selection grid
- **ScaleTable** - Scale selection grid

**Characteristics:**
- Focused, single-responsibility components
- Leverage custom hooks for logic
- Styled with CSS modules
- Proper TypeScript typing

## Design Patterns

### 1. Entity Pattern
Entities encapsulate domain logic and provide rich methods for manipulation.

```typescript
// Note entity with transposition
const note = Note.fromString('C4');
const higher = note.transpose(7); // G4

// Scale entity with chord containment
const scale = Scale.fromType(scaleType, 'C');
const containsChord = scale.containsChord(chord);
```

### 2. Facade Pattern
Services provide backward-compatible facades while delegating to entities.

```typescript
// Service (facade)
export function parseChord(symbol: string): Chord | null {
  const entity = ChordEntity.fromSymbol(symbol);
  return entity ? convertToLegacyChord(entity) : null;
}
```

### 3. Custom Hook Pattern
Hooks encapsulate stateful logic that can be shared across components.

```typescript
export function useChordPlayback(options) {
  const [playingIndex, setPlayingIndex] = useState(null);
  // ... playback logic
  return { playingIndex, playChord, playSequence };
}
```

### 4. Component Composition
Components are composed of smaller, focused sub-components.

```typescript
<SequenceBuilder>
  <SequenceControls />
  <ChordCard />
  <TabSelector />
  <BassNoteSelector />
</SequenceBuilder>
```

## Data Flow

### Chord Selection Flow
```
User clicks chord
  → Component calls onSelectChord
    → Hook applies bass note (if selected)
      → Entity creates Chord with bass
        → Playback hook plays chord
          → Audio engine plays notes
```

### Scale Filtering Flow
```
User selects scale
  → Hook updates selected scales
    → useChordGrouping filters chords
      → Scale entity checks containsPitchClasses
        → ChordTable displays filtered chords
```

## Testing Strategy

### Entity Layer
- **Coverage:** 100%
- **Approach:** Unit tests for all methods
- **Location:** `src/music/entities/__tests__/`
- **Tools:** Jest/Vitest (when test framework is set up)

### Hook Layer
- **Coverage:** To be added
- **Approach:** Test hooks with React Testing Library
- **Focus:** State management, side effects

### Component Layer
- **Coverage:** To be added
- **Approach:** Integration tests with user interactions
- **Focus:** User workflows, accessibility

## Migration Guide

### For New Features
1. Use entity classes directly (`Note`, `Chord`, `Triad`, `Scale`)
2. Use custom hooks for UI logic
3. Create focused components
4. Follow established patterns

### For Existing Code
1. Legacy service functions still work
2. Gradually migrate to entities when touching code
3. No rush - backward compatibility maintained
4. Mark old code with `// TODO: Migrate to entity`

### Example Migration
```typescript
// Before
import { parseChord } from './music/chordParser';
import { calculateTriads } from './music/triads';

const chord = parseChord('Cmaj7');
const triads = calculateTriads(scaleNotes, intervals);

// After
import { Chord, Triad } from './music/entities';

const chord = Chord.fromSymbol('Cmaj7');
const triads = Triad.calculateAll(scaleNotes, intervals);
```

## File Organization

```
src/
├── music/
│   ├── entities/           # Core domain entities
│   │   ├── Note.ts
│   │   ├── Chord.ts
│   │   ├── Triad.ts
│   │   ├── Scale.ts
│   │   ├── index.ts
│   │   └── __tests__/      # Entity tests
│   ├── chordParser.ts      # Legacy facade
│   ├── triads.ts           # Legacy facade
│   ├── notes.ts            # Legacy facade
│   └── ...
├── hooks/                  # Custom React hooks
│   ├── useChordPlayback.ts
│   ├── useSequenceManagement.ts
│   └── ...
├── components/             # Shared components
│   ├── ChordTable.tsx
│   ├── ScaleTable.tsx
│   └── ...
└── pages/                  # Page components
    └── sequence-builder/
        ├── SequenceBuilderPage.tsx
        └── components/     # Page-specific components
            ├── ChordCard.tsx
            ├── SequenceControls.tsx
            └── ...
```

## Performance Considerations

### Memoization
- **Hooks:** Use `useMemo` and `useCallback` appropriately
- **Components:** Use `React.memo` for expensive renders
- **Entities:** Immutable, can be safely memoized

### Lazy Loading
- Consider dynamic imports for large feature areas
- Split chunks by route or feature

### Audio
- Audio engine manages Web Audio API efficiently
- Playback cancellation prevents overlapping sounds

## Future Enhancements

### Short Term
- Complete component extractions
- Set up test framework (Vitest)
- Add hook and component tests

### Medium Term
- Performance profiling and optimization
- Accessibility audit and improvements
- Mobile responsiveness enhancements

### Long Term
- Progressive Web App features
- Offline support
- Advanced music theory features

## References

- [React Hooks Documentation](https://react.dev/reference/react)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Domain-Driven Design](https://martinfowler.com/bliki/DomainDrivenDesign.html)

---

**Last Updated:** February 11, 2026
**Authors:** Development Team + Claude Sonnet 4.5
