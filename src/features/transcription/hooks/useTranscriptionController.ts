import { useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent, DragEvent, KeyboardEvent } from "react";
import { decodeAndResampleAudio } from "../../../lib/audio";
import { downloadTextFile } from "../../../lib/download-file";
import {
  DEFAULT_WHISPER_CPP_MODEL_ID,
  WHISPER_CPP_MODEL_CATALOG,
  getWhisperCppModelDefinition,
  whisperCppModelDownloadUrl
} from "../../../lib/whispercpp/model-catalog";
import { getWhisperCppBackendWarning } from "../../../lib/whispercpp/runtime-capabilities";
import {
  getAutoLanguageWarning,
  getModelRuntimeWarning,
  getReportedDeviceMemory
} from "../../../lib/whispercpp/runtime-support";
import { getRecommendedWhisperCppThreads } from "../../../lib/whispercpp/thread-selection";
import { WhisperCppWorkerClient } from "../../../lib/whispercpp/worker-client";
import type { WorkerListeners } from "../../../lib/whispercpp/types";
import {
  LANGUAGE_OPTIONS,
  MOBILE_SECTION_ORDER,
  type LanguageCode,
  type MobileSection
} from "../config";
import { initialAppState } from "../state";
import { useInstallPrompt } from "./useInstallPrompt";
import { useNarrowLayout } from "./useNarrowLayout";
import { isSupportedAudioFile } from "../lib/audio-file";
import { getMeta, persistLastSelections } from "../lib/persistence";
import {
  applyLanguageToOutputName,
  buildProgressDetails,
  canInstallModel,
  canStartTranscription,
  countTranscriptWords,
  describeProgress,
  getRunToneClass,
  transcriptFileName
} from "../lib/view-model";

