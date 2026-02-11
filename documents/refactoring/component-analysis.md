# Component Analysis Report: 20 Heaviest Components by Code Length

Generated: 2026-02-11

## Overview

This report analyzes the 20 largest components in the Scale Master application by line count, providing insights into the codebase structure and complexity distribution.

---

## 📄 Pages (Main Features)

### 1. **SequenceBuilderPage.tsx** (830 lines)
**Location:** `src/pages/sequence-builder/SequenceBuilderPage.tsx`

The most complex component - a chord progression builder with:
- Draft/edit modes for building chord sequences
- Real-time playback with previous chord context
- Bass note selector (supports slash chords)
- Dual scale selection (S1/S2) for chord filtering
- Beat controls (1-6 beats per chord)
- Playback with tempo-based timing
- Heavy state management with multiple editing modes

### 2. **ScaleFinderPage.tsx** (523 lines)
**Location:** `src/pages/finder/ScaleFinderPage.tsx`

Search engine for finding scales:
- Three search modes: notes, chords, or chord types
- Real-time parsing and validation
- Advanced filtering (root notes + scale families)
- Shows match quality (perfect/extra notes)
- Integration with catalog system

### 3. **ChordSearchPage.tsx** (241 lines)
**Location:** `src/pages/chord-search/ChordSearchPage.tsx`

Find common chords across multiple scales:
- Dynamic scale selection
- Universal/shared/unique chord categorization
- Statistical analysis of chord commonality

### 4. **ScaleCatalogPage.tsx** (168 lines)
**Location:** `src/pages/scale-catalog/ScaleCatalogPage.tsx`

Browse all available scales:
- Root note selector
- Scale filtering by name
- Grid display with navigation

---

## 🎵 Complex UI Sections

### 5. **TriadsSection.tsx** (308 lines)
**Location:** `src/pages/scale/TriadsSection.tsx`

