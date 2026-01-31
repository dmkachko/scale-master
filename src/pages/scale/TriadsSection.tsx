/**
 * Triads Section Component
 * Displays all triads built on each scale degree with playback controls
 */

import {useState} from 'react';
import {audioEngine} from '../../services/audioEngine.ts';
import {calculateTriads, getTriadName, getTriadAbbreviation, type Triad} from '../../music/triads.ts';
import './TriadsSection.css';

interface TriadsSectionProps {
    scaleNotes: string[];
    scaleIntervals: number[];
}

function TriadsSection({scaleNotes, scaleIntervals}: TriadsSectionProps) {
    const [playingTriad, setPlayingTriad] = useState<number | null>(null);
    const triads = calculateTriads(scaleNotes, scaleIntervals);

    const handlePlayChord = async (triad: Triad, index: number) => {
        setPlayingTriad(index);
        try {
            await audioEngine.playChord(triad.notes);
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
            await audioEngine.playArpeggio(triad.notes);
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
                            <div className="triad-degree">{triad.romanNumeral}</div>
                            <div className="triad-name">
                                <div className="triad-abbreviation">
                                    {getTriadAbbreviation(triad.root, triad.quality)}
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
