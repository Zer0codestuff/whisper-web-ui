import { humanProgress } from "../../../lib/format";
import { PanelHeader } from "./PanelHeader";

interface RunPanelProps {
  progressValue: number;
  progressStage?: string;
  statusSummary: string;
  progressDetails: string;
  runToneClass: string;
  error: string | null;
  canStart: boolean;
  canInstallSelectedModel: boolean;
  busy: boolean;
  selectedModelId: string;
  onStart: () => Promise<void>;
  onInstallSelectedModel: (modelId: string) => void;
  onCancel: () => void;
}

export function RunPanel({
  progressValue,
  progressStage,
  statusSummary,
  progressDetails,
  runToneClass,
  error,
  canStart,
  canInstallSelectedModel,
  busy,
  selectedModelId,
  onStart,
  onInstallSelectedModel,
  onCancel
}: RunPanelProps) {
  return (
    <section className="panel panel-run" aria-live="polite">
      <PanelHeader step="03" label="Run" title="Progress" />

      <article className={`run-card ${runToneClass}`}>
        <div className="run-card-top">
          <strong>{statusSummary}</strong>
          <span className="run-percent">{progressStage ? humanProgress(progressValue) : "Idle"}</span>
        </div>
        <div
          className={`progress-track${progressStage === "transcribe" ? " progress-track--busy" : ""}`}
          aria-hidden="true"
        >
          <div className="progress-fill" style={{ width: `${progressValue}%` }} />
        </div>
        <p className="run-copy">{progressDetails}</p>
      </article>

      {error ? (
        <div className="error-box" role="alert">
          <strong>Attention required</strong>
          <p>{error}</p>
        </div>
      ) : null}

      <div className="button-row">
        <button className="primary-button" type="button" onClick={() => void onStart()} disabled={!canStart}>
          Start transcription
        </button>
        <button
          className="ghost-button"
          type="button"
          onClick={() => onInstallSelectedModel(selectedModelId)}
          disabled={!canInstallSelectedModel}
        >
          Install selected model
        </button>
        {busy ? (
          <button className="danger-button" type="button" onClick={onCancel}>
            Cancel
          </button>
        ) : null}
      </div>
    </section>
  );
}
