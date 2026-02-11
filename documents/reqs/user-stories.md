# Music Theory App — User Stories (Ordered) with Test Cases

> Notes:
> - Each story is intentionally small/atomic.
> - Stories are ordered by dependency (later ones assume earlier ones exist).
> - Test cases are written in a black-box style (inputs → expected outputs/behavior).
> - ✅ marks implemented features, ❌ marks unimplemented features
> - Last updated: 2026-02-10

---

## US-01 — Load the scale catalog from a local JSON file ✅
**Status: IMPLEMENTED** (`src/catalog/loader.ts`, `src/store/catalogStore.ts`)

**As a user**, I want the app to load a built-in catalog of scale types so that all features operate on a known dataset.

> **Note**: Test cases for US-01 are documented in [US-01-test-cases.md](US-01-test-cases.md)

---

## US-02 — Parse a single note token into a pitch class ✅
**Status: IMPLEMENTED** (`src/music/notes.ts`: `getPitchClassFromNote()`)

**As a user**, I want to type a note like `C#` or `Db` and have it understood reliably.

### Test cases
1. Input `C` → pitch class `0` ✅
2. Input `B` → pitch class `11` ✅
3. Input `C#` → pitch class `1` ✅
4. Input `Db` → pitch class `1` ✅
5. Input `C4` → pitch class `0` (octave ignored) ✅
6. Input `H` → parse error (invalid token) ✅

---

## US-03 — Parse a list of note tokens into a deduplicated note set ✅
**Status: IMPLEMENTED** (`src/music/notes.ts`: `parseNotes()`)

**As a user**, I want to paste multiple notes and have the app produce a clean unique set of notes.

### Test cases
1. Input `"C E G"` → set contains exactly `{C, E, G}` ✅
2. Input `"C, E, G"` → set contains exactly `{C, E, G}` ✅
3. Input `"C C E"` → set contains exactly `{C, E}` (duplicates removed) ✅
4. Input `"C X G"` → set contains `{C, G}` and error list includes `X` ✅

---

## US-04 — Display the parsed input note set back to the user ✅
**Status: IMPLEMENTED** (`src/pages/finder/ScaleFinderPage.tsx`)

**As a user**, I want to see which notes were accepted so I can correct mistakes.

### Test cases
1. Input `"C Eb G"` → UI shows three "note chips" `C`, `Eb`, `G` ✅
2. Input includes invalid token `"C Q"` → UI shows `C` chip and an error indicator for `Q` ✅

---

## US-05 — Convert a scale type (interval list) into a scale note set for a chosen root ✅
**Status: IMPLEMENTED** (`src/music/notes.ts`: `calculateScaleNotes()`)

**As a user**, I want the app to construct the actual notes of a scale given root + scale type.

### Test cases
1. Given scale type intervals `[0,2,4,5,7,9,11]` and root `C`
    - Then notes are `{C,D,E,F,G,A,B}` ✅
2. Same scale type and root `D`
    - Then notes are `{D,E,F#,G,A,B,C#}` ✅
3. For any scale type
    - Then output contains exactly `N` notes where `N = number of intervals` ✅

---

## US-06 — List available scale types from the catalog in a selector ✅
**Status: IMPLEMENTED** (Multiple pages: ScaleCatalogPage, ChordSearchPage, SequenceBuilder ScaleTable)

**As a user**, I want to choose a scale type from a list so I don't need to type internal IDs.

### Test cases
1. Scale type dropdown shows all catalog scale types by `name` ✅
2. Selecting an item exposes its `id` internally (used by later pages) ✅

---

## US-07 — Find all scales that contain the user's input note set ✅
**Status: IMPLEMENTED** (`src/music/scaleFinder.ts`: `findScalesContaining()`)

**As a user**, I want to enter notes and see which scales contain them.

### Test cases
1. Input `C E G`
    - Then results include at least one scale that contains these notes ✅
2. Input `C C# D`
    - Then results include only scales containing all three pitch classes ✅
3. Input empty
    - Then results area shows "enter notes to search" and no matches are computed ✅

**Additional Implemented Features:**
- Also search by chord symbols (e.g., "C Am F G")
- Also search by chord types (e.g., "major minor dim")

---

## US-08 — Sort scale matches by "fewest extra notes" ✅
**Status: IMPLEMENTED** (`src/music/scaleFinder.ts`, `src/music/chordTypeFinder.ts`)

**As a user**, I want the most specific matches first.

