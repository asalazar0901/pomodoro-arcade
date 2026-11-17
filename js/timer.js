/* =====================================================================
   timer.js — Lógica del Pomodoro y frases motivacionales.
   25 min de concentración / 10 min de descanso.
   ===================================================================== */

/* Truco para probar rápido: abre la app con ?demo=1 en la URL y los
   bloques se acortan (25 s de trabajo, 60 s de descanso). */
const DEMO = new URLSearchParams(location.search).has('demo');

export const DURATIONS = {
  work: DEMO ? 25 * 1000 : 25 * 60 * 1000,
  break: DEMO ? 60 * 1000 : 10 * 60 * 1000,
};

export const WORK_PHRASES = [
  // Las tres obligatorias:
  'Empezar a estudiar esto da tanta pereza como el cálculo de ajedrez, pero al terminar te sentirás genial.',
  'Concéntrate ahora, los Reels de Insta te esperan en 25 minutos.',
  'Si Dipper y Mabel pueden resolver misterios, tú puedes terminar este bloque.',
  // Extras:
  'Un bloque a la vez, ingeniero. Así se construyen los puentes.',
  'Grogu cree en ti. Y yo también, mucho más.',
  'Cada minuto de foco es un Skittle para el arcade. Piénsalo.',
  'El estereofón frena, tú no. Sigue.',
  'Hasta Valery Salov calculaba jugada por jugada. Tú ve línea por línea.',
  'Cuando termines hay tickets. Y con tickets hay brownies. Matemática simple.',
  'Ni Homelander es tan rápido como tú cuando te concentras.',
  'Tu yo del futuro te va a agradecer estos 25 minutos. Tu novia también.',
  'Que la Fuerza (y el café) te acompañen.',
  'Estoy orgullosa de ti. Ahora vuelve a mirar el cuaderno.',
];

export const BREAK_PHRASES = [
  '¡Descanso! Estira la espalda, toma agua y ve a jugar un rato.',
  'Te ganaste 10 minutos. El arcade y la sopa de letras están abiertos.',
  'Pausa merecida, mi vida. Respira.',
  'Hora del snack: Skittles, Gomitas o Brazy Puffs, tú eliges.',
];

const TIMER_KEY = 'pomodoroArcade.timer';
const PHRASE_EVERY_MS = DEMO ? 6000 : 60 * 1000;

export class PomodoroTimer {
  /**
   * @param {object} hooks
   * @param {(info: {mode, remainingMs, totalMs, running}) => void} hooks.onTick
   * @param {(finishedMode: 'work'|'break') => void} hooks.onPhaseEnd  Se llama cuando un bloque termina completo.
   * @param {(mode: 'work'|'break') => void} hooks.onModeChange
   * @param {(text: string) => void} hooks.onPhrase
   */
  constructor(hooks = {}) {
    this.hooks = hooks;
    this.mode = 'work';
    this.running = false;
    this.remainingMs = DURATIONS.work;
    this.endAt = 0; // marca de tiempo real en la que termina el bloque
    this.interval = null;
    this.lastPhraseAt = 0;
    this.lastPhrase = '';
    this.#restore();
  }

  /* ---------- API pública ---------- */
  start() {
    if (this.running) return;
    this.running = true;
    this.endAt = Date.now() + this.remainingMs;
    this.#loop();
    this.#showPhrase();
    this.#persist();
    this.#emit();
  }

  pause() {
    if (!this.running) return;
    this.remainingMs = Math.max(0, this.endAt - Date.now());
    this.running = false;
    clearInterval(this.interval);
    this.#persist();
    this.#emit();
  }

  toggle() { this.running ? this.pause() : this.start(); }

  /** Reinicia el bloque actual sin dar recompensa. */
  reset() {
    this.running = false;
    clearInterval(this.interval);
    this.remainingMs = DURATIONS[this.mode];
    this.#persist();
    this.#emit();
  }

  /** Termina el descanso antes de tiempo y vuelve a modo concentración. */
  skipBreak() {
    if (this.mode !== 'break') return;
    this.#setMode('work', false);
  }

  /** Úsalo al cargar la página para pintar el estado inicial. */
  refresh() {
    if (this.running) this.#loop();
    this.hooks.onModeChange?.(this.mode);
    this.#emit();
  }

  /* ---------- internos ---------- */
  #loop() {
    clearInterval(this.interval);
    // Se calcula contra el reloj real (endAt), así no se desfasa si el
    // navegador duerme la pestaña o el celular bloquea la pantalla.
    this.interval = setInterval(() => this.#tick(), 250);
    this.#tick();
  }

  #tick() {
    if (!this.running) return;
    this.remainingMs = Math.max(0, this.endAt - Date.now());
    if (Date.now() - this.lastPhraseAt > PHRASE_EVERY_MS) this.#showPhrase();
    this.#emit();
    if (this.remainingMs <= 0) this.#finish();
  }

  #finish() {
    const finished = this.mode;
    clearInterval(this.interval);
    this.running = false;
    this.hooks.onPhaseEnd?.(finished);
    // Trabajo -> el descanso arranca solo (para abrir los minijuegos).
    // Descanso -> vuelve a trabajo y espera a que él pulse Iniciar.
    if (finished === 'work') this.#setMode('break', true);
    else this.#setMode('work', false);
  }

  #setMode(mode, autostart) {
    this.mode = mode;
    this.running = false;
    clearInterval(this.interval);
    this.remainingMs = DURATIONS[mode];
    this.hooks.onModeChange?.(mode);
    if (autostart) this.start();
    else {
      this.#persist();
      this.#emit();
    }
  }

  #showPhrase() {
    const pool = this.mode === 'work' ? WORK_PHRASES : BREAK_PHRASES;
    let text;
    do { text = pool[Math.floor(Math.random() * pool.length)]; } while (pool.length > 1 && text === this.lastPhrase);
    this.lastPhrase = text;
    this.lastPhraseAt = Date.now();
    this.hooks.onPhrase?.(text);
  }

  #emit() {
    this.hooks.onTick?.({
      mode: this.mode,
      remainingMs: this.remainingMs,
      totalMs: DURATIONS[this.mode],
      running: this.running,
    });
  }

  /* Guarda el reloj para que sobreviva a recargar la página. */
  #persist() {
    try {
      localStorage.setItem(TIMER_KEY, JSON.stringify({
        mode: this.mode, running: this.running, remainingMs: this.remainingMs, endAt: this.endAt,
      }));
    } catch { /* sin almacenamiento: no pasa nada */ }
  }

  #restore() {
    try {
      const saved = JSON.parse(localStorage.getItem(TIMER_KEY));
      if (!saved || !DURATIONS[saved.mode]) return;
      this.mode = saved.mode;
      if (saved.running) {
        const left = saved.endAt - Date.now();
        if (left > 0) {
          this.running = true;
          this.endAt = saved.endAt;
          this.remainingMs = left;
        } else if (saved.mode === 'work') {
          // El bloque terminó con la pestaña cerrada: se cuenta al primer tick.
          this.running = true;
          this.endAt = saved.endAt;
          this.remainingMs = 0;
        } else {
          this.mode = 'work';
          this.remainingMs = DURATIONS.work;
        }
      } else {
        this.remainingMs = Math.min(saved.remainingMs ?? DURATIONS[saved.mode], DURATIONS[saved.mode]);
      }
    } catch { /* estado corrupto: se empieza de cero */ }
  }
}

export function formatTime(ms) {
  const total = Math.ceil(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
