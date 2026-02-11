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
- Mode discovery by rotation + catalog lookup (uses pre-computed inversions map instead)
- Scale matching for a pair of triads
- Similar-scale search by set distance

🎵 **Additional Features (beyond original design):**
- Interactive audio playback with Salamander piano samples
- Playback patterns (ascending, descending, alternating, ladder)
- Real-time playback visualization
- Scale relatives analysis (1st/2nd degree alterations)
- Triad extension analysis (#5, b5, 6, 7, maj7)
- Scale Finder with note/chord/chord-type search modes
- Chord Search (find common chords across multiple scales)
- Sequence Builder (chord progression builder with intelligent recommendations)
- Comprehensive chord parser with slash chord support

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

**Status: ✅ FULLY IMPLEMENTED**

**Goal:** Convert user input tokens into a pitch-class set.

**Implementation:** (`src/music/notes.ts`)
1. Tokenize user string (comma/space-separated).
2. Parse each token into a pitch class:
    - Base letter A–G
    - Accidentals (#, b, double, etc.)
    - Optional octave suffix ignored
3. Convert to pitch class (mod 12).
4. Aggregate into set (deduplicate).

**Function:**
```typescript
export function parseNotes(input: string): {
  notes: string[];
  pitchClasses: Set<number>;
  errors: string[];
}
```

**Outputs:**
- `notes` (array of parsed note names)
- `pitchClasses` (pitch-class set)
- `errors` (invalid tokens) for UI feedback

**Current State:** Fully implemented in Scale Finder page with three search modes: notes, chords, and chord types.

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

**Status: ✅ FULLY IMPLEMENTED**

**Goal:** Find all concrete scales that contain the user's note set.

**Implementation:** (`src/music/scaleFinder.ts`)

**Inputs:**
- `inputPitchClasses` (Set<number>)
- catalog scale types
- preferSharps (boolean)

**Method:**
```typescript
export function findScalesContaining(
  inputPitchClasses: Set<number>,
  scaleTypes: ScaleType[],
  preferSharps: boolean = true
): ScaleMatch[]
```

For each scale type `T`:
- For each root `r` in 0..11:
    - Build `scaleSet(T, r)`
    - Match rule: `inputSet ⊆ scaleSet`
    - Calculate extra notes count

**Ranking (implemented):**
- Minimal "extra notes" first: `|scaleSet| - |inputSet|`
- Secondary sort by scale name (stable ordering)

**Outputs per match (ScaleMatch interface):**
- scaleType (full type object)
- root (pitch class 0-11)
- rootNoteName (string)
- scaleNotes (array of note names)
- scalePitchClasses (Set<number>)
- extraNotesCount (number)
- matchedNotes (array of matched note names)

**UI Features:**
- Three search modes: Notes, Chords, Chord Types
- Filters by root note and scale family
- Real-time search as you type
- Visual highlighting of matched vs. extra notes
- Perfect match badges for scales with no extra notes

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

### 4.9 Chord Parsing

**Status: ✅ FULLY IMPLEMENTED** (not in original design)

**Goal:** Parse chord symbols into pitch class sets and support complex chord qualities.

**Implementation:** (`src/music/chordParser.ts`)

**Supported Chord Types:**
- Triads: major, minor, diminished, augmented, sus2, sus4
- 7th chords: maj7, m7, dim7, dominant 7, mmaj7, m7b5 (half-dim), aug7, 7sus4
- 6th chords: 6, m6
- Slash chords: C/E, Am/G, etc. (any chord with alternate bass note)

**Method:**
```typescript
export function parseChord(input: string): Chord | null
export function parseChords(input: string): ParseChordsResult
```

**Outputs (Chord interface):**
- root (note name string)
- rootPitchClass (0-11)
- quality (chord quality identifier)
- pitchClasses (Set<number> of all chord tones)
- displayName (formatted chord symbol)
- bass (optional bass note for slash chords)
- bassPitchClass (optional bass pitch class)

**Features:**
- Flexible input parsing with multiple aliases per quality
- Support for sharp and flat accidentals
- Slash chord notation (C/E, Dm7/G)
- Error reporting for invalid chord symbols
- Combines multiple chords into union of pitch classes

**Used By:**
- Scale Finder (chord search mode)
- Sequence Builder (chord selection)
- Chord progression validation

### 4.10 Chord Type Matching

**Status: ✅ FULLY IMPLEMENTED** (not in original design)

**Goal:** Find scales that contain specific triad qualities (e.g., "scales with major and minor triads").

**Implementation:** (`src/music/chordTypeFinder.ts`)

**Method:**
```typescript
export function findScalesByChordTypes(
  requestedTypes: Set<TriadQuality>,
  scaleTypes: ScaleType[],
  preferSharps: boolean = true
): ChordTypeMatch[]
```

1. For each scale type and root:
    - Calculate all triads in the scale
    - Determine which triad qualities are present
2. Match scales where all requested types are found
3. Rank by triad variety (more diverse types ranked higher)

**Outputs (ChordTypeMatch interface):**
- scaleType, root, rootNoteName, scaleNotes (standard scale info)
- triadsFound (record mapping TriadQuality → count)

**UI Features:**
- Search by chord quality keywords (major, minor, dim, aug, sus2, sus4)
- Displays count of each triad type in results
- Highlights requested types vs. additional types found
- Helps find scales for specific harmonic contexts

**Use Cases:**
- "Find scales with major and minor chords" → returns diatonic scales
- "Find scales with major, minor, dim" → returns major/minor scales
- "Find scales with augmented chords" → returns harmonic minor, whole tone, etc.

### 4.11 Common Chords Across Scales

**Status: ✅ FULLY IMPLEMENTED** (not in original design)

**Goal:** Given multiple selected scales, find all chords (triads + extensions) that appear in all or most of them.

**Implementation:** (`src/music/commonChords.ts`)

**Method:**
```typescript
export function findCommonChords(
  scales: SelectedScale[],
  preferSharps: boolean = true
): CommonChord[]
```

1. For each selected scale:
    - Calculate all triads using `calculateTriads()`
    - Generate chord symbols with extensions
2. Track which scales contain each unique chord
3. Return chords sorted by:
    - Universal chords first (in all scales)
    - Shared chords next (in 2+ scales)
    - Unique chords last (in 1 scale only)

**Outputs (CommonChord interface):**
- symbol (chord symbol string, e.g., "Cmaj7")
- count (number of scales containing this chord)
- scaleNames (array of scale names containing it)

**Statistics:**
- total (total unique chords found)
- universal (chords in all scales)
- shared (chords in 2+ scales)
- unique (chords in exactly 1 scale)

**UI Features (ChordSearchPage):**
- Select multiple scales by root and type
- Real-time chord calculation
- Visual categorization (universal/shared/unique)
- Chord counts per scale
- Remove individual scales or clear all

**Use Cases:**
- Find common ground between different scales
- Identify pivot chords for modulation
- Discover shared harmonic material
- Build chord vocabularies for multi-scale contexts

### 4.12 Chord Progression Builder

**Status: ✅ FULLY IMPLEMENTED** (not in original design)

**Goal:** Build chord progressions with intelligent recommendations based on selected scales and previous chords.

**Implementation:** (`src/pages/sequence-builder/SequenceBuilderPage.tsx`, `src/store/sequenceBuilderStore.ts`)

**Core Concepts:**

**ChordState:**
- chord (selected Chord object)
- s1 (optional first scale: {scale: string, root: string})
- s2 (optional second scale: {scale: string, root: string})
- beats (duration: 1-6 beats)
- saved (boolean: in sequence vs. draft)

**Sequence Structure:**
- savedSequence (array of saved ChordStates)
- draft (current ChordState being edited)
- Linear progression with ability to edit any saved cell

**Features:**

1. **Three Selection Tabs:**
   - Chord tab: Browse and select chords filtered by scales
   - Scale tab: Select first scale (S1) for filtering
   - Scale 2 tab: Select second scale (S2) for additional filtering

2. **Intelligent Chord Filtering:**
   - If S1 selected: show only chords that fit in S1
   - If S1 and S2 selected: show chords in intersection of both scales
   - Color-coded recommendations (exact match, contains notes, good fit)

3. **Bass Note Selector:**
   - Available bass notes determined by selected scales
   - Creates slash chords when non-root bass selected
   - Visual selector with scale-derived note options

4. **Beat Duration Controls:**
   - Adjustable per chord (1-6 beats)
   - Visual beat indicators
   - Affects playback timing

5. **Edit Mode:**
   - Click edit icon on any saved chord
   - Modify chord, scales, or beats
   - Save or cancel changes
   - Delete button available in edit mode

6. **Playback:**
   - Play individual chords (click chord display)
   - Play entire sequence (respects beat durations)
   - Contextual playback (plays N previous chords before current)
   - Visual highlighting of currently playing chord

7. **State Persistence:**
   - Saves to sessionStorage
   - Preserves sequence across page reloads
   - Lost on browser close (intentional for drafting)

**Components:**
- ChordTable: Displays filterable chord grid with scale-based coloring
- ScaleTable: Displays scales with chord-fit indicators
- Sequence display: Horizontal scrolling timeline of cards

**Use Cases:**
- Compose chord progressions interactively
- Explore chords within scale constraints
- Build modulating progressions (switch scales mid-sequence)
- Experiment with slash chords and alternate bass notes
- Hear progressions with realistic timing

### 4.13 Audio Playback System

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

6. **chordParser.ts** - Chord symbol parsing
   - `parseChord(input)` - parses single chord symbol
   - `parseChords(input)` - parses multiple chords from input string
   - `getSupportedChordTypes()` - returns list of supported chord types
   - Supports triads, 7th chords, 6th chords, and slash chords

7. **scaleFinder.ts** - Scale matching
   - `findScalesContaining(pitchClasses, scaleTypes, preferSharps)` - finds scales containing notes
   - Returns ranked results by fewest extra notes

8. **chordTypeFinder.ts** - Chord type matching
   - `findScalesByChordTypes(types, scaleTypes, preferSharps)` - finds scales with specific triad qualities
   - `parseChordTypes(input)` - parses chord quality keywords
   - `getTriadQualityDisplayName(quality)` - formats quality names

9. **commonChords.ts** - Multi-scale chord analysis
   - `findCommonChords(scales, preferSharps)` - finds chords common across multiple scales
   - `getCommonChordsStats(chords, scaleCount)` - calculates statistics

10. **chordProgression.ts** - Chord progression utilities
    - `createChordState(...)` - creates ChordState objects
    - `chordToNotes(chord)` - converts Chord to note names array

11. **chordScaleChecker.ts** - Chord-scale fit validation
    - Checks if chords fit within selected scales
    - Returns fit quality (exact, contains, good)

12. **chordFilter.ts** - Chord filtering by scale constraints
    - Filters chord lists based on scale selections

**NOT Implemented:**
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
   - Root selector (via query param `?root=N`)
   - ScaleCard display
   - TriadsSection with all triads + extensions
   - RelativesSection showing 1st/2nd degree relatives
   - Full audio playback integration
   - Shareable URLs with scale ID and root

3. **ScaleFinderPage** (`/scale-finder` route) - ✅ FULLY WORKING
   - Three search modes: Notes, Chords, Chord Types
   - Real-time search as you type
   - Parse errors displayed for invalid input
   - Filters by root note and scale family
   - Results sorted by relevance
   - Visual highlighting of matched vs. extra notes
   - Clickable results navigate to scale detail page
   - Examples and help text for each mode

4. **ChordSearchPage** (`/chord-search` route) - ✅ FULLY WORKING (new feature)
   - Add multiple scales by root and type
   - Real-time common chord calculation
   - Visual categorization (universal/shared/unique)
   - Statistics display (total/universal/shared counts)
   - Remove individual scales or clear all
   - Chord counts per category

5. **SequenceBuilderPage** (`/sequence-builder` route) - ✅ FULLY WORKING (new feature)
   - Horizontal timeline of chord cards
   - Three-tab selector (Chord/Scale/Scale2)
   - Bass note selector with scale-aware options
   - Beat duration controls (1-6 beats per chord)
   - Edit mode for modifying saved chords
   - Delete last chord or clear entire sequence
   - Play individual chords or full sequence
   - Visual playback highlighting
   - State persistence in sessionStorage

**Reusable Components:**

- **Layout.tsx** - App shell with header/navigation, links to all pages
- **ScaleCard.tsx** - Scale display card with playback controls
- **TriadsSection.tsx** - Triads grid with chord/arpeggio playback
- **RelativesSection.tsx** - Related scales display
- **PatternSelector.tsx** - Pattern selection radio buttons
- **RouteGuard.tsx** - Conditional rendering based on data loading state
- **ScaleTable.tsx** - Grid of scales with filtering and chord-fit indicators (used in Sequence Builder)
- **ChordTable.tsx** - Grid of chords with filtering and scale-fit indicators (used in Sequence Builder)

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

4. **sequenceBuilderStore.ts** - Chord sequence state (persisted to sessionStorage)
   ```typescript
   interface SequenceBuilderState {
     savedSequence: ChordState[];  // Saved chord cells
     draft: ChordState | null;     // Current draft cell
     selectedChord: Chord | null;  // Currently selected chord
     // Actions: setSelectedChord, selectChord, saveDraft,
     // moveToPrevious, clearSequence
   }
   ```
   - Persisted to sessionStorage (clears on browser close)
   - Preserves chord progressions across page navigation
   - Manages linear sequence with edit capabilities

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

**Flow 4: Scale Finder Search** ✅ (Previously marked as not implemented)
1. User enters notes, chords, or chord types in Scale Finder
2. App parses input and identifies pitch classes or qualities
3. Search algorithm finds matching scales from catalog
4. Results displayed sorted by relevance (fewest extra notes or triad variety)
5. User filters by root note or scale family
6. Click result → navigate to scale detail page with selected root

**Flow 5: Common Chords Discovery** ✅ (New Feature)
1. User visits Chord Search page
2. Add multiple scales by selecting root and type
3. App calculates all chords (triads + extensions) in each scale
4. Displays common chords categorized:
   - Universal (in all scales)
   - Shared (in 2+ scales)
   - Unique (in 1 scale)
4. Shows statistics and scale membership for each chord
5. Remove scales or clear all to re-calculate

**Flow 6: Chord Progression Building** ✅ (New Feature)
1. User visits Sequence Builder page
2. Optionally select scale(s) to constrain chord choices
3. Browse filtered chord table (color-coded by scale fit)
4. Optionally select alternate bass note
5. Click chord → adds to draft cell, plays with context
6. Adjust beat duration if needed
7. Save to sequence → creates new draft
8. Repeat to build progression
9. Edit any saved chord by clicking edit icon
10. Play individual chords or full sequence
11. Sequence persists in sessionStorage

### 6.2 NOT Implemented Flows

**Flow 7: Two Triads → Scales** ❌
1. ~~Build two triad sets~~
2. ~~Union into constraint set~~
3. ~~Search scales containing constraint~~
4. ~~Map triads to degrees~~
- No triad pair matching feature

**Flow 8: Scale → Similar Scales** ❌
1. ~~Compute target scale set~~
2. ~~Compare against catalog~~
3. ~~Filter by distance~~
4. ~~Display diffs~~
- No similarity search feature (but see Scale Relatives for similar functionality)

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

1. **Dynamic Mode Discovery** (Section 4.4 original design)
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
Last updated: 2026-02-10 (major update: documented Scale Finder, Chord Search, and Sequence Builder implementations)