### Test cases
1. Given multiple matching scales
    - Then the first result has minimal extra notes compared to the input set ✅
2. If two results have equal extra notes
    - Then they are consistently ordered (stable ordering by name) ✅

---

## US-09 — Open "Scale Details" for a selected match ✅
**Status: IMPLEMENTED** (`src/pages/finder/ScaleFinderPage.tsx`)

**As a user**, I want to click a matching scale and see its details.

### Test cases
1. Clicking a match opens Scale Details showing the selected root + scale type ✅
2. Navigating back returns to the previous search state (inputs preserved if possible) ⚠️ (inputs not preserved in URL)

---

## US-10 — Show scale notes and intervals on the Scale Details page ✅
**Status: IMPLEMENTED** (`src/pages/scale/ScalePage.tsx`, `src/components/ScaleCard.tsx`)

**As a user**, I want to see the exact note list and the interval structure.

### Test cases
1. For a chosen scale, the page shows:
    - root note ✅
    - scale type name ✅
    - ordered list of notes ✅
    - intervals list (as semitone offsets) ✅
2. Note count equals interval count ✅

---

## US-11 — Generate mode interval rotations for a scale type ❌
**Status: NOT IMPLEMENTED** (uses pre-computed inversions map instead of runtime rotation)

**As a user**, I want to see all rotations ("modes") of the chosen scale.

### Test cases
1. For a scale type with `N` intervals
    - Then exactly `N` rotations are produced (one per degree) ❌ (only shows modes with inversions map)
2. Each rotation:
    - Contains 0
    - Has the same number of intervals as the original
    - Is normalized into `[0..11]` and sorted

**Implementation Note:** Modes are displayed using pre-computed `inversions` map in catalog, not dynamic rotation.

---

## US-12 — Resolve mode names by querying the catalog (no hardcoded mode lists) ✅
**Status: PARTIALLY IMPLEMENTED** (via pre-computed inversions map)

**As a user**, I want each rotation to be labeled with a known scale name when present in the catalog.

### Test cases
1. If inversions map exists and has entry for degree
    - Then the mode entry shows that scale type's `name` ✅
2. If inversions map missing or incomplete
    - Then no modes shown ❌ (no fallback to runtime rotation)

**Implementation Difference:** Uses `inversions` map from catalog instead of runtime lookup.

---

## US-13 — Show the modes section on Scale Details ✅
**Status: IMPLEMENTED** (`src/pages/scale/ScalePage.tsx`)

**As a user**, I want to see the modes list in the UI.

### Test cases
1. Modes section lists mode entries for each degree (when inversions map exists) ✅
2. Each entry shows:
    - degree ✅
    - resolved name ✅
    - link to mode scale page ✅

---

## US-14 — Build a triad from a root note + quality ✅
**Status: IMPLEMENTED** (`src/music/chordParser.ts`: `parseChord()`)

**As a user**, I want to define a triad (e.g., D minor) as input for other features.

### Test cases
1. Root `C`, quality `major` → notes `{C,E,G}` ✅
2. Root `D`, quality `minor` → notes `{D,F,A}` ✅
3. Root `B`, quality `diminished` → notes `{B,D,F}` ✅
4. Root `C`, quality `augmented` → notes `{C,E,G#}` ✅

**Additional Implemented Features:**
- Supports 7th chords (maj7, m7, dim7, 7, mmaj7, m7b5, aug7, 7sus4)
- Supports 6th chords (6, m6)
- Supports slash chords (C/E, Am/G, etc.)

---

## US-15 — Compute "triads in scale" for each scale degree ✅
**Status: IMPLEMENTED** (`src/music/triads.ts`: `calculateTriads()`)

**As a user**, I want to see what triad exists on each degree of the scale.

### Test cases
1. For a 7-note scale:
    - Then exactly 7 triads are returned (one per degree) ✅
2. For each triad:
    - root is the scale note at that degree ✅
    - notes are 1st/3rd/5th scale tones (stacked thirds in scale order) ✅
3. If a triad quality is not one of {maj,min,dim,aug}
    - Then it includes sus2, sus4 qualities ✅

