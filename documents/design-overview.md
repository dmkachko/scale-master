# Music Theory App — Proposed System Design (Frontend Only)

## 1. Overview

This document proposes a **frontend-only** system design for a deterministic music-theory application that operates on a finite **scale catalog** and provides:

- Scale matching by note set
- Scale details (notes, intervals)
- Mode discovery (by rotation + catalog lookup)
- Triads-in-scale analysis
- Scale matching for a pair of triads (with degree mapping and diatonic marking)
- Similar-scale search (by set distance)

No backend services are assumed.

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

**ScaleType**
- `id` (stable unique key)
- `name` (human-readable)
- `aliases` (optional)
- `family` (optional grouping)
- `intervals` (sorted, relative to root; must include 0)

**ConcreteScale**
- `root` (pitch class)
- `scaleTypeId`

Derived properties:
- `notes` (as pitch-class set)
- `interval set key` (canonical representation, used for lookup)

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

**Goal:** Convert user input tokens into a pitch-class set.

**Method:**
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

**Goal:** Find all concrete scales that contain the user’s note set.

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

### 4.4 Modes (Rotation + Catalog Lookup)

**Goal:** For a selected scale type, compute its modes and resolve their names *via catalog*.

**Inputs:**
- selected `ScaleType` with intervals length `N`
- `ScaleTypeByIntervalKey` index

**Method:**
For each degree `k` from 0..N-1:
1. **Rotate** the interval list so that degree `k` becomes the new tonic.
2. **Normalize**:
    - subtract the new tonic interval value from all rotated intervals
    - mod 12 into [0..11]
    - sort
3. Produce `modeIntervalKey`.
4. Look up `modeIntervalKey` in `ScaleTypeByIntervalKey`:
    - if found, use that scale type’s name/id as the mode identity
    - otherwise mark as unknown/unnamed

**Outputs per mode:**
- degree (1..N)
- rotated interval set
- resolved mode name/id (if found)
- mode notes when applied to a chosen root (optional display)

**Design choices:**
- Symmetric scales may yield duplicate rotations; UI may:
    - show all degrees, or
    - deduplicate identical rotations (configurable)

---

### 4.5 Triads in a scale (Diatonic triads)

**Goal:** Determine the triad on each scale degree by stacking scale tones.

**Inputs:**
- `ConcreteScale` (ordered scale notes by intervals)

**Method (generic “stack thirds”):**
For a scale with N notes in order:
- For each degree `d`:
    - root = note[d]
    - third = note[(d+2) mod N]
    - fifth = note[(d+4) mod N]
    - triadSet = {root, third, fifth}
    - classify quality by semitone distances from root:
        - maj: (4, 7)
        - min: (3, 7)
        - dim: (3, 6)
        - aug: (4, 8)
        - otherwise: “other/unknown” (for exotic scales)

**Outputs per degree:**
- degree number
- triad root pitch class
- triad quality label
- triad notes (set and optionally spelled notes)

**Note:** For non-heptatonic scales, this method still works but yields “triads” in that scale’s ordered system (may be musically unconventional; still deterministic).

---

### 4.6 Scales matching a pair of triads

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

**Goal:** Find scales “close” to a selected scale by changing 1 or 2 notes.

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

---

## 5. Module Architecture (Frontend)

### 5.1 Module boundaries

#### A) Catalog Module
**Responsibilities**
- Load catalog file
- Validate minimal schema expectations
- Build indexes (by id, by interval key)
- Optionally precompute concrete scales list

**Interfaces**
- `getScaleTypes()`
- `findScaleTypeByIntervalKey(key)`
- `getConcreteScales()` (optional precompute)

#### B) Music Theory Engine Module
Pure logic. No UI state. No side effects.

**Submodules**
- Note Parsing & Spelling
- Set Operations
- Scale Operations (instantiate, order notes)
- Mode Operations (rotate/normalize + lookup)
- Triad Operations (build, classify, triads-in-scale)
- Search Operations:
    - scale finder
    - triad-pair finder
    - similar-scales finder

**Interfaces**
- `parseNotes(input): { set, errors }`
- `findScalesContaining(set, options)`
- `getScaleDetails(scaleTypeId, root)`
- `getModes(scaleTypeId)`
- `getTriads(scaleTypeId, root)`
- `findScalesForTriadPair(triadA, triadB, options)`
- `findSimilarScales(target, options)`

#### C) Presentation / UI Module
**Responsibilities**
- Gather inputs
- Call engine methods
- Render structured results
- Provide navigation between workflows
- Manage display preferences (sharp/flat preference, filters)

**Pages (workflows)**
- Scale Finder
- Scale Details
- Triad Pair Matching
- Similar Scales

#### D) Preferences / State Module
**Responsibilities**
- Store user display preferences and search options
- Persist locally (browser storage)
- Provide consistent defaults

---

## 6. Data Flow Summary

### 6.1 Typical user flows

**Flow 1: Notes → Scales**
1. Parse note tokens → `inputSet`
2. Search catalog → matching scales list
3. Display sorted results; allow selection → Scale Details

**Flow 2: Scale → Modes and Triads**
1. Instantiate selected scale → `scaleSet`
2. Compute modes (rotations) → resolve names via catalog lookup
3. Compute triads per degree → display

**Flow 3: Two Triads → Scales**
1. Build two triad sets
2. Union into constraint set
3. Search scales containing constraint
4. Map triads to degrees; mark diatonic/non-diatonic
5. Display

**Flow 4: Scale → Similar Scales**
1. Compute target scale set
2. Compare against precomputed concrete scales list
3. Filter by distance
4. Display diffs (added/removed notes)

---

## 7. Key Design Properties

- **Catalog-driven:** scale and mode names come only from the catalog.
- **Deterministic:** no inference; results are stable and reproducible.
- **Fast:** all operations are bounded by catalog size × 12 roots.
- **Extensible:** new catalog entries automatically participate in:
    - matching,
    - mode naming (via lookup),
    - triad analysis,
    - similarity comparisons.

---

## 8. Open Design Options (Non-blocking)

These are configurable policies rather than implementation details:

1. **Mode duplication in symmetric scales**
    - Show all degrees vs deduplicate identical rotations

2. **Triad “diatonic” definition**
    - Strict: must match stacked-scale triad at that degree
    - Loose: chord notes merely contained in scale

3. **Spelling policy**
    - Simple preference (sharps/flats)
    - Key-aware diatonic spelling (later enhancement)

4. **Similarity definition**
    - Require same cardinality or not
    - Compare only within same family or across all families

---
End of document.
