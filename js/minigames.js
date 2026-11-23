/* =====================================================================
   minigames.js — Minijuegos de palabras, trivia y ajedrez.
     - Hangman      "Salva el Malvavisco" (ahorcado)
     - Cosidle      adivina la palabra de 5 letras
     - Trivia       examen sorpresa de opción múltiple con tiempo
     - ChessPuzzle  mate en N jugadas sobre un tablero dibujado desde un FEN

   Todos reciben sus datos de public/contenido/juegos.js (ver gamedata.js)
   y comparten la misma forma. `dif` es el bloque `dificultad` de juegos.js:
       const juego = new Hangman(contenedor, datos, { onWin, onLose, sfx }, dif);
       juego.start();     // partida nueva
       juego.destroy();   // al salir (quita teclado y temporizadores)
   ===================================================================== */

import { normalizeWord } from './gamedata.js';

const pick = (list) => list[Math.floor(Math.random() * list.length)];
const escapeHtml = (s) => String(s).replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));

/** Copia revuelta (Fisher-Yates). */
function shuffle(list) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Elige un elemento al azar evitando repetir el anterior. */
function pickNew(list, previous) {
  if (list.length < 2) return list[0];
  let item;
  do { item = pick(list); } while (item === previous);
  return item;
}

/* ---------------------------------------------------------------------
   Base común: contenedor, hooks y teclado físico
   --------------------------------------------------------------------- */
class MiniGame {
  constructor(root, data, hooks = {}, dif = {}) {
    this.root = root;
    this.data = data;
    this.hooks = hooks;
    this.dif = dif;
    this.over = false;
    this._onKey = (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;
      if (this.onKey(e.key) === true) e.preventDefault();
    };
    document.addEventListener('keydown', this._onKey);
  }

  onKey() { /* cada juego decide */ }
  sfx(name) { this.hooks.sfx?.(name); }
  win(detail) { this.over = true; this.sfx('win'); this.hooks.onWin?.(detail); }
  lose(detail) { this.over = true; this.sfx('gameOver'); this.hooks.onLose?.(detail); }
  $(sel) { return this.root.querySelector(sel); }

  destroy() {
    document.removeEventListener('keydown', this._onKey);
    clearInterval(this.interval);
    clearTimeout(this.timeout);
    this.root.innerHTML = '';
  }
}

/** Teclado en pantalla. `rows` es una lista de filas; cada tecla es un texto. */
function keyboardHtml(rows) {
  return `<div class="kb">${rows.map((row) => `<div class="kb-row">${row.map((k) =>
    `<button type="button" class="kb-key ${k.length > 1 ? 'is-wide' : ''}" data-key="${k}">${k === 'BORRAR' ? '⌫' : k === 'ENVIAR' ? '✔' : k}</button>`).join('')}</div>`).join('')}</div>`;
}
const LETTER_ROWS = [[...'QWERTYUIOP'], [...'ASDFGHJKLÑ'], [...'ZXCVBNM']];

/* =====================================================================
   1. AHORCADO: "Salva el Malvavisco"
   ===================================================================== */
const VILLAINS = [
  { name: 'Darth Vader', sprite: 'assets/vader_v2.png' },
  { name: 'Valery Salov', sprite: 'assets/salov_v2.png' },
  { name: 'Homelander', sprite: 'assets/homelander_v2.png' },
];

const HANGMAN_KEY = 'pomodoroArcade.ahorcado';

export class Hangman extends MiniGame {
  get maxFails() { return this.dif.ahorcadoFallos || 6; }
  get hintAfter() { return this.dif.ahorcadoPistaTrasFallos ?? 0; }
  /** La palabra no se puede cambiar hasta ganar o perder. */
  get canRestart() { return this.over; }

