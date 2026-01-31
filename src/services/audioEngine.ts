/**
 * Audio Engine
 * Command-style sound engine using Tone.js
 * Works with global audio store for state management
 */

import * as Tone from 'tone';
import { useAudioStore } from '../store/audioStore';
import { usePreferencesStore } from '../store/preferencesStore';
import { createSynth, volumeToDb, type SynthType } from './synthPresets';
import { generateNoteSequence, type ScalePattern } from './scalePatterns';

class AudioEngine {
  private synths: Map<SynthType, Tone.PolySynth> = new Map();
  private currentPart: Tone.Part | null = null;
  private initialized = false;

  /**
   * Initialize the synth and audio context
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    await Tone.start();

    // Create all three synth types
    const prefs = usePreferencesStore.getState();

    this.synths.set('pads', createSynth('pads', volumeToDb(prefs.synthSettings.pads.volume)));
    this.synths.set('melody', createSynth('melody', volumeToDb(prefs.synthSettings.melody.volume)));
    this.synths.set('bass', createSynth('bass', volumeToDb(prefs.synthSettings.bass.volume)));

    this.initialized = true;
  }

  /**
   * Get the currently active synth
   */
  private getActiveSynth(): Tone.PolySynth | null {
    const prefs = usePreferencesStore.getState();
    return this.synths.get(prefs.activeSynthType) || null;
  }

  /**
   * Update synth volume
   */
  updateSynthVolume(type: SynthType, volumePercent: number): void {
    const synth = this.synths.get(type);
    if (synth) {
      synth.volume.value = volumeToDb(volumePercent);
    }
  }

  /**
   * Play a single note
   */
  async playNote(note: string, octave: number = 4): Promise<void> {
    await this.initialize();

    const synth = this.getActiveSynth();
    if (!synth) return;

    const prefs = usePreferencesStore.getState();
    const noteWithOctave = `${note}${octave}`;
    synth.triggerAttackRelease(noteWithOctave, '8n', undefined, prefs.velocitySettings.normal);
  }

  /**
   * Play a chord (multiple notes simultaneously)
   */
  async playChord(notes: string[], octave: number = 4, duration: string = '2n'): Promise<void> {
    await this.initialize();

    const synth = this.getActiveSynth();
    if (!synth) return;

    const prefs = usePreferencesStore.getState();
    const notesWithOctave = notes.map((note) => `${note}${octave}`);
    synth.triggerAttackRelease(notesWithOctave, duration, undefined, prefs.velocitySettings.normal);
  }

  /**
   * Play an arpeggio (notes in sequence)
   */
  async playArpeggio(notes: string[], octave: number = 4): Promise<void> {
    await this.initialize();

    const synth = this.getActiveSynth();
    if (!synth) return;

    const prefs = usePreferencesStore.getState();
    const now = Tone.now();
    const noteDuration = 0.2; // 200ms per note

    notes.forEach((note, i) => {
      const noteWithOctave = `${note}${octave}`;
      const time = now + i * noteDuration;
      synth.triggerAttackRelease(noteWithOctave, '8n', time, prefs.velocitySettings.normal);
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

    const synth = this.getActiveSynth();
    if (!synth) return;

    // Stop any currently playing sequence
    this.stop();

    // Generate note sequence based on pattern (includes octave offsets)
    const noteSequence = generateNoteSequence(notes, pattern);

    // Set the tempo
    Tone.Transport.bpm.value = tempo;

    // Calculate note duration based on time signature
    const beatsPerMeasure = timeSignature === '4/4' ? 4 : 3;
    const noteDuration = '4n'; // Quarter note

    const store = useAudioStore.getState();
    const prefs = usePreferencesStore.getState();

    // Get pattern steps to map sequence index to scale degree
    const patternSteps = generateNoteSequence(notes, pattern);

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

      synth.triggerAttackRelease(noteWithOctave, duration, time, velocity);

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

    this.synths.forEach((synth) => {
      synth.dispose();
    });
    this.synths.clear();

    this.initialized = false;
  }
}

// Export a singleton instance
export const audioEngine = new AudioEngine();
