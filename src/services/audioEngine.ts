/**
 * Audio Engine
 * Command-style sound engine using Tone.js
 * Works with global audio store for state management
 */

import * as Tone from 'tone';
import { useAudioStore } from '../store/audioStore';
import { usePreferencesStore } from '../store/preferencesStore';
import { volumeToDb, type SynthType } from './synthPresets';
import { generateNoteSequence, type ScalePattern } from './scalePatterns';
import { getPitchClassFromNote, addOctavesToNotes } from '../music/notes';

// Salamander piano samples are stored locally in public/samples/salamander/
const SALAMANDER_BASE_URL = `${import.meta.env.BASE_URL}samples/salamander/`;

// Salamander samples are recorded in minor thirds (A, C, D#, F#)
// Files use 's' for sharps (Ds1.mp3, Fs1.mp3) but Tone.js expects note names with '#'
const SAMPLE_MAPPING: Record<string, string> = {
  'A0': 'A0.mp3', 'C1': 'C1.mp3', 'D#1': 'Ds1.mp3', 'F#1': 'Fs1.mp3',
  'A1': 'A1.mp3', 'C2': 'C2.mp3', 'D#2': 'Ds2.mp3', 'F#2': 'Fs2.mp3',
  'A2': 'A2.mp3', 'C3': 'C3.mp3', 'D#3': 'Ds3.mp3', 'F#3': 'Fs3.mp3',
  'A3': 'A3.mp3', 'C4': 'C4.mp3', 'D#4': 'Ds4.mp3', 'F#4': 'Fs4.mp3',
  'A4': 'A4.mp3', 'C5': 'C5.mp3', 'D#5': 'Ds5.mp3', 'F#5': 'Fs5.mp3',
  'A5': 'A5.mp3', 'C6': 'C6.mp3', 'D#6': 'Ds6.mp3', 'F#6': 'Fs6.mp3',
  'A6': 'A6.mp3', 'C7': 'C7.mp3', 'D#7': 'Ds7.mp3', 'F#7': 'Fs7.mp3',
  'A7': 'A7.mp3', 'C8': 'C8.mp3'
};

class AudioEngine {
  private sampler: Tone.Sampler | null = null;
  private currentPart: Tone.Part | null = null;
  private initialized = false;

  /**
   * Initialize the sampler and audio context
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    await Tone.start();

    const prefs = usePreferencesStore.getState();

    // Create sampler with Salamander piano samples
    this.sampler = new Tone.Sampler({
      urls: SAMPLE_MAPPING,
      baseUrl: SALAMANDER_BASE_URL,
      volume: volumeToDb(prefs.synthSettings.melody.volume),
      release: 1,
    }).toDestination();

    // Wait for samples to load
    await Tone.loaded();

    this.initialized = true;
  }

  /**
   * Update sampler volume
   */
  updateSynthVolume(type: SynthType, volumePercent: number): void {
    if (this.sampler) {
      this.sampler.volume.value = volumeToDb(volumePercent);
    }
  }

  /**
   * Play a single note
   */
  async playNote(note: string, octave: number = 4): Promise<void> {
    await this.initialize();

    if (!this.sampler) return;

    const prefs = usePreferencesStore.getState();
    const noteWithOctave = `${note}${octave}`;
    this.sampler.triggerAttackRelease(noteWithOctave, '8n', undefined, prefs.velocitySettings.normal);
  }

  /**
   * Play a chord (multiple notes simultaneously)
   */
  async playChord(notes: string[], octave: number = 4, duration: string = '2n'): Promise<void> {
    await this.initialize();

    if (!this.sampler) return;

    const prefs = usePreferencesStore.getState();

    // Check if notes already have octaves (e.g., "C4" vs "C")
    const hasOctaves = notes.some(note => /\d$/.test(note));
    const notesWithOctave = hasOctaves
      ? notes
      : addOctavesToNotes(notes, octave);

    this.sampler.triggerAttackRelease(notesWithOctave, duration, undefined, prefs.velocitySettings.normal);
  }

  /**
   * Play an arpeggio (notes in sequence)
   */
  async playArpeggio(notes: string[], octave: number = 4): Promise<void> {
    await this.initialize();

    if (!this.sampler) return;

    const prefs = usePreferencesStore.getState();
    const now = Tone.now();
    const noteDuration = 0.2; // 200ms per note

    // Check if notes already have octaves (e.g., "C4" vs "C")
    const hasOctaves = notes.some(note => /\d$/.test(note));
    const notesWithOctave = hasOctaves
      ? notes
      : addOctavesToNotes(notes, octave);

    notesWithOctave.forEach((noteWithOctave, i) => {
      const time = now + i * noteDuration;
      this.sampler!.triggerAttackRelease(noteWithOctave, '8n', time, prefs.velocitySettings.normal);
    });
  }

