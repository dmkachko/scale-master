# Music Theory App — System Design (Frontend Only)

## 1. Overview

This document describes the **frontend-only** system design for a deterministic music-theory application that operates on a finite **scale catalog**.

### 1.1 Implemented Features

✅ **Currently Working:**
- Scale catalog browser with filtering and root selection
- Scale details with intervals, notes, and playback
- Triads-in-scale analysis with quality detection and extensions
- Scale relatives discovery (1st and 2nd degree alterations)
- Audio playback with Tone.js (multiple patterns, chord/arpeggio modes)
- State management with persistence (Zustand stores)

❌ **Not Yet Implemented:**
- Scale matching by note set (Scale Finder placeholder exists)
- Mode discovery by rotation + catalog lookup (uses pre-computed inversions map instead)
- Scale matching for a pair of triads
- Similar-scale search by set distance

🎵 **Additional Features (beyond original design):**
- Interactive audio playback with Salamander piano samples
- Playback patterns (ascending, descending, alternating, ladder)
- Real-time playback visualization
- Scale relatives analysis (1st/2nd degree alterations)
- Triad extension analysis (#5, b5, 6, 7, maj7)

No backend services are used.

---

## 2. Core Data Model

### 2.1 Pitch-class normalization
All computations use **pitch classes** (0–11). Octaves are ignored.

- Input notes are parsed into pitch classes.
- Enharmonic equivalents are treated as equal for matching.

**Design note:** spelling (C# vs Db) is a *presentation* concern; matching is spelling-agnostic.

### 2.2 Set representation
All note collections (scales, chords, user inputs) are represented as **sets of pitch classes**.

Recommended internal representation:
- **12-bit set** (bitmask) OR an equivalent canonical set abstraction.

Properties required from the set representation:
- Efficient subset test (“does scale contain all input notes?”)
- Efficient difference/overlap computation
- Efficient distance metric (“how many notes differ?”)

### 2.3 Catalog entities

**ScaleType** (actual implementation from `src/schemas/catalog.ts`)
- `id` (stable unique key, string)
- `name` (human-readable name)
- `alternativeNames` (array of strings, optional)
- `family` (grouping string, required)
- `intervals` (array of 0-11 semitones, sorted, must include 0)
- `steps` (array of whole/half steps, optional, pre-calculated)
- `modeOf` (object with `{id: string, step: number}`, nullable)
- `inversions` (record mapping step → mode scale ID, optional)

**ConcreteScale**
- Not a distinct type in implementation
- Derived on-demand via `calculateScaleNotes(root, intervals, preferSharps)`

Computed properties:
- `notes` (array of note name strings with preferred accidentals)
- `triads` (computed via `calculateTriads(notes, intervals)`)
- `relatives` (computed via `findRelatedScales(scale, catalog)`)

**Implementation Note:** The app does not pre-compute all concrete scales (12 roots × N types). Scales are instantiated on-demand when viewing a specific scale type + root combination.

---

## 3. Catalog Indexing and Canonical Keys

To enable mode resolution and fast matching, the catalog is indexed by a canonical “interval set key”.

### 3.1 Interval set key
A canonical key is produced from a normalized interval list:
- Intervals sorted ascending
- Intervals reduced to [0..11]
- Always include 0
- Key format: `"0,2,4,5,7,9,11"` (example)

### 3.2 Required catalog indexes

At runtime, the app builds:
- **ScaleTypeById**: `id -> ScaleType`
- **ScaleTypeByIntervalKey**: `intervalKey -> ScaleType`

Optional supporting indexes:
- `ScaleTypesByFamily`
- `ConcreteScales` precomputed list for all roots (0–11) × scale types

---

## 4. Algorithms and Methods

### 4.1 Parsing and normalization (Notes)

**Status: ❌ NOT IMPLEMENTED**

**Goal:** Convert user input tokens into a pitch-class set.

**Proposed Method:**
1. Tokenize user string (comma/space-separated).
2. Parse each token into a pitch class:
    - Base letter A–G
    - Accidentals (#, b, double, etc.)
    - Optional octave suffix ignored
3. Convert to pitch class (mod 12).
4. Aggregate into set (deduplicate).

**Outputs:**
- `inputSet` (pitch-class set)
- parse errors (invalid tokens) for UI feedback

**Current State:** Scale Finder page exists but is only a placeholder. No note parsing logic has been implemented.

---

### 4.2 Scale instantiation (Concrete scale notes)

**Goal:** Derive scale note set from `(root, scaleType.intervals)`.

**Method:**
- For each interval `i` in scale type:
    - note = (root + i) mod 12
- Aggregate into set

**Outputs:**
- `scaleSet` (pitch-class set)
- `orderedScaleNotes` (optional, for degree mapping; ordering based on intervals)

---

### 4.3 Scale matching by notes (Scale Finder)

**Status: ❌ NOT IMPLEMENTED**

**Goal:** Find all concrete scales that contain the user's note set.

**Inputs:**
- `inputSet`
- catalog scale types

**Method:**
For each scale type `T`:
- For each root `r` in 0..11:
    - Build `scaleSet(T, r)`
    - Match rule: `inputSet ⊆ scaleSet`

**Ranking (recommended):**
- Minimal “extra notes” first: `|scaleSet| - |inputSet|`
- Optional: prefer smaller scales, then stable ordering by family/name

**Outputs per match:**
- scale type (id/name)
- root
- scale notes
- extra notes count (optional)

---

### 4.4 Modes (Pre-computed Inversions Map)

**Goal:** For a selected scale type, display its modes with resolved names from catalog.

**Inputs:**
- selected `ScaleType` with `inversions` map
- catalog for name lookups

**Method (ACTUAL IMPLEMENTATION):**
1. Check if scale has `inversions` map (record of step → mode scale ID)
2. For each entry in inversions:
    - step (degree number): the scale degree that becomes the new root
    - modeScaleId: the catalog ID of the resulting mode
3. Look up the mode scale by ID in catalog
4. Display mode name and link to that scale's detail page

**Outputs per mode:**
- degree/step (e.g., "2nd mode", "3rd mode")
- mode scale ID
- mode name (from catalog)
- navigation link to mode scale page

**Implementation Difference from Original Design:**
- ❌ Does NOT dynamically rotate intervals at runtime
- ❌ Does NOT use `ScaleTypeByIntervalKey` index for lookup
- ✅ Uses pre-computed `inversions` map in catalog data
- ✅ Simpler and faster, but requires catalog maintainer to populate inversions
- ⚠️ If inversions map is missing, no modes are shown (no fallback rotation algorithm)

**Rationale for Change:**
Pre-computed inversions avoid runtime complexity and ensure mode names match catalog intent. However, this means modes must be manually maintained in the catalog file.

---

### 4.5 Triads in a scale (Diatonic triads)

**Goal:** Determine the triad on each scale degree by stacking scale tones, plus analyze available extensions.

**Inputs:**
- scale notes (array of note names)
- scale intervals (array of semitone offsets from root)
- scale family (for determining if Roman numerals should be shown)

**Method (implemented in `src/music/triads.ts`):**
For a scale with N notes in order:
- For each degree `d`:
    - root = note[d]
    - third = note[(d+2) mod N]
    - fifth = note[(d+4) mod N]
    - triadSet = {root, third, fifth}
    - classify quality by semitone intervals:
        - major: root to third = 4, third to fifth = 3
        - minor: root to third = 3, third to fifth = 4
        - diminished: root to third = 3, third to fifth = 3
        - augmented: root to third = 4, third to fifth = 4
        - sus2: root to third = 2, third to fifth = 5
        - sus4: root to third = 5, third to fifth = 2
    - **Calculate extensions** (NEW):
        - Check available intervals from triad root in scale
        - Identify: alt5 (b5 can be replaced with #5), #5, 6, 7, maj7
        - Rules:
            - If chord has b5 and scale has #5 → add "alt5"
            - If chord has natural 5 and scale has #5 → add "#5"
            - If scale has 6 and chord doesn't have #5 → add "6"
            - Add "maj7" if available (11 semitones), else "7" if available (10 semitones)
    - Generate Roman numeral based on degree and quality

**Outputs per degree (Triad type):**
- degree (0-based index)
- root (note name)
- quality (TriadQuality enum)
- notes (array of 3 note names)
- romanNumeral (e.g., "I", "ii", "iii°", "IV", "V", "vi", "vii°")
- extensions (optional array: ["#5", "b5", "6", "7", "maj7"])

**UI Features:**
- Click root note → plays triad as chord or arpeggio (selected via radio)
- Click extension button → plays triad with that extension added
- Alt5 elaborated into separate #5 and b5 buttons
- b5 button hidden for diminished triads (already has b5)
- Roman numerals only shown for diatonic/minor/harmonic-minor/melodic-minor families

**Note:** Works for all scale cardinalities (5, 6, 7, 8+ notes). For non-heptatonic scales, method remains deterministic but may produce unconventional triad types.

---

### 4.6 Scales matching a pair of triads

**Status: ❌ NOT IMPLEMENTED**

**Goal:** Identify scales containing both triads and map each triad to degrees within each scale.

**Inputs:**
- Triad A: (root, quality) or direct note set
- Triad B: (root, quality) or direct note set
- catalog (concrete scales)

**Method:**
1. Build `triadSetA`, `triadSetB`.
2. Combine constraints: `requiredSet = triadSetA ∪ triadSetB`.
3. Find matching scales using the Scale Finder method (`requiredSet ⊆ scaleSet`).
4. For each matched scale:
    - Determine the degree index of triad roots:
        - Find position of triad root in ordered scale notes (if present)
    - Determine diatonic status (optional but recommended):
        - Compare input triad’s note set with the triad produced by the scale at that degree
        - If identical: mark “diatonic”, else “contained but non-diatonic”

**Outputs per match:**
- scale name/id and root
- Triad A degree + diatonic flag
- Triad B degree + diatonic flag

---

### 4.7 Similar scales (Distance search)

**Status: ❌ NOT IMPLEMENTED**

**Goal:** Find scales "close" to a selected scale by changing 1 or 2 notes.

**Inputs:**
- target `scaleSet`
- options:
    - maxChanges = 1 or 2
    - sameCardinality (require same number of notes) boolean

**Method:**
1. Precompute list of all concrete scales from the catalog.
2. For each candidate scale:
    - Optionally skip if cardinality differs and sameCardinality is enabled.
    - Compute set difference (or XOR distance for bit sets).
3. Convert “distance” to note-change count:
    - One note swap = remove 1 + add 1 = 2 differing notes
    - Two swaps = 4 differing notes
4. Keep candidates with distance <= threshold.
5. Sort by distance, then stable ordering (family/name/root).

**Outputs per similar scale:**
- candidate scale identity
- added notes (candidate - target)
- removed notes (target - candidate)
- distance metric

### 4.8 Scale Relatives (First/Second Degree Alterations)

**Status: ✅ IMPLEMENTED** (not in original design)

**Goal:** Find related scales by altering one or two scale intervals by ±1 semitone.

**Inputs:**
- current scale (intervals array)
- catalog (all scale types)
- current root
- degree filter: 1st degree (1 alteration) or 2nd degree (2 alterations)

**Method (implemented in `src/music/relatives.ts`):**
1. Generate all possible 1-alteration variants:
    - For each interval (except root):
        - Try raising by 1 semitone (if result ≤ 11)
        - Try lowering by 1 semitone (if result ≥ 0)
    - Normalize and deduplicate resulting interval sets
2. For each variant:
    - Convert to canonical interval key string
    - Look up in catalog by intervals matching
3. If 2nd degree requested:
    - For each 1st degree relative found:
        - Recursively apply 1-alteration to generate 2nd degree variants
        - Deduplicate and look up in catalog

**Outputs per relative:**
- relativeScale (ScaleType from catalog)
- degree (1 or 2)
- alterations (array of {interval: number, direction: 'up' | 'down'})

**UI Display:**
- Grouped by degree (1st degree / 2nd degree)
- Shows scale name and alteration description
- Links to relative scale detail page
- Displayed in RelativesSection on scale detail page

**Use Cases:**
- Discover scales similar to current scale
- Explore harmonic relationships between scales
- Navigate between closely related scale families

### 4.9 Audio Playback System

**Status: ✅ FULLY IMPLEMENTED** (major addition not in original design)

**Goal:** Provide interactive audio playback for scales, triads, and individual notes using high-quality piano samples.

**Technology Stack:**
- Tone.js library for Web Audio API abstraction
- Salamander Grand Piano samples (sampled at minor third intervals: A0, C1, D#1, F#1, etc.)
- Samples hosted locally at `/public/samples/salamander/`

**Audio Engine** (`src/services/audioEngine.ts`)

Singleton service providing:

1. **Single Note Playback:**
   - `playNote(note: string, duration?: number)` - plays one note with octave
   - Used for individual note buttons on scale cards

2. **Chord Playback:**
   - `playChord(notes: string[], duration?: number)` - plays notes simultaneously
   - Used for triad playback in chord mode
   - Handles octave calculation to ensure proper voicing

3. **Arpeggio Playback:**
   - `playArpeggio(notes: string[], duration?: number)` - plays notes sequentially with 200ms delay
   - Used for triad playback in arpeggio mode
   - Notes sorted by MIDI pitch for ascending order

4. **Pattern Sequence Playback:**
   - `startSequence(scaleId, notes, timeSignature, tempo, pattern, octave)` - looping scale playback
   - Supports time signatures: 4/4, 3/4
   - Tempo range: 60-240 BPM
   - Accents on downbeats (every 4th or 3rd note)
   - Real-time state updates via Tone.Draw.schedule
   - Updates audioStore with current note index for UI highlighting

5. **Playback Control:**
   - `stop()` - stops all current playback
   - Cleanup and state reset

**Scale Patterns** (`src/services/scalePatterns.ts`)

Pattern types with dynamic generation based on scale length:
- **Ascending:** 1, 2, 3, ..., N, N+1(octave)
- **Descending:** N+1, N, ..., 3, 2, 1
- **Alternating:** 1, N+1, 2, N, 3, N-1, ...
- **Ladder:** 1-2-1, 2-3-2, 3-4-3, ..., up and back down

**Pattern Selector Component:**
- Radio button UI for pattern selection
- Persisted in preferences store
- Applied to all scale playback

**Octave Management:**
- `addOctavesToNotes(notes, baseOctave)` - assigns octaves to scale notes
- Detects chromatic wrapping (when pitch class decreases)
- Ensures scales play correctly across octaves (e.g., A minor doesn't play C below A)
- Used throughout playback system for consistent voicing

**State Management:**
- **audioStore** (`src/store/audioStore.ts`):
    - isPlaying: boolean
    - currentNoteIndex: number
    - currentNoteStep: scale degree being played
    - activeScaleId: which scale is currently playing
- **preferencesStore** (`src/store/preferencesStore.ts`):
    - playbackPattern: selected pattern
    - tempo: BPM
    - timeSignature: 4/4 or 3/4
    - accidentalPreference: sharps/flats
    - All persisted to localStorage

**UI Integration:**
- ScaleCard "Play All" button - plays full scale with selected pattern
- TriadsSection playback modes:
    - Radio selector: Chord / Arpeggio
    - Click root note button → plays basic triad
    - Click extension button → plays triad with extension
- Real-time highlighting of currently playing note
- Visual feedback during playback (playing state, note highlighting)

**Technical Details:**
- Sample mapping handles enharmonic equivalents (C# → Ds files)
- Tone.js Transport for tempo-synced playback
- Scheduled events for precise timing
- Volume control per synth type (pads, melody, bass)
- Velocity control for accented vs. normal notes

---

## 5. Module Architecture (Frontend)

### 5.1 Module boundaries

#### A) Catalog Module (`src/catalog/` and `src/schemas/`)

**Responsibilities:**
- Load catalog JSON file from `/public/catalog/scales.json`
- Validate using Zod schemas (`src/schemas/catalog.ts`)
- Build indexes: scaleTypeById, scaleTypeByIntervalKey
- Manage catalog loading state

**Files:**
- `src/catalog/loader.ts` - async catalog loading function
- `src/schemas/catalog.ts` - Zod validation schemas
- `src/types/catalog.ts` - TypeScript type exports

**Implementation:**
```typescript
export interface CatalogIndexes {
  catalog: Catalog;
  scaleTypeById: Map<string, ScaleType>;
  scaleTypeByIntervalKey: Map<string, ScaleType>;
}

export async function loadCatalog(): Promise<CatalogIndexes>
```

**Hook:**
- `useCatalogInit()` - React hook that triggers catalog load on mount
- Used by all pages that need catalog data

#### B) Music Theory Engine Module (`src/music/`)

Pure logic modules. No UI state. No side effects.

**Implemented Modules:**

1. **notes.ts** - Note and pitch class utilities
   - `getPitchClassFromNote(noteName)` - converts note name to 0-11
   - `getNoteNameFromPitchClass(pitchClass, preferSharps)` - pitch class to name
   - `calculateScaleNotes(root, intervals, preferSharps)` - generates scale note names
   - `addOctavesToNotes(notes, baseOctave)` - assigns octaves with wrapping detection

2. **triads.ts** - Triad analysis
   - `calculateTriads(scaleNotes, scaleIntervals)` - generates all triads
   - `getTriadName(root, quality)` - full name (e.g., "C minor")
   - `getTriadAbbreviation(root, quality)` - short form (e.g., "Cm")
   - Internal: `determineTriadQuality(intervals)`, `calculateExtensions(...)`

3. **relatives.ts** - Scale relationship discovery
   - `findRelatedScales(scale, allScales, root, degree)` - finds 1st/2nd degree relatives
   - `intervalsToKey(intervals)` - canonical interval key for matching

4. **degrees.ts** - Interval/degree notation
   - `getIntervalRomanNumeral(interval)` - converts 0-11 to Roman numerals
   - Used for displaying scale degrees

5. **characteristics.ts** - Scale classification
   - `analyzeScale(intervals)` - returns characteristic tags
   - Tags include: major/minor, has7th, hasMaj7, has6, etc.

**NOT Implemented:**
- ❌ `parseNotes(input)` - note parsing from user input
- ❌ `findScalesContaining(set)` - scale finder algorithm
- ❌ `findScalesForTriadPair(...)` - triad pair matching
- ❌ `findSimilarScales(...)` - similarity search

#### C) Presentation / UI Module (`src/pages/` and `src/components/`)

**Technology:**
- React 19 with TypeScript
- React Router DOM v7 for navigation
- CSS Modules for styling
- Vite for bundling

**Implemented Pages:**

1. **ScaleCatalogPage** (`/` route) - ✅ FULLY WORKING
   - Displays all scales in grid layout
   - Root selector dropdown (changes displayed notes)
   - Filter/search input (searches name and alternativeNames)
   - Scale cards with intervals, notes, steps, characteristics
   - "Play All" button per card
   - Navigation to individual scale pages

2. **ScalePage** (`/scale/:scaleId` route) - ✅ FULLY WORKING
   - Two-column layout (left: controls, right: details)
   - Pattern selector (ascending/descending/alternating/ladder)
   - Root selector
   - ScaleCard display
   - TriadsSection with all triads + extensions
   - RelativesSection showing 1st/2nd degree relatives
   - Full audio playback integration

3. **ScaleFinderPage** (`/scale-finder` route) - ❌ PLACEHOLDER
   - Shows "Coming Soon" message
   - Lists planned features but not implemented

4. **ScaleDetailsPage** (`/scale-details` route) - ❌ PLACEHOLDER
   - Redundant with ScalePage

**Reusable Components:**

- **Layout.tsx** - App shell with header/navigation
- **ScaleCard.tsx** - Scale display card with playback controls
- **TriadsSection.tsx** - Triads grid with chord/arpeggio playback
- **RelativesSection.tsx** - Related scales display
- **PatternSelector.tsx** - Pattern selection radio buttons
- **RouteGuard.tsx** - Conditional rendering based on data loading state

**Navigation:**
- React Router with basename `/scale-master` for GitHub Pages
- Links between catalog → scale detail → mode pages
- 404 handling with NotFoundPage

#### D) State Management Module (`src/store/`)

**Technology:** Zustand with persist middleware

**Implemented Stores:**

1. **catalogStore.ts** - Catalog data and loading state
   ```typescript
   interface CatalogState {
     status: 'idle' | 'loading' | 'ready' | 'error';
     catalog: Catalog | null;
     error: string | null;
     indexes: CatalogIndexes | null;
     selectedRoot: number; // 0-11 pitch class
     filterQuery: string; // search filter
     // Actions: setCatalogLoading, setCatalogReady, setCatalogError,
     // setSelectedRoot, setFilterQuery
   }
   ```

2. **preferencesStore.ts** - User preferences (persisted to localStorage)
   ```typescript
   interface PreferencesState {
     accidentalPreference: 'sharps' | 'flats';
     timeSignature: '4/4' | '3/4';
     tempo: number; // 60-240 BPM
     playbackPattern: 'ascending' | 'descending' | 'alternating' | 'ladder';
     synthSettings: { volume per synth type };
     velocitySettings: { normal, accented };
     // Actions: setAccidentalPreference, setTimeSignature, setTempo,
     // setPlaybackPattern, setSynthVolume, setVelocity
   }
   ```
   - Persisted using Zustand persist middleware
   - Survives page refreshes

3. **audioStore.ts** - Playback state (not persisted)
   ```typescript
   interface AudioState {
     isPlaying: boolean;
     currentNoteIndex: number | null;
     currentNoteStep: number | null;
     activeScaleId: string | null;
     // Actions: setPlaying, setCurrentNoteIndex, setCurrentNote, stopAll
   }
   ```
   - Updated in real-time during playback
   - Used for UI highlighting of current note

**State Flow:**
- Catalog loads once on app init
- Preferences persist across sessions
- Audio state updates during playback for UI feedback
- All stores accessible via React hooks throughout component tree

#### E) Services Module (`src/services/`)

Additional service layers not in original design:

1. **audioEngine.ts** - Audio playback singleton
   - Tone.js wrapper
   - Manages Sampler instrument with piano samples
   - Provides playback methods: note, chord, arpeggio, sequence
   - Handles octave calculation and voice management

2. **scalePatterns.ts** - Pattern generation
   - Defines playback patterns (ascending, descending, etc.)
   - Dynamic pattern generation based on scale length
   - Converts patterns to note sequences with octave offsets

3. **synthPresets.ts** - Synth configuration (if used)
   - Tone.js synth settings
   - Volume and velocity configurations

---

## 6. Data Flow Summary

### 6.1 Implemented User Flows

**Flow 1: Browse Catalog → Scale Details** ✅
1. User visits Scale Catalog page (home)
2. Optionally: filter by name, select root note
3. Browse scales in grid, see intervals/notes/characteristics
4. Click scale card → navigate to Scale Detail page
5. View full scale info with triads and relatives
6. Play scale with selected pattern, play individual triads

**Flow 2: Explore Scale Relationships** ✅
1. On Scale Detail page, view TriadsSection
   - See all diatonic triads with quality and extensions
   - Click root button → play triad as chord or arpeggio
   - Click extension button → play with added note
2. View RelativesSection
   - See 1st and 2nd degree relatives
   - Click relative → navigate to that scale's detail page
3. View Modes (if inversions map exists)
   - See mode names and links
   - Navigate to mode scale pages

**Flow 3: Interactive Audio Exploration** ✅ (Not in Original Design)
1. Select playback pattern (ascending/descending/alternating/ladder)
2. Click "Play All" on scale card → hear full scale with pattern
3. Real-time visual feedback showing current note
4. Adjust tempo, time signature in preferences
5. Play individual triads with extensions
6. Switch between chord and arpeggio playback modes

### 6.2 NOT Implemented Flows

**Flow 4: Notes → Scales** ❌
1. ~~Parse note tokens → inputSet~~
2. ~~Search catalog → matching scales list~~
3. ~~Display sorted results~~
- Scale Finder page is placeholder only

**Flow 5: Two Triads → Scales** ❌
1. ~~Build two triad sets~~
2. ~~Union into constraint set~~
3. ~~Search scales containing constraint~~
4. ~~Map triads to degrees~~
- No triad pair matching feature

**Flow 6: Scale → Similar Scales** ❌
1. ~~Compute target scale set~~
2. ~~Compare against catalog~~
3. ~~Filter by distance~~
4. ~~Display diffs~~
- No similarity search feature

---

## 7. Key Design Properties (Actual Implementation)

- **Catalog-driven:** ✅ All scale and mode names come from the catalog JSON
- **Deterministic:** ✅ No inference; all results stable and reproducible
- **Fast:** ✅ Efficient - scales instantiated on-demand, no pre-computation needed
- **Frontend-only:** ✅ No backend; runs entirely in browser
- **Interactive Audio:** 🎵 Real-time playback with high-quality piano samples
- **Extensible:** ⚠️ Partially - new catalog entries automatically get:
    - ✅ Display in catalog
    - ✅ Triad analysis
    - ✅ Relatives discovery
    - ✅ Audio playback
    - ❌ Mode naming only if inversions map provided
    - ❌ Scale finder matching (feature not implemented)
- **State Persistence:** ✅ User preferences saved to localStorage
- **Responsive:** ✅ Mobile-friendly UI with CSS media queries

---

## 8. Design Decisions Made

These policies were decided during implementation:

1. **Mode duplication in symmetric scales** → **Not applicable**
    - Implementation uses pre-computed inversions map
    - No runtime rotation, so duplicates don't occur
    - If inversions map missing, modes section doesn't display

2. **Triad "diatonic" definition** → **Strict**
    - Triads are built by stacking scale degrees (d, d+2, d+4)
    - Quality determined by actual semitone intervals
    - Extensions calculated based on available scale intervals
    - All triads shown, even unconventional ones for exotic scales

3. **Spelling policy** → **User preference**
    - Global sharp/flat preference in preferencesStore
    - Persisted to localStorage
    - Applied consistently across all scale note displays
    - ❌ Key-aware diatonic spelling not implemented

4. **Similarity definition** → **Scale relatives approach**
    - Instead of generic "similarity," implemented specific "relatives" feature
    - 1st degree: exactly 1 interval altered by ±1 semitone
    - 2nd degree: exactly 2 intervals altered
    - No cardinality requirement (any scale size can be relative)
    - Searches across all families
    - ❌ Generic similarity search not implemented

5. **Playback patterns** → **Four options**
    - Ascending, descending, alternating, ladder
    - User-selectable via radio buttons
    - Persisted preference
    - Applied to all "Play All" scale playback

6. **Triad playback modes** → **Chord vs. Arpeggio**
    - User toggles between modes via radio selector in TriadsSection header
    - Chord: all notes played simultaneously
    - Arpeggio: notes played sequentially, sorted by MIDI pitch
    - Extensions can be added by clicking extension buttons

7. **Extension display** → **Smart filtering**
    - Alt5 elaborated into separate #5 and b5 buttons
    - b5 hidden for diminished triads (already have b5)
    - Only show extensions available in the scale
    - Separate button per extension for flexibility

---

## 9. Implementation Gaps and Future Work

### High Priority (Core Features from Original Design)

1. **Scale Finder** (Section 4.1, 4.3)
   - Implement note input parsing
   - Implement scale matching algorithm
   - Build Scale Finder UI page
   - Add ranking by "minimal extra notes"
   - User Story: US-07, US-08, US-09

2. **Dynamic Mode Discovery** (Section 4.4 original design)
   - Implement interval rotation algorithm
   - Build ScaleTypeByIntervalKey index
   - Add runtime mode resolution as fallback when inversions map missing
   - Would enable automatic mode discovery for any scale

### Medium Priority (Nice to Have)

1. **Triad Pair Matching** (Section 4.6)
   - Parse two triad inputs
   - Find scales containing both
   - Map to scale degrees
   - Mark diatonic vs. contained

2. **Similar Scales Search** (Section 4.7)
   - Implement set distance calculation
   - Allow configurable distance threshold (1-2 note changes)
   - Option to require same cardinality
   - Complement existing "relatives" feature

3. **Key-aware Spelling**
   - Context-sensitive sharp/flat selection
   - Diatonic spelling based on scale family
   - Would improve readability for common keys

### Low Priority (Enhancements)

1. **Playback Enhancements**
   - Additional synth options beyond piano
   - Customizable arpeggio speeds
   - Loop controls for scale playback
   - MIDI export

2. **UI Polish**
   - Keyboard shortcuts for playback
   - Dark mode theme
   - Accessibility improvements (ARIA labels, keyboard navigation)
   - Mobile gesture controls

3. **Advanced Analysis**
   - Interval class vector display
   - Symmetry analysis
   - Rothenberg propriety metrics
   - Historical/cultural context for scales

---

## 10. Technology Stack Summary

**Frontend Framework:**
- React 19 with TypeScript
- React Router DOM v7
- Zustand for state management
- Zod for schema validation

**Build Tools:**
- Vite (with Rolldown)
- ESLint for linting
- TypeScript 5.9

**Audio:**
- Tone.js 15.x
- Salamander Grand Piano samples (local hosting)

**Styling:**
- CSS Modules
- CSS custom properties (CSS variables)
- Responsive design with media queries

**Deployment:**
- GitHub Pages via gh-pages package
- Static site hosting
- No backend required

---
End of document.
Last updated: 2026-02-01
