import type { ChangeEvent, DragEvent, KeyboardEvent, RefObject } from "react";
import { formatBytes, formatSeconds } from "../../../lib/format";
import { PanelHeader } from "./PanelHeader";

interface UploadPanelProps {
  fileInputRef: RefObject<HTMLInputElement | null>;
  dragging: boolean;
  selectedFile: File | null;
  selectedDuration: number | null;
  busy: boolean;
  onChooseAudio: () => void;
  onClear: () => void;
  onFileInput: (event: ChangeEvent<HTMLInputElement>) => Promise<void>;
  onDropZoneKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
  onDragEnter: () => void;
  onDragLeave: () => void;
  onDragOver: (event: DragEvent<HTMLElement>) => void;
  onDrop: (event: DragEvent<HTMLElement>) => void;
}

export function UploadPanel({
  fileInputRef,
  dragging,
  selectedFile,
  selectedDuration,
  busy,
  onChooseAudio,
  onClear,
  onFileInput,
  onDropZoneKeyDown,
  onDragEnter,
  onDragLeave,
  onDragOver,
  onDrop
}: UploadPanelProps) {
  return (
    <section className="panel panel-upload">
      <PanelHeader step="01" label="Input" title="Audio" />

      <label
        className={`dropzone ${dragging ? "dropzone-active" : ""}`}
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onKeyDown={onDropZoneKeyDown}
        tabIndex={0}
      >
        <input
          ref={fileInputRef}
          className="visually-hidden"
          type="file"
          accept=".wav,.mp3,.m4a,.aac,.ogg,audio/*"
          onChange={(event) => void onFileInput(event)}
        />
        <span className="dropzone-icon" aria-hidden="true">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
            />
          </svg>
        </span>
        <span className="dropzone-eyebrow">Tap to browse or drag audio here</span>
        <strong className="dropzone-title">
          {selectedFile ? "Audio locked in" : "Choose a recording"}
        </strong>
        <p className="dropzone-copy">
          {selectedFile ? "Decoded locally before transcription." : "WAV, MP3, M4A, AAC, OGG."}
        </p>
        <span className="dropzone-file">{selectedFile?.name ?? "No file selected"}</span>
      </label>

      <dl className="detail-list detail-list--compact">
        <div className="detail-item">
          <dt>Size</dt>
          <dd>{selectedFile ? formatBytes(selectedFile.size) : "-"}</dd>
        </div>
        <div className="detail-item">
          <dt>Duration</dt>
          <dd>{formatSeconds(selectedDuration)}</dd>
        </div>
      </dl>

      <div className="button-row">
        <button className="primary-button" type="button" onClick={onChooseAudio}>
          {selectedFile ? "Replace audio" : "Choose audio"}
        </button>
        <button
          className="ghost-button"
          type="button"
          onClick={onClear}
          disabled={!selectedFile || busy}
        >
          Clear
        </button>
      </div>
    </section>
  );
}
