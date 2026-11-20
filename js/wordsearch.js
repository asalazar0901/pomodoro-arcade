/* =====================================================================
   wordsearch.js — Minijuego 1: Sopa de letras con generador automático.
   ===================================================================== */

/* Mapas (niveles). Se llenan desde public/contenido/juegos.js con setMaps(). */
export const WORD_MAPS = {};
let DIF = {};

/**
 * Recibe la lista `sopa` y el bloque `dificultad` de juegos.js y calcula
 * el tamaño de cada cuadrícula. Con señuelos la cuadrícula crece.
 */
export function setMaps(list, dif = {}) {
  DIF = dif || {};
  Object.keys(WORD_MAPS).forEach((k) => delete WORD_MAPS[k]);
  for (const m of list) {
    const longest = Math.max(...m.palabras.map((w) => w.length));
    const letters = m.palabras.reduce((n, w) => n + w.length, 0);
    const base = Math.max(longest + 2, Math.ceil(Math.sqrt(letters * 2.6))) + (DIF.sopaSenuelos ? 4 : 0);
    const size = Math.max(8, Math.min(15, base));
    WORD_MAPS[m.id] = { title: m.titulo, size, words: m.palabras };
  }
}

// Las 8 direcciones posibles [fila, columna]
const DIRECTIONS = [
  [0, 1], [1, 0], [1, 1], [-1, 1],
  [0, -1], [-1, 0], [-1, -1], [1, -1],
];
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const rand = (n) => Math.floor(Math.random() * n);

/** Cuántas veces aparece `word` en la cuadrícula (en las 8 direcciones). */
function countWord(grid, word) {
  const n = grid.length;
  let count = 0;
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (grid[r][c] !== word[0]) continue;
      for (const [dr, dc] of DIRECTIONS) {
        let i = 1;
        while (i < word.length) {
          const rr = r + dr * i; const cc = c + dc * i;
          if (rr < 0 || rr >= n || cc < 0 || cc >= n || grid[rr][cc] !== word[i]) break;
          i += 1;
        }
        if (i === word.length) count += 1;
      }
    }
  }
  return word.length > 1 && [...word].reverse().join('') === word ? count / 2 : count;
}

/** Palabras a medias o con una letra cambiada, para despistar. */
function makeDecoys(words) {
  const decoys = [];
  for (const w of words) {
    if (w.length < 4) continue;
    decoys.push(w.slice(0, -1));                                       // le falta la última
    const i = 1 + rand(w.length - 2);
    let other;
    do { other = w[rand(w.length)]; } while (other === w[i] && new Set(w).size > 1);
    decoys.push(w.slice(0, i) + other + w.slice(i + 1));                 // una letra cambiada
  }
  return decoys;
}

/**
 * Genera una cuadrícula con todas las palabras colocadas.
 * Con `hard`, rellena con letras de las mismas palabras y siembra señuelos,
 * cuidando que cada palabra real aparezca una sola vez.
 * @returns {{grid: string[][], placements: {word, cells: [r,c][]}[]}}
 */