  /** Partida a medias guardada (sobrevive a salir del juego y a recargar). */
  #load() {
    try {
      const saved = JSON.parse(localStorage.getItem(HANGMAN_KEY) || 'null');
      const entry = saved && this.data.find((x) => x.palabra === saved.palabra);
      if (!entry) return null;
      return { entry, guessed: new Set(saved.guessed || []), villain: VILLAINS[saved.villain] || VILLAINS[0] };
    } catch { return null; }
  }
  #save() {
    try {
      if (this.over) localStorage.removeItem(HANGMAN_KEY);
      else localStorage.setItem(HANGMAN_KEY, JSON.stringify({
        palabra: this.word, guessed: [...this.guessed], villain: VILLAINS.indexOf(this.villain),
      }));
    } catch { /* sin almacenamiento: no pasa nada */ }
  }

  /** Primero un tema al azar y luego una palabra de ese tema (sin repetir la anterior). */
  #pickEntry() {
    const temas = [...new Set(this.data.map((x) => x.tema))];
    const tema = pick(temas);
    return pickNew(this.data.filter((x) => x.tema === tema), this.entry);
  }

  start() {
    if (this.entry && !this.over) return;   // sigue la misma partida
    const saved = this.#load();
    this.over = false;
    this.entry = saved ? saved.entry : this.#pickEntry();
    this.word = this.entry.palabra;          // ya viene en MAYÚSCULAS y sin tildes
    this.guessed = saved ? saved.guessed : new Set();
    this.fails = [...this.guessed].filter((ch) => !this.word.includes(ch)).length;
    this.villain = saved ? saved.villain : pick(VILLAINS);
    this.root.innerHTML = `
      <div class="hm-stage fondo-${this.entry.fondo}">
        <p class="hm-theme">Tema: <strong>${escapeHtml(this.entry.tema)}</strong></p>
        <p class="mg-hint hm-hint"></p>
        <div class="hm-track" aria-hidden="true">
          <div class="hm-villain" style="background-image:url('${this.villain.sprite}')"></div>
          <img class="hm-prize" src="assets/malvavisco_v2.png" alt="" />
        </div>
        <p class="mg-status" aria-live="polite"></p>
        <p class="hm-word" aria-label="Palabra"></p>
      </div>
      ${keyboardHtml(LETTER_ROWS)}
      <p class="game-msg" aria-live="polite"></p>`;
    this.root.querySelector('.kb').addEventListener('click', (e) => {
      const key = e.target.closest('[data-key]');
      if (key) this.guess(key.dataset.key);
    });
    this.#paint();
  }

  onKey(key) {
    const letter = normalizeWord(key);
    if (letter.length === 1) { this.guess(letter); return true; }
    return false;
  }

  guess(letter) {
    if (this.over || this.guessed.has(letter)) return;
    this.guessed.add(letter);
    const hit = this.word.includes(letter);
    if (!hit) { this.fails += 1; this.sfx('hit'); } else this.sfx('word');
    this.#paint();

    const solved = [...this.word].every((ch) => ch === ' ' || this.guessed.has(ch));
    if (solved) {
      this.$('.game-msg').textContent = '¡Malvavisco a salvo!';
      this.win();
      this.#save();
    } else if (this.fails >= this.maxFails) {
      this.#paint(true);
      const msg = this.$('.game-msg');
      msg.textContent = `${this.villain.name} se comió el malvavisco. Era: ${this.word}`;
      msg.classList.add('is-error');
      this.lose();
      this.#save();
    } else this.#save();
  }

  #paint(reveal = false) {
    const lockedHint = this.fails < this.hintAfter && !reveal;
    const left0 = this.hintAfter - this.fails;
    this.$('.hm-hint').innerHTML = lockedHint
      ? `🔒 <strong>Pista bloqueada:</strong> se abre con ${left0} fallo${left0 === 1 ? '' : 's'} más.`
      : `<strong>Pista:</strong> ${escapeHtml(this.entry.pista || 'Sin pista. Suerte.')}`;
    this.$('.hm-word').innerHTML = [...this.word].map((ch) => {
      if (ch === ' ') return '<span class="hm-gap"></span>';
      const shown = this.guessed.has(ch) || reveal;
      return `<span class="hm-letter ${shown && !this.guessed.has(ch) ? 'is-missed' : ''}">${shown ? ch : ''}</span>`;
    }).join('');
    const left = this.maxFails - this.fails;
    this.$('.mg-status').textContent = left > 0
      ? `${this.villain.name} está a ${left} paso${left === 1 ? '' : 's'} del malvavisco.`
      : `${this.villain.name} llegó al malvavisco.`;
    this.$('.hm-villain').style.left = `calc(${(this.fails / this.maxFails) * 100}% - ${(this.fails / this.maxFails) * 96}px)`;
    this.$('.hm-track').classList.toggle('is-lost', this.fails >= this.maxFails);
    this.root.querySelectorAll('.kb-key').forEach((btn) => {
      const k = btn.dataset.key;
      btn.disabled = this.guessed.has(k);
      btn.classList.toggle('is-hit', this.guessed.has(k) && this.word.includes(k));
      btn.classList.toggle('is-miss', this.guessed.has(k) && !this.word.includes(k));
    });
  }
}

/* =====================================================================
   1b. FRASE CIFRADA: criptograma. Una frase célebre donde cada letra se
   cambió por un número. Misma letra = mismo número.
   ===================================================================== */
const CRYPTO_KEY = 'pomodoroArcade.cripto';

export class Cryptogram extends MiniGame {
  get canRestart() { return this.over; }
  get maxErrors() { return this.dif.criptoErrores || 3; }

