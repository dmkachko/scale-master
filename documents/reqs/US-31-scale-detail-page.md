# US-31 — Individual Scale Detail Page

## User Story

**As a user**, I want to view detailed information about a specific scale on a dedicated page so that I can explore the scale in depth without distractions from the full catalog.

**Acceptance Criteria**:
1. Each scale card in the catalog has a "More →" link
2. Clicking the "More" link navigates to a dedicated scale detail page
3. The scale detail page uses a proper route (e.g., `/scale/major`)
4. The page has a two-column layout:
   - Left column: Scale card with full information
   - Right column: Additional information section (placeholder)
5. The page has a "← Back to Catalog" navigation link
6. The scale card on the detail page does not show the "More" link

---

## Related User Story: Catalog Filtering

**As a user**, I want to filter scales by typing part of the name so that I can quickly find scales matching my search across the entire catalog.

**Acceptance Criteria**:
1. The catalog page has a filter input field (not a dropdown)
2. Typing in the filter searches scale names and alternative names
3. The catalog shows ALL matching scales (not just one)
4. A count displays how many scales match the filter
5. Clearing the filter shows the full catalog again
6. The filter is case-insensitive
7. The filter updates results in real-time as I type

---

## Test Cases

### Test Suite 1: Scale Detail Page Navigation

#### TC-31.01: More link appears on catalog cards
- **Given** the user is on the catalog page
- **When** viewing any scale card
- **Then** a "More →" link appears in the top-right corner
- **And** the link has purple/brand color
- **And** the link is clickable

#### TC-31.02: More link navigates to detail page
- **Given** the user is viewing a Major scale card in the catalog
- **When** the user clicks the "More →" link
- **Then** the browser navigates to `/scale/major`
- **And** the Major scale detail page loads
- **And** the URL changes in the browser address bar

#### TC-31.03: Detail page loads via direct URL
- **Given** the user types `/scale/phrygian-dominant` in the browser
- **When** the page loads
- **Then** the Phrygian Dominant scale detail page is displayed
- **And** the scale card shows Phrygian Dominant information
- **And** the layout has two columns

#### TC-31.04: Invalid scale ID shows error
- **Given** the user navigates to `/scale/invalid-scale-name`
- **When** the page attempts to load
- **Then** an error message "Scale Not Found" is displayed
- **And** a message shows "The scale 'invalid-scale-name' does not exist"
- **And** a "Return to Catalog" button is provided

#### TC-31.05: Back link returns to catalog
- **Given** the user is on a scale detail page
- **When** the user clicks "← Back to Catalog"
- **Then** the browser navigates to `/` (catalog page)
- **And** the full catalog is displayed
- **And** the root note selection is preserved

#### TC-31.06: Browser back button works
- **Given** the user navigated from catalog → detail page
- **When** the user clicks the browser back button
- **Then** the catalog page is displayed
- **And** the same root note is selected
- **And** any filter text is preserved

---

### Test Suite 2: Scale Detail Page Layout

#### TC-31.07: Page has two-column layout on desktop
- **Given** viewport width >= 1024px
- **When** viewing a scale detail page
- **Then** the layout has two columns of equal width
- **And** the left column contains the scale card
- **And** the right column contains additional info section

#### TC-31.08: Left column shows complete scale card
- **Given** the user is on a scale detail page
- **When** examining the left column
- **Then** the scale card displays all standard information:
  - Scale name
  - Alternative names (if any)
  - Family and characteristic tags
  - Note grid (intervals, notes, degrees)
  - Steps display
  - "Mode of" section (if applicable)
  - "Modes" section (if applicable)

#### TC-31.09: Scale card on detail page has no "More" link
- **Given** the user is on a scale detail page
- **When** examining the scale card
- **Then** no "More →" link is present
- **And** the card header shows only the scale name

#### TC-31.10: Right column shows placeholder content
- **Given** the user is on a scale detail page
- **When** examining the right column
- **Then** a placeholder section is displayed
- **And** the heading shows "Additional Information"
- **And** a list describes future content:
  - Chord progressions
  - Common usage patterns
  - Related scales
  - Musical examples
  - Practice exercises

#### TC-31.11: Left column is sticky on scroll (desktop)
- **Given** viewport width >= 1024px
- **And** the page content is tall enough to scroll
- **When** the user scrolls down
- **Then** the scale card (left column) remains visible (sticky)
- **And** the right column content scrolls normally

#### TC-31.12: Layout becomes single column on mobile
- **Given** viewport width < 1024px
- **When** viewing a scale detail page
- **Then** the layout stacks into a single column
- **And** the scale card appears first (top)
- **And** the additional info appears second (below)
- **And** the sticky behavior is disabled

