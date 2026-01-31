# Music Theory App — User Stories (Ordered) with Test Cases

> Notes:
> - Each story is intentionally small/atomic.
> - Stories are ordered by dependency (later ones assume earlier ones exist).
> - Test cases are written in a black-box style (inputs → expected outputs/behavior).

---

## US-01 — Load the scale catalog from a local JSON file
**As a user**, I want the app to load a built-in catalog of scale types so that all features operate on a known dataset.

> **Note**: Test cases for US-01 are documented in [US-01-test-cases.md](./US-01-test-cases.md)

---

## US-02 — Parse a single note token into a pitch class
**As a user**, I want to type a note like `C#` or `Db` and have it understood reliably.

### Test cases
1. Input `C` → pitch class `0`
2. Input `B` → pitch class `11`
3. Input `C#` → pitch class `1`
4. Input `Db` → pitch class `1`
5. Input `C4` → pitch class `0` (octave ignored)
6. Input `H` → parse error (invalid token)

---

## US-03 — Parse a list of note tokens into a deduplicated note set
**As a user**, I want to paste multiple notes and have the app produce a clean unique set of notes.

### Test cases
1. Input `"C E G"` → set contains exactly `{C, E, G}`
2. Input `"C, E, G"` → set contains exactly `{C, E, G}`
3. Input `"C C E"` → set contains exactly `{C, E}` (duplicates removed)
4. Input `"C X G"` → set contains `{C, G}` and error list includes `X`

---

## US-04 — Display the parsed input note set back to the user
**As a user**, I want to see which notes were accepted so I can correct mistakes.

### Test cases
1. Input `"C Eb G"` → UI shows three “note chips” `C`, `Eb`, `G`
2. Input includes invalid token `"C Q"` → UI shows `C` chip and an error indicator for `Q`

---

## US-05 — Convert a scale type (interval list) into a scale note set for a chosen root
**As a user**, I want the app to construct the actual notes of a scale given root + scale type.

### Test cases
1. Given scale type intervals `[0,2,4,5,7,9,11]` and root `C`
    - Then notes are `{C,D,E,F,G,A,B}`
2. Same scale type and root `D`
    - Then notes are `{D,E,F#,G,A,B,C#}`
3. For any scale type
    - Then output contains exactly `N` notes where `N = number of intervals`

---

## US-06 — List available scale types from the catalog in a selector
**As a user**, I want to choose a scale type from a list so I don’t need to type internal IDs.

### Test cases
1. Scale type dropdown shows all catalog scale types by `name`
2. Selecting an item exposes its `id` internally (used by later pages)

---

## US-07 — Find all scales that contain the user’s input note set
**As a user**, I want to enter notes and see which scales contain them.

### Test cases
1. Input `C E G`
    - Then results include at least one scale that contains these notes (depending on catalog)
2. Input `C C# D`
    - Then results include only scales containing all three pitch classes
3. Input empty
    - Then results area shows “enter notes to search” and no matches are computed

---

## US-08 — Sort scale matches by “fewest extra notes”
**As a user**, I want the most specific matches first.

### Test cases
1. Given multiple matching scales
    - Then the first result has minimal extra notes compared to the input set
2. If two results have equal extra notes
    - Then they are consistently ordered (stable ordering by name or family)

---

## US-09 — Open “Scale Details” for a selected match
**As a user**, I want to click a matching scale and see its details.

### Test cases
1. Clicking a match opens Scale Details showing the selected root + scale type
2. Navigating back returns to the previous search state (inputs preserved if possible)

---

## US-10 — Show scale notes and intervals on the Scale Details page
**As a user**, I want to see the exact note list and the interval structure.

### Test cases
1. For a chosen scale, the page shows:
    - root note
    - scale type name
    - ordered list of notes
    - intervals list (as semitone offsets)
2. Note count equals interval count

---

## US-11 — Generate mode interval rotations for a scale type
**As a user**, I want to see all rotations (“modes”) of the chosen scale.

### Test cases
1. For a scale type with `N` intervals
    - Then exactly `N` rotations are produced (one per degree)
2. Each rotation:
    - Contains 0
    - Has the same number of intervals as the original
    - Is normalized into `[0..11]` and sorted

---

## US-12 — Resolve mode names by querying the catalog (no hardcoded mode lists)
**As a user**, I want each rotation to be labeled with a known scale name when present in the catalog.

### Test cases
1. If a rotation’s interval set exists in the catalog
    - Then the mode entry shows that scale type’s `name`
2. If a rotation is not found
    - Then the mode entry shows “Unnamed mode” (or “Rotation k”) and still shows intervals

---

## US-13 — Show the modes section on Scale Details
**As a user**, I want to see the modes list in the UI.

### Test cases
1. Modes section lists mode entries for degrees 1..N
2. Each entry shows:
    - degree
    - resolved name (or fallback)
    - rotated intervals

---

## US-14 — Build a triad from a root note + quality
**As a user**, I want to define a triad (e.g., D minor) as input for other features.

### Test cases
1. Root `C`, quality `major` → notes `{C,E,G}`
2. Root `D`, quality `minor` → notes `{D,F,A}`
3. Root `B`, quality `diminished` → notes `{B,D,F}`
4. Root `C`, quality `augmented` → notes `{C,E,G#}`

