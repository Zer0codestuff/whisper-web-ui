import { describe, expect, it } from "vitest";
import { fileExtension, isSupportedAudioFile } from "./audio-file";

describe("audio file helpers", () => {
  it("normalizes the file extension to lower case", () => {
    expect(fileExtension("VOICE.MP3")).toBe(".mp3");
  });

  it("accepts supported audio uploads", () => {
    const file = new File(["data"], "voice.m4a", { type: "audio/mp4" });
    expect(isSupportedAudioFile(file)).toBe(true);
  });
});
