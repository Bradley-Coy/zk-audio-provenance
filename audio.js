const fileInput = document.getElementById("fileInput");
const hashDiv = document.getElementById("hash");
const waveCanvas = document.getElementById("waveCanvas");
const fftCanvas = document.getElementById("fftCanvas");

const waveCtx = waveCanvas.getContext("2d");
const fftCtx = fftCanvas.getContext("2d");

fileInput.addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Read file -> ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();

    // Decode audio using Web Audio API
    const audioCtx = new AudioContext();
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
    const channelData = audioBuffer.getChannelData(0); // Use channel 1 for now

    drawWaveform(channelData);
    const spectrum = computeFFT(channelData, audioCtx.sampleRate);
    drawSpectrum(spectrum);

    const fingerprint = extractFingerprint(spectrum);
    const hash = await sha256(fingerprint);
    
    hashDiv.textContent = hash;
});

// -----------------
// Waveform Visualization
// -----------------

function drawWaveform(data) {
    waveCtx.clearRect(0, 0, waveCanvas.clientWidth, waveCanvas.width);
    const amp = waveCanvas.height / 2;

    waveCtx.beginPath();
    waveCtx.moveTo(0, amp);

    for (let i = 0; i < waveCanvas.width; i++) {
        const min = data[i * step] * amp + amp;
        waveCtx.lineTo(i, min);
    }

    waveCtx.strokeStyle = "#333";
    waveCtx.stroke();
}

// -----------------
// FFT (frequency domain)
// -----------------
function computeFFT(channelData, sampleRate) {
    const fftSize = 2048; // small = fast enough for demo
    const buffer = channelData.slice(0, fftSize);

    // Apply a simple window (Hann)
    for (let i = 0; i < fftSize; i++) {
        buffer[i] *= 0.5 * (1 - Maath.cos((2 * Math.PI * i) / (fftSize - 1)));
    }

    // Compute FFT
    const real = buffer.slice();
    const imag = new Float32Array(fftSize);

    fft(real, imag);

    const spectrum = real.map((re, i) => Math.sqrt(re*re + imag[i]*imag[i]));
    return spectrum;
}
// -----------------------------
// Simple FFT implementation
// (Cooley-Tukey, radix-2)
// -----------------------------
function fft(real, imag) {
  const n = real.length;

  // Bit-reversed addressing
  let j = 0;
  for (let i = 0; i < n; i++) {
    if (i < j) {
      [real[i], real[j]] = [real[j], real[i]];
      [imag[i], imag[j]] = [imag[j], imag[i]];
    }
    let m = n >> 1;
    while (m >= 1 && j >= m) {
      j -= m;
      m >>= 1;
    }
    j += m;
  }

  // Danielson–Lanczos
  for (let size = 2; size <= n; size <<= 1) {
    const half = size >> 1;
    const tableStep = n / size;

    for (let i = 0; i < n; i += size) {
      for (let j = 0; j < half; j++) {
        const k = j * tableStep;
        const tRe = Math.cos((-2 * Math.PI * k) / n);
        const tIm = Math.sin((-2 * Math.PI * k) / n);

        const uRe = real[i + j];
        const uIm = imag[i + j];

        const vRe = real[i + j + half] * tRe - imag[i + j + half] * tIm;
        const vIm = real[i + j + half] * tIm + imag[i + j + half] * tRe;

        real[i + j] = uRe + vRe;
        imag[i + j] = uIm + vIm;

        real[i + j + half] = uRe - vRe;
        imag[i + j + half] = uIm - vIm;
      }
    }
  }
}

// -----------------------------
// Spectrum Visualization
// -----------------------------
function drawSpectrum(spectrum) {
  fftCtx.clearRect(0, 0, fftCanvas.width, fftCanvas.height);
  const barWidth = fftCanvas.width / spectrum.length;

  const max = Math.max(...spectrum);

  for (let i = 0; i < spectrum.length; i++) {
    const magnitude = spectrum[i] / max;
    const h = magnitude * fftCanvas.height;

    fftCtx.fillStyle = "#444";
    fftCtx.fillRect(i * barWidth, fftCanvas.height - h, barWidth, h);
  }
}

// -----------------------------
// Feature Extraction → Fingerprint
// -----------------------------
function extractFingerprint(spectrum) {
  // Downsample to 64 bins for simplicity
  const bins = 64;
  const chunk = Math.floor(spectrum.length / bins);

  const fingerprint = [];
  for (let i = 0; i < bins; i++) {
    const start = i * chunk;
    const end = start + chunk;
    const avg = spectrum.slice(start, end).reduce((a, b) => a + b, 0) / chunk;
    fingerprint.push(avg);
  }

  return new Float32Array(fingerprint);
}

// -----------------------------
// Hash (SHA-256)
// -----------------------------
async function sha256(data) {
  const buffer = new Uint8Array(data.buffer);
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}