  /**
   * Start playing a sequence of notes in a loop
   */
  async startSequence(
    scaleId: string,
    notes: string[],
    timeSignature: '4/4' | '3/4',
    tempo: number,
    pattern: ScalePattern,
    octave: number = 4
  ): Promise<void> {
    await this.initialize();

    if (!this.sampler) return;

    // Stop any currently playing sequence
    this.stop();

    // Get root pitch class for proper octave calculation
    const rootPitchClass = getPitchClassFromNote(notes[0]);

    // Generate note sequence based on pattern (includes octave offsets)
    const noteSequence = generateNoteSequence(notes, pattern, rootPitchClass);

    // Set the tempo
    Tone.Transport.bpm.value = tempo;

    // Calculate note duration based on time signature
    const beatsPerMeasure = timeSignature === '4/4' ? 4 : 3;
    const noteDuration = '4n'; // Quarter note

    const store = useAudioStore.getState();
    const prefs = usePreferencesStore.getState();

    // Create note events - notes play continuously
    const noteEvents: Array<{
      time: string;
      note: string;
      index: number;
      step: number | null; // Which scale degree (0-7, or null for silence)
      isAccent: boolean;
      octaveOffset: number;
      isSilence: boolean;
    }> = noteSequence.map((item, i) => {
      // Accent on downbeat of each measure
      const isAccent = timeSignature === '3/4'
        ? (i % 3 === 0)  // Every 3rd note in 3/4
        : (i % 4 === 0); // Every 4th note in 4/4

      // Determine which scale degree this is (0-6 for notes, or 0 for octave-up tonic)
      let step: number | null = null;
      if (item.note !== '') {
        // Find which note this is in the scale
        const noteIndex = notes.indexOf(item.note);
        if (noteIndex !== -1) {
          step = noteIndex;
        }
      }

      return {
        time: this.calculateBeatTime(i),
        note: item.note,
        index: i,
        step,
        isAccent,
        octaveOffset: item.octaveOffset,
        isSilence: item.note === '', // Empty string means silence
      };
    });

    // Calculate loop length to include silence at the end for 3/4
    let loopLength: string;
    if (timeSignature === '3/4') {
      // Add silence beats to complete the final measure
      const totalBeatsNeeded = Math.ceil(noteSequence.length / beatsPerMeasure) * beatsPerMeasure;
      loopLength = this.calculateBeatTime(totalBeatsNeeded);
    } else {
      // 4/4 - just calculate based on notes
      const totalMeasures = Math.ceil(noteSequence.length / beatsPerMeasure);
      loopLength = `${totalMeasures}m`;
    }

    // Create the looping sequence
    this.currentPart = new Tone.Part((time, value) => {
      // Handle silence (step 0)
      if (value.isSilence) {
        // Clear current note index during silence
        Tone.Draw.schedule(() => {
          store.setCurrentNote(null, null);
        }, time);
        return;
      }

      // Apply octave offset from pattern
      const noteOctave = octave + value.octaveOffset;
      const noteWithOctave = `${value.note}${noteOctave}`;

      // Apply velocity from settings
      const velocity = value.isAccent
        ? prefs.velocitySettings.accented
        : prefs.velocitySettings.normal;

      // Accented notes are slightly longer for emphasis
      const duration = value.isAccent ? '4n' : '8n';

      this.sampler!.triggerAttackRelease(noteWithOctave, duration, time, velocity);

      // Schedule the callback to run at the correct time
      Tone.Draw.schedule(() => {
        store.setCurrentNote(value.index, value.step);
      }, time);
    }, noteEvents);

    // Enable looping
    this.currentPart.loop = true;
    this.currentPart.loopEnd = loopLength;
    this.currentPart.start(0);

    Tone.Transport.start();

    // Update global state
    store.setPlaying(true, scaleId);
  }

  /**
   * Stop the currently playing sequence
   */
  stop(): void {
    if (this.currentPart) {
      this.currentPart.stop();
      this.currentPart.dispose();
      this.currentPart = null;
    }

    Tone.Transport.stop();
    Tone.Transport.cancel();

    // Update global state
    const store = useAudioStore.getState();
    store.stopAll();
  }

  /**
   * Check if currently playing
   */
  isPlaying(): boolean {
    return Tone.Transport.state === 'started';
  }

  /**
   * Calculate continuous beat time (for notes that play one after another)
   */
  private calculateBeatTime(beatIndex: number): string {
    // Convert beat index to measures:beats:sixteenths format
    // Since we're using quarter notes, each beat = 1 quarter note
    const measures = Math.floor(beatIndex / 4);
    const beats = beatIndex % 4;
    return `${measures}:${beats}:0`;
  }

  /**
   * Cleanup resources
   */
  dispose(): void {
    this.stop();

    if (this.sampler) {
      this.sampler.dispose();
      this.sampler = null;
    }

    this.initialized = false;
  }
}

// Export a singleton instance
export const audioEngine = new AudioEngine();
