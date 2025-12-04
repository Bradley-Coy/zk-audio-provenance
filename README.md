# Audio Provenance Demo

This is a frontend prototype for an audio provenance system. Users can upload audio files, analyze them offline, and generate a SHA-256 fingerprint. Live playback with FFT visualization is also supported.

## Features

### Offline Analysis (no playback required)
- Upload an audio file (MP3, WAV, etc.)
- Generate a static waveform visualization
- Generate a static FFT spectrum from audio samples
- Compute a SHA-256 fingerprint of the audio

### Live Playback Visualization
- Play the audio using the built-in audio player
- Live FFT visualization synced with playback timeline
- Decoupled from offline analysis for deterministic fingerprinting

### Technical Notes
- Uses Web Audio API for decoding and playback
- Offline FFT computed from first 2048 samples (static visualization)
- Live FFT uses `AnalyserNode` during playback
- SHA-256 fingerprint generated from downsampled audio data
- Modular design separates analysis from playback

## How to Run

1. Open `index.html` in Chrome or Firefox
2. Select an audio file
3. Click **Analyze** to see static waveform, FFT, and fingerprint
4. Use the audio player to play the file and view live FFT visualization

## Future Work
- Improve waveform and FFT visuals
- Backend storage and verification of fingerprints
- Zero-knowledge proof integration for AI model provenance

## Changelog / Stage 1

**Stage 1: Frontend Audio Provenance Prototype**

- File upload and offline analysis (no playback required)
  - Static waveform visualization of uploaded audio
  - Static FFT spectrum computed from audio samples
  - Deterministic SHA-256 fingerprint from downsampled audio data
- Live playback visualization
  - Plays audio in the browser with built-in player
  - Live FFT spectrum visualization synchronized with playback
- UI improvements
  - Separate canvases for static vs live visualization
  - Clear separation of analysis and playback workflows
- Event handler refactoring for clarity and maintainability
- Fully functional frontend prototype, ready for future backend and ZK integration
