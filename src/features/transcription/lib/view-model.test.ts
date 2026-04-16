import { describe, expect, it } from "vitest";
import {
  applyLanguageToOutputName,
  canInstallModel,
  canStartTranscription,
  countTranscriptWords,
  describeProgress,
  transcriptFileName
} from "./view-model";

describe("transcript file naming", () => {
  it("keeps the base filename and appends txt", () => {
    const file = new File([""], "meeting.m4a");
    expect(transcriptFileName(file)).toBe("meeting.txt");
  });

  it("adds the selected language suffix to the output name", () => {
    expect(applyLanguageToOutputName("meeting.txt", "it")).toBe("meeting.it.txt");
    expect(applyLanguageToOutputName("meeting.txt", "auto")).toBe("meeting.txt");
  });
});

describe("transcription view rules", () => {
  it("allows transcription only when the file and model are ready", () => {
    const file = new File([""], "voice.wav");

    expect(
      canStartTranscription({
        selectedFile: file,
        activeModelState: {
          modelId: "wc-tiny-q5",
          installed: true,
          pending: false,
          sizeBytes: 123
        },
        busy: false,
        autoLanguageWarning: null,
        backendWarning: null
      })
    ).toBe(true);
  });

  it("blocks install when the selected model is already installed", () => {
    expect(
      canInstallModel({
        busy: false,
        activeModelState: {
          modelId: "wc-tiny-q5",
          installed: true,
          pending: false,
          sizeBytes: 123
        },
        backendWarning: null
      })
    ).toBe(false);
  });
});

describe("transcript presentation", () => {
  it("counts transcript words from the current result", () => {
    expect(
      countTranscriptWords({
        text: "one two three",
        durationSeconds: 3,
        outputName: "transcript.txt"
      })
    ).toBe(3);
  });

  it("prefers errors over progress messages in the status summary", () => {
    expect(describeProgress(null, "Preparing audio...", "Model missing")).toBe("Model missing");
  });
});