export function useTranscriptionController() {
  const installState = useInstallPrompt();
  const narrow = useNarrowLayout();
  const workerRef = useRef<WhisperCppWorkerClient | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [state, setState] = useState(initialAppState);
  const [dragging, setDragging] = useState(false);
  const [mobileSection, setMobileSection] = useState<MobileSection>("upload");

  const workerListeners = useMemo<WorkerListeners>(
    () => ({
      onReady: (available, capabilities) => {
        setState((current) => ({
          ...current,
          workerReady: true,
          localRuntime: available,
          whisperCapabilities: capabilities ?? current.whisperCapabilities
        }));
      },
      onModelState: (modelState) => {
        setState((current) => {
          const completedModelDownload =
            current.progress?.stage === "download" && !modelState.pending && !modelState.error;

          return {
            ...current,
            busy: completedModelDownload ? false : current.busy,
            progress: completedModelDownload
              ? {
                  stage: "finalize",
                  percent: 100,
                  message: modelState.installed
                    ? "Model ready. You can start transcription."
                    : "Model removed from local cache."
                }
              : current.progress,
            models: {
              ...current.models,
              [modelState.modelId]: modelState
            }
          };
        });
      },
      onProgress: (progress) => {
        setState((current) => ({
          ...current,
          progress,
          busy: progress.stage !== "finalize" || progress.percent < 100,
          error: null
        }));
      },
      onResult: (result) => {
        setState((current) => ({
          ...current,
          transcript: {
            ...result,
            outputName: applyLanguageToOutputName(result.outputName, current.language)
          },
          busy: false,
          error: null,
          progress: {
            stage: "finalize",
            percent: 100,
            message: "Transcript ready."
          }
        }));
      },
      onError: (message) => {
        setState((current) => ({
          ...current,
          busy: false,
          error: message,
          progress: null
        }));
      }
    }),
    []
  );

  function bootWorker(): WhisperCppWorkerClient {
    workerRef.current?.terminate();
    const worker = new WhisperCppWorkerClient(workerListeners);
    workerRef.current = worker;
    worker.post({ type: "init" });
    return worker;
  }

  function resetWorker(): void {
    workerRef.current?.terminate();
    bootWorker();
  }

  useEffect(() => {
    setState((current) => ({
      ...current,
      installState
    }));
  }, [installState]);

  useEffect(() => {
    let active = true;
    void getMeta().then((meta) => {
      if (!active) {
        return;
      }

      const modelId =
        meta.lastModelId &&
        WHISPER_CPP_MODEL_CATALOG.some((model) => model.id === meta.lastModelId)
          ? meta.lastModelId
          : DEFAULT_WHISPER_CPP_MODEL_ID;
      const language: LanguageCode =
        meta.lastLanguage &&
        LANGUAGE_OPTIONS.some((option) => option.value === meta.lastLanguage)
          ? (meta.lastLanguage as LanguageCode)
          : initialAppState.language;

      setState((current) => ({
        ...current,
        modelId,
        language
      }));
    });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const worker = bootWorker();
    return () => {
      worker.terminate();
      workerRef.current = null;
    };
  }, [workerListeners]);

  const mobileStepIndex = Math.max(0, MOBILE_SECTION_ORDER.indexOf(mobileSection));
  const mobileNextSection =
    mobileStepIndex < MOBILE_SECTION_ORDER.length - 1
      ? MOBILE_SECTION_ORDER[mobileStepIndex + 1]!
      : null;

  const selectedModel =
    WHISPER_CPP_MODEL_CATALOG.find((model) => model.id === state.modelId) ??
    WHISPER_CPP_MODEL_CATALOG[0];
  const selectedLanguage =
    LANGUAGE_OPTIONS.find((option) => option.value === state.language) ?? LANGUAGE_OPTIONS[0];
  const activeModelState = state.models[state.modelId];
  const reportedDeviceMemory = useMemo(() => getReportedDeviceMemory(), []);
  const installedModelCount = WHISPER_CPP_MODEL_CATALOG.filter(
    (model) => state.models[model.id]?.installed
  ).length;
  const whisperCppWarning = getWhisperCppBackendWarning(state.whisperCapabilities);
  const selectedModelRuntimeWarning = getModelRuntimeWarning(selectedModel, reportedDeviceMemory);
  const autoLanguageWarning = getAutoLanguageWarning(
    selectedLanguage.value,
    state.selectedDuration
  );
  const transcriptWordCount = countTranscriptWords(state.transcript);
  const canStart = canStartTranscription({
    selectedFile: state.selectedFile,
    activeModelState,
    busy: state.busy,
    autoLanguageWarning,
    backendWarning: whisperCppWarning
  });
  const canInstallSelectedModel = canInstallModel({
    busy: state.busy,
    activeModelState,
    backendWarning: whisperCppWarning
  });
  const progressValue = state.progress?.percent ?? 0;
  const progressDetails = buildProgressDetails(state.transcript, transcriptWordCount);
  const statusSummary = describeProgress(
    state.transcript,
    state.progress?.message ?? null,
    state.error
  );
  const runToneClass = getRunToneClass({
    busy: state.busy,
    error: state.error,
    transcript: state.transcript
  });
  const engineReady = state.workerReady && state.localRuntime;

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const setLanguage = (language: LanguageCode) => {
    setState((current) => ({
      ...current,
      language,
      error: null
    }));
  };

  const setModelId = (modelId: string) => {
    setState((current) => ({
      ...current,
      modelId
    }));
  };

  const setSelectedFile = async (file: File) => {
    if (!isSupportedAudioFile(file)) {
      setState((current) => ({
        ...current,
        error: "Unsupported file format. Use .wav, .mp3, .m4a, .aac, or .ogg."
      }));
      return;
    }

    setState((current) => ({
      ...current,
      selectedFile: file,
      selectedDuration: null,
      transcript: null,
      error: null
    }));

    try {
      const decoded = await decodeAndResampleAudio(file);
      setState((current) => ({
        ...current,
        selectedDuration: decoded.durationSeconds
      }));
    } catch (error) {
      setState((current) => ({
        ...current,
        error:
          error instanceof Error
            ? error.message
            : "This browser could not decode the selected audio file."
      }));
    }
  };

  const clearSelectedFile = () => {
    setState((current) => ({
      ...current,
      selectedFile: null,
      selectedDuration: null,
      transcript: null,
      error: null
    }));
  };

  const handleFileInput = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await setSelectedFile(file);
    }
    event.target.value = "";
  };

  const handleDropZoneKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openFilePicker();
    }
  };

  const handleDragEnter = () => {
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleDragOver = (event: DragEvent<HTMLElement>) => {
    event.preventDefault();
    setDragging(true);
  };

  const handleDrop = (event: DragEvent<HTMLElement>) => {
    event.preventDefault();
    setDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) {
      void setSelectedFile(file);
    }
  };

  const ensureModel = (modelId: string) => {
    const model = getWhisperCppModelDefinition(modelId);
    setState((current) => ({
      ...current,
      modelId,
      error: null,
      progress: {
        stage: "download",
        percent: 0,
        message: "Preparing model download..."
      }
    }));

    workerRef.current?.post({
      type: "ensureModel",
      modelId: model.id,
      downloadUrl: whisperCppModelDownloadUrl(model),
      sizeBytes: model.sizeBytes
    });
  };

  const startTranscription = async () => {
    if (autoLanguageWarning) {
      setState((current) => ({
        ...current,
        error: autoLanguageWarning
      }));
      return;
    }

    if (!state.selectedFile) {
      setState((current) => ({
        ...current,
        error: "Pick an audio file first."
      }));
      return;
    }

    if (!activeModelState?.installed) {
      setState((current) => ({
        ...current,
        error: "Install the selected model before starting transcription."
      }));
      return;
    }

    setState((current) => ({
      ...current,
      busy: true,
      transcript: null,
      error: null,
      progress: {
        stage: "decode",
        percent: 0,
        message: "Preparing audio..."
      }
    }));

    try {
      const decoded = await decodeAndResampleAudio(state.selectedFile, (percent, message) => {
        setState((current) => ({
          ...current,
          progress: {
            stage: "decode",
            percent,
            message
          }
        }));
      });

      await persistLastSelections(state.modelId, state.language);

      workerRef.current?.post(
        {
          type: "transcribe",
          request: {
            language: selectedLanguage.value,
            modelId: state.modelId,
            threads: getRecommendedWhisperCppThreads(
              typeof navigator !== "undefined" ? navigator.hardwareConcurrency : undefined
            )
          },
          audio: decoded,
          outputName: transcriptFileName(state.selectedFile)
        },
        [decoded.samples.buffer as ArrayBuffer]
      );
    } catch (error) {
      setState((current) => ({
        ...current,
        busy: false,
        error:
          error instanceof Error
            ? error.message
            : "This file could not be prepared for transcription.",
        progress: null
      }));
    }
  };

  const cancelRun = () => {
    resetWorker();
    setState((current) => ({
      ...current,
      busy: false,
      workerReady: false,
      localRuntime: false,
      progress: null,
      error: "Transcription cancelled."
    }));
  };

  const removeModel = (modelId: string) => {
    workerRef.current?.post({ type: "deleteModel", modelId });
  };

  const copyTranscript = async () => {
    if (!state.transcript) {
      return;
    }

    try {
      await navigator.clipboard.writeText(state.transcript.text);
    } catch {
      setState((current) => ({
        ...current,
        error: "Clipboard access was blocked by this browser."
      }));
    }
  };

  const downloadTranscript = () => {
    if (!state.transcript) {
      return;
    }

    downloadTextFile(state.transcript.outputName, state.transcript.text);
  };

  const promptInstallApp = async () => {
    await state.installState.prompt?.();
  };

  return {
    state,
    dragging,
    narrow,
    mobileSection,
    mobileStepIndex,
    mobileNextSection,
    selectedModel,
    selectedLanguage,
    activeModelState,
    installedModelCount,
    modelCatalog: WHISPER_CPP_MODEL_CATALOG,
    reportedDeviceMemory,
    whisperCppWarning,
    selectedModelRuntimeWarning,
    autoLanguageWarning,
    transcriptWordCount,
    canStart,
    canInstallSelectedModel,
    progressValue,
    progressDetails,
    statusSummary,
    runToneClass,
    engineReady,
    fileInputRef,
    setMobileSection,
    setLanguage,
    setModelId,
    openFilePicker,
    handleFileInput,
    handleDropZoneKeyDown,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,
    clearSelectedFile,
    ensureModel,
    startTranscription,
    cancelRun,
    removeModel,
    copyTranscript,
    downloadTranscript,
    promptInstallApp
  };
}
