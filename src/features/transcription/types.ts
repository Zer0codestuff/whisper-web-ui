import type {
  ModelInstallState,
  TranscriptResult,
  TranscriptionProgress,
  WhisperCppRuntimeCapabilities
} from "../../lib/whispercpp/types";
import type { LanguageCode } from "./config";

export interface InstallPromptState {
  canInstall: boolean;
  prompt: (() => Promise<void>) | null;
}

export interface AppState {
  whisperCapabilities: WhisperCppRuntimeCapabilities | null;
  modelId: string;
  language: LanguageCode;
  installState: InstallPromptState;
  selectedFile: File | null;
  selectedDuration: number | null;
  transcript: TranscriptResult | null;
  progress: TranscriptionProgress | null;
  busy: boolean;
  error: string | null;
  workerReady: boolean;
  localRuntime: boolean;
  models: Record<string, ModelInstallState>;
}