  #load() {
    try {
      const saved = JSON.parse(localStorage.getItem(CRYPTO_KEY) || 'null');
      const entry = saved && this.data.find((x) => x.frase === saved.frase);
      return entry ? { entry, ...saved } : null;
    } catch { return null; }
  }
  #save() {
    try {
      if (this.over) localStorage.removeItem(CRYPTO_KEY);
      else localStorage.setItem(CRYPTO_KEY, JSON.stringify({
        frase: this.entry.frase, code: this.code, guess: this.guess, given: [...this.given], errors: this.errors,
      }));
    } catch { /* sin almacenamiento */ }
  }

  start() {
    if (this.entry && !this.over) return;
    const saved = this.#load();
    this.over = false;
    this.entry = saved ? saved.entry : pickNew(this.data, this.entry);
    // Texto en mayúsculas y sin tildes; lo demás (comas, puntos) se queda igual
    this.text = [...this.entry.frase.toUpperCase()].map((ch) => normalizeWord(ch) || ch).join('');
    const letters = [...new Set([...this.text].filter((ch) => /[A-ZÑ]/.test(ch)))];
    if (saved) {
      this.code = saved.code; this.guess = saved.guess; this.given = new Set(saved.given); this.errors = saved.errors || 0;
    } else {
      const nums = shuffle(Array.from({ length: 27 }, (_, i) => i + 1));
      this.code = Object.fromEntries(letters.map((ch, i) => [ch, nums[i]]));
      this.guess = {};                      // número -> letra que puso él
      this.given = new Set(shuffle(letters).slice(0, Math.min(this.dif.criptoPistas ?? 2, letters.length - 1)));
      this.given.forEach((ch) => { this.guess[this.code[ch]] = ch; });
      this.errors = 0;
    }
    this.selected = null;

    const words = this.text.split(' ');
    this.root.innerHTML = `
      <p class="mg-hint">Cada número es una letra. Toca una casilla y escribe la letra. Las pistas ya vienen en verde.</p>
      <div class="cr-phrase">${words.map((w) => `<span class="cr-word">${[...w].map((ch) => (
        this.code[ch]
          ? `<button type="button" class="cr-cell ${this.given.has(ch) ? 'is-given' : ''}" data-n="${this.code[ch]}"><b></b><i>${this.code[ch]}</i></button>`
          : `<span class="cr-punct">${escapeHtml(ch)}</span>`)).join('')}</span>`).join('')}</div>
      <p class="mg-status" aria-live="polite"></p>
      ${keyboardHtml([LETTER_ROWS[0], LETTER_ROWS[1], [...LETTER_ROWS[2], 'BORRAR']])}
      <p class="game-msg" aria-live="polite"></p>`;
    this.$('.cr-phrase').addEventListener('click', (e) => {
      const cell = e.target.closest('[data-n]');
      if (!cell || this.over) return;
      const n = Number(cell.dataset.n);
      if (this.#isGiven(n)) return;
      this.selected = n;
      this.#paint();
    });
    this.root.querySelector('.kb').addEventListener('click', (e) => {
      const key = e.target.closest('[data-key]');
      if (key) this.press(key.dataset.key);
    });
    this.#paint();
    this.#save();
  }

  #isGiven(n) { return [...this.given].some((ch) => this.code[ch] === n); }
  #numbers() { return [...new Set(Object.values(this.code))]; }

  onKey(key) {
    if (key === 'Backspace' || key === 'Delete') { this.press('BORRAR'); return true; }
    if (key === 'ArrowRight' || key === 'ArrowLeft') { this.#move(key === 'ArrowRight' ? 1 : -1); return true; }
    const letter = normalizeWord(key);
    if (letter.length === 1) { this.press(letter); return true; }
    return false;
  }

  /** Pasa a la siguiente casilla vacía. */
  #move(dir = 1) {
    const order = [...this.root.querySelectorAll('.cr-cell')].map((c) => Number(c.dataset.n)).filter((n, i, a) => a.indexOf(n) === i && !this.#isGiven(n));
    if (!order.length) return;
    let i = order.indexOf(this.selected);
    for (let k = 0; k < order.length; k++) {
      i = (i + dir + order.length) % order.length;
      if (dir < 0 || !this.guess[order[i]]) { this.selected = order[i]; this.#paint(); return; }
    }
  }

  press(key) {
    if (this.over || this.selected == null) {
      if (!this.over && this.selected == null) {
        const msg = this.$('.game-msg');
        msg.textContent = 'Toca primero una casilla.';
        msg.classList.remove('is-error');
      }
      return;
    }
    const msg = this.$('.game-msg');
    msg.textContent = '';
    msg.classList.remove('is-error');
    if (key === 'BORRAR') {
      delete this.guess[this.selected];
    } else {
      // Una letra solo puede estar en un número
      for (const [n, ch] of Object.entries(this.guess)) if (ch === key && !this.#isGiven(Number(n))) delete this.guess[n];
      if (Object.entries(this.guess).some(([n, ch]) => ch === key)) {
        msg.textContent = `La ${key} ya es una pista fija.`;
        msg.classList.add('is-error');
        return;
      }
      this.guess[this.selected] = key;
      this.sfx('word');
      this.#move(1);
    }
    this.#paint();
    this.#check();
    this.#save();
  }

  #check() {
    const nums = this.#numbers();
    if (!nums.every((n) => this.guess[n])) return;
    const right = Object.entries(this.code).every(([ch, n]) => this.guess[n] === ch);
    const msg = this.$('.game-msg');
    if (right) {
      this.selected = null;
      this.over = true;
      this.#paint();
      msg.innerHTML = `¡Descifrada! <br><em>«${escapeHtml(this.entry.frase)}»</em>${this.entry.autor ? `<br>— ${escapeHtml(this.entry.autor)}` : ''}`;
      this.win();
      return;
    }
    this.errors += 1;
    this.sfx('hit');
    if (this.errors >= this.maxErrors) {
      this.over = true;
      this.selected = null;
      Object.entries(this.code).forEach(([ch, n]) => { this.guess[n] = ch; });
      this.#paint();
      msg.innerHTML = `Sin intentos. Era: <em>«${escapeHtml(this.entry.frase)}»</em>${this.entry.autor ? ` — ${escapeHtml(this.entry.autor)}` : ''}`;
      msg.classList.add('is-error');
      this.lose();
      return;
    }
    this.#paint();
    msg.textContent = 'Todo lleno, pero hay letras equivocadas. Revisa.';
    msg.classList.add('is-error');
  }

  #paint() {
    this.root.querySelectorAll('.cr-cell').forEach((cell) => {
      const n = Number(cell.dataset.n);
      cell.querySelector('b').textContent = this.guess[n] || '';
      cell.classList.toggle('is-selected', n === this.selected);
    });
    const used = new Set(Object.values(this.guess));
    this.root.querySelectorAll('.kb-key').forEach((btn) => btn.classList.toggle('is-used', used.has(btn.dataset.key)));
    const left = this.maxErrors - this.errors;
    this.$('.mg-status').textContent = `Comprobaciones fallidas que quedan: ${'●'.repeat(Math.max(0, left))}${'○'.repeat(Math.max(0, this.errors))}`;
  }
}

/* =====================================================================
   1c. CRÍPTICO: una pista de crucigrama críptico. Cada pista tiene una
   definición (lo que significa la respuesta) y un juego de palabras
   (anagrama, palabra escondida, al revés...). Entre paréntesis, las letras.
   ===================================================================== */
const CRYPTIC_KEY = 'pomodoroArcade.criptico';
export const CRYPTIC_TYPES = {
  'anagrama': 'Las letras de una palabra de la pista, revueltas. Avisos: revuelto, loco, roto, mal, mezclado.',
  'escondida': 'La respuesta está escondida, seguida, dentro de las palabras de la pista. Avisos: en, esconde, guarda, dentro de.',
  'al revés': 'Una palabra de la pista leída de derecha a izquierda. Avisos: al revés, regresa, de vuelta.',
  'suma': 'Dos piezas que se pegan una tras otra para formar la respuesta.',
  'doble definición': 'Dos significados distintos de la misma palabra, sin juego de letras.',
  'contenedor': 'Una pieza metida dentro de otra. Avisos: abraza, contiene, rodea.',
  'resta': 'A una palabra le quitas letras. Avisos: sin cabeza, sin fin, casi.',
  'iniciales': 'Las primeras letras de varias palabras. Avisos: cabezas de, al principio, primeras de.',
  'suena como': 'La respuesta se oye igual que otra palabra. Avisos: suena, se oye.',
};

export class CrypticClue extends MiniGame {
  get canRestart() { return this.over; }
  get maxTries() { return this.dif.cripticoIntentos || 3; }
  get maxHints() { return this.dif.cripticoPistas ?? 3; }

  #load() {
    try {
      const saved = JSON.parse(localStorage.getItem(CRYPTIC_KEY) || 'null');
      const entry = saved && this.data.find((x) => x.pista === saved.pista);
      return entry ? { entry, ...saved } : null;
    } catch { return null; }
  }
  #save() {
    try {
      if (this.over) localStorage.removeItem(CRYPTIC_KEY);
      else localStorage.setItem(CRYPTIC_KEY, JSON.stringify({ pista: this.entry.pista, tries: this.tries, hints: this.hints, typed: this.typed }));
    } catch { /* sin almacenamiento */ }
  }

  start() {
    if (this.entry && !this.over) return;
    const saved = this.#load();
    this.over = false;
    this.entry = saved ? saved.entry : pickNew(this.data, this.entry);
    this.answer = this.entry.respuesta;               // MAYÚSCULAS, sin tildes, con espacios
    this.letters = this.answer.replace(/ /g, '');
    this.tries = saved ? saved.tries : 0;
    this.hints = saved ? saved.hints : 0;
    this.typed = saved ? saved.typed || '' : '';
    const pattern = this.answer.split(' ').map((w) => w.length).join(',');
    this.root.innerHTML = `
      <div class="cc-card">
        <p class="cc-clue">${escapeHtml(this.entry.pista)} <span class="cc-len">(${pattern})</span></p>
        <p class="cc-author">Pista críptica · hecha para ti</p>
      </div>
      <div class="cc-boxes" aria-label="Respuesta">${this.answer.split(' ').map((w) =>
        `<span class="cc-word">${[...w].map(() => '<span class="cc-box"></span>').join('')}</span>`).join('')}</div>
      <p class="mg-status" aria-live="polite"></p>
      <div class="cc-hints" aria-live="polite"></div>
      <div class="cc-actions">
        <button type="button" class="btn btn-ghost btn-small cc-hint-btn">💡 Pista</button>
        <details class="cc-help"><summary>¿Cómo se juega?</summary>
          <p>Cada pista tiene dos partes: una <strong>definición</strong> (casi siempre al principio o al final) y un <strong>juego de palabras</strong> que lleva a la misma respuesta. Entre paréntesis va el número de letras.</p>
          <ul>${Object.entries(CRYPTIC_TYPES).map(([k, v]) => `<li><strong>${k}:</strong> ${v}</li>`).join('')}</ul>
          <p>Ejemplo: «Roma al revés es lo que siento por ti (4)». Definición: lo que siento por ti. Juego: ROMA al revés = AMOR.</p>
          <p>Piezas cortas que se usan mucho: notas musicales (DO, RE, MI, FA, SOL, LA, SI), símbolos químicos (NA sodio, FE hierro, CU cobre, O oxígeno), números romanos (D = 500, VI = 6) y puntos cardinales (N, S, E, O).</p>
        </details>
      </div>
      ${keyboardHtml([LETTER_ROWS[0], LETTER_ROWS[1], ['ENVIAR', ...LETTER_ROWS[2], 'BORRAR']])}
      <p class="game-msg" aria-live="polite"></p>`;
    this.root.querySelector('.kb').addEventListener('click', (e) => {
      const key = e.target.closest('[data-key]');
      if (key) this.press(key.dataset.key);
    });
    this.$('.cc-hint-btn').addEventListener('click', () => this.hint());
    this.#paint();
    this.#save();
  }

  onKey(key) {
    if (key === 'Enter') { this.press('ENVIAR'); return true; }
    if (key === 'Backspace') { this.press('BORRAR'); return true; }
    const letter = normalizeWord(key);
    if (letter.length === 1) { this.press(letter); return true; }
    return false;
  }

  press(key) {
    if (this.over) return;
    const msg = this.$('.game-msg');
    msg.textContent = '';
    msg.classList.remove('is-error');
    if (key === 'BORRAR') this.typed = this.typed.slice(0, -1);
    else if (key === 'ENVIAR') { this.#submit(); return; }
    else if (this.typed.length < this.letters.length) this.typed += key;
    this.#paint();
    this.#save();
  }

  hint() {
    if (this.over || this.hints >= Math.min(this.maxHints, 3)) return;
    this.hints += 1;
    this.sfx('word');
    this.hooks.onHint?.();
    this.#paint();
    this.#save();
  }

  #submit() {
    const msg = this.$('.game-msg');
    if (this.typed.length < this.letters.length) {
      msg.textContent = `Faltan letras: son ${this.letters.length}.`;
      msg.classList.add('is-error');
      return;
    }
    if (this.typed === this.letters) {
      this.over = true;
      this.#paint();
      msg.innerHTML = `¡Correcto! Era <strong>${escapeHtml(this.answer)}</strong>. ${escapeHtml(this.entry.explicacion || '')}`;
      this.win({ hints: this.hints });
      this.#save();
      return;
    }
    this.tries += 1;
    this.sfx('hit');
    if (this.tries >= this.maxTries) {
      this.over = true;
      this.typed = this.letters;
      this.#paint();
      msg.innerHTML = `Sin intentos. Era <strong>${escapeHtml(this.answer)}</strong>. ${escapeHtml(this.entry.explicacion || '')}`;
      msg.classList.add('is-error');
      this.lose();
      this.#save();
      return;
    }
    this.typed = '';
    this.#paint();
    this.#save();
    msg.textContent = 'No es esa. Busca la definición y el juego de palabras.';
    msg.classList.add('is-error');
  }

  #paint() {
    const boxes = this.root.querySelectorAll('.cc-box');
    boxes.forEach((box, i) => {
      box.textContent = this.typed[i] || (this.hints >= 3 && i === 0 ? this.letters[0] : '');
      box.classList.toggle('is-hinted', !this.typed[i] && this.hints >= 3 && i === 0);
      box.classList.toggle('is-next', !this.over && i === this.typed.length);
      box.classList.toggle('is-done', this.over);
    });
    const tipo = this.entry.tipo;
    const lines = [];
    if (this.hints >= 1) lines.push(`<li><strong>Tipo:</strong> ${escapeHtml(tipo)}${CRYPTIC_TYPES[tipo] ? ` — ${escapeHtml(CRYPTIC_TYPES[tipo])}` : ''}</li>`);
    if (this.hints >= 2) lines.push(`<li><strong>Definición:</strong> «${escapeHtml(this.entry.definicion)}»</li>`);
    if (this.hints >= 3) lines.push('<li><strong>Primera letra:</strong> ya está en la primera casilla.</li>');
    this.$('.cc-hints').innerHTML = lines.length ? `<ul>${lines.join('')}</ul>` : '';
    const btn = this.$('.cc-hint-btn');
    const allowed = Math.min(this.maxHints, 3);
    btn.disabled = this.over || this.hints >= allowed;
    btn.textContent = allowed ? `💡 Pista (${allowed - this.hints} de ${allowed})` : '💡 Sin pistas';
    const left = this.maxTries - this.tries;
    this.$('.mg-status').textContent = `Intentos: ${'●'.repeat(Math.max(0, left))}${'○'.repeat(Math.max(0, this.tries))}`;
  }
}

