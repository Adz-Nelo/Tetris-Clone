// Audio System
let synth, drums, bgMusic;
let audioInitialized = false;
let audioMuted = false;

function initAudio() {
    if (audioInitialized) return;
    
    // Background music with MP3
    // OPTION 1: Using Tone.js Player for MP3
    bgMusic = new Tone.Player({
        url: "music/tetris-theme.mp3", // Replace with your MP3 URL
        loop: true,
        autostart: false
    }).toDestination();
    bgMusic.volume.value = -15;

    synth = new Tone.Synth({
        oscillator: { type: 'triangle' },
        envelope: { attack: 0.001, decay: 0.1, sustain: 0.1, release: 0.1 }
    }).toDestination();
    synth.volume.value = -10;

    drums = new Tone.MembraneSynth({
        pitchDecay: 0.05,
        octaves: 4,
        oscillator: { type: 'sine' },
        envelope: { attack: 0.001, decay: 0.4, sustain: 0.01, release: 1.4 }
    }).toDestination();
    drums.volume.value = -8;

    // Start the music when Tone is ready
    Tone.loaded().then(() => {
        if (!audioMuted) {
            bgMusic.start();
        }
    });

    audioInitialized = true;
}

function toggleMute() {
    audioMuted = !audioMuted;
    if (audioInitialized) {
        if (audioMuted) {
            Tone.Master.mute = true;
            if (bgMusic.state === 'started') {
                bgMusic.stop();
            }
        } else {
            Tone.Master.mute = false;
            if (bgMusic.state === 'stopped') {
                bgMusic.start();
            }
        }
    }
}

function playMoveSound() {
    if (!audioInitialized || audioMuted) return;
    synth.triggerAttackRelease('C5', '32n');
}

function playRotateSound() {
    if (!audioInitialized || audioMuted) return;
    synth.triggerAttackRelease('E5', '32n');
}

function playDropSound() {
    if (!audioInitialized || audioMuted) return;
    drums.triggerAttackRelease('C2', '16n');
}

function playLineClearSound() {
    if (!audioInitialized || audioMuted) return;
    const notes = ['C5', 'E5', 'G5', 'C6'];
    notes.forEach((note, i) => {
        setTimeout(() => synth.triggerAttackRelease(note, '32n'), i * 50);
    });
}

function playGameOverSound() {
    if (!audioInitialized || audioMuted) return;
    const notes = ['C5', 'B4', 'A4', 'G4', 'F4', 'E4', 'D4', 'C4'];
    notes.forEach((note, i) => {
        setTimeout(() => synth.triggerAttackRelease(note, '16n'), i * 80);
    });
}

function playPauseSound() {
    if (!audioInitialized || audioMuted) return;
    synth.triggerAttackRelease('G5', '8n');
}

function orientPoints(pieceType, rotation) {
    let results = [];
    switch (pieceType) {
        case 0:
            switch (rotation) {
                case 0: results = [[-2, 0], [-1, 0], [0, 0], [1, 0]]; break;
                case 1: results = [[0, -1], [0, 0], [0, 1], [0, 2]]; break;
                case 2: results = [[-2, 1], [-1, 1], [0, 1], [1, 1]]; break;
                case 3: results = [[-1, -1], [-1, 0], [-1, 1], [-1, 2]]; break;
            }
            break;
        case 1:
            switch (rotation) {
                case 0: results = [[-2, -1], [-2, 0], [-1, 0], [0, 0]]; break;
                case 1: results = [[-1, -1], [-1, 0], [-1, 1], [0, -1]]; break;
                case 2: results = [[-2, 0], [-1, 0], [0, 0], [0, 1]]; break;
                case 3: results = [[-1, -1], [-1, 0], [-1, 1], [-2, 1]]; break;
            }
            break;
        case 2:
            switch (rotation) {
                case 0: results = [[-2, 0], [-1, 0], [0, 0], [0, -1]]; break;
                case 1: results = [[-1, -1], [-1, 0], [-1, 1], [0, 1]]; break;
                case 2: results = [[-2, 0], [-2, 1], [-1, 0], [0, 0]]; break;
                case 3: results = [[-2, -1], [-1, -1], [-1, 0], [-1, 1]]; break;
            }
            break;
        case 3:
            results = [[-1, -1], [0, -1], [-1, 0], [0, 0]];
            break;
        case 4:
            switch (rotation) {
                case 0: results = [[-1, -1], [-2, 0], [-1, 0], [0, -1]]; break;
                case 1: results = [[-1, -1], [-1, 0], [0, 0], [0, 1]]; break;
                case 2: results = [[-1, 0], [-2, 1], [-1, 1], [0, 0]]; break;
                case 3: results = [[-2, -1], [-2, 0], [-1, 0], [-1, 1]]; break;
            }
            break;
        case 5:
            switch (rotation) {
                case 0: results = [[-1, 0], [0, 0], [1, 0], [0, -1]]; break;
                case 1: results = [[0, -1], [0, 0], [0, 1], [1, 0]]; break;
                case 2: results = [[-1, 0], [0, 0], [1, 0], [0, 1]]; break;
                case 3: results = [[0, -1], [0, 0], [0, 1], [-1, 0]]; break;
            }
            break;
        case 6:
            switch (rotation) {
                case 0: results = [[-2, -1], [-1, -1], [-1, 0], [0, 0]]; break;
                case 1: results = [[-1, 0], [-1, 1], [0, 0], [0, -1]]; break;
                case 2: results = [[-2, 0], [-1, 0], [-1, 1], [0, 1]]; break;
                case 3: results = [[-2, 0], [-2, 1], [-1, 0], [-1, -1]]; break;
            }
            break;
    }
    return results;
}