Displays triads for a scale with:
- Chord/arpeggio playback modes
- Extension support (6, 7, maj7, #5, b5, alt5)
- Octave-aware note calculation
- Roman numeral display for diatonic scales

---

## 🧩 Components

### 6. **Layout.tsx** (255 lines)
**Location:** `src/components/Layout.tsx`

Main app layout with:
- Navigation bar
- Settings dropdown with extensive controls:
  - Accidental preference (♯/♭)
  - Time signature (4/4, 3/4)
  - Tempo slider (60-240 BPM)
  - Chord playback context (0-5 previous chords)
  - Synth volumes (pads, melody, bass)
  - Note velocities (normal, accented)

### 7. **ChordCard.tsx** (278 lines)
**Location:** `src/pages/sequence-builder/components/ChordCard.tsx`

Reusable chord card for sequence builder:
- Edit/save/delete controls
- Beat indicators with chevron controls
- Scale display (S1/S2)
- Click-to-play functionality

### 8. **ScaleCard.tsx** (203 lines)
**Location:** `src/components/ScaleCard.tsx`

Displays scale information:
- Interval/note/step grid
- Play all button
- Mode relationships (parent/children)
- Alternative names

---

## 🎼 Music Entities (Core Data Models)

### 9. **Chord.ts** (280 lines)
**Location:** `src/music/entities/Chord.ts`

Chord entity with:
- 53 chord quality definitions (triads, 7ths, 6ths)
- Alias system (e.g., "min" → "m")
- Slash chord support (bass notes)
- Pitch class calculations
- Multiple parsing methods

**Supported chord types:**
- Triads: major, minor, diminished, augmented, sus2, sus4
- 7th chords: maj7, m7, dim7, 7, mmaj7, m7b5, aug7, 7sus4
- 6th chords: 6, m6

### 10. **Triad.ts** (270 lines)
**Location:** `src/music/entities/Triad.ts`

Triad entity featuring:
- Quality determination from intervals
- Roman numeral calculation
- Extension logic (alt5, 6, 7, maj7, #5, b5)
- Scale degree triads generation

### 11. **Scale.ts** (237 lines)
**Location:** `src/music/entities/Scale.ts`

Scale entity with:
- Note generation with octave handling
- Triad calculation
- Chord containment checking
- Mode relationships
- Characteristics analysis

### 12. **Note.ts** (191 lines)
**Location:** `src/music/entities/Note.ts`

Note entity providing:
- Pitch class mapping (♯/♭)
- MIDI conversion
- Transposition
- Frequency calculation (A4 = 440 Hz)
- Multiple parsing methods

---

## 🔊 Audio Services

### 13. **audioEngine.ts** (300 lines)
**Location:** `src/services/audioEngine.ts`

Tone.js wrapper with:
- Salamander piano samples (28 sampled notes: A0-C8)
- Sequence looping with patterns
- Tempo/time signature handling (4/4, 3/4)
- Velocity control (normal, accented)
- Beat time calculations
- Volume management (dB conversion)

---

## 🎣 Hooks (Reusable Logic)

### 14. **useSequenceManagement.ts** (186 lines)
**Location:** `src/hooks/useSequenceManagement.ts`

Manages sequence builder state:
- Draft/edit mode coordination
- Scale selection logic (S1/S2)
- Bass note filtering based on selected scales
- Slash chord application

### 15. **useTriadPlayback.ts** (185 lines)
**Location:** `src/hooks/useTriadPlayback.ts`

Triad playback logic:
- Octave-aware note mapping
- Extension note calculation
- Chord/arpeggio modes
- MIDI pitch calculations

### 16. **useChordPlayback.ts** (177 lines)
**Location:** `src/hooks/useChordPlayback.ts`

Chord playback orchestration:
- Context-aware playback (previous chords)
- Sequence playback with timing
- Cancellation tokens for interrupting playback
- Bass note handling

---

## 🎶 Music Logic Utilities

### 17. **commonChords.ts** (183 lines)
**Location:** `src/music/commonChords.ts`

Find chords across multiple scales:
- Triad generation from scales
- Enharmonic equivalence handling
- Frequency counting
- Statistics generation (universal, shared, unique)

### 18. **chordTypeFinder.ts** (176 lines)
**Location:** `src/music/chordTypeFinder.ts`

Find scales by chord types:
- Chord type parsing (major, minor, dim, aug, sus)
- Triad variety sorting
- Type counting per scale
- Support for chord type aliases

### 19. **relatives.ts** (195 lines)
**Location:** `src/music/relatives.ts`

Scale relationship finder:
- First-degree relatives (1 note altered by half step)
- Second-degree relatives (2 notes altered)
- Modification descriptions with note names
- Interval comparison logic

---

## 💾 State Management

### 20. **preferencesStore.ts** (154 lines)
**Location:** `src/store/preferencesStore.ts`

Zustand store with localStorage persistence:
- Accidental preference (sharps/flats)
- Time signature (4/4, 3/4)
- Tempo (60-240 BPM)
- Playback pattern (alternating, ascending, etc.)
- Synth settings (volume for pads, melody, bass)
- Velocity settings (normal 50%, accented 100%)
- Chord selection playback count (0-5 previous chords)

---

## 📊 Summary Statistics

### Total Lines
- **Pages:** 1,930 lines (4 files)
- **Components:** 736 lines (3 files)
- **Entities:** 978 lines (4 files)
- **Services:** 300 lines (1 file)
- **Hooks:** 548 lines (3 files)
- **Music Logic:** 554 lines (3 files)
- **Store:** 154 lines (1 file)

**Grand Total:** 5,200 lines across 19 TypeScript files

### Code Distribution
- **UI Layer (Pages + Components):** 2,666 lines (51%)
- **Music Theory (Entities + Logic):** 1,532 lines (29%)
- **Infrastructure (Hooks + Services + Store):** 1,002 lines (20%)

---

## 🔍 Key Insights

### Complexity Hotspots

1. **SequenceBuilderPage is the most complex component** at 830 lines, combining:
   - Multiple editing modes (draft, edit, saved)
   - Real-time playback with context
   - Complex state coordination
   - Three-panel UI (sequence, chord selector, bass selector)

2. **ScaleFinderPage is the second most complex** at 523 lines:
   - Three distinct search modes
   - Real-time parsing and validation
   - Advanced filtering with multiple dimensions

### Architecture Patterns

1. **Entity-Oriented Design:** Core music concepts (Note, Chord, Triad, Scale) are well-encapsulated in classes with rich methods.

2. **Hook-Based Logic Extraction:** Heavy state management and playback logic is extracted into custom hooks, keeping components cleaner.

3. **Zustand for Global State:** Preferences and catalog data use Zustand stores with persistence.

4. **Tone.js Abstraction:** Audio engine wraps Tone.js complexity, providing a simpler API.

### Music Theory Implementation

The codebase contains sophisticated music theory logic:
- **Interval calculations** for scale generation
- **Roman numeral analysis** for triads
- **Extension logic** for 6ths, 7ths, altered 5ths
- **Scale relationships** (modes, relatives)
- **Chord-scale compatibility** checking

### Code Quality Observations

✅ **Strengths:**
- Clear separation of concerns
- Well-documented with JSDoc comments
- Type-safe with TypeScript
- Reusable entity classes
- Good hook abstraction

⚠️ **Areas for Potential Refactoring:**
- SequenceBuilderPage could be broken into smaller components
- Some hooks are quite large (180+ lines)
- ChordCard has many props (could use context)

---

## 📈 Recommendations

### Short-term
1. Extract smaller components from SequenceBuilderPage:
   - SequenceDisplay
   - ChordSelector
   - BassNoteSelector

2. Create a CardControls component to reduce ChordCard props

3. Add more unit tests for entity classes (high value, low coupling)

### Long-term
1. Consider state machine for SequenceBuilder edit modes
2. Extract playback orchestration to a service layer
3. Add memoization for expensive calculations (triads, extensions)

---

## 🎯 Conclusion

The codebase demonstrates a well-structured music theory application with:
- **Strong domain modeling** through entity classes
- **Clean separation** between UI, logic, and state
- **Sophisticated music theory** implementation
- **Thoughtful abstractions** for complex operations

The largest components handle complex user interactions (SequenceBuilderPage, ScaleFinderPage) which is appropriate. The codebase would benefit from further componentization of the largest files, but overall structure is solid.

---

*Report generated by Claude Code analyzing 20 largest files (5,200+ lines)*
