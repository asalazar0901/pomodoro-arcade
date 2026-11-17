/* =====================================================================
   minigames.js — Minijuegos de palabras, trivia y ajedrez.
     - Hangman      "Salva el Malvavisco" (ahorcado)
     - Cosidle      adivina la palabra de 5 letras en 6 intentos
     - Trivia       examen sorpresa de opción múltiple con tiempo
     - ChessPuzzle  mate en 1 sobre un tablero dibujado desde un FEN

   Todos reciben sus datos de public/contenido/juegos.js (ver gamedata.js)
   y comparten la misma forma:
       const juego = new Hangman(contenedor, datos, { onWin, onLose, sfx });
       juego.start();     // partida nueva
       juego.destroy();   // al salir (quita teclado y temporizadores)
   ===================================================================== */

import { normalizeWord } from './gamedata.js';

const pick = (list) => list[Math.floor(Math.random() * list.length)];
const escapeHtml = (s) => String(s).replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));

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
  constructor(root, data, hooks = {}) {
    this.root = root;
    this.data = data;
    this.hooks = hooks;
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

export class Hangman extends MiniGame {
  static MAX_FAILS = 6;

  start() {
    this.over = false;
    this.entry = pickNew(this.data, this.entry);
    this.word = this.entry.palabra;          // ya viene en MAYÚSCULAS y sin tildes
    this.guessed = new Set();
    this.fails = 0;
    this.villain = pick(VILLAINS);
    this.root.innerHTML = `
      <p class="mg-hint"><strong>Pista:</strong> ${escapeHtml(this.entry.pista || 'Sin pista. Suerte.')}</p>
      <div class="hm-track" aria-hidden="true">
        <div class="hm-villain" style="background-image:url('${this.villain.sprite}')"></div>
        <img class="hm-prize" src="assets/malvavisco_v2.png" alt="" />
      </div>
      <p class="mg-status" aria-live="polite"></p>
      <p class="hm-word" aria-label="Palabra"></p>
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
    } else if (this.fails >= Hangman.MAX_FAILS) {
      this.#paint(true);
      const msg = this.$('.game-msg');
      msg.textContent = `${this.villain.name} se comió el malvavisco. Era: ${this.word}`;
      msg.classList.add('is-error');
      this.lose();
    }
  }

  #paint(reveal = false) {
    this.$('.hm-word').innerHTML = [...this.word].map((ch) => {
      if (ch === ' ') return '<span class="hm-gap"></span>';
      const shown = this.guessed.has(ch) || reveal;
      return `<span class="hm-letter ${shown && !this.guessed.has(ch) ? 'is-missed' : ''}">${shown ? ch : ''}</span>`;
    }).join('');
    const left = Hangman.MAX_FAILS - this.fails;
    this.$('.mg-status').textContent = left > 0
      ? `${this.villain.name} está a ${left} paso${left === 1 ? '' : 's'} del malvavisco.`
      : `${this.villain.name} llegó al malvavisco.`;
    this.$('.hm-villain').style.left = `calc(${(this.fails / Hangman.MAX_FAILS) * 100}% - ${(this.fails / Hangman.MAX_FAILS) * 96}px)`;
    this.$('.hm-track').classList.toggle('is-lost', this.fails >= Hangman.MAX_FAILS);
    this.root.querySelectorAll('.kb-key').forEach((btn) => {
      const k = btn.dataset.key;
      btn.disabled = this.guessed.has(k);
      btn.classList.toggle('is-hit', this.guessed.has(k) && this.word.includes(k));
      btn.classList.toggle('is-miss', this.guessed.has(k) && !this.word.includes(k));
    });
  }
}

/* =====================================================================
   2. COSI-DLE: palabra de 5 letras en 6 intentos
   ===================================================================== */
export class Cosidle extends MiniGame {
  static TRIES = 6;
  static LENGTH = 5;

  start() {
    this.over = false;
    this.word = pickNew(this.data, this.word);
    this.rows = [];        // intentos ya enviados: [{ guess, marks }]
    this.current = '';
    this.keyState = {};    // mejor estado conocido de cada letra
    this.root.innerHTML = `
      <p class="mg-hint">Adivina la palabra de ${Cosidle.LENGTH} letras en ${Cosidle.TRIES} intentos.
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
      this.win();
    } else if (this.rows.length >= Cosidle.TRIES) {
      msg.textContent = `Se acabaron los intentos. Era: ${this.word}`;
      msg.classList.add('is-error');
      this.lose();
    } else this.sfx('word');
  }

  #paint() {
    let html = '';
    for (let r = 0; r < Cosidle.TRIES; r++) {
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
    this.questions = [...preguntas].sort(() => Math.random() - 0.5).slice(0, cuantas);
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
    const right = 'ABCD'.indexOf(String(q.correcta).toUpperCase());
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
   4. RETO DE AJEDREZ: mate en 1 (tablero desde FEN)
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
  static ATTEMPTS = 3;

  start() {
    this.over = false;
    this.puzzle = pickNew(this.data, this.puzzle);
    const { board, turn } = parseFen(this.puzzle.fen);
    this.board = board;
    this.turn = turn;
    this.selected = null;
    this.attempts = ChessPuzzle.ATTEMPTS;
    this.solution = this.puzzle.solucion.toLowerCase().replace(/\s/g, '');
    this.root.innerHTML = `
      <p class="tv-title">♟️ ${escapeHtml(this.puzzle.titulo || 'Reto de ajedrez')}</p>
      <p class="mg-hint">Juegan <strong>${turn === 'w' ? 'blancas' : 'negras'}</strong> y dan mate en 1. Toca la pieza y luego la casilla de destino.</p>
      <div class="ch-board" role="grid" aria-label="Tablero de ajedrez"></div>
      <p class="mg-status" aria-live="polite"></p>
      <p class="game-msg" aria-live="polite"></p>`;
    this.$('.ch-board').addEventListener('click', (e) => {
      const sq = e.target.closest('[data-r]');
      if (sq) this.tap(Number(sq.dataset.r), Number(sq.dataset.c));
    });
    this.#paint();
  }

  #isOwn(piece) {
    if (!piece) return false;
    return (piece === piece.toUpperCase()) === (this.turn === 'w');
  }

  tap(r, c) {
    if (this.over) return;
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
    if (move === this.solution) {
      this.board[r][c] = this.board[fr][fc];
      this.board[fr][fc] = null;
      this.selected = null;
      this.lastMove = [[fr, fc], [r, c]];
      this.#paint();
      msg.textContent = `¡Jaque mate! ${this.puzzle.nota || ''}`;
      this.win();
      return;
    }

    this.attempts -= 1;
    this.selected = null;
    this.sfx('hit');
    if (this.attempts <= 0) {
      const [from, to] = this.solution.split('-');
      this.#paint();
      msg.textContent = `Sin intentos. La solución era ${from} a ${to}. ${this.puzzle.nota || ''}`;
      msg.classList.add('is-error');
      this.lose();
    } else {
      this.#paint();
      msg.textContent = 'Esa no da mate. Calcula otra vez.';
      msg.classList.add('is-error');
    }
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
    this.lastMove = this.over ? this.lastMove : null;
    this.$('.mg-status').textContent = `Intentos: ${'●'.repeat(Math.max(0, this.attempts))}${'○'.repeat(ChessPuzzle.ATTEMPTS - Math.max(0, this.attempts))}`;
  }
}