---

### Test Suite 3: Catalog Filter Input

#### TC-31.13: Filter input appears in controls bar
- **Given** the user is on the catalog page
- **When** examining the controls bar
- **Then** a text input field is visible
- **And** the placeholder text shows "Filter scales by name..."
- **And** the input is positioned to the right of the root selector

#### TC-31.14: Filter searches scale names
- **Given** the catalog has 32 scales loaded
- **When** the user types "major" in the filter
- **Then** the catalog shows all scales with "major" in the name
- **And** results include: Major, Harmonic Major, Melodic Major, etc.
- **And** results update immediately as the user types

#### TC-31.15: Filter searches alternative names
- **Given** Natural Minor has alternative name "Aeolian"
- **When** the user types "aeolian"
- **Then** Natural Minor scale appears in results
- **And** other Aeolian-related scales appear if they exist

#### TC-31.16: Filter is case-insensitive
- **Given** the user types "LYDIAN"
- **When** the filter is applied
- **Then** results include "Lydian", "Lydian Augmented", "Lydian Dominant"
- **And** same results as typing "lydian" (lowercase)

#### TC-31.17: Filter shows all matching results
- **Given** the user types "dorian"
- **When** the filter is applied
- **Then** ALL scales with "dorian" are shown:
  - Dorian
  - Dorian #4
  - Ukrainian Dorian
  - Any other Dorian variants
- **And** the grid displays all matches (not just one)

#### TC-31.18: Filter count displays
- **Given** the user types "phrygian"
- **When** the filter returns 4 matching scales
- **Then** a message displays "Showing 4 of 32 scales"
- **And** the message appears above the scale grid
- **And** the message uses secondary text color

#### TC-31.19: Clear button appears with text
- **Given** the user has typed text in the filter
- **When** examining the filter input
- **Then** an "×" clear button is visible
- **And** the button is positioned inside the input (right side)

#### TC-31.20: Clear button removes filter
- **Given** the filter shows "Showing 5 of 32 scales"
- **When** the user clicks the "×" clear button
- **Then** the filter text is cleared
- **And** all 32 scales are displayed
- **And** the count message disappears
- **And** the clear button disappears

#### TC-31.21: Empty filter shows all scales
- **Given** the filter input is empty
- **When** viewing the catalog
- **Then** all scales are displayed
- **And** no count message appears
- **And** no clear button appears

#### TC-31.22: No matches shows empty grid
- **Given** the user types "xyz" (non-existent name)
- **When** the filter is applied
- **Then** the scale grid shows no cards
- **And** the count shows "Showing 0 of 32 scales"
- **And** the grid area is empty (no error message needed)

---

### Test Suite 4: Detail Page with Filtering

#### TC-31.23: Filter state is independent from detail pages
- **Given** the user has filtered to "minor" on catalog page
- **When** the user clicks "More" on Natural Minor
- **Then** the detail page shows only Natural Minor (normal behavior)
- **When** the user clicks "Back to Catalog"
- **Then** the catalog still shows the "minor" filter active
- **And** the filter text "minor" is still in the input

#### TC-31.24: Root note persists across navigation
- **Given** the user selects root "F" on catalog page
- **When** the user navigates to any scale detail page
- **Then** the scale card shows notes calculated from F
- **When** the user returns to catalog
- **Then** root "F" is still selected
- **And** all catalog cards show notes from F

---

### Test Suite 5: Modal Navigation from Detail Page

#### TC-31.25: Mode links work from detail page
- **Given** the user is on the Major scale detail page
- **When** the user clicks mode link "6. Natural Minor"
- **Then** the browser navigates to `/scale/natural-minor`
- **And** the Natural Minor detail page loads
- **And** the scale card updates to Natural Minor

#### TC-31.26: "Mode Of" link works from detail page
- **Given** the user is on the Dorian scale detail page
- **And** Dorian shows "Mode of: Major (starting from step 2)"
- **When** the user clicks the "Major" link
- **Then** the browser navigates to `/scale/major`
- **And** the Major detail page loads

#### TC-31.27: Navigation creates browser history
- **Given** the user navigates: Catalog → Major → Dorian → Natural Minor
- **When** the user presses back button 3 times
- **Then** the navigation goes: Natural Minor → Dorian → Major → Catalog
- **And** each page loads correctly

---

### Test Suite 6: Responsive Design

