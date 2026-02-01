/**
 * Triads Section Component
 * Displays all triads built on each scale degree with playback controls
 */

import {useState} from 'react';
import {audioEngine} from '../../services/audioEngine.ts';
import {calculateTriads, getTriadName, getTriadAbbreviation, type Triad} from '../../music/triads.ts';
import {addOctavesToNotes, getPitchClassFromNote} from '../../music/notes.ts';
import './TriadsSection.css';

interface TriadsSectionProps {
    scaleNotes: string[];
    scaleIntervals: number[];
    scaleFamily?: string;
}

type PlaybackMode = 'chord' | 'arpeggio';

function TriadsSection({scaleNotes, scaleIntervals, scaleFamily}: TriadsSectionProps) {
    console.log('TriadsSection rendered with', scaleNotes.length, 'notes');

    const [playingTriad, setPlayingTriad] = useState<number | null>(null);
    const [playbackMode, setPlaybackMode] = useState<PlaybackMode>('chord');
    const triads = calculateTriads(scaleNotes, scaleIntervals);

    console.log('Calculated triads:', triads);

    // Calculate notes with proper octaves for the scale
    const scaleNotesWithOctaves = addOctavesToNotes(scaleNotes, 4);

    // Create a mapping from note name to note with octave
    const noteToOctaveMap = new Map<string, string>();
    scaleNotes.forEach((note, idx) => {
        noteToOctaveMap.set(note, scaleNotesWithOctaves[idx]);
    });

    // Helper function to map triad notes to notes with proper octaves from the scale
    const getTriadNotesWithOctaves = (triad: Triad): string[] => {
        const notesWithOctaves = triad.notes.map(note => noteToOctaveMap.get(note) || `${note}4`);

        // Parse root note to get its MIDI pitch
        const rootMatch = notesWithOctaves[0].match(/^([A-G][#b]?)(\d+)$/);
        if (!rootMatch) return notesWithOctaves;

        const [, rootNoteName, rootOctaveStr] = rootMatch;
        const rootOctave = parseInt(rootOctaveStr);
        const rootPitchClass = getPitchClassFromNote(rootNoteName);
        const rootMidiPitch = rootOctave * 12 + rootPitchClass;

        // Ensure all notes are at or above the root's pitch
        return notesWithOctaves.map((noteWithOctave, idx) => {
            if (idx === 0) return noteWithOctave; // Root stays as is

            const match = noteWithOctave.match(/^([A-G][#b]?)(\d+)$/);
            if (!match) return noteWithOctave;

            const [, noteName, octaveStr] = match;
            const octave = parseInt(octaveStr);
            const pitchClass = getPitchClassFromNote(noteName);
            const midiPitch = octave * 12 + pitchClass;

            // If this note's pitch is less than root's pitch, bump it up an octave
            if (midiPitch < rootMidiPitch) {
                return `${noteName}${octave + 1}`;
            }

            return noteWithOctave;
        });
    };

    // Only show roman numerals for diatonic/minor scales where they're meaningful
    const showRomanNumerals = scaleFamily === 'diatonic' ||
                              scaleFamily === 'minor' ||
                              scaleFamily === 'harmonic-minor-modes' ||
                              scaleFamily === 'melodic-minor-modes';

    // Helper to calculate extension note from extension label [v2]
    const getExtensionNote = (triad: Triad, extensionLabel: string): string => {
        console.log('[NEW] Getting extension:', extensionLabel, 'for triad', triad.root);

        const rootNoteName = triad.root;
        const rootWithOctave = noteToOctaveMap.get(rootNoteName) || `${rootNoteName}4`;

        // Parse root to get octave
        const match = rootWithOctave.match(/^([A-G][#b]?)(\d+)$/);
        if (!match) {
            console.log('[NEW] No match, returning:', rootWithOctave);
            return rootWithOctave;
        }

        const [, , octaveStr] = match;
        const octave = parseInt(octaveStr);
        const rootPitchClass = getPitchClassFromNote(rootNoteName);

        // Map extension label to semitone interval from root
        const extensionIntervalMap: Record<string, number> = {
            'b5': 6,
            '#5': 8,
            '6': 9,
            '7': 10,
            'maj7': 11
        };

        const interval = extensionIntervalMap[extensionLabel];
        console.log('[NEW] Looking for interval:', interval);

        if (interval === undefined) {
            console.log('[NEW] Interval undefined, returning:', rootWithOctave);
            return rootWithOctave;
        }

        // Find which scale note has the target interval from the triad root
        const triadRootIndex = scaleNotes.indexOf(rootNoteName);
        console.log('[NEW] Triad root index:', triadRootIndex);

        if (triadRootIndex === -1) {
            console.log('[NEW] Triad root not found in scale!');
            return rootWithOctave;
        }

        const triadRootInterval = scaleIntervals[triadRootIndex];
        console.log('[NEW] Searching in scale intervals:', scaleIntervals);

        // Search for the scale note that is 'interval' semitones above the triad root
        let extensionNoteName: string | null = null;
        for (let i = 0; i < scaleNotes.length; i++) {
            const scaleNoteInterval = scaleIntervals[i];
            const intervalFromTriadRoot = (scaleNoteInterval - triadRootInterval + 12) % 12;

            if (intervalFromTriadRoot === interval) {
                extensionNoteName = scaleNotes[i];
                console.log('[NEW] FOUND extension note:', extensionNoteName, 'at index', i);
                break;
            }
        }

        // Fallback to hardcoded names if not found in scale
        if (!extensionNoteName) {
            const targetPitchClass = (rootPitchClass + interval) % 12;
            const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
            extensionNoteName = noteNames[targetPitchClass];
            console.log('[NEW] Using fallback:', extensionNoteName);
        }

        // Calculate the correct octave
        const extensionPitchClass = getPitchClassFromNote(extensionNoteName);
        const rootMidiPitch = octave * 12 + rootPitchClass;

        // Extension should be 'interval' semitones above root
        let extensionOctave = octave;
        let extensionMidiPitch = extensionOctave * 12 + extensionPitchClass;

        // If the extension pitch is below root, move to next octave
        while (extensionMidiPitch < rootMidiPitch) {
            extensionOctave++;
            extensionMidiPitch = extensionOctave * 12 + extensionPitchClass;
        }

        const result = `${extensionNoteName}${extensionOctave}`;
        console.log('[NEW] Final result:', result, '(root:', rootMidiPitch, 'ext:', extensionMidiPitch, 'diff:', extensionMidiPitch - rootMidiPitch, ')');

        return result;
    };

    const handlePlayTriad = async (triad: Triad, index: number, extensionLabel?: string) => {
        console.log('=== handlePlayTriad called ===');
        console.log('Triad:', triad);
        console.log('Extension label:', extensionLabel);

        setPlayingTriad(index);
        try {
            let notesWithOctaves = getTriadNotesWithOctaves(triad);

            // Add extension note if provided
            if (extensionLabel) {
                console.log('About to call getExtensionNote with label:', extensionLabel);
                const extensionNote = getExtensionNote(triad, extensionLabel);
                console.log('getExtensionNote returned:', extensionNote);

                // For b5 or #5, replace the existing fifth (index 2) instead of adding
                if (extensionLabel === 'b5' || extensionLabel === '#5') {
                    notesWithOctaves = [notesWithOctaves[0], notesWithOctaves[1], extensionNote];
                } else {
                    notesWithOctaves = [...notesWithOctaves, extensionNote];
                }
                console.log('Notes with extension:', notesWithOctaves);
            }

            // For arpeggios, sort notes by MIDI pitch to ensure correct ascending order
            if (playbackMode === 'arpeggio') {
                notesWithOctaves = notesWithOctaves.sort((a, b) => {
                    const getMidiPitch = (note: string) => {
                        const match = note.match(/^([A-G][#b]?)(\d+)$/);
                        if (!match) return 0;
                        const [, noteName, octaveStr] = match;
                        const octave = parseInt(octaveStr);
                        const pitchClass = getPitchClassFromNote(noteName);
                        return octave * 12 + pitchClass;
                    };
                    return getMidiPitch(a) - getMidiPitch(b);
                });
            }

            if (playbackMode === 'chord') {
                await audioEngine.playChord(notesWithOctaves);
                setTimeout(() => setPlayingTriad(null), 1000);
            } else {
                await audioEngine.playArpeggio(notesWithOctaves);
                setTimeout(() => setPlayingTriad(null), notesWithOctaves.length * 200 + 100);
            }
        } catch (error) {
            console.error('Failed to play:', error);
            setPlayingTriad(null);
        }
    };

    // Elaborate alt5 extension into separate #5 and b5
    const getElaboratedExtensions = (extensions?: string[], quality?: TriadQuality): string[] => {
        if (!extensions) return [];
        return extensions.flatMap(ext => {
            if (ext === 'alt5') {
                return ['#5', 'b5'];
            }
            return [ext];
        }).filter(ext => {
            // Don't show b5 for diminished triads (they already have b5)
            if (ext === 'b5' && quality === 'diminished') {
                return false;
            }
            return true;
        });
    };

    return (
        <div className="triads-section">
            <div className="triads-header">
                <h3>Triads</h3>
                <div className="playback-mode-selector">
                    <label className="mode-option">
                        <input
                            type="radio"
                            name="playback-mode"
                            value="chord"
                            checked={playbackMode === 'chord'}
                            onChange={() => setPlaybackMode('chord')}
                        />
                        <span>Chord</span>
                    </label>
                    <label className="mode-option">
                        <input
                            type="radio"
                            name="playback-mode"
                            value="arpeggio"
                            checked={playbackMode === 'arpeggio'}
                            onChange={() => setPlaybackMode('arpeggio')}
                        />
                        <span>Arpeggio</span>
                    </label>
                </div>
            </div>

            <div className="triads-grid">
                {triads.map((triad, index) => {
                    const elaboratedExtensions = getElaboratedExtensions(triad.extensions, triad.quality);

                    return (
                        <div
                            key={index}
                            className={`triad-card ${playingTriad === index ? 'playing' : ''}`}
                        >
                            {showRomanNumerals && (
                                <div className="triad-degree">{triad.romanNumeral}</div>
                            )}

                            <button
                                className="triad-root"
                                onClick={() => handlePlayTriad(triad, index)}
                                disabled={playingTriad !== null}
                                aria-label={`Play ${getTriadName(triad.root, triad.quality)}`}
                            >
                                {getTriadAbbreviation(triad.root, triad.quality)}
                            </button>

                            {elaboratedExtensions.length > 0 && (
                                <div className="triad-extensions">
                                    {elaboratedExtensions.map((ext, extIdx) => (
                                        <button
                                            key={extIdx}
                                            className="extension-button"
                                            onClick={() => handlePlayTriad(triad, index, ext)}
                                            disabled={playingTriad !== null}
                                            aria-label={`Play with ${ext}`}
                                        >
                                            {ext}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default TriadsSection;