/* =====================================================================
   2. COSI-DLE: palabra de 5 letras
   ===================================================================== */
export class Cosidle extends MiniGame {
  static LENGTH = 5;
  get tries() { return this.dif.cosidleIntentos || 6; }

  start() {
    this.over = false;
    this.word = pickNew(this.data, this.word);
    this.rows = [];        // intentos ya enviados: [{ guess, marks }]
    this.current = '';
    this.keyState = {};    // mejor estado conocido de cada letra
    this.root.innerHTML = `
      <p class="mg-hint">Adivina la palabra de ${Cosidle.LENGTH} letras en ${this.tries} intentos.${this.dif.cosidleModoDificil ? ' <strong>Modo difícil:</strong> las letras que ya descubriste se tienen que usar, y las verdes en su lugar.' : ''}
        <span class="cd-legend"><i class="cd-ok"></i> lugar correcto <i class="cd-near"></i> está, en otro lugar <i class="cd-no"></i> no está</span></p>
      <div class="cd-grid" aria-label="Intentos"></div>
      <p class="game-msg" aria-live="polite"></p>
      ${keyboardHtml([LETTER_ROWS[0], LETTER_ROWS[1], ['ENVIAR', ...LETTER_ROWS[2], 'BORRAR']])}`;
    this.root.querySelector('.kb').addEventListener('click', (e) => {
      const key = e.target.closest('[data-key]');
      if (key) this.press(key.dataset.key);
    });
    this.#paint();
  }