**Additional Implemented Features:**
- Calculates available extensions (#5, b5, 6, 7, maj7)
- Generates Roman numerals for diatonic scales
- Works for scales of any cardinality

---

## US-16 — Show triads section on Scale Details ✅
**Status: IMPLEMENTED** (`src/pages/scale/TriadsSection.tsx`)

**As a user**, I want to see the computed triads in the UI.

### Test cases
1. Triads section lists triads for each degree ✅
2. Each row shows:
    - degree ✅
    - chord name (root + quality) ✅
    - chord notes ✅
    - Roman numeral (for diatonic scales) ✅
    - extension buttons (clickable to play with extension) ✅

**Additional Implemented Features:**
- Chord/Arpeggio playback mode toggle
- Click root to play triad
- Click extension buttons to play extended chords

---

## US-17 — Input two triads in the Triad Pair workflow ❌
**Status: NOT IMPLEMENTED**

**As a user**, I want to select two triads as constraints for scale search.

### Test cases
1. Triad A selector accepts root note + quality ❌
2. Triad B selector accepts root note + quality ❌
3. Changing triad inputs updates the computed constraint note set ❌

**Alternative:** Users can search by multiple chord symbols in Scale Finder (e.g., "C Em G") which finds scales containing all chords.

---

## US-18 — Find scales that contain both triads (union-of-notes constraint) ❌
**Status: NOT IMPLEMENTED AS DEDICATED FEATURE**

**As a user**, I want to see scales that contain all notes from both triads.

### Test cases
1. Given triads A and B
    - Then returned scales all contain `notes(A) ∪ notes(B)` ❌
2. If triads share notes
    - Then union is deduplicated and matching still works ❌

**Alternative:** Scale Finder's chord search mode supports this (e.g., "C Em") but doesn't show degree mapping.

---

## US-19 — Map each triad root to a degree within each matching scale ❌
**Status: NOT IMPLEMENTED**

**As a user**, I want to know where each triad "lands" in the scale.

### Test cases
1. For each scale match:
    - If triad root is in scale, degree is returned (1..N) ❌
2. If a triad root is not in a scale
    - Then that scale must not appear in results ❌

---

## US-20 — Mark a triad as diatonic vs non-diatonic relative to a scale ❌
**Status: NOT IMPLEMENTED**

**As a user**, I want to see whether the triad matches the scale's own triad on that degree.

### Test cases
1. For each scale match and triad:
    - If the triad's note set equals the scale-derived triad at that degree → `diatonic = true` ❌
    - Else → `diatonic = false` (but still contained) ❌

---

## US-21 — Display Triad Pair results in a table ❌
**Status: NOT IMPLEMENTED**

**As a user**, I want to browse scale results with degree and diatonic information.

### Test cases
1. Results table shows per row:
    - scale name + root ❌
    - triad A degree + diatonic flag ❌
    - triad B degree + diatonic flag ❌
    - scale notes ❌
2. Sorting by "fewest extra notes" works the same as Scale Finder ❌

---

## US-22 — Precompute a list of all concrete scales from the catalog ❌
**Status: NOT IMPLEMENTED** (scales computed on-demand instead)

**As a user**, I want similar-scale discovery to be fast and consistent.

### Test cases
1. For each scale type and each root (12)
    - A concrete scale entry exists ❌ (computed on-demand)
2. Each concrete scale entry includes:
    - identity (root + type) ❌
    - note set ❌
    - interval key (for reference/debug) ❌

**Implementation Note:** Scales are instantiated on-demand rather than pre-computed. This is fast enough and saves memory.

---

## US-23 — Compute similarity distance between two scales ❌
**Status: NOT IMPLEMENTED**

**As a user**, I want the app to quantify how different two scales are.

### Test cases
1. Two identical scales → distance = 0 ❌
2. One-note swap between same-size scales → distance corresponds to 2 differing notes (remove+add) ❌
3. Two-note swaps → distance corresponds to 4 differing notes ❌

**Alternative:** Scale Relatives feature (implemented) shows 1st/2nd degree alterations (±1 semitone to intervals).

---

## US-24 — Find similar scales within a maximum change threshold ❌
**Status: NOT IMPLEMENTED**

**As a user**, I want to see scales that are 1 or 2 note changes away from the selected scale.

### Test cases
1. With threshold "1 change":
    - Only candidates with distance <= 2 appear ❌
2. With threshold "2 changes":
    - Candidates with distance <= 4 appear ❌
3. Results are sorted by increasing distance ❌

**Alternative:** Scale Relatives feature shows scales with 1 or 2 interval alterations (different from note changes).

---

## US-25 — Show added/removed notes for each similar scale result ❌
**Status: NOT IMPLEMENTED**

**As a user**, I want to understand exactly what changes between scales.

### Test cases
1. For each similar candidate:
    - "Removed" = notes in target but not in candidate ❌
    - "Added" = notes in candidate but not in target ❌
2. Removed + Added note counts correspond to the distance metric ❌

**Alternative:** Scale Relatives shows which intervals were altered (up/down by 1 semitone).

---

## US-26 — Display Similar Scales results in the UI ❌
**Status: NOT IMPLEMENTED**

**As a user**, I want a clear list/table of similar scales and their differences.

### Test cases
1. The page shows:
    - similar scale name/root ❌
    - distance ❌
    - added notes ❌
    - removed notes ❌
2. Changing threshold updates results instantly ❌

**Alternative:** Scale Relatives section (implemented) shows related scales with degree and alteration information.

---

## US-27 — User preference: display spelling preference (sharps vs flats) ✅
**Status: IMPLEMENTED** (`src/store/preferencesStore.ts`)

**As a user**, I want to choose whether notes are displayed with sharps or flats.

### Test cases
1. Toggle "Prefer sharps":
    - Then a pitch class like 1 is displayed as `C#` ✅
2. Toggle "Prefer flats":
    - Then the same pitch class is displayed as `Db` ✅
3. Preference affects all pages consistently ✅

---

## US-28 — Persist user preferences locally ✅
**Status: IMPLEMENTED** (`src/store/preferencesStore.ts` with Zustand persist middleware)

**As a user**, I want the app to remember my display preferences.

### Test cases
1. Set "Prefer flats" ✅
2. Reload page
    - Then "Prefer flats" is still active ✅
3. Clearing storage resets to defaults ✅

**Additional Persisted Preferences:**
- Tempo (60-240 BPM)
- Time signature (4/4 or 3/4)
- Playback pattern (ascending/descending/alternating/ladder)
- Synth volume settings
- Velocity settings

---

## US-29 — Shareable links for Scale Details selection ✅
**Status: IMPLEMENTED** (URL routing with query parameters)

**As a user**, I want to share a link that opens a specific scale.

### Test cases
1. Selecting a scale produces a URL that encodes:
    - scale type id (in path: `/scale/:scaleId`) ✅
    - root (in query: `?root=N`) ✅
2. Opening the URL in a new tab opens the same Scale Details view ✅

**Example:** `/scale/major?root=2` opens D Major scale page

---

## US-30 — Shareable links for Scale Finder note input ❌
**Status: NOT IMPLEMENTED** (search inputs not preserved in URL)

**As a user**, I want to share a link that reproduces a note search.

### Test cases
1. Enter notes `C,E,G`
    - Then URL encodes these notes (or pitch classes) ❌
2. Opening the URL reproduces the same input and results ❌

**Implementation Note:** Scale Finder doesn't currently encode search parameters in URL. Search state is ephemeral.

---

## Additional Implemented Features (Not in Original Stories)

### US-31 — Chord Search: Find common chords across multiple scales ✅
**Status: IMPLEMENTED** (`src/pages/chord-search/ChordSearchPage.tsx`)

**As a user**, I want to select multiple scales and see which chords are common to all or most of them.

**Features:**
- Add/remove scales by root and type ✅
- Real-time calculation of common chords ✅
- Categorization: universal (all scales), shared (2+ scales), unique (1 scale) ✅
- Statistics display ✅

---

### US-32 — Sequence Builder: Build chord progressions with scale constraints ✅
**Status: IMPLEMENTED** (`src/pages/sequence-builder/SequenceBuilderPage.tsx`)

**As a user**, I want to build chord progressions with intelligent recommendations based on selected scales.

**Features:**
- Select chords from filtered list based on scale(s) ✅
- Select up to 2 scales to constrain chord choices ✅
- Bass note selector for slash chords ✅
- Beat duration controls (1-6 beats per chord) ✅
- Edit mode for modifying saved chords ✅
- Playback with contextual previous chords ✅
- State persistence in sessionStorage ✅

---

### US-33 — Chord Type Search: Find scales by triad qualities ✅
**Status: IMPLEMENTED** (`src/music/chordTypeFinder.ts`, Scale Finder chord-types mode)

**As a user**, I want to find scales that contain specific triad types (e.g., "major and minor").

**Features:**
- Search by chord quality keywords ✅
- Displays triad type counts per scale ✅
- Highlights requested vs. additional types found ✅

---
End of list.
Last updated: 2026-02-10