export function generatePuzzle(words, size, hard = false) {
  const list = words.map((w) => w.toUpperCase()).sort((a, b) => b.length - a.length);

  for (let attempt = 0; attempt < 200; attempt++) {
    const grid = Array.from({ length: size }, () => Array(size).fill(''));
    const placements = [];
    let ok = true;

    for (const word of list) {
      let placed = false;
      for (let tries = 0; tries < 400 && !placed; tries++) {
        const [dr, dc] = DIRECTIONS[rand(DIRECTIONS.length)];
        const r0 = rand(size);
        const c0 = rand(size);
        const rEnd = r0 + dr * (word.length - 1);
        const cEnd = c0 + dc * (word.length - 1);
        if (rEnd < 0 || rEnd >= size || cEnd < 0 || cEnd >= size) continue;

        // ¿Cabe? Solo puede cruzarse con otra palabra si la letra coincide.
        const cells = [];
        let fits = true;
        for (let i = 0; i < word.length; i++) {
          const r = r0 + dr * i;
          const c = c0 + dc * i;
          if (grid[r][c] && grid[r][c] !== word[i]) { fits = false; break; }
          cells.push([r, c]);
        }
        if (!fits) continue;

        cells.forEach(([r, c], i) => { grid[r][c] = word[i]; });
        placements.push({ word, cells });
        placed = true;
      }
      if (!placed) { ok = false; break; }
    }

    if (!ok) continue;

    if (hard) {
      // Señuelos: se colocan donde quepan (si no caben, no pasa nada)
      for (const decoy of makeDecoys(list)) {
        for (let tries = 0; tries < 60; tries++) {
          const [dr, dc] = DIRECTIONS[rand(DIRECTIONS.length)];
          const r0 = rand(size); const c0 = rand(size);
          const cells = [];
          let fits = true;
          for (let i = 0; i < decoy.length && fits; i++) {
            const r = r0 + dr * i; const c = c0 + dc * i;
            if (r < 0 || r >= size || c < 0 || c >= size || (grid[r][c] && grid[r][c] !== decoy[i])) fits = false;
            else cells.push([r, c]);
          }
          if (!fits) continue;
          cells.forEach(([r, c], i) => { grid[r][c] = decoy[i]; });
          break;
        }
      }
    }

    // Relleno: en difícil, con las mismas letras de las palabras
    const pool = hard ? list.join('') : ALPHABET;
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (!grid[r][c]) grid[r][c] = pool[rand(pool.length)];
      }
    }
    if (hard && list.some((w) => countWord(grid, w) !== 1)) continue;
    return { grid, placements };
  }
  throw new Error('No se pudo generar la sopa de letras');
}

export class WordSearch {
  /**
   * @param {object} els  { grid, words, msg, title } elementos del DOM
   * @param {object} hooks { onComplete(mapId), onWordFound(word) }
   */
  constructor(els, hooks = {}) {
    this.els = els;
    this.hooks = hooks;
    this.mapId = null;
    this.found = new Set();
    this.anchor = null; // primera celda en modo "toca inicio y fin"
    this.dragStart = null;
    this.dragMoved = false;
    this.#bind();
  }

  /** Carga (o regenera) un mapa. */
  load(mapId = this.mapId) {
    const map = WORD_MAPS[mapId];
    if (!map) return;
    this.mapId = mapId;
    this.map = map;
    this.found = new Set();
    this.anchor = null;
    this.completed = false;
    this.lost = false;
    const { grid, placements } = generatePuzzle(map.words, map.size, !!DIF.sopaSenuelos);
    this.grid = grid;
    this.placements = placements;
    this.#render();
    this.#startClock();
  }

