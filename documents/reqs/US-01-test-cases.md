# US-01 Test Cases — Scale Catalog Loading and Display

> **User Story**: As a user, I want the app to load a built-in catalog of scale types so that all features operate on a known dataset.

---

## Test Suite 1: Catalog Loading

### TC-01.01: Catalog loads successfully on app start
- **Given** the app is opened for the first time
- **When** the app initializes
- **Then** the catalog is loaded from `/catalog/scales.json`
- **And** the catalog store status transitions from `idle` → `loading` → `ready`
- **And** no error banner is displayed
- **And** the scale grid is rendered with all catalog scales

### TC-01.02: Catalog loading shows loading state
- **Given** the app is starting
- **When** the catalog is being fetched
- **Then** a loading message "Loading scale catalog..." is displayed
- **And** no scale cards are shown
- **And** no controls are shown

### TC-01.03: Catalog loading handles network errors
- **Given** the catalog file is unavailable (404 error)
- **When** the app attempts to load the catalog
- **Then** the catalog store status is set to `error`
- **And** an error banner is displayed
- **And** the error message describes the network failure
- **And** no scale cards are shown

### TC-01.04: Catalog validation catches missing required fields
- **Given** the catalog JSON is missing required `id` field on a scale
- **When** the catalog is loaded and validated
- **Then** validation fails with Zod error
- **And** the error banner shows which field is missing
- **And** the error message includes the scale index path

### TC-01.05: Catalog validation catches invalid intervals
- **Given** a scale has intervals that don't include 0 (root)
- **When** the catalog is validated
- **Then** validation fails with message "Intervals must include 0 (root)"
- **And** the catalog is not loaded
- **And** error banner displays the validation error

---

## Test Suite 2: Catalog Data Structure

### TC-02.01: All scales have required fields
- **Given** the catalog is successfully loaded
- **When** examining each scale type
- **Then** each scale has `id` (non-empty string)
- **And** each scale has `name` (non-empty string)
- **And** each scale has `family` (non-empty string)
- **And** each scale has `intervals` (array with at least one element)
- **And** all intervals are integers between 0-11
- **And** intervals array includes 0

### TC-02.02: Optional fields are present when defined
- **Given** the catalog is loaded
- **When** examining scales with optional fields
- **Then** scales with `steps` have integer arrays of values 1-11
- **And** scales with `alternativeNames` have string arrays
- **And** scales with `modeOf` have objects with `{id: string, step: number}`
- **And** scales with `inversions` have objects mapping step numbers to scale IDs

### TC-02.03: Modal relationships are bidirectional
- **Given** a scale A is a mode of scale B (has `modeOf` pointing to B)
- **When** examining scale B's inversions
- **Then** scale B's `inversions` object contains an entry pointing back to A
- **And** the step number matches A's `modeOf.step`

### TC-02.04: Steps array matches intervals
- **Given** a scale has both `intervals` and `steps` defined
- **When** converting steps to intervals
- **Then** the reconstructed intervals match the original intervals array
- **And** the number of steps equals the number of intervals

### TC-02.05: Catalog contains scale families
- **Given** the catalog is loaded
- **Then** catalog contains scales from "diatonic" family
- **And** catalog contains scales from "melodic-minor-modes" family
- **And** catalog contains scales from "harmonic-minor-modes" family
- **And** catalog contains scales from "pentatonic" family
- **And** catalog contains scales from "symmetrical" family

---

## Test Suite 3: Root Selector

