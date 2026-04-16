import { formatSeconds } from "../../../lib/format";
import type { TranscriptResult } from "../../../lib/whispercpp/types";
import { PanelHeader } from "./PanelHeader";

interface TranscriptPanelProps {
  transcript: TranscriptResult | null;
  transcriptWordCount: number;
  onDownload: () => void;
  onCopy: () => Promise<void>;
}

export function TranscriptPanel({
  transcript,
  transcriptWordCount,
  onDownload,
  onCopy
}: TranscriptPanelProps) {
  return (
    <section className="panel panel-output">
      <PanelHeader step="04" label="Output" title="Transcript" />

      <div className="output-toolbar">
        <span className="mono-pill mono-pill-neutral">
          {transcript ? formatSeconds(transcript.durationSeconds) : "-"}
        </span>
        <span className="mono-pill mono-pill-neutral">{transcriptWordCount} words</span>
      </div>

      <textarea
        className="transcript-box"
        readOnly
        value={transcript?.text ?? ""}
        placeholder="The transcript will appear here when the local run finishes."
      />

      <div className="button-row">
        <button className="primary-button" type="button" disabled={!transcript} onClick={onDownload}>
          Download .txt
        </button>
        <button
          className="ghost-button"
          type="button"
          disabled={!transcript}
          onClick={() => void onCopy()}
        >
          Copy text
        </button>
      </div>
    </section>
  );
}
