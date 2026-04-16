# WhisperDrop PWA

WhisperDrop is a local-first Progressive Web App for browser transcription with `whisper.cpp`.

## Features

- React + Vite + TypeScript frontend
- Installable PWA shell
- Drag and drop or file picker audio upload
- Browser-side decode and resample to 16 kHz mono
- `whisper.cpp` running in a dedicated Web Worker
- Local model download, install, remove, and reuse
- Transcript preview, copy, and `.txt` export

## Runtime

The app serves the official `whisper.cpp` browser artifacts from `public/whispercpp/`. Models are cached locally in IndexedDB inside the worker, so after installation the transcription flow stays on-device.

Audio is prepared on the main thread and then transferred to the worker to avoid unnecessary copies before inference.

## Development

```bash
npm install
npm run dev
```

Available scripts:

```bash
npm test
npm run build
npm run preview
```

The dev server uses port `24680` with `strictPort: true`. Preview uses port `27272`.