#### TC-31.28: Detail page is responsive on tablet
- **Given** viewport width is 768px (tablet)
- **When** viewing a scale detail page
- **Then** the layout becomes single column
- **And** content is readable without horizontal scroll
- **And** the scale card is full width

#### TC-31.29: Detail page is responsive on mobile
- **Given** viewport width is 375px (mobile)
- **When** viewing a scale detail page
- **Then** the back link is full width
- **And** the scale card is full width
- **And** all text is legible
- **And** the placeholder section is full width

#### TC-31.30: Filter input is full width on mobile
- **Given** viewport width < 640px
- **When** viewing the catalog page
- **Then** the controls stack vertically
- **And** the root selector spans full width
- **And** the filter input spans full width

---

### Test Suite 7: Error Handling

#### TC-31.31: Catalog error shows on detail page
- **Given** the catalog fails to load
- **When** the user navigates to `/scale/major`
- **Then** the error banner is displayed
- **And** the error message describes the failure
- **And** no scale card is shown

#### TC-31.32: Loading state shows on detail page
- **Given** the catalog is still loading
- **When** the user navigates to a scale detail page
- **Then** a loading message is displayed
- **And** no scale card is shown yet
- **And** the back link may or may not be visible

---

### Test Suite 8: Accessibility

#### TC-31.33: Back link is keyboard accessible
- **Given** the user is on a scale detail page
- **When** the user tabs through interactive elements
- **Then** the back link receives focus
- **And** a visible focus outline appears
- **When** the user presses Enter
- **Then** navigation occurs to the catalog

#### TC-31.34: Filter input has proper label
- **Given** the filter input is rendered
- **When** examining the input element
- **Then** it has `aria-label="Filter scales"`
- **And** the placeholder provides usage hint

#### TC-31.35: Clear button has proper label
- **Given** the clear button is visible
- **When** examining the button element
- **Then** it has `aria-label="Clear filter"`
- **And** screen readers can announce its purpose

#### TC-31.36: More links are keyboard navigable
- **Given** the catalog page is displayed
- **When** the user tabs through scale cards
- **Then** each "More →" link receives focus
- **And** pressing Enter activates the link

---

### Test Suite 9: Performance

#### TC-31.37: Detail page loads quickly
- **Given** the catalog is already loaded
- **When** the user clicks a "More" link
- **Then** the detail page renders within 100ms
- **And** no visible lag occurs

#### TC-31.38: Filter updates are instant
- **Given** the user types in the filter input
- **When** each keystroke occurs
- **Then** the grid updates within 50ms
- **And** typing feels responsive

#### TC-31.39: Showing all filtered results is smooth
- **Given** the filter returns 10 matching scales
- **When** the grid displays all 10 cards
- **Then** rendering completes within 200ms
- **And** no jank or layout shifts occur

---

## Summary

- **Total Test Cases**: 39
- **Test Suites**: 9
  1. Scale Detail Page Navigation (6 cases)
  2. Scale Detail Page Layout (6 cases)
  3. Catalog Filter Input (10 cases)
  4. Detail Page with Filtering (2 cases)
  5. Modal Navigation from Detail Page (3 cases)
  6. Responsive Design (3 cases)
  7. Error Handling (2 cases)
  8. Accessibility (4 cases)
  9. Performance (3 cases)

---

## Implementation Details

### Routes Added
- `/scale/:scaleId` - Individual scale detail page

### Components Modified
- `ScaleCard`: Added optional `showMoreLink` prop and "More →" link in header
- `ScaleCatalogPage`: Replaced typeahead with simple filter input

### Components Created
- `ScalePage`: New detail page with two-column layout

### Files Changed
1. `/src/App.tsx` - Added new route
2. `/src/pages/ScalePage.tsx` - New page component
3. `/src/pages/ScalePage.css` - New page styles
4. `/src/components/ScaleCard.tsx` - Added More link
5. `/src/components/ScaleCard.css` - Styled More link
6. `/src/pages/ScaleCatalogPage.tsx` - Replaced typeahead with filter
7. `/src/pages/ScaleCatalogPage.css` - Updated filter styles

### Components Removed
- `ScaleTypeahead` component (no longer used)

---

## Future Enhancements (Right Column Placeholder)

The right column on the scale detail page is reserved for:
1. **Chord Progressions**: Common chord progressions using this scale
2. **Usage Patterns**: Typical melodic and harmonic patterns
3. **Related Scales**: Scales that share similar characteristics
4. **Musical Examples**: Famous songs or pieces using this scale
5. **Practice Exercises**: Interactive exercises for practicing the scale

These features can be implemented in future user stories.
