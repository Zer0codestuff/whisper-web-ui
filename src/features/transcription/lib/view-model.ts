import type { ModelInstallState, TranscriptResult } from "../../../lib/whispercpp/types";
import type { LanguageCode } from "../config";

export function transcriptFileName(source: File | null): string {
  const base = source?.name.replace(/\.[^/.]+$/, "") ?? "transcript";
  return `${base}.txt`;
}

export function applyLanguageToOutputName(outputName: string, language: LanguageCode): string {
  if (language === "auto") {
    return outputName;
  }

  return `${outputName.replace(/\.txt$/i, "")}.${language}.txt`;
}

export function describeProgress(
  transcript: TranscriptResult | null,
  progressMessage: string | null,
  error: string | null
): string {
  if (error) {
    return error;
  }

  if (progressMessage) {
    return progressMessage;
  }

  if (transcript) {
    return "Transcript ready to export.";
  }

  return "Ready when you are.";
}

export function countTranscriptWords(transcript: TranscriptResult | null): number {
  return transcript?.text.trim().split(/\s+/).filter(Boolean).length ?? 0;
}

export function buildProgressDetails(
  transcript: TranscriptResult | null,
  transcriptWordCount: number
): string {
  if (transcript) {
    return `${transcriptWordCount} words`;
  }

  return "Models stay in this browser.";
}

export function getRunToneClass(params: {
  busy: boolean;
  error: string | null;
  transcript: TranscriptResult | null;
}): string {
  if (params.error) {
    return "run-card-error";
  }

  if (params.transcript) {
    return "run-card-success";
  }

  if (params.busy) {
    return "run-card-active";
  }

  return "";
}

export function canStartTranscription(params: {
  selectedFile: File | null;
  activeModelState?: ModelInstallState;
  busy: boolean;
  autoLanguageWarning: string | null;
  backendWarning: string | null;
}): boolean {
  return Boolean(
    params.selectedFile &&
      params.activeModelState?.installed &&
      !params.busy &&
      !params.autoLanguageWarning &&
      !params.backendWarning
  );
}

export function canInstallModel(params: {
  busy: boolean;
  activeModelState?: ModelInstallState;
  backendWarning: string | null;
}): boolean {
  return Boolean(!params.busy && !params.activeModelState?.installed && !params.backendWarning);
}
