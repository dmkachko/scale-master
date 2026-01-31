# US-32 — Scale Sound Playback

## User Story

**As a user**, I want to hear the sounds of scale steps individually and play them sequentially in rhythm so that I can understand how the scale sounds musically.

**Acceptance Criteria**:
1. Each step in the scale card has a clickable play button
2. Clicking a step plays its corresponding note sound
3. A "Play All" button plays all steps sequentially in rhythm
4. The playback respects a time signature setting (4/4 or 3/4)
5. The full scale cycle fits within the chosen time signature
6. Time signature can be configured in settings
7. Visual feedback shows which step is currently playing

---

## Test Cases

### Test Suite 1: Individual Step Playback

#### TC-32.01: Play button appears on each step
- **Given** the user is viewing a scale card
- **When** examining the steps display
- **Then** each step has a play button icon
- **And** the button is clickable
- **And** the button has proper hover state

#### TC-32.02: Click step plays single note
- **Given** the user is viewing a C Major scale
- **When** the user clicks the play button on step 1 (C)
- **Then** the C note plays immediately
- **And** the sound completes before another click is processed
- **And** visual feedback shows the step is playing

#### TC-32.03: Each step plays correct note
- **Given** the user is viewing a D Dorian scale
- **When** the user clicks each step sequentially
- **Then** the notes play in order: D, E, F, G, A, B, C, D
- **And** each note corresponds to the correct pitch

#### TC-32.04: Multiple clicks queue properly
- **Given** the user clicks step 1
- **When** the user quickly clicks step 2 before step 1 finishes
- **Then** step 1 plays to completion
- **And** step 2 plays immediately after
- **Or** step 2 interrupts and plays immediately (implementation choice)

#### TC-32.05: Visual feedback during playback
- **Given** the user clicks a step
- **When** the note is playing
- **Then** the step highlights with a distinct color
- **And** the play button shows an active state
- **And** the highlight disappears when playback completes

---

### Test Suite 2: Play All Functionality

#### TC-32.06: Play All button appears on scale card
- **Given** the user is viewing a scale card
- **When** examining the card controls
- **Then** a "Play All" button is visible
- **And** the button is positioned prominently
- **And** the button shows a play icon

#### TC-32.07: Play All plays sequential notes
- **Given** the user is viewing a Major scale with 8 steps
- **When** the user clicks "Play All"
- **Then** all 8 steps play in order from 1 to 8
- **And** each note plays for the duration defined by the time signature
- **And** the sequence completes automatically

#### TC-32.08: Visual feedback follows playback
- **Given** the user clicks "Play All"
- **When** each note plays
- **Then** the corresponding step highlights
- **And** the highlight moves to the next step
- **And** only one step is highlighted at a time

#### TC-32.09: Stop button appears during playback
- **Given** the user clicks "Play All"
- **When** playback is in progress
- **Then** the "Play All" button changes to "Stop"
- **And** the stop button is clickable
- **And** clicking stop halts playback immediately

#### TC-32.10: Playback stops on interrupt
- **Given** "Play All" is playing step 4 of 8
- **When** the user clicks "Stop"
- **Then** playback halts immediately
- **And** the highlight disappears
- **And** the button returns to "Play All"
- **And** the next click starts from the beginning

---

### Test Suite 3: Time Signature — 4/4

#### TC-32.11: Settings has time signature option
- **Given** the user opens settings
- **When** examining the audio options
- **Then** a "Time Signature" setting is visible
- **And** options include "4/4" and "3/4"
- **And** the default value is "4/4"

#### TC-32.12: 8-step scale fits in one 4/4 measure
- **Given** time signature is set to 4/4
- **And** the scale has 8 steps (e.g., Major)
- **When** the user plays all steps
- **Then** steps 1-4 play as quarter notes in beats 1-4
- **And** steps 5-8 play as quarter notes in beats 1-4 of the next measure
- **And** the total duration is 2 measures at the set tempo