  onKey(key) {
    if (key === 'Enter') { this.press('ENVIAR'); return true; }
    if (key === 'Backspace') { this.press('BORRAR'); return true; }
    const letter = normalizeWord(key);
    if (letter.length === 1) { this.press(letter); return true; }
    return false;
  }

  press(key) {
    if (this.over) return;
    const msg = this.$('.game-msg');
    msg.textContent = '';
    msg.classList.remove('is-error');
    if (key === 'BORRAR') this.current = this.current.slice(0, -1);
    else if (key === 'ENVIAR') { this.#submit(); return; }
    else if (this.current.length < Cosidle.LENGTH) this.current += key;
    this.#paint();
  }

  /** Marca cada letra: 'ok' (lugar correcto), 'near' (está en otro lugar) o 'no'. */
  static score(guess, word) {
    const marks = Array(word.length).fill('no');
    const pool = {};
    [...word].forEach((ch, i) => { if (guess[i] === ch) marks[i] = 'ok'; else pool[ch] = (pool[ch] || 0) + 1; });
    [...guess].forEach((ch, i) => {
      if (marks[i] === 'ok' || !pool[ch]) return;
      marks[i] = 'near';
      pool[ch] -= 1;
    });
    return marks;
  }

  #submit() {
    const msg = this.$('.game-msg');
    if (this.current.length < Cosidle.LENGTH) {
      msg.textContent = `Faltan letras: son ${Cosidle.LENGTH}.`;
      msg.classList.add('is-error');
      return;
    }
    const guess = this.current;
    const broken = this.dif.cosidleModoDificil && this.#hardModeError(guess);
    if (broken) {
      msg.textContent = broken;
      msg.classList.add('is-error');
      this.sfx('hit');
      return;
    }
    const marks = Cosidle.score(guess, this.word);
    this.rows.push({ guess, marks });
    this.current = '';
    const rank = { no: 1, near: 2, ok: 3 };
    [...guess].forEach((ch, i) => {
      if ((rank[this.keyState[ch]] || 0) < rank[marks[i]]) this.keyState[ch] = marks[i];
    });
    this.#paint();

    if (guess === this.word) {
      msg.textContent = `¡Era ${this.word}! Lo lograste en ${this.rows.length} intento${this.rows.length === 1 ? '' : 's'}.`;
      this.win({ tries: this.rows.length });
    } else if (this.rows.length >= this.tries) {
      msg.textContent = `Se acabaron los intentos. Era: ${this.word}`;
      msg.classList.add('is-error');
      this.lose();
    } else this.sfx('word');
  }

