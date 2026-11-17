/* =====================================================================
   wordsearch.js — Minijuego 1: Sopa de letras con generador automático.
   ===================================================================== */

/* Mapas (niveles). Se llenan desde public/contenido/juegos.js con setMaps(). */
export const WORD_MAPS = {};

/** Recibe la lista `sopa` de juegos.js y calcula el tamaño de cada cuadrícula. */
export function setMaps(list) {
  Object.keys(WORD_MAPS).forEach((k) => delete WORD_MAPS[k]);
  for (const m of list) {
    const longest = Math.max(...m.palabras.map((w) => w.length));
    const letters = m.palabras.reduce((n, w) => n + w.length, 0);
    const size = Math.max(8, Math.min(15, Math.max(longest + 2, Math.ceil(Math.sqrt(letters * 2.6)))));
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

/**
 * Genera una cuadrícula con todas las palabras colocadas.
 * @returns {{grid: string[][], placements: {word, cells: [r,c][]}[]}}
 */
export function generatePuzzle(words, size) {
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
    // Relleno con letras al azar
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (!grid[r][c]) grid[r][c] = ALPHABET[rand(ALPHABET.length)];
      }
    }
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
    const { grid, placements } = generatePuzzle(map.words, map.size);
    this.grid = grid;
    this.placements = placements;
    this.#render();
  }

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
      li.textContent = w;
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
    this.els.words.querySelector(`[data-word="${target}"]`)?.classList.add('found');
    this.hooks.onWordFound?.(target);

    if (this.found.size === this.map.words.length) {
      this.completed = true;
      this.hooks.onComplete?.(this.mapId);
    }
  }
}
