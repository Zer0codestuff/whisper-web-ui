import { AppHeader } from "./components/AppHeader";
import { MobileSectionNav } from "./components/MobileSectionNav";
import { ModelPanel } from "./components/ModelPanel";
import { RunPanel } from "./components/RunPanel";
import { TranscriptPanel } from "./components/TranscriptPanel";
import { UploadPanel } from "./components/UploadPanel";
import { useTranscriptionController } from "./hooks/useTranscriptionController";

export function TranscriptionApp() {
  const controller = useTranscriptionController();

  return (
    <div className={`app-shell${controller.narrow ? " app-shell--narrow" : ""}`}>
      <main className="app-frame">
        <AppHeader
          narrow={controller.narrow}
          workerReady={controller.state.workerReady}
          localRuntime={controller.state.localRuntime}
          engineReady={controller.engineReady}
          installedModelCount={controller.installedModelCount}
          totalModelCount={controller.modelCatalog.length}
          canInstallApp={controller.state.installState.canInstall}
          onInstallApp={controller.promptInstallApp}
        />

        {controller.narrow ? (
          <MobileSectionNav
            mobileSection={controller.mobileSection}
            mobileStepIndex={controller.mobileStepIndex}
            mobileNextSection={controller.mobileNextSection}
            onSelectSection={controller.setMobileSection}
          />
        ) : null}

        <section
          className={controller.narrow ? "workspace-single" : "workspace-grid"}
          aria-label={controller.narrow ? "Active workspace section" : "Workspace"}
        >
          {!controller.narrow || controller.mobileSection === "upload" ? (
            <UploadPanel
              fileInputRef={controller.fileInputRef}
              dragging={controller.dragging}
              selectedFile={controller.state.selectedFile}
              selectedDuration={controller.state.selectedDuration}
              busy={controller.state.busy}
              onChooseAudio={controller.openFilePicker}
              onClear={controller.clearSelectedFile}
              onFileInput={controller.handleFileInput}
              onDropZoneKeyDown={controller.handleDropZoneKeyDown}
              onDragEnter={controller.handleDragEnter}
              onDragLeave={controller.handleDragLeave}
              onDragOver={controller.handleDragOver}
              onDrop={controller.handleDrop}
            />
          ) : null}

          {!controller.narrow || controller.mobileSection === "model" ? (
            <ModelPanel
              modelCatalog={controller.modelCatalog}
              selectedModelId={controller.state.modelId}
              selectedLanguage={controller.state.language}
              activeModelState={controller.activeModelState}
              busy={controller.state.busy}
              reportedDeviceMemory={controller.reportedDeviceMemory}
              whisperCppWarning={controller.whisperCppWarning}
              autoLanguageWarning={controller.autoLanguageWarning}
              selectedModelRuntimeWarning={controller.selectedModelRuntimeWarning}
              onSelectLanguage={controller.setLanguage}
              onSelectModel={controller.setModelId}
              onEnsureModel={controller.ensureModel}
              onRemoveModel={controller.removeModel}
              modelStates={controller.state.models}
            />
          ) : null}

          {!controller.narrow || controller.mobileSection === "run" ? (
            <RunPanel
              progressValue={controller.progressValue}
              progressStage={controller.state.progress?.stage}
              statusSummary={controller.statusSummary}
              progressDetails={controller.progressDetails}
              runToneClass={controller.runToneClass}
              error={controller.state.error}
              canStart={controller.canStart}
              canInstallSelectedModel={controller.canInstallSelectedModel}
              busy={controller.state.busy}
              selectedModelId={controller.state.modelId}
              onStart={controller.startTranscription}
              onInstallSelectedModel={controller.ensureModel}
              onCancel={controller.cancelRun}
            />
          ) : null}

          {!controller.narrow || controller.mobileSection === "output" ? (
            <TranscriptPanel
              transcript={controller.state.transcript}
              transcriptWordCount={controller.transcriptWordCount}
              onDownload={controller.downloadTranscript}
              onCopy={controller.copyTranscript}
            />
          ) : null}
        </section>
      </main>
    </div>
  );
}
