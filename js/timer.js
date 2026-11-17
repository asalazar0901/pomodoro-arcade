/* =====================================================================
   timer.js — Lógica del Pomodoro y frases motivacionales.
   25 min de concentración / 10 min de descanso.
   ===================================================================== */

/* Truco para probar rápido: abre la app con ?demo=1 en la URL y los
   bloques se acortan (25 s de trabajo, 60 s de descanso). */
const DEMO = new URLSearchParams(location.search).has('demo');

/* ---------------------------------------------------------------------
   DURACIONES (editables desde ⚙ Ajustes)
   --------------------------------------------------------------------- */
export const LIMITS = {
  // Sin código de seguridad:
  workMin: 15, workMax: 90,
  breakMin: 5, breakMax: 20,
  // Con código de seguridad:
  adminMin: 1, adminMax: 180,
};
const DEFAULT_MINUTES = { work: 25, break: 10 };
const SETTINGS_KEY = 'pomodoroArcade.settings';

function loadMinutes() {
  try {
    const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY));
    const ok = (v) => Number.isFinite(v) && v >= LIMITS.adminMin && v <= LIMITS.adminMax;
    if (saved && ok(saved.work) && ok(saved.break)) return { work: saved.work, break: saved.break };
  } catch { /* ajustes corruptos: se usan los de fábrica */ }
  return { ...DEFAULT_MINUTES };
}

const minutes = loadMinutes();
// En modo demo un "minuto" de trabajo dura 1 segundo y uno de descanso 6.
const toMs = (mode, min) => min * (DEMO ? (mode === 'work' ? 1000 : 6000) : 60 * 1000);

export const DURATIONS = { work: toMs('work', minutes.work), break: toMs('break', minutes.break) };

export const getMinutes = () => ({ ...minutes });

/**
 * Valida unos minutos nuevos. `admin` = se introdujo el código de seguridad.
 * Devuelve un texto de error, o null si todo está bien.
 */
export function validateMinutes(work, brk, admin = false) {
  if (!Number.isInteger(work) || !Number.isInteger(brk)) return 'Escribe minutos enteros.';
  if (admin) {
    if (work < LIMITS.adminMin || brk < LIMITS.adminMin) return `El mínimo es ${LIMITS.adminMin} minuto.`;
    if (work > LIMITS.adminMax || brk > LIMITS.adminMax) return `El máximo es ${LIMITS.adminMax} minutos.`;
    return null;
  }
  if (work < LIMITS.workMin) return `El bloque no puede bajar de ${LIMITS.workMin} minutos sin el código de seguridad.`;
  if (work > LIMITS.workMax) return `El bloque no puede pasar de ${LIMITS.workMax} minutos.`;
  if (brk < LIMITS.breakMin || brk > LIMITS.breakMax) return `El descanso va de ${LIMITS.breakMin} a ${LIMITS.breakMax} minutos sin el código de seguridad.`;
  return null;
}

/** Guarda los minutos nuevos. Llama después a timer.applyDurations(). */
export function saveMinutes(work, brk) {
  minutes.work = work;
  minutes.break = brk;
  DURATIONS.work = toMs('work', work);
  DURATIONS.break = toMs('break', brk);
  try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(minutes)); } catch { /* sin almacenamiento */ }
}

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
    this.breakId = 0; // identifica cada descanso (para no cobrar dos veces el mismo premio)
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

  /**
   * Aplica las duraciones recién guardadas. Si el reloj está detenido se
   * reinicia el bloque actual con el tiempo nuevo; si está corriendo, el
   * cambio entra en el siguiente bloque. Devuelve true si se aplicó ya.
   */
  applyDurations() {
    if (this.running) return false;
    this.remainingMs = DURATIONS[this.mode];
    this.#persist();
    this.#emit();
    return true;
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
    if (mode === 'break') this.breakId = Date.now();
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
      totalMs: Math.max(DURATIONS[this.mode], this.remainingMs),
      running: this.running,
    });
  }

  /* Guarda el reloj para que sobreviva a recargar la página. */
  #persist() {
    try {
      localStorage.setItem(TIMER_KEY, JSON.stringify({
        mode: this.mode, running: this.running, remainingMs: this.remainingMs, endAt: this.endAt, breakId: this.breakId,
      }));
    } catch { /* sin almacenamiento: no pasa nada */ }
  }

  #restore() {
    try {
      const saved = JSON.parse(localStorage.getItem(TIMER_KEY));
      if (!saved || !DURATIONS[saved.mode]) return;
      this.mode = saved.mode;
      this.breakId = saved.breakId || 0;
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
