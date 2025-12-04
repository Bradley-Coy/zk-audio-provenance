// DOM elements
const audioFileInput = document.getElementById('audioFile');
const analyzeBtn = document.getElementById('analyzeBtn');
const player = document.getElementById('player');
const waveformCanvas = document.getElementById('waveformCanvas');
const fftCanvas = document.getElementById('fftCanvas');
const fingerprintHashEl = document.getElementById('fingerprintHash');
const liveCanvas = document.getElementById('liveCanvas');

const waveformCtx = waveformCanvas.getContext('2d');
const fftCtx = fftCanvas.getContext('2d');
const liveCtx = liveCanvas.getContext('2d');

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let audioBuffer;

// Offline analysis (no playback)
analyzeBtn.addEventListener('click', () => {
  const file = audioFileInput.files[0];
  if (!file) return alert('Please select an audio file.');

  const reader = new FileReader();
  reader.onload = e => {
    const arrayBuffer = e.target.result;
    audioCtx.decodeAudioData(arrayBuffer)
      .then(buffer => {
        audioBuffer = buffer;
        // Set audio src for playback (user must click play)
        player.src = URL.createObjectURL(file);

        // Offline static analysis
        drawWaveform(buffer);
        drawStaticFFT(buffer);
        computeFingerprint(buffer);
      })
      .catch(err => console.error('Error decoding audio:', err));
  };
  reader.readAsArrayBuffer(file);
});

// Draw static waveform from buffer
function drawWaveform(buffer) {
  waveformCtx.clearRect(0, 0, waveformCanvas.width, waveformCanvas.height);
  const data = buffer.getChannelData(0);
  const step = Math.ceil(data.length / waveformCanvas.width);

  waveformCtx.beginPath();
  for (let i = 0; i < waveformCanvas.width; i++) {
    const slice = data.slice(i*step, (i+1)*step);
    const min = Math.min(...slice);
    const max = Math.max(...slice);
    waveformCtx.moveTo(i, (1 + min) * waveformCanvas.height/2);
    waveformCtx.lineTo(i, (1 + max) * waveformCanvas.height/2);
  }
  waveformCtx.stroke();
}

// Compute FFT offline (static)
function drawStaticFFT(buffer) {
  fftCtx.clearRect(0, 0, fftCanvas.width, fftCanvas.height);

  const data = buffer.getChannelData(0);
  const n = 2048;
  const slice = data.slice(0, n);
  const magnitudes = new Float32Array(n/2);

  for (let k = 0; k < n/2; k++) {
    let re = 0, im = 0;
    for (let t = 0; t < n; t++) {
      const angle = 2*Math.PI*k*t/n;
      re += slice[t]*Math.cos(angle);
      im -= slice[t]*Math.sin(angle);
    }
    magnitudes[k] = Math.sqrt(re*re + im*im);
  }

  const binWidth = fftCanvas.width / magnitudes.length;
  for (let i = 0; i < magnitudes.length; i++) {
    const mag = magnitudes[i] * 50; // scale for display
    fftCtx.fillRect(i*binWidth, fftCanvas.height - mag, binWidth, mag);
  }
}

// SHA-256 fingerprint offline
async function computeFingerprint(buffer) {
  const data = buffer.getChannelData(0);
  const bins = 64;
  const step = Math.floor(data.length / bins);
  const fingerprint = [];

  for (let i = 0; i < bins; i++) {
    const slice = data.slice(i*step, (i+1)*step);
    fingerprint.push(Math.max(...slice).toFixed(5));
  }

  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(fingerprint.join(',')));
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2,'0')).join('');
  fingerprintHashEl.textContent = hashHex;
}

// Live visualization during playback
let analyserNode, sourceNode;
player.addEventListener('play', async () => {
  if (!audioBuffer) return;
  if (audioCtx.state === 'suspended') await audioCtx.resume();

  // Stop previous source if any
  if (sourceNode) sourceNode.disconnect();
  if (analyserNode) analyserNode.disconnect();

  sourceNode = audioCtx.createMediaElementSource(player);
  analyserNode = audioCtx.createAnalyser();
  analyserNode.fftSize = 2048;

  sourceNode.connect(analyserNode);
  analyserNode.connect(audioCtx.destination);

  const dataArray = new Uint8Array(analyserNode.frequencyBinCount);

  function renderLive() {
    if (player.paused) return;
    requestAnimationFrame(renderLive);
    analyserNode.getByteFrequencyData(dataArray);

    liveCtx.clearRect(0, 0, liveCanvas.width, liveCanvas.height);
    const barWidth = liveCanvas.width / dataArray.length;
    for (let i = 0; i < dataArray.length; i++) {
      const barHeight = dataArray[i];
      liveCtx.fillRect(i*barWidth, liveCanvas.height - barHeight, barWidth, barHeight);
    }
  }
  renderLive();
});
