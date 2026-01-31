/**
 * Preferences Store
 * User preferences for note spelling and other settings
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

type AccidentalPreference = 'sharps' | 'flats';

interface PreferencesState {
  accidentalPreference: AccidentalPreference;

  // Actions
  setAccidentalPreference: (preference: AccidentalPreference) => void;
  toggleAccidentalPreference: () => void;
}

export const usePreferencesStore = create<PreferencesState>()(
  devtools(
    persist(
      (set) => ({
        // Initial state
        accidentalPreference: 'sharps',

        // Actions
        setAccidentalPreference: (preference) =>
          set(
            { accidentalPreference: preference },
            false,
            'preferences/setAccidentalPreference'
          ),

        toggleAccidentalPreference: () =>
          set(
            (state) => ({
              accidentalPreference: state.accidentalPreference === 'sharps' ? 'flats' : 'sharps',
            }),
            false,
            'preferences/toggleAccidentalPreference'
          ),
      }),
      {
        name: 'scale-master-preferences',
      }
    ),
    { name: 'PreferencesStore' }
  )
);
