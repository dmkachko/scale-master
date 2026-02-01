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

function TriadsSection({scaleNotes, scaleIntervals, scaleFamily}: TriadsSectionProps) {
    const [playingTriad, setPlayingTriad] = useState<number | null>(null);
    const triads = calculateTriads(scaleNotes, scaleIntervals);

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

    const handlePlayChord = async (triad: Triad, index: number) => {
        setPlayingTriad(index);
        try {
            const notesWithOctaves = getTriadNotesWithOctaves(triad);
            await audioEngine.playChord(notesWithOctaves);
            // Clear the playing state after the chord finishes
            setTimeout(() => setPlayingTriad(null), 1000);
        } catch (error) {
            console.error('Failed to play chord:', error);
            setPlayingTriad(null);
        }
    };

    const handlePlayArpeggio = async (triad: Triad, index: number) => {
        setPlayingTriad(index);
        try {
            const notesWithOctaves = getTriadNotesWithOctaves(triad);
            await audioEngine.playArpeggio(notesWithOctaves);
            // Clear the playing state after the arpeggio finishes (3 notes * 200ms)
            setTimeout(() => setPlayingTriad(null), 700);
        } catch (error) {
            console.error('Failed to play arpeggio:', error);
            setPlayingTriad(null);
        }
    };

    return (
        <div className="triads-section">
            <h3>Triads</h3>
            <p className="triads-description">
                Triads built on each scale degree
            </p>

            <div>
                {triads.map((triad, index) => (
                    <div
                        key={index}
                        className={`triad-card ${playingTriad === index ? 'playing' : ''}`}
                    >
                        <div className="triad-header">
                            {showRomanNumerals && (
                                <div className="triad-degree">{triad.romanNumeral}</div>
                            )}
                            <div className="triad-name">
                                <div className="triad-abbreviation">
                                    {getTriadAbbreviation(triad.root, triad.quality)}
                                    {triad.extensions && triad.extensions.length > 0 && (
                                        <span className="triad-extensions"> ({triad.extensions.join(', ')})</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="triad-controls">
                        <button
                            onClick={() => handlePlayChord(triad, index)}
                            className="triad-button"
                            disabled={playingTriad !== null}
                            aria-label={`Play ${getTriadName(triad.root, triad.quality)} chord`}
                        >
                            <span className="button-icon">♫</span>
                            Chord
                        </button>
                        <button
                            onClick={() => handlePlayArpeggio(triad, index)}
                            className="triad-button"
                            disabled={playingTriad !== null}
                            aria-label={`Play ${getTriadName(triad.root, triad.quality)} arpeggio`}
                        >
                            <span className="button-icon">♪</span>
                            Arpeggio
                        </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default TriadsSection;
