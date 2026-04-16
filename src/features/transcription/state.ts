import { DEFAULT_LANGUAGE } from "./config";
import { DEFAULT_WHISPER_CPP_MODEL_ID } from "../../lib/whispercpp/model-catalog";
import type { AppState } from "./types";

export const initialAppState: AppState = {
  whisperCapabilities: null,
  modelId: DEFAULT_WHISPER_CPP_MODEL_ID,
  language: DEFAULT_LANGUAGE,
  installState: {
    canInstall: false,
    prompt: null
  },
  selectedFile: null,
  selectedDuration: null,
  transcript: null,
  progress: null,
  busy: false,
  error: null,
  workerReady: false,
  localRuntime: false,
  models: {}
};