  /** Modo difícil: reusar las pistas de los intentos anteriores. */
  #hardModeError(guess) {
    for (const { guess: prev, marks } of this.rows) {
      for (let i = 0; i < marks.length; i++) {
        if (marks[i] === 'ok' && guess[i] !== prev[i]) return `Modo difícil: la letra ${i + 1} tiene que ser ${prev[i]}.`;
      }
      const need = {};
      marks.forEach((m, i) => { if (m !== 'no') need[prev[i]] = (need[prev[i]] || 0) + 1; });
      for (const [ch, n] of Object.entries(need)) {
        if ([...guess].filter((g) => g === ch).length < n) return `Modo difícil: tu palabra tiene que llevar ${ch}.`;
      }
    }
    return '';
  }

  #paint() {
    let html = '';
    for (let r = 0; r < this.tries; r++) {
      const row = this.rows[r];
      const text = row ? row.guess : r === this.rows.length ? this.current : '';
      for (let c = 0; c < Cosidle.LENGTH; c++) {
        html += `<div class="cd-cell ${row ? `cd-${row.marks[c]}` : text[c] ? 'is-filled' : ''}">${text[c] || ''}</div>`;
      }
    }
    this.$('.cd-grid').innerHTML = html;
    this.root.querySelectorAll('.kb-key').forEach((btn) => {
      const state = this.keyState[btn.dataset.key];
      btn.classList.toggle('cd-ok', state === 'ok');
      btn.classList.toggle('cd-near', state === 'near');
      btn.classList.toggle('cd-no', state === 'no');
    });
  }
}

/* =====================================================================
   3. EXAMEN SORPRESA: trivia de opción múltiple con tiempo
   ===================================================================== */
export class Trivia extends MiniGame {
  start() {
    this.over = false;
    clearInterval(this.interval);
    clearTimeout(this.timeout);
    const { preguntas, cuantas } = this.data;
    this.questions = shuffle(preguntas).slice(0, cuantas).map((q) => {
      // Las opciones también se revuelven: memorizar "era la B" no sirve
      const right = 'ABCD'.indexOf(String(q.correcta).toUpperCase());
      const order = shuffle(q.opciones.slice(0, 4).map((text, i) => ({ text, ok: i === right })));
      return { pregunta: q.pregunta, opciones: order.map((o) => o.text), right: order.findIndex((o) => o.ok) };
    });
    this.index = 0;
    this.correct = 0;
    this.#showQuestion();
  }

  onKey(key) {
    const i = 'abcd'.indexOf(String(key).toLowerCase());
    if (i >= 0 && !this.locked && !this.over) { this.answer(i); return true; }
    return false;
  }