---

## US-15 — Compute “triads in scale” for each scale degree
**As a user**, I want to see what triad exists on each degree of the scale.

### Test cases
1. For a 7-note scale:
    - Then exactly 7 triads are returned (one per degree)
2. For each triad:
    - root is the scale note at that degree
    - notes are 1st/3rd/5th scale tones (stacked thirds in scale order)
3. If a triad quality is not one of {maj,min,dim,aug}
    - Then it is labeled as “other” (still shows notes)

---

## US-16 — Show triads section on Scale Details
**As a user**, I want to see the computed triads in the UI.

### Test cases
1. Triads section lists triads for each degree
2. Each row shows:
    - degree
    - chord name (root + quality)
    - chord notes

---

## US-17 — Input two triads in the Triad Pair workflow
**As a user**, I want to select two triads as constraints for scale search.

### Test cases
1. Triad A selector accepts root note + quality
2. Triad B selector accepts root note + quality
3. Changing triad inputs updates the computed constraint note set

---

## US-18 — Find scales that contain both triads (union-of-notes constraint)
**As a user**, I want to see scales that contain all notes from both triads.

### Test cases
1. Given triads A and B
    - Then returned scales all contain `notes(A) ∪ notes(B)`
2. If triads share notes
    - Then union is deduplicated and matching still works

---

## US-19 — Map each triad root to a degree within each matching scale
**As a user**, I want to know where each triad “lands” in the scale.

### Test cases
1. For each scale match:
    - If triad root is in scale, degree is returned (1..N)
2. If a triad root is not in a scale
    - Then that scale must not appear in results (since triad notes wouldn’t be contained)

---

## US-20 — Mark a triad as diatonic vs non-diatonic relative to a scale
**As a user**, I want to see whether the triad matches the scale’s own triad on that degree.

### Test cases
1. For each scale match and triad:
    - If the triad’s note set equals the scale-derived triad at that degree → `diatonic = true`
    - Else → `diatonic = false` (but still contained)

---

## US-21 — Display Triad Pair results in a table
**As a user**, I want to browse scale results with degree and diatonic information.

### Test cases
1. Results table shows per row:
    - scale name + root
    - triad A degree + diatonic flag
    - triad B degree + diatonic flag
    - scale notes
2. Sorting by “fewest extra notes” works the same as Scale Finder

---

## US-22 — Precompute a list of all concrete scales from the catalog
**As a user**, I want similar-scale discovery to be fast and consistent.

### Test cases
1. For each scale type and each root (12)
    - A concrete scale entry exists
2. Each concrete scale entry includes:
    - identity (root + type)
    - note set
    - interval key (for reference/debug)

---

## US-23 — Compute similarity distance between two scales
**As a user**, I want the app to quantify how different two scales are.

### Test cases
1. Two identical scales → distance = 0
2. One-note swap between same-size scales → distance corresponds to 2 differing notes (remove+add)
3. Two-note swaps → distance corresponds to 4 differing notes

---

## US-24 — Find similar scales within a maximum change threshold
**As a user**, I want to see scales that are 1 or 2 note changes away from the selected scale.

### Test cases
1. With threshold “1 change”:
    - Only candidates with distance <= 2 appear
2. With threshold “2 changes”:
    - Candidates with distance <= 4 appear
3. Results are sorted by increasing distance

---

## US-25 — Show added/removed notes for each similar scale result
**As a user**, I want to understand exactly what changes between scales.

### Test cases
1. For each similar candidate:
    - “Removed” = notes in target but not in candidate
    - “Added” = notes in candidate but not in target
2. Removed + Added note counts correspond to the distance metric

---

## US-26 — Display Similar Scales results in the UI
**As a user**, I want a clear list/table of similar scales and their differences.

### Test cases
1. The page shows:
    - similar scale name/root
    - distance
    - added notes
    - removed notes
2. Changing threshold updates results instantly

---

## US-27 — User preference: display spelling preference (sharps vs flats)
**As a user**, I want to choose whether notes are displayed with sharps or flats.

### Test cases
1. Toggle “Prefer sharps”:
    - Then a pitch class like 1 is displayed as `C#`
2. Toggle “Prefer flats”:
    - Then the same pitch class is displayed as `Db`
3. Preference affects all pages consistently

---

## US-28 — Persist user preferences locally
**As a user**, I want the app to remember my display preferences.

### Test cases
1. Set “Prefer flats”
2. Reload page
    - Then “Prefer flats” is still active
3. Clearing storage resets to defaults

---

## US-29 — Shareable links for Scale Details selection
**As a user**, I want to share a link that opens a specific scale.

### Test cases
1. Selecting a scale produces a URL that encodes:
    - scale type id
    - root
2. Opening the URL in a new tab opens the same Scale Details view

---

## US-30 — Shareable links for Scale Finder note input
**As a user**, I want to share a link that reproduces a note search.

### Test cases
1. Enter notes `C,E,G`
    - Then URL encodes these notes (or pitch classes)
2. Opening the URL reproduces the same input and results

---
End of list.