#### TC-32.13: 7-step scale fits in 4/4 measure
- **Given** time signature is set to 4/4
- **And** the scale has 7 steps (e.g., Phrygian Dominant)
- **When** the user plays all steps
- **Then** steps 1-4 play in the first measure
- **And** steps 5-7 play in beats 1-3 of the second measure
- **And** beat 4 of the second measure is silent or holds the last note

#### TC-32.14: Playback is rhythmic in 4/4
- **Given** time signature is set to 4/4
- **And** tempo is set to 120 BPM (if configurable)
- **When** the user plays all steps
- **Then** each note plays for 0.5 seconds (120 BPM = 2 beats per second)
- **And** the rhythm is consistent and steady
- **And** there are no random delays between notes

---

### Test Suite 4: Time Signature — 3/4

#### TC-32.15: 3/4 time signature can be selected
- **Given** the user opens settings
- **When** the user clicks on time signature
- **And** selects "3/4"
- **Then** the setting saves as "3/4"
- **And** playback uses 3/4 rhythm

#### TC-32.16: 6-step scale fits in two 3/4 measures
- **Given** time signature is set to 3/4
- **And** the scale has 6 steps
- **When** the user plays all steps
- **Then** steps 1-3 play in the first measure
- **And** steps 4-6 play in the second measure
- **And** the total duration is 2 measures

#### TC-32.17: 8-step scale distributes across 3/4 measures
- **Given** time signature is set to 3/4
- **And** the scale has 8 steps
- **When** the user plays all steps
- **Then** steps 1-3 play in the first measure
- **And** steps 4-6 play in the second measure
- **And** steps 7-8 play in beats 1-2 of the third measure
- **And** beat 3 is silent or holds the last note

#### TC-32.18: Playback feels like 3/4 waltz
- **Given** time signature is set to 3/4
- **When** the user plays all steps
- **Then** each measure has 3 beats
- **And** the rhythm emphasizes beat 1 (optionally)
- **And** the pattern feels like a waltz rhythm

---

### Test Suite 5: Settings Persistence

#### TC-32.19: Time signature persists across sessions
- **Given** the user sets time signature to 3/4
- **When** the user closes and reopens the app
- **Then** the time signature remains 3/4
- **And** playback uses 3/4 rhythm

#### TC-32.20: Time signature applies to all scales
- **Given** the user sets time signature to 4/4
- **When** the user plays different scales
- **Then** all scales use 4/4 rhythm
- **And** the setting is global, not per-scale

#### TC-32.21: Changing time signature updates playback
- **Given** the user is viewing a scale card
- **When** the user changes time signature from 4/4 to 3/4 in settings
- **And** returns to the scale card
- **Then** clicking "Play All" uses 3/4 rhythm
- **And** no app refresh is required

---

### Test Suite 6: Audio Loading and Errors

#### TC-32.22: Audio files load before playback
- **Given** the app loads for the first time
- **When** the user clicks a play button
- **Then** the audio plays without delay
- **Or** a loading indicator shows briefly
- **And** playback starts as soon as audio is ready

#### TC-32.23: Error handling for missing audio
- **Given** an audio file fails to load
- **When** the user clicks the corresponding step
- **Then** an error message displays briefly
- **And** playback does not crash the app
- **And** other steps continue to work

#### TC-32.24: Mute/volume control (optional)
- **Given** the app has a volume control in settings
- **When** the user sets volume to 50%
- **Then** all playback sounds at 50% volume
- **And** muting sets volume to 0%
- **And** unmuting restores previous volume

---

### Test Suite 7: Responsive and Accessibility

#### TC-32.25: Play buttons are touch-friendly
- **Given** the user is on a mobile device
- **When** the user taps a step play button
- **Then** the button has sufficient touch target (44x44px minimum)
- **And** the note plays immediately

#### TC-32.26: Play buttons have aria-labels
- **Given** the user is using a screen reader
- **When** focusing on a step play button
- **Then** the button announces "Play [note name]"
- **And** "Play All" announces "Play all scale steps"