  #showQuestion() {
    const q = this.questions[this.index];
    this.locked = false;
    this.left = this.data.segundos;
    this.root.innerHTML = `
      <p class="tv-title">📝 ${escapeHtml(this.data.titulo)}</p>
      <p class="mg-status">Pregunta ${this.index + 1} de ${this.questions.length} · Aciertos: ${this.correct} · Se aprueba con ${this.data.aprobar}</p>
      <div class="tv-timer"><div class="tv-timer-fill"></div></div>
      <p class="tv-question">${escapeHtml(q.pregunta)}</p>
      <div class="tv-options">
        ${q.opciones.slice(0, 4).map((opt, i) => `
          <button type="button" class="tv-option" data-option="${i}">
            <span class="tv-letter">${'ABCD'[i]}</span><span>${escapeHtml(opt)}</span>
          </button>`).join('')}
      </div>
      <p class="game-msg" aria-live="polite"></p>`;
    this.root.querySelector('.tv-options').addEventListener('click', (e) => {
      const btn = e.target.closest('[data-option]');
      if (btn) this.answer(Number(btn.dataset.option));
    });
    const fill = this.$('.tv-timer-fill');
    const startedAt = Date.now();
    clearInterval(this.interval);
    this.interval = setInterval(() => {
      const elapsed = (Date.now() - startedAt) / 1000;
      fill.style.width = `${Math.max(0, 100 * (1 - elapsed / this.data.segundos))}%`;
      if (elapsed >= this.data.segundos) this.answer(-1); // se acabó el tiempo
    }, 100);
  }

  answer(choice) {
    if (this.locked || this.over) return;
    this.locked = true;
    clearInterval(this.interval);
    const q = this.questions[this.index];
    const right = q.right;
    const ok = choice === right;
    if (ok) { this.correct += 1; this.sfx('word'); } else this.sfx('hit');

    this.root.querySelectorAll('.tv-option').forEach((btn, i) => {
      btn.disabled = true;
      if (i === right) btn.classList.add('is-right');
      else if (i === choice) btn.classList.add('is-wrong');
    });
    const msg = this.$('.game-msg');
    msg.textContent = ok ? '¡Correcto!' : choice < 0 ? `Se acabó el tiempo. Era la ${'ABCD'[right]}.` : `Incorrecto. Era la ${'ABCD'[right]}.`;
    msg.classList.toggle('is-error', !ok);

    this.timeout = setTimeout(() => {
      this.index += 1;
      if (this.index < this.questions.length) this.#showQuestion();
      else this.#finish();
    }, 1500);
  }

  #finish() {
    const total = this.questions.length;
    const passed = this.correct >= this.data.aprobar;
    this.root.innerHTML = `
      <p class="tv-title">📝 ${escapeHtml(this.data.titulo)}</p>
      <div class="tv-grade ${passed ? 'is-pass' : 'is-fail'}">
        <strong>${this.correct}/${total}</strong>
        <span>${passed ? 'APROBADO' : 'A EXTRAORDINARIO'}</span>
      </div>
      <p class="game-msg ${passed ? '' : 'is-error'}">${passed ? 'Tu novia está orgullosa. Y un poco sorprendida.' : `Necesitabas ${this.data.aprobar}. Repasa la materia y vuelve a intentarlo.`}</p>`;
    if (passed) this.win(); else this.lose();
  }
}

/* =====================================================================
   4. RETO DE AJEDREZ: mate en N (tablero desde FEN)
   ===================================================================== */
const PIECES = { k: '♚\uFE0E', q: '♛\uFE0E', r: '♜\uFE0E', b: '♝\uFE0E', n: '♞\uFE0E', p: '♟\uFE0E' };
const PIECE_NAMES = { k: 'rey', q: 'dama', r: 'torre', b: 'alfil', n: 'caballo', p: 'peón' };

/** FEN -> { board[8][8] (fila 0 = rank 8), turn: 'w'|'b' } */
export function parseFen(fen) {
  const [placement, turn = 'w'] = String(fen).trim().split(/\s+/);
  const board = placement.split('/').map((rank) => {
    const row = [];
    for (const ch of rank) {
      if (/\d/.test(ch)) for (let i = 0; i < Number(ch); i++) row.push(null);
      else row.push(ch);
    }
    while (row.length < 8) row.push(null);
    return row.slice(0, 8);
  });
  return { board, turn: turn === 'b' ? 'b' : 'w' };
}
const squareName = (r, c) => `${'abcdefgh'[c]}${8 - r}`;

export class ChessPuzzle extends MiniGame {
  get maxAttempts() { return this.dif.ajedrezIntentos || 3; }

  start() {
    this.over = false;
    clearInterval(this.interval);
    clearTimeout(this.timeout);
    this.puzzle = pickNew(this.data, this.puzzle);
    const { board, turn } = parseFen(this.puzzle.fen);
    this.board = board;
    this.turn = turn;          // bando de quien resuelve (no cambia)
    this.selected = null;
    this.lastMove = null;
    this.step = 0;             // jugada actual dentro de `solution`
    this.waiting = false;
    this.attempts = this.maxAttempts;
    this.solution = this.puzzle.solucion;   // ['f4-f7', 'h7-h8', 'f7-g7']
    const n = Math.ceil(this.solution.length / 2);
    this.root.innerHTML = `
      <p class="tv-title">♟️ ${escapeHtml(this.puzzle.titulo || 'Reto de ajedrez')}</p>
      <p class="mg-hint">Juegan <strong>${turn === 'w' ? 'blancas' : 'negras'}</strong> y dan mate en ${n}.${n > 1 ? ' El rival contesta solo después de tu jugada.' : ''} Toca la pieza y luego la casilla de destino.</p>
      <div class="ch-board" role="grid" aria-label="Tablero de ajedrez"></div>
      <p class="mg-status" aria-live="polite"></p>
      <p class="game-msg" aria-live="polite"></p>`;
    this.$('.ch-board').addEventListener('click', (e) => {
      const sq = e.target.closest('[data-r]');
      if (sq) this.tap(Number(sq.dataset.r), Number(sq.dataset.c));
    });

    const seconds = this.dif.ajedrezSegundos || 0;
    this.deadline = seconds ? Date.now() + seconds * 1000 : 0;
    if (this.deadline) {
      this.interval = setInterval(() => {
        if (this.over) return clearInterval(this.interval);
        if (Date.now() >= this.deadline) this.#fail('Se acabó el tiempo.');
        else this.#status();
      }, 250);
    }
    this.#paint();
  }

