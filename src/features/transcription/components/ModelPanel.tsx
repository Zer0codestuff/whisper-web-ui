import { formatBytes } from "../../../lib/format";
import { getModelRuntimeWarning } from "../../../lib/whispercpp/runtime-support";
import type { ModelInstallState, WhisperCppModelDefinition } from "../../../lib/whispercpp/types";
import { LANGUAGE_OPTIONS, type LanguageCode } from "../config";
import { PanelHeader } from "./PanelHeader";

interface ModelPanelProps {
  modelCatalog: WhisperCppModelDefinition[];
  selectedModelId: string;
  selectedLanguage: LanguageCode;
  activeModelState?: ModelInstallState;
  busy: boolean;
  reportedDeviceMemory: number | null;
  whisperCppWarning: string | null;
  autoLanguageWarning: string | null;
  selectedModelRuntimeWarning: string | null;
  onSelectLanguage: (language: LanguageCode) => void;
  onSelectModel: (modelId: string) => void;
  onEnsureModel: (modelId: string) => void;
  onRemoveModel: (modelId: string) => void;
  modelStates: Record<string, ModelInstallState>;
}

export function ModelPanel({
  modelCatalog,
  selectedModelId,
  selectedLanguage,
  activeModelState,
  busy,
  reportedDeviceMemory,
  whisperCppWarning,
  autoLanguageWarning,
  selectedModelRuntimeWarning,
  onSelectLanguage,
  onSelectModel,
  onEnsureModel,
  onRemoveModel,
  modelStates
}: ModelPanelProps) {
  const selectedModel =
    modelCatalog.find((model) => model.id === selectedModelId) ?? modelCatalog[0];

  return (
    <section className="panel panel-controls">
      <PanelHeader step="02" label="Model" title="Model & language" />

      <div className="control-grid">
        <label className="control-field" htmlFor="language">
          <span>Language</span>
          <select
            id="language"
            value={selectedLanguage}
            onChange={(event) => onSelectLanguage(event.target.value as LanguageCode)}
          >
            {LANGUAGE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {autoLanguageWarning ? <p className="inline-error">{autoLanguageWarning}</p> : null}
        </label>

        {whisperCppWarning ? (
          <p className="inline-error control-grid-full">{whisperCppWarning}</p>
        ) : null}

        <label className="control-field" htmlFor="model">
          <span>Selected model</span>
          <select
            id="model"
            value={selectedModelId}
            onChange={(event) => onSelectModel(event.target.value)}
          >
            {modelCatalog.map((model) => (
              <option key={model.id} value={model.id}>
                {model.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <p className="control-hint">
        Current: <strong>{selectedModel.label}</strong>
        {activeModelState?.installed
          ? " - installed"
          : activeModelState?.pending
            ? " - downloading"
            : " - not installed"}
        {selectedModelRuntimeWarning ? (
          <span className="inline-error"> {selectedModelRuntimeWarning}</span>
        ) : null}
      </p>

      <div className="model-list" role="list" aria-label="Available transcription models">
        {modelCatalog.map((model) => {
          const install = modelStates[model.id];
          const installed = Boolean(install?.installed);
          const pending = Boolean(install?.pending);
          const selected = selectedModelId === model.id;
          const runtimeWarning = getModelRuntimeWarning(model, reportedDeviceMemory);

          return (
            <article
              key={model.id}
              className={`model-row model-row--compact ${selected ? "model-row-selected" : ""}`}
              role="listitem"
              title={model.recommendedFor}
            >
              <div className="model-row-copy">
                <div className="model-row-title">
                  <h3>{model.label}</h3>
                  <span className="mono-pill mono-pill-neutral">{formatBytes(model.sizeBytes)}</span>
                </div>
                {runtimeWarning ? <p className="inline-error">{runtimeWarning}</p> : null}
                {install?.error ? <p className="inline-error">{install.error}</p> : null}
              </div>

              <div className="model-row-actions">
                <button
                  className={selected ? "secondary-button" : "ghost-button"}
                  type="button"
                  onClick={() => onSelectModel(model.id)}
                >
                  {selected ? "Selected" : "Use model"}
                </button>

                {installed ? (
                  <button
                    className="danger-button"
                    type="button"
                    onClick={() => onRemoveModel(model.id)}
                    disabled={busy}
                  >
                    Remove
                  </button>
                ) : (
                  <button
                    className="ghost-button"
                    type="button"
                    onClick={() => onEnsureModel(model.id)}
                    disabled={busy || pending}
                  >
                    {pending ? "Downloading..." : "Download"}
                  </button>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