#### TC-32.27: Keyboard shortcuts for playback (optional)
- **Given** the user has a scale card focused
- **When** the user presses spacebar
- **Then** "Play All" triggers
- **And** pressing Escape stops playback

---

### Test Suite 8: Performance

#### TC-32.28: Playback starts within 100ms
- **Given** the user clicks a play button
- **When** measuring response time
- **Then** the sound begins within 100ms
- **And** there is no perceptible lag

#### TC-32.29: Play All maintains consistent timing
- **Given** the user plays an 8-step scale
- **When** measuring the interval between notes
- **Then** each interval is consistent (e.g., 500ms each)
- **And** drift does not accumulate over the sequence

#### TC-32.30: Multiple scales can play independently
- **Given** the user has two scale cards visible
- **When** the user clicks "Play All" on the first card
- **And** then clicks "Play All" on the second card
- **Then** the first playback stops
- **And** the second playback starts
- **Or** both play simultaneously (implementation choice)

---

## Summary

- **Total Test Cases**: 30
- **Test Suites**: 8
  1. Individual Step Playback (5 cases)
  2. Play All Functionality (5 cases)
  3. Time Signature — 4/4 (4 cases)
  4. Time Signature — 3/4 (4 cases)
  5. Settings Persistence (3 cases)
  6. Audio Loading and Errors (3 cases)
  7. Responsive and Accessibility (3 cases)
  8. Performance (3 cases)

---

## Implementation Details

### Audio Source
- Use Web Audio API or HTML5 Audio for playback
- Audio files: Prerecorded note samples (piano or synth)
- File format: MP3 or OGG for browser compatibility
- Notes needed: Full chromatic scale (C, C#, D, D#, E, F, F#, G, G#, A, A#, B)

### Components Modified
- `ScaleCard`: Add play buttons to steps display, add "Play All" button
- `ScaleCard.css`: Style play buttons and active states
- Settings component: Add time signature selector

### New Services/Utilities
- `audioService.ts`: Handles audio loading and playback
  - `playNote(noteName: string)`: Play single note
  - `playSequence(notes: string[], timeSignature: '4/4' | '3/4', tempo: number)`: Play notes rhythmically
  - `stopPlayback()`: Stop current playback

### State Management
- Add `audioSettings` to app state or local storage:
  ```typescript
  {
    timeSignature: '4/4' | '3/4',
    tempo: number, // BPM (e.g., 120)
    volume: number, // 0-100
    muted: boolean
  }
  ```

### Rhythm Calculation
- **4/4 Time**: Divide notes evenly across measures with 4 beats each
  - 8 notes = 2 measures (4 notes per measure)
  - 7 notes = 4+3 split (1.75 measures)

- **3/4 Time**: Divide notes evenly across measures with 3 beats each
  - 6 notes = 2 measures (3 notes per measure)
  - 8 notes = 3+3+2 split (2.67 measures)

### Files to Create
1. `/src/services/audioService.ts` - Audio playback logic
2. `/src/hooks/useAudioPlayback.ts` - React hook for playback state
3. `/public/audio/notes/*.mp3` - Audio files for each note

### Files to Modify
1. `/src/components/ScaleCard.tsx` - Add play buttons and controls
2. `/src/components/ScaleCard.css` - Style play UI
3. `/src/pages/SettingsPage.tsx` - Add time signature settings (or create if doesn't exist)
4. `/src/types/settings.ts` - Add audio settings types

---

## Future Enhancements

1. **Tempo Control**: Allow users to adjust playback speed (60-240 BPM)
2. **Instrument Selection**: Choose from piano, guitar, synth sounds
3. **Loop Mode**: Continuously loop the scale playback
4. **Metronome**: Optional click track during playback
5. **Record**: Record and export scale playback as audio file
6. **MIDI Support**: Use MIDI devices for playback instead of samples
7. **Chord Playback**: Play chords built from scale steps (future US)