  #isOwn(piece) {
    if (!piece) return false;
    return (piece === piece.toUpperCase()) === (this.turn === 'w');
  }

  #apply(move) {
    const [from, to] = move.split('-');
    const fc = from.charCodeAt(0) - 97; const fr = 8 - Number(from[1]);
    const tc = to.charCodeAt(0) - 97; const tr = 8 - Number(to[1]);
    this.board[tr][tc] = this.board[fr][fc];
    this.board[fr][fc] = null;
    this.lastMove = [[fr, fc], [tr, tc]];
  }

  tap(r, c) {
    if (this.over || this.waiting) return;
    const piece = this.board[r][c];
    const msg = this.$('.game-msg');
    msg.textContent = '';
    msg.classList.remove('is-error');

    if (!this.selected || this.#isOwn(piece)) {
      // Elegir (o cambiar) la pieza que se va a mover
      if (!this.#isOwn(piece)) {
        msg.textContent = `Toca primero una pieza ${this.turn === 'w' ? 'blanca' : 'negra'}.`;
        msg.classList.add('is-error');
        return;
      }
      this.selected = this.selected && this.selected[0] === r && this.selected[1] === c ? null : [r, c];
      this.#paint();
      return;
    }

    const [fr, fc] = this.selected;
    const move = `${squareName(fr, fc)}-${squareName(r, c)}`;
    this.selected = null;
    if (move !== this.solution[this.step]) {
      this.attempts -= 1;
      this.sfx('hit');
      if (this.attempts <= 0) { this.#fail('Esa no era.'); return; }
      this.#paint();
      msg.textContent = 'Esa no es la jugada. Calcula otra vez.';
      msg.classList.add('is-error');
      return;
    }

    this.#apply(move);
    this.step += 1;
    if (this.step >= this.solution.length) {
      clearInterval(this.interval);
      this.over = true;
      this.#paint();
      msg.textContent = `¡Jaque mate! ${this.puzzle.nota || ''}`;
      this.win();
      return;
    }
    // Contesta el rival
    this.sfx('word');
    this.waiting = true;
    this.#paint();
    msg.textContent = 'Bien. El rival piensa...';
    this.timeout = setTimeout(() => {
      this.waiting = false;
      if (this.over) return;
      this.#apply(this.solution[this.step]);
      this.step += 1;
      this.#paint();
      msg.textContent = 'Te toca. Remata.';
    }, 700);
  }

  #fail(reason) {
    clearInterval(this.interval);
    this.over = true;
    this.#paint();
    const rest = this.solution.slice(this.step).map((m) => m.replace('-', '→')).join(', ');
    const msg = this.$('.game-msg');
    msg.textContent = `${reason} La línea era: ${rest}. ${this.puzzle.nota || ''}`;
    msg.classList.add('is-error');
    this.lose();
  }

  #status() {
    const left = Math.max(0, this.attempts);
    let text = `Intentos: ${'●'.repeat(left)}${'○'.repeat(Math.max(0, this.maxAttempts - left))}`;
    if (this.deadline) {
      const s = Math.max(0, Math.ceil((this.deadline - Date.now()) / 1000));
      text += ` · ⏱ ${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
    }
    this.$('.mg-status').textContent = text;
  }

  #paint() {
    let html = '';
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = this.board[r][c];
        const dark = (r + c) % 2 === 1;
        const sel = this.selected && this.selected[0] === r && this.selected[1] === c;
        const moved = this.lastMove?.some(([mr, mc]) => mr === r && mc === c);
        const label = `${squareName(r, c)}${piece ? ` ${PIECE_NAMES[piece.toLowerCase()]} ${piece === piece.toUpperCase() ? 'blanco' : 'negro'}` : ''}`;
        html += `<button type="button" class="ch-sq ${dark ? 'is-dark' : 'is-light'} ${sel ? 'is-selected' : ''} ${moved ? 'is-moved' : ''}" data-r="${r}" data-c="${c}" aria-label="${label}">
          ${piece ? `<span class="ch-piece ${piece === piece.toUpperCase() ? 'is-white' : 'is-black'}">${PIECES[piece.toLowerCase()] || ''}</span>` : ''}
          ${c === 0 ? `<i class="ch-rank">${8 - r}</i>` : ''}${r === 7 ? `<i class="ch-file">${'abcdefgh'[c]}</i>` : ''}
        </button>`;
      }
    }
    this.$('.ch-board').innerHTML = html;
    this.#status();
  }
}
