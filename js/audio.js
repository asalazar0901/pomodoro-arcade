/* =====================================================================
   audio.js — AudioController: efectos de sonido (SFX).

   Cada sonido tiene dos formas de sonar:
     - `src`:   ruta a un archivo .mp3 (ponlo en /public/sounds).
     - `notes`: si `src` es null, se sintetiza un sonidito 8-bit con
                WebAudio (frecuencias en Hz), así no hace falta ningún archivo.

   PARA USAR TUS PROPIOS SONIDOS: guarda el .mp3 en public/sounds/ y
   cambia `src: null` por, p. ej., `src: 'sounds/snack.mp3'`.
   ===================================================================== */

export const SOUNDS = {
  // --- Pomodoro ---
  pomodoroDone: { src: null /* 'sounds/pomodoro.mp3' */,  notes: [660, 880, 1320], step: 0.14 },
  breakDone:    { src: null /* 'sounds/descanso.mp3' */,  notes: [880, 660, 440], step: 0.14 },
  click:        { src: null /* 'sounds/click.mp3' */,     notes: [520], step: 0.08 },
  // --- Arcade ---
  snack:        { src: null /* 'sounds/snack.mp3' */,     notes: [988, 1319], step: 0.06 },
  powerup:      { src: null /* 'sounds/powerup.mp3' */,   notes: [523, 659, 784, 1047, 1568], step: 0.07 },
  hit:          { src: null /* 'sounds/golpe.mp3' */,     notes: [220, 165, 110], step: 0.09, wave: 'sawtooth' },
  foam:         { src: null /* 'sounds/estereofon.mp3' */, notes: [140, 100], step: 0.06, wave: 'triangle' },
  bash:         { src: null /* 'sounds/caldo.mp3' */,     notes: [392, 784], step: 0.07 },
  gameOver:     { src: null /* 'sounds/gameover.mp3' */,  notes: [440, 330, 220, 165], step: 0.16 },
  // --- Sopa de letras, tienda y varios ---
  word:         { src: null /* 'sounds/palabra.mp3' */,   notes: [880], step: 0.1 },
  win:          { src: null /* 'sounds/victoria.mp3' */,  notes: [660, 880, 1100, 1320], step: 0.12 },
  coupon:       { src: null /* 'sounds/cupon.mp3' */,     notes: [660, 990, 1320], step: 0.12 },
  busted:       { src: null /* 'sounds/trampa.mp3' */,    notes: [392, 370, 349, 330, 147], step: 0.16, wave: 'sawtooth' },
};

const MUTE_KEY = 'pomodoroArcade.muted';

export class AudioController {
  constructor(sounds = SOUNDS) {
    this.sounds = sounds;
    this.ctx = null;       // AudioContext (se crea con el primer sonido)
    this.files = {};       // caché de <audio> para los .mp3
    this.volume = 0.08;
    try { this.muted = localStorage.getItem(MUTE_KEY) === '1'; } catch { this.muted = false; }
  }

  /** Reproduce un sonido por nombre: audio.play('snack') */
  play(name) {
    const sound = this.sounds[name];
    if (!sound || this.muted) return;
    try {
      if (sound.src) this.#playFile(name, sound.src);
      else this.#synth(sound);
    } catch { /* sin audio: la app sigue igual */ }
  }

  toggleMute() {
    this.muted = !this.muted;
    try { localStorage.setItem(MUTE_KEY, this.muted ? '1' : '0'); } catch { /* sin almacenamiento */ }
    return this.muted;
  }

  #playFile(name, src) {
    const base = this.files[name] || (this.files[name] = new Audio(src));
    const node = base.cloneNode(); // permite que el mismo sonido se solape
    node.volume = 0.6;
    node.play().catch(() => {});
  }

  #synth({ notes, step = 0.12, wave = 'square' }) {
    this.ctx = this.ctx || new (window.AudioContext || window.webkitAudioContext)();
    if (this.ctx.state === 'suspended') this.ctx.resume();
    notes.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = wave;
      osc.frequency.value = freq;
      const t0 = this.ctx.currentTime + i * step;
      gain.gain.setValueAtTime(this.volume, t0);
      gain.gain.exponentialRampToValueAtTime(0.001, t0 + step * 0.95);
      osc.connect(gain).connect(this.ctx.destination);
      osc.start(t0);
      osc.stop(t0 + step);
    });
  }
}

export const audio = new AudioController();
