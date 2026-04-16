import type { WhisperCppRuntimeCapabilities } from "./types";

export function getWhisperCppBackendWarning(
  caps: WhisperCppRuntimeCapabilities | null
): string | null {
  if (!caps) {
    return null;
  }

  if (!caps.crossOriginIsolated) {
    return "whisper.cpp in this browser is not running in a cross-origin isolated context. Pthreads and SIMD may be disabled and transcription can fail. Use Chrome/Edge over HTTPS (or local dev with COOP/COEP headers).";
  }

  if (!caps.pthreads) {
    return "SharedArrayBuffer is unavailable, so whisper.cpp cannot use pthread workers. Try a recent Chromium browser with cross-origin isolation enabled.";
  }

  if (!caps.simd) {
    return "WebAssembly SIMD is not available. The whisper.cpp build used here expects SIMD support.";
  }

  return null;
}
