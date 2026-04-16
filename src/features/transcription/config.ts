export const SUPPORTED_AUDIO_TYPES = new Set([
  ".wav",
  ".mp3",
  ".m4a",
  ".aac",
  ".ogg"
]);

export const LANGUAGE_OPTIONS = [
  { label: "Auto detect (short clips)", value: "auto" },
  { label: "Italian", value: "it" },
  { label: "English", value: "en" },
  { label: "French", value: "fr" },
  { label: "German", value: "de" },
  { label: "Spanish", value: "es" },
  { label: "Portuguese", value: "pt" }
] as const;

export type LanguageCode = (typeof LANGUAGE_OPTIONS)[number]["value"];

export const DEFAULT_LANGUAGE: LanguageCode = LANGUAGE_OPTIONS[0].value;
export const AUTO_LANGUAGE_MAX_RELIABLE_SECONDS = 120;

export type MobileSection = "upload" | "model" | "run" | "output";

export const MOBILE_SECTION_ORDER: MobileSection[] = ["upload", "model", "run", "output"];

export const MOBILE_SECTION_LABELS: Record<MobileSection, string> = {
  upload: "Audio",
  model: "Modello",
  run: "Esecuzione",
  output: "Trascrizione"
};

export const MOBILE_FLOW_HINTS: Record<MobileSection, string> = {
  upload:
    "Carica un file, poi passa a Modello per scegliere la lingua e installare il modello (se serve).",
  model:
    "Qui installi o cambi modello. Quando e` pronto, vai a Esecuzione per avviare la trascrizione.",
  run: "Avvia la trascrizione qui. A fine lavoro apri Trascrizione per leggere ed esportare il testo.",
  output: "Qui compare il testo quando la trascrizione e` finita. Puoi tornare indietro con il menu Vista."
};