### TC-03.01: Root selector shows all 12 chromatic notes
- **Given** the catalog page is displayed
- **When** examining the root selector dropdown
- **Then** exactly 12 note options are present
- **And** notes are displayed in chromatic order (C, C#/Db, D, etc.)

### TC-03.02: Root selector defaults to C
- **Given** the app loads for the first time
- **When** the catalog page is displayed
- **Then** the root selector shows "C" as selected
- **And** all scale notes are calculated with C as root

### TC-03.03: Changing root recalculates all displayed notes
- **Given** the catalog page shows scales with root C
- **When** the user selects D from the root selector
- **Then** all scale cards immediately update
- **And** notes shift up by 2 semitones (C→D, D→E, etc.)
- **And** scale intervals remain unchanged

### TC-03.04: Root selector respects sharp/flat preference
- **Given** the user preference is set to "sharps"
- **When** viewing the root selector
- **Then** accidentals are displayed as C#, D#, F#, G#, A#
- **When** the preference changes to "flats"
- **Then** accidentals are displayed as Db, Eb, Gb, Ab, Bb

### TC-03.05: Root selection persists during session
- **Given** the user selects F# from the root selector
- **When** the user navigates between scales or uses search
- **Then** the root remains F#
- **And** all scale notes continue to be calculated from F#

---

## Test Suite 4: Typeahead Search

### TC-04.01: Typeahead filters scales by name
- **Given** the catalog page is displayed
- **When** the user types "major" in the search box
- **Then** the dropdown shows all scales with "major" in their name
- **And** results include "Major", "Harmonic Major", etc.
- **And** results are case-insensitive

### TC-04.02: Typeahead searches alternative names
- **Given** a scale has alternative names (e.g., "Aeolian" for Natural Minor)
- **When** the user types "aeolian"
- **Then** the dropdown includes "Natural Minor"
- **And** the alternative name "Aeolian" is shown in the dropdown item

### TC-04.03: Typeahead shows "No scales found" for no matches
- **Given** the search box is active
- **When** the user types "xyz" (non-existent scale)
- **Then** the dropdown displays "No scales found"
- **And** no scale items are shown

### TC-04.04: Selecting a scale from typeahead filters the grid
- **Given** the user types "phrygian" in search
- **When** the user clicks "Phrygian" from the dropdown
- **Then** the scale grid shows ONLY the Phrygian scale
- **And** the search box clears
- **And** the Phrygian card is highlighted
- **And** the page scrolls to center the card

### TC-04.05: Clear button appears and works
- **Given** the user has typed text in the search box
- **When** examining the search input
- **Then** an "×" clear button is visible
- **When** the user clicks the clear button
- **Then** the search text is cleared
- **And** the full catalog is displayed again
- **And** the clear button disappears

### TC-04.06: Keyboard navigation in typeahead
- **Given** the search dropdown is open with results
- **When** the user presses ArrowDown
- **Then** the first item is focused
- **When** the user presses ArrowDown again
- **Then** the second item is focused
- **When** the user presses Enter
- **Then** the focused scale is selected
- **And** the grid filters to that scale

### TC-04.07: Escape key closes typeahead dropdown
- **Given** the typeahead dropdown is open
- **When** the user presses Escape
- **Then** the dropdown closes
- **And** the search text remains
- **And** focus stays on the input

---

## Test Suite 5: Scale Card Display

### TC-05.01: Scale card shows basic information
- **Given** a scale card is rendered (e.g., Major scale)
- **Then** the card displays the scale name "Major"
- **And** the card displays the family tag "diatonic"
- **And** the card has a white background with border
- **And** the card is centered with proper spacing

### TC-05.02: Scale card shows alternative names
- **Given** a scale has alternative names defined
- **When** viewing the scale card (e.g., Phrygian Dominant)
- **Then** below the name, italic text shows "Also known as: Spanish Phrygian, Freygish, Hijaz, Altered Phrygian"

### TC-05.03: Scale card displays intervals row
- **Given** a Major scale card at root C
- **When** examining the note grid
- **Then** the first row shows intervals: 0, 2, 4, 5, 7, 9, 11
- **And** intervals have gray background
- **And** intervals use monospace font

### TC-05.04: Scale card displays notes row
- **Given** a Major scale card at root C
- **When** examining the note grid
- **Then** the second row shows notes: C, D, E, F, G, A, B
- **And** notes have green background
- **And** notes use bold font
- **And** notes respect sharp/flat preference

### TC-05.05: Scale card displays degrees row
- **Given** a Major scale card
- **When** examining the note grid
- **Then** the third row shows roman numerals: I, II, III, IV, V, VI, VII
- **And** degrees have blue background
- **And** degrees use italic font

### TC-05.06: Scale card shows steps when present
- **Given** a scale has `steps` field defined (e.g., Major: [2,2,1,2,2,2,1])
- **When** viewing the scale card
- **Then** an "Interval Steps" section is displayed
- **And** steps are shown as badges: W W H W W W H
- **And** 1 = H (half step), 2 = W (whole step)

### TC-05.07: Scale card shows characteristic tags
- **Given** a Major scale card
- **When** examining the tags section
- **Then** characteristic tags are displayed (e.g., "major", "nat", "maj7")
- **And** tags are color-coded with green background
- **And** tags are uppercase with letter spacing

### TC-05.08: Note grid columns are aligned
- **Given** any scale card
- **When** viewing the three rows (intervals, notes, degrees)
- **Then** all columns are vertically aligned
- **And** each column represents one scale degree
- **And** column width is equal across all three rows

---

## Test Suite 6: Modal Relationships Display

### TC-06.01: "Mode Of" section appears for modes
- **Given** a scale card for Dorian (mode 2 of Major)
- **When** viewing the card
- **Then** a "Mode of:" section is displayed
- **And** it shows "Major (starting from step 2)"
- **And** "Major" is a clickable link

### TC-06.02: "Mode Of" link is clickable
- **Given** a Dorian scale card with "Mode of: Major"
- **When** the user clicks the "Major" link
- **Then** the page navigates to the Major scale card
- **And** the Major card is highlighted with pulse animation
- **And** the page scrolls to center the Major card

### TC-06.03: "Modes" section shows all inversions
- **Given** a Major scale card
- **When** viewing the card
- **Then** a "Modes of this scale:" section is displayed
- **And** mode items are shown in a grid
- **And** exactly 6 modes are listed (steps 2-7)
- **And** each mode shows: step number badge + mode name

### TC-06.04: Mode items are clickable
- **Given** the Major scale "Modes" section
- **When** the user clicks the mode item "3. Phrygian"
- **Then** the page navigates to the Phrygian scale
- **And** the Phrygian card is highlighted
- **And** the scale grid filters to show only Phrygian

### TC-06.05: Mode step badges are styled
- **Given** a mode item in the "Modes" section
- **When** examining the step badge
- **Then** the badge is circular with brand color background
- **And** the step number is white text
- **And** the badge is positioned to the left of the mode name

### TC-06.06: Modal relationships are accurate
- **Given** the catalog contains modal families (Major modes, Melodic Minor modes, Harmonic Minor modes)
- **When** examining any mode's relationships
- **Then** the mode's parent matches its `modeOf.id`
- **And** the parent's inversions include the mode at the correct step
- **And** clicking through the chain returns to the starting scale

---

## Test Suite 7: Highlighting and Navigation

### TC-07.01: Clicking mode link highlights target scale
- **Given** viewing the Major scale card
- **When** the user clicks "6. Natural Minor" mode link
- **Then** the Natural Minor card receives `highlighted` class
- **And** a light gray border (3px, #d1d5db) appears
- **And** a subtle shadow glow appears around the card
- **And** a pulse animation plays for 0.6 seconds

### TC-07.02: Highlight auto-clears after 2 seconds
- **Given** a scale card is highlighted
- **When** 2 seconds elapse
- **Then** the `highlighted` class is removed
- **And** the border returns to normal
- **And** the glow disappears

### TC-07.03: Highlighting scrolls card into view
- **Given** the target scale card is off-screen
- **When** the card is highlighted via navigation
- **Then** the page smoothly scrolls (behavior: 'smooth')
- **And** the card is positioned in the center of the viewport (block: 'center')

### TC-07.04: Searching a scale highlights and filters
- **Given** the user types "Superlocrian" and presses Enter
- **When** the scale is selected from typeahead
- **Then** the grid shows ONLY the Superlocrian card
- **And** the card is highlighted with pulse animation
- **And** the search box clears

### TC-07.05: Typing in search clears highlight
- **Given** a scale card is currently highlighted
- **When** the user types in the search box
- **Then** the highlight is removed
- **And** the full catalog is displayed again

### TC-07.06: Multiple navigation clicks work correctly
- **Given** the user clicks mode link A
- **When** before the 2-second timeout, the user clicks mode link B
- **Then** the first highlight is cleared
- **And** only scale B is highlighted
- **And** the timeout for B starts fresh (2 seconds)

---

## Test Suite 8: Music Theory Calculations

### TC-08.01: Notes calculated correctly for root C
- **Given** Major scale (intervals [0,2,4,5,7,9,11]) at root C
- **When** calculating scale notes
- **Then** notes are: C, D, E, F, G, A, B

### TC-08.02: Notes calculated correctly for root D
- **Given** Major scale at root D (root = 2)
- **When** calculating scale notes
- **Then** notes are: D, E, F#, G, A, B, C#
- **And** sharps are used (assuming sharp preference)

### TC-08.03: Notes respect flat preference
- **Given** Major scale at root D
- **And** flat preference is selected
- **When** calculating scale notes
- **Then** F# is displayed as Gb
- **And** C# is displayed as Db

### TC-08.04: Degrees calculated correctly for Major
- **Given** Major scale (intervals [0,2,4,5,7,9,11])
- **When** converting to roman numerals
- **Then** degrees are: I, II, III, IV, V, VI, VII

### TC-08.05: Degrees show flats for altered scales
- **Given** Phrygian scale (intervals [0,1,3,5,7,8,10])
- **When** converting to roman numerals
- **Then** degrees include: I, bII, bIII, IV, V, bVI, bVII

### TC-08.06: Characteristics detect major/minor correctly
- **Given** a scale with interval 4 (major third)
- **When** analyzing characteristics
- **Then** "major" tag is present
- **Given** a scale with interval 3 (minor third)
- **Then** "minor" tag is present

### TC-08.07: Characteristics detect 5th correctly
- **Given** a scale with interval 6 (diminished fifth)
- **Then** "dim" tag is present
- **Given** a scale with interval 7 (perfect fifth)
- **Then** "nat" tag is present
- **Given** a scale with interval 8 (augmented fifth)
- **Then** "aug" tag is present

### TC-08.08: Characteristics detect 7th correctly
- **Given** a scale with interval 11 (major seventh)
- **Then** "maj7" tag is present
- **Given** a scale with interval 10 (minor seventh)
- **Then** "7th" tag is present
- **Given** a scale with interval 9 but no 10 or 11
- **Then** "6" tag is present

---

## Test Suite 9: Responsive Design

### TC-09.01: Desktop layout uses grid columns
- **Given** viewport width >= 1024px
- **When** viewing the scale grid
- **Then** multiple scale cards appear per row
- **And** grid uses `--grid-columns-desktop` CSS variable

### TC-09.02: Tablet layout reduces columns
- **Given** viewport width between 640px and 1024px
- **When** viewing the scale grid
- **Then** fewer scale cards appear per row
- **And** grid uses `--grid-columns-tablet` CSS variable

### TC-09.03: Mobile layout shows single column
- **Given** viewport width < 640px
- **When** viewing the scale grid
- **Then** one scale card appears per row
- **And** grid uses `--grid-columns-mobile` CSS variable

### TC-09.04: Controls stack on mobile
- **Given** viewport width < 640px
- **When** viewing the controls bar
- **Then** root selector and typeahead are stacked vertically
- **And** each control spans full width

### TC-09.05: Mode items grid is responsive
- **Given** varying card widths
- **When** viewing the "Modes" section
- **Then** mode items auto-fill available space
- **And** minimum item width is 200px
- **And** items wrap to new rows as needed

---

## Test Suite 10: Error Handling

### TC-10.01: Network error shows error banner
- **Given** the catalog fetch fails with network error
- **When** the error state is reached
- **Then** an error banner is displayed
- **And** the banner has a red background
- **And** the error message describes the failure
- **And** no scale cards are shown

### TC-10.02: Validation error shows details
- **Given** the catalog fails Zod validation
- **When** the error banner is displayed
- **Then** the error message includes validation details
- **And** the path to the invalid field is shown
- **And** the expected vs actual values are described

### TC-10.03: Error boundary catches component errors
- **Given** a React component throws an error during render
- **When** the error propagates
- **Then** the Error Boundary catches it
- **And** a fallback UI is displayed
- **And** error details and stack trace are shown
- **And** "Try Again" and "Reload Page" buttons are provided

### TC-10.04: Missing parent scale is handled gracefully
- **Given** a scale has `modeOf` pointing to a non-existent parent ID
- **When** rendering the scale card
- **Then** the "Mode of:" section does not appear
- **Or** it shows the ID as text (not a link)
- **And** no JavaScript error is thrown

### TC-10.05: Invalid interval data doesn't crash
- **Given** a scale somehow has intervals outside 0-11 range (bypassing validation)
- **When** calculating notes or degrees
- **Then** the app handles it gracefully (modulo 12)
- **And** no crash occurs
- **And** notes/degrees are displayed

---

## Test Suite 11: State Management

### TC-11.01: Catalog store initializes correctly
- **Given** the app loads
- **When** examining the catalog store
- **Then** initial status is "idle"
- **And** catalog is null
- **And** indexes are null
- **And** error is null
- **And** selectedRoot is 0

### TC-11.02: Catalog store updates on successful load
- **Given** the catalog loads successfully
- **When** the store is updated
- **Then** status becomes "ready"
- **And** catalog contains the ScaleType array
- **And** indexes are populated with Maps
- **And** error remains null

### TC-11.03: Catalog store updates on error
- **Given** the catalog load fails
- **When** the store is updated
- **Then** status becomes "error"
- **And** error contains the error message
- **And** catalog remains null
- **And** indexes remain null

### TC-11.04: Root selection updates store
- **Given** the user selects root F (5) from dropdown
- **When** the change event fires
- **Then** catalogStore.selectedRoot updates to 5
- **And** all scale cards re-render with new notes

### TC-11.05: Preferences persist across reloads
- **Given** the user sets accidental preference to "flats"
- **When** the page is reloaded
- **Then** the preference is still "flats"
- **And** notes display with flat accidentals
- **And** localStorage contains the persisted preference

---

## Test Suite 12: Accessibility

### TC-12.01: Typeahead has proper ARIA attributes
- **Given** the typeahead component
- **When** examining the input element
- **Then** it has `aria-label="Search scales"`
- **And** it has `aria-autocomplete="list"`
- **And** it has `aria-controls="scale-typeahead-list"`
- **And** `aria-expanded` reflects dropdown open/closed state

### TC-12.02: Typeahead dropdown has proper roles
- **Given** the typeahead dropdown is open
- **When** examining the list element
- **Then** it has `role="listbox"`
- **And** each item has `role="option"`
- **And** focused item has `aria-selected="true"`

### TC-12.03: Keyboard navigation is fully functional
- **Given** the user is navigating with keyboard only
- **When** tabbing through the page
- **Then** all interactive elements receive focus in logical order
- **And** focus indicators are visible
- **And** Enter/Space activate buttons and links

### TC-12.04: Root selector is keyboard accessible
- **Given** the root selector has focus
- **When** the user presses ArrowDown/ArrowUp
- **Then** the selection changes
- **When** the user presses Enter
- **Then** the dropdown closes and selection is confirmed

### TC-12.05: Mode links are keyboard navigable
- **Given** a scale card with mode links
- **When** the user tabs to a mode link
- **Then** the link receives visible focus outline
- **When** the user presses Enter
- **Then** navigation occurs to the target scale

---

## Test Suite 13: Performance

### TC-13.01: Initial catalog load completes within 2 seconds
- **Given** normal network conditions
- **When** the app loads for the first time
- **Then** the catalog loads within 2 seconds
- **And** the scale grid renders within 3 seconds total

### TC-13.02: Root change updates immediately
- **Given** the catalog is displayed with 32 scales
- **When** the user changes the root selector
- **Then** all scale notes update within 100ms
- **And** no visible lag or flicker occurs

### TC-13.03: Search filtering is instant
- **Given** the user types in the search box
- **When** each keystroke occurs
- **Then** the dropdown filters within 50ms
- **And** typing feels responsive

### TC-13.04: Scale grid with 32 cards renders smoothly
- **Given** the full catalog of 32 scales
- **When** the page is rendered
- **Then** all cards appear within 1 second
- **And** scrolling is smooth (60fps)
- **And** no jank or layout shifts occur

### TC-13.05: Navigation doesn't cause page flicker
- **Given** the user clicks a mode link
- **When** navigation occurs
- **Then** the transition is smooth
- **And** no white flash or content jump happens
- **And** scroll animation is smooth

---

## Test Suite 14: Data Integrity

### TC-14.01: All catalog scales have unique IDs
- **Given** the catalog is loaded
- **When** examining all scale IDs
- **Then** no duplicate IDs exist
- **And** all IDs follow kebab-case format

### TC-14.02: Modal relationships form valid cycles
- **Given** the Major scale has 6 modes
- **When** following the mode chain: Major → Dorian → Phrygian → ... → Locrian → Major
- **Then** the chain completes in exactly 7 steps
- **And** returns to the original Major scale

### TC-14.03: Alternative names are not empty strings
- **Given** a scale has `alternativeNames` field
- **When** examining the array
- **Then** all elements are non-empty strings
- **And** no whitespace-only strings exist

### TC-14.04: Inversions reference valid scale IDs
- **Given** a scale has `inversions` field
- **When** examining each inversion entry
- **Then** each referenced scale ID exists in the catalog
- **And** the referenced scale's intervals match the rotation

### TC-14.05: Steps reconstruct to original intervals
- **Given** a scale with both `steps` and `intervals`
- **When** converting steps to intervals (cumulative sum starting at 0)
- **Then** the result exactly matches the original intervals array

---

## Test Suite 15: Edge Cases

### TC-15.01: Scale with minimal data displays correctly
- **Given** a scale with only required fields (id, name, family, intervals)
- **When** the scale card is rendered
- **Then** the card displays without errors
- **And** no optional sections appear (steps, modeOf, inversions, alternativeNames)

### TC-15.02: Scale with maximal data displays correctly
- **Given** a scale with all optional fields populated
- **When** the scale card is rendered
- **Then** all sections appear correctly
- **And** no layout overflow occurs
- **And** all interactive elements work

### TC-15.03: Scale with many modes shows scrollable list
- **Given** an 8-note scale with 7 modes
- **When** the "Modes" section is rendered
- **Then** mode items wrap to multiple rows if needed
- **And** grid auto-fill maintains minimum 200px width
- **And** all modes are accessible

### TC-15.04: Scale with long alternative names doesn't overflow
- **Given** a scale with 5+ long alternative names
- **When** displaying the alternative names section
- **Then** text wraps appropriately
- **And** card height adjusts to fit content
- **And** no horizontal overflow occurs

### TC-15.05: Searching with special characters works
- **Given** the user types "c#" or "bb7" in search
- **When** filtering scales
- **Then** no JavaScript error occurs
- **And** relevant scales are found (e.g., scales with # or 7 in name)

---

## Summary Statistics

- **Total Test Cases**: 105
- **Test Suites**: 15
  1. Catalog Loading (5 cases)
  2. Catalog Data Structure (5 cases)
  3. Root Selector (5 cases)
  4. Typeahead Search (7 cases)
  5. Scale Card Display (8 cases)
  6. Modal Relationships Display (6 cases)
  7. Highlighting and Navigation (6 cases)
  8. Music Theory Calculations (8 cases)
  9. Responsive Design (5 cases)
  10. Error Handling (5 cases)
  11. State Management (5 cases)
  12. Accessibility (5 cases)
  13. Performance (5 cases)
  14. Data Integrity (5 cases)
  15. Edge Cases (5 cases)

---

**Priority Levels**:
- **P0 (Critical)**: Test Suites 1, 2, 5, 8 - Core functionality
- **P1 (High)**: Test Suites 3, 4, 6, 7, 10, 11 - Primary features
- **P2 (Medium)**: Test Suites 9, 12, 13, 14 - Quality & UX
- **P3 (Low)**: Test Suite 15 - Edge cases

**Coverage**: These test cases cover all features identified in the codebase exploration, including catalog loading, validation, display, search, navigation, modal relationships, calculations, and error handling.
