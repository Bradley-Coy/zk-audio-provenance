# Audio Fingerprinting Basics

This project provides a minimal, browser-based environment for learning how to extract audio features, compute FFTs, and generate spectral fingerprints suitable for later use in zero-knowledge (ZK) verification systems.

It implements the first stage of an audio provenance pipeline:
convert an audio file into a deterministic, feature-based hash.

This repository is part of a broader exploration of zkML and audio proof systems.

---

## Features

- Upload audio files (MP3/WAV)
- Decode audio using the Web Audio API
- Render a waveform visualization
- Compute a Fast Fourier Transform (FFT)
- Display the frequency spectrum
- Extract a simple 64-bin spectral fingerprint
- Hash the fingerprint using SHA-256

All functionality is implemented in plain JavaScript with no external libraries.

---

## Rationale

Modern audio verification and ZK systems require a stable fingerprint before any proving or circuit work can begin.  
This project aims to clearly illustrate the early-stage processing steps:
1. Access and decode raw audio data
2. Transform time-domain data into the frequency domain
3. Extract simple, meaningful features
4. Produce a consistent hash of the extracted features

---

## Project Structure

index.html       - UI and canvas elements  
audio.js         - audio decoding, waveform, FFT, fingerprinting, hashing  
style.css        - (optional) styling  

---

## How to Run

Open `index.html` directly in a browser.
No dependencies or build steps are required.

---

## Learning Objectives

- Understand how raw audio buffers work in web environments
- Learn how FFT algorithms map audio to the frequency domain
- Explore basic DSP operations and feature extraction
- Produce deterministic feature hashes suitable for later circuit design

---

## Future Work

This repository is the foundation for deeper work in DSP and ZK:
- More robust audio feature extraction (MFCCs, spectral entropy)
- Better normalization techniques
- Fingerprint comparison metrics
- Circuit constraints to verify feature-vector properties
- ZK proofs for model-generated audio fingerprints

---

## License

MIT License
