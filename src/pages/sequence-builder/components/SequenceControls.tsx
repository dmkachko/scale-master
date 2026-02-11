/**
 * SequenceControls Component
 * Control buttons for sequence playback and management
 */

import { Trash2 } from 'lucide-react';

interface SequenceControlsProps {
  hasSequence: boolean;
  onPlay: () => void;
  onDeleteLast: () => void;
  onClear: () => void;
}

export default function SequenceControls({
  hasSequence,
  onPlay,
  onDeleteLast,
  onClear,
}: SequenceControlsProps) {
  return (
    <div className="flex gap-2">
      {hasSequence && (
        <>
          <button
            onClick={onPlay}
            className="btn btn-primary btn-sm"
          >
            Play
          </button>
          <button
            onClick={onDeleteLast}
            className="btn btn-secondary btn-sm"
            title="Delete last saved chord"
          >
            <Trash2 size={16} />
          </button>
        </>
      )}
      <button
        onClick={onClear}
        className="btn btn-secondary btn-sm"
      >
        Clear
      </button>
    </div>
  );
}
