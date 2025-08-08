let audioContext;
let analyserNode;
let detector;
let targetFreq;
let targetNoteName;
let micStream;

const startBtn = document.getElementById('startBtn');
const newNoteBtn = document.getElementById('newNoteBtn');
const targetNoteEl = document.getElementById('targetNote');
const yourNoteEl = document.getElementById('yourNote');
const diffEl = document.getElementById('difference');
const feedbackEl = document.getElementById('feedback');

const NOTES = [
    { note: 'C4', freq: 261.63 },
    { note: 'D4', freq: 293.66 },
    { note: 'E4', freq: 329.63 },
    { note: 'F4', freq: 349.23 },
    { note: 'G4', freq: 392.00 },
    { note: 'A4', freq: 440.00 },
    { note: 'B4', freq: 493.88 },
    { note: 'C5', freq: 523.25 }
];

function pickRandomNote() {
    const base = NOTES[Math.floor(Math.random() * NOTES.length)];
    const thirdUp = base.freq * Math.pow(2, 4/12); // Major third
    targetFreq = thirdUp;
    targetNoteName = `${base.note} + third`;
    targetNoteEl.textContent = targetNoteName;
}

async function startListening() {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const source = audioContext.createMediaStreamSource(micStream);
    analyserNode = audioContext.createAnalyser();
    source.connect(analyserNode);

    detector = Pitchy.PitchDetector.forFloat32Array(analyserNode.fftSize);
    listenPitch();
}

function listenPitch() {
    const input = new Float32Array(analyserNode.fftSize);
    analyserNode.getFloatTimeDomainData(input);
    const [pitch, clarity] = detector.findPitch(input, audioContext.sampleRate);

    if (pitch && clarity > 0.8) {
        yourNoteEl.textContent = pitch.toFixed(2) + " Hz";
        const diff = 1200 * Math.log2(pitch / targetFreq);
        diffEl.textContent = diff.toFixed(2);
        if (Math.abs(diff) < 20) {
            feedbackEl.textContent = "🎯 Great! You're on pitch.";
        } else {
            feedbackEl.textContent = "❌ Keep adjusting.";
        }
    }

    requestAnimationFrame(listenPitch);
}

startBtn.addEventListener('click', async () => {
    await startListening();
    startBtn.disabled = true;
    newNoteBtn.disabled = false;
    pickRandomNote();
});

newNoteBtn.addEventListener('click', () => {
    pickRandomNote();
});
