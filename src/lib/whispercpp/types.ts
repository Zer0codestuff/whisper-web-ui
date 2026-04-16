import type { LanguageCode } from "../../features/transcription/config";

export interface WhisperCppRuntimeCapabilities {
  crossOriginIsolated: boolean;
  simd: boolean;
  pthreads: boolean;
}

export interface WhisperCppModelDefinition {
  id: string;
  label: string;
  engineModelId: string;
  sizeBytes: number;
  recommendedFor: string;
  minimumDeviceMemoryGb?: number;
}

export interface DecodedAudioPayload {
  sampleRate: number;
  samples: Float32Array;
  durationSeconds: number;
}

export type ProgressStage =
  | "bootstrap"
  | "download"
  | "decode"
  | "prepare"
  | "transcribe"
  | "finalize";

export interface TranscriptionProgress {
  stage: ProgressStage;
  percent: number;
  message: string;
}

export interface ModelInstallState {
  modelId: string;
  installed: boolean;
  pending: boolean;
  sizeBytes: number;
  error?: string;
}

export interface TranscriptResult {
  text: string;
  durationSeconds: number;
  outputName: string;
}

export interface TranscriptionRequest {
  language: LanguageCode;
  modelId: string;
  threads?: number;
}

export type WorkerRequestMessage =
  | { type: "init" }
  | { type: "ensureModel"; modelId: string; downloadUrl?: string; sizeBytes?: number }
  | { type: "deleteModel"; modelId: string }
  | {
      type: "transcribe";
      request: TranscriptionRequest;
      audio: DecodedAudioPayload;
      outputName: string;
    };

export type WorkerEventMessage =
  | {
      type: "ready";
      available: boolean;
      capabilities?: WhisperCppRuntimeCapabilities;
    }
  | { type: "modelState"; state: ModelInstallState }
  | { type: "progress"; progress: TranscriptionProgress }
  | { type: "result"; result: TranscriptResult }
  | { type: "error"; message: string };

export interface WorkerListeners {
  onReady?: (available: boolean, capabilities?: WhisperCppRuntimeCapabilities) => void;
  onModelState?: (state: ModelInstallState) => void;
  onProgress?: (progress: TranscriptionProgress) => void;
  onResult?: (result: TranscriptResult) => void;
  onError?: (message: string) => void;
}