  /* ---------- reloj (dificultad.sopaSegundos) ---------- */
  #startClock() {
    clearInterval(this.clock);
    const el = this.els.timer;
    const seconds = DIF.sopaSegundos || 0;
    if (el) el.textContent = '';
    if (!seconds) return;
    const deadline = Date.now() + seconds * 1000;
    const tick = () => {
      // Si salió del juego, la partida se abandona
      if (!this.els.grid.isConnected || this.els.grid.closest('[hidden]')) { clearInterval(this.clock); return; }
      if (this.completed) { clearInterval(this.clock); return; }
      const s = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      if (el) {
        el.textContent = `⏱ ${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')} · ${this.found.size}/${this.map.words.length} palabras`;
        el.classList.toggle('is-error', s <= 20);
      }
      if (s <= 0) {
        clearInterval(this.clock);
        this.completed = true;
        this.lost = true;
        this.#reveal();
        this.hooks.onTimeUp?.(this.mapId);
      }
    };
    tick();
    this.clock = setInterval(tick, 250);
  }

  /** Al perder: marca dónde estaban las que faltaron. */
  #reveal() {
    for (const { word, cells } of this.placements) {
      if (this.found.has(word)) continue;
      cells.forEach(([r, c]) => this.cells[r][c].classList.add('missed'));
      const li = this.els.words.querySelector(`[data-word="${word}"]`);
      if (li) { li.textContent = word; li.classList.add('missed'); }
    }
  }

  stop() { clearInterval(this.clock); }

  /* ---------- render ---------- */
  #render() {
    const { grid: gridEl, words: wordsEl, msg, title } = this.els;
    if (title) title.textContent = this.map.title;
    msg.textContent = '';
    gridEl.style.setProperty('--n', this.map.size);
    gridEl.innerHTML = '';
    this.cells = [];
    this.grid.forEach((row, r) => {
      this.cells[r] = [];
      row.forEach((letter, c) => {
        const cell = document.createElement('div');
        cell.className = 'ws-cell';
        cell.textContent = letter;
        cell.dataset.r = r;
        cell.dataset.c = c;
        gridEl.appendChild(cell);
        this.cells[r][c] = cell;
      });
    });
    wordsEl.innerHTML = '';
    this.map.words.forEach((w) => {
      const li = document.createElement('li');
      // Palabras ocultas: solo la inicial y cuántas letras lleva
      li.textContent = DIF.sopaOcultarPalabras ? `${w[0]}${'·'.repeat(w.length - 1)} (${w.length})` : w;
      li.dataset.word = w.toUpperCase();
      wordsEl.appendChild(li);
    });
  }

  /* ---------- selección (arrastre o dos toques) ---------- */
  #bind() {
    const gridEl = this.els.grid;

    const cellAt = (e) => {
      const el = document.elementFromPoint(e.clientX, e.clientY);
      if (!el || !el.classList.contains('ws-cell') || !gridEl.contains(el)) return null;
      return [Number(el.dataset.r), Number(el.dataset.c)];
    };

    gridEl.addEventListener('pointerdown', (e) => {
      const pos = cellAt(e);
      if (!pos || this.completed) return;
      e.preventDefault();
      this.dragStart = pos;
      this.dragMoved = false;
      this.#paint(this.#line(pos, pos));
    });

    gridEl.addEventListener('pointermove', (e) => {
      if (!this.dragStart) return;
      const pos = cellAt(e);
      if (!pos) return;
      if (pos[0] !== this.dragStart[0] || pos[1] !== this.dragStart[1]) this.dragMoved = true;
      this.#paint(this.#line(this.dragStart, pos));
    });

    const end = (e) => {
      if (!this.dragStart) return;
      const start = this.dragStart;
      const pos = cellAt(e) || start;
      this.dragStart = null;

      if (this.dragMoved) {
        // Arrastre normal
        this.anchor = null;
        this.#check(this.#line(start, pos));
      } else if (this.anchor) {
        // Segundo toque: de la celda ancla a esta
        const line = this.#line(this.anchor, pos);
        this.anchor = null;
        this.#check(line);
      } else {
        // Primer toque: queda marcada como ancla
        this.anchor = pos;
      }
      this.#paint(null);
    };
    gridEl.addEventListener('pointerup', end);
    gridEl.addEventListener('pointercancel', () => { this.dragStart = null; this.#paint(null); });
    gridEl.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse' && this.dragStart) end(e); });
  }

  /** Celdas en línea recta (horizontal, vertical o diagonal) entre a y b. */
  #line(a, b) {
    const dr = b[0] - a[0];
    const dc = b[1] - a[1];
    if (!(dr === 0 || dc === 0 || Math.abs(dr) === Math.abs(dc))) return null;
    const len = Math.max(Math.abs(dr), Math.abs(dc));
    const sr = Math.sign(dr);
    const sc = Math.sign(dc);
    const cells = [];
    for (let i = 0; i <= len; i++) cells.push([a[0] + sr * i, a[1] + sc * i]);
    return cells;
  }

  #paint(line) {
    this.cells?.flat().forEach((el) => el.classList.remove('sel', 'anchor'));
    if (line) line.forEach(([r, c]) => this.cells[r][c].classList.add('sel'));
    if (this.anchor) this.cells[this.anchor[0]][this.anchor[1]].classList.add('anchor');
  }

  #check(line) {
    if (!line || line.length < 2) return;
    const text = line.map(([r, c]) => this.grid[r][c]).join('');
    const reversed = [...text].reverse().join('');
    const target = this.map.words.map((w) => w.toUpperCase()).find((w) => !this.found.has(w) && (w === text || w === reversed));
    if (!target) return;

    this.found.add(target);
    line.forEach(([r, c]) => this.cells[r][c].classList.add('found'));
    const li = this.els.words.querySelector(`[data-word="${target}"]`);
    if (li) { li.textContent = target; li.classList.add('found'); }
    this.hooks.onWordFound?.(target);

    if (this.found.size === this.map.words.length) {
      this.completed = true;
      this.hooks.onComplete?.(this.mapId);
    }
  }
}
