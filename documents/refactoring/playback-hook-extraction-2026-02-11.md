# Playback Hook Extraction

**Date:** 2026-02-11
**Scope:** SequenceBuilderPage playback functionality

## 🎯 Goal

Extract playback functionality from SequenceBuilderPage into a dedicated custom hook to improve code organization and separation of concerns.

---

## 📝 Changes Made

### 1. Created `useSequencePlayback.ts`

**Location:** `src/pages/sequence-builder/useSequencePlayback.ts`

**Purpose:** Encapsulate all playback-related state and logic for SequenceBuilderPage

**What it provides:**
- `playingIndex`: Current playing chord index
- `handlePlayChord`: Play a single chord
- `handlePlaySequence`: Play entire sequence including draft
- `playChordWithPrevious`: Play chord with context of previous chords
- `cancelPlayback`: Cancel any ongoing playback

**Implementation details:**
- Uses `ChordState` type from `chordProgression.ts` for type safety
- Manages playback state with `useState` for visual feedback
- Uses `useRef` for cancel tokens to interrupt playback
- Accepts `tempo` and `chordSelectionPlaybackCount` as options
- All playback functions are memoized with `useCallback`

### 2. Refactored `SequenceBuilderPage.tsx`

**Removed (~45 lines):**
- `playingIndex` state
- `playbackCancelRef` ref
- `getBassNote` helper function
- `handlePlayChord` function
- `handlePlaySequence` function
- `playChordWithPrevious` function
- Unused imports: `chordToNotes`, `audioEngine`

**Added:**
- Import of `useSequencePlayback` hook
- Hook initialization with tempo and playbackCount options

**Updated:**
- `handleSelectChord`: Removed cancel token logic, now calls hook's `playChordWithPrevious` with `savedSequence`
- `handleAddChord`: Removed cancel token logic, now calls hook's `playChordWithPrevious` with `savedSequence`
- `handleBassNoteChange`: Removed cancel token logic, now calls hook's `playChordWithPrevious` with `savedSequence`
- Play button: Updated to call `handlePlaySequence(savedSequence, draft)`

---

## 📊 Benefits

### 1. **Separation of Concerns**
- ✅ Playback logic isolated from UI logic
- ✅ Component focuses on state management and rendering
- ✅ Hook focuses on audio playback functionality

### 2. **Code Organization**
- ✅ Reduced component file by ~45 lines
- ✅ Playback logic grouped in dedicated file
- ✅ Easier to locate and maintain playback code

### 3. **Reusability**
- ✅ Hook is feature-specific but could be adapted for similar use cases
- ✅ All playback parameters configurable via options

### 4. **Type Safety**
- ✅ Uses existing `ChordState` type instead of duplicating interface
- ✅ Type inference works correctly throughout component

### 5. **Maintainability**
- ✅ Changes to playback logic isolated to hook file
- ✅ Component changes don't affect playback implementation
- ✅ Clear API boundary between component and playback

---

## 🔍 Technical Details

### Hook Options
```typescript
interface UseSequencePlaybackOptions {
  tempo: number;
  chordSelectionPlaybackCount: number;
}
```

### Hook Return Value
```typescript
interface UseSequencePlaybackReturn {
  playingIndex: number | null;
  handlePlayChord: (chord: Chord | null, beats?: number) => Promise<void>;
  handlePlaySequence: (savedSequence: ChordState[], draft: ChordState | null) => Promise<void>;
  playChordWithPrevious: (chord: Chord, savedSequence: ChordState[], currentBeats?: number) => Promise<void>;
  cancelPlayback: () => void;
}
```

### Cancel Token Pattern
The hook manages playback cancellation internally using refs:
```typescript
const playbackCancelRef = useRef<{ cancelled: boolean }>({ cancelled: false });

const cancelPlayback = useCallback(() => {
  playbackCancelRef.current.cancelled = true;
}, []);
```

This allows `playChordWithPrevious` to automatically cancel any ongoing playback before starting new playback.

### Fire-and-Forget Async
All playback functions return Promises but are called without `await` in the component:
```typescript
// Start playback async (non-blocking)
playChordWithPrevious(finalChord, savedSequence, currentBeats);
```

This ensures UI remains responsive while audio plays.

---

## 📂 Files Modified

### Created
- `src/pages/sequence-builder/useSequencePlayback.ts` (180 lines)

### Modified
- `src/pages/sequence-builder/SequenceBuilderPage.tsx` (-45 lines net)
  - Removed playback state and functions
  - Added hook integration
  - Updated all playback-related calls

---

## ✅ Verification

- ✅ Build successful
- ✅ No TypeScript errors
- ✅ All playback functionality preserved
- ✅ Component code cleaner and more focused
- ✅ Type safety maintained with `ChordState`

---

## 🎯 Pattern Established

### Custom Hook for Feature-Specific Logic

When a component has complex, self-contained functionality:
1. Create a custom hook in the feature folder
2. Extract state, refs, and logic into the hook
3. Define clear options and return value interfaces
4. Use `useCallback` to memoize functions
5. Import and use in component

```typescript
// Hook file: useFeature.ts
export function useFeature(options: Options): ReturnValue {
  const [state, setState] = useState(initial);

  const action = useCallback(() => {
    // Logic here
  }, [dependencies]);

  return { state, action };
}

// Component file: Component.tsx
const { state, action } = useFeature({ option1, option2 });
```

---

## 🚀 Future Improvements

### 1. **Playback Queue**
Could enhance hook to support queuing multiple playback requests:
```typescript
interface PlaybackQueue {
  add: (request: PlaybackRequest) => void;
  clear: () => void;
}
```

### 2. **Playback Events**
Could add callback options for playback lifecycle:
```typescript
interface UseSequencePlaybackOptions {
  tempo: number;
  chordSelectionPlaybackCount: number;
  onPlayStart?: () => void;
  onPlayEnd?: () => void;
  onPlayError?: (error: Error) => void;
}
```

### 3. **Test Coverage**
Could add unit tests for hook logic:
- Test cancel token behavior
- Test sequence playback order
- Test error handling

---

## 📚 Related Documentation

- Previous refactorings:
  - `zustand-refactoring-2026-02-11.md`
  - `zustand-complete-refactoring-2026-02-11.md`
  - `zustand-selector-optimization-2026-02-11.md`
- React Hooks: https://react.dev/reference/react
- Custom Hooks Best Practices: https://react.dev/learn/reusing-logic-with-custom-hooks

---

## 🎉 Conclusion

Successfully extracted 180 lines of playback logic into a dedicated custom hook, reducing SequenceBuilderPage complexity and establishing a clear pattern for feature-specific hooks.

**Key outcomes:**
- ✅ Cleaner component code
- ✅ Better separation of concerns
- ✅ Maintained type safety
- ✅ Preserved all functionality

---

*Playback hook extraction completed on 2026-02-11*
