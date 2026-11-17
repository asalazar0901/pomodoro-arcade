/* =====================================================================
   arcade.js — Minijuego 2: Arcade de supervivencia (HTML5 Canvas).
   Vista top-down. El ingeniero recoge snacks y esquiva a los jefes.
   ===================================================================== */

/* ---------------------------------------------------------------------
   SPRITES — AQUÍ VAN LAS RUTAS DE TUS IMÁGENES (Midjourney v5.2)
   ---------------------------------------------------------------------
   Guarda cada PNG (fondo transparente) en la carpeta /assets y pon su
   ruta en `src`. Mientras `src` sea null, el juego dibuja un placeholder
   en pixel art hecho por código, así que funciona sin ninguna imagen.

   - Si tu imagen es una hoja de animación horizontal (varios cuadros en
     fila, como la del ingeniero), indica cuántos cuadros trae en `frames`.
   - Si es una sola imagen, deja frames: 1.
   - `size` es el alto en píxeles con el que se dibuja dentro del juego.
   --------------------------------------------------------------------- */
export const SPRITES = {
  // Jugador
  player:     { src: 'assets/ingeniero_v5.2.png', frames: 4, size: 52 },
  // Enemigos
  homelander: { src: null /* 'assets/homelander_v5.2.png' */, frames: 1, size: 44 },
  vader:      { src: null /* 'assets/vader_v5.2.png' */,      frames: 1, size: 44 },
  salov:      { src: null /* 'assets/salov_v5.2.png' */,      frames: 1, size: 44 },
  zombie:     { src: 'assets/zombi_v5.2.png', frames: 4, size: 44 },
  // Coleccionables
  skittles:   { src: null /* 'assets/skittles_v5.2.png' */,   frames: 1, size: 22 },
  gomitas:    { src: null /* 'assets/gomitas_v5.2.png' */,    frames: 1, size: 22 },
  puffs:      { src: null /* 'assets/brazy_puffs_v5.2.png' */, frames: 1, size: 24 },
  // Power-ups
  redbull:    { src: null /* 'assets/redbull_green_v5.2.png' */, frames: 1, size: 28 },
  caldo:      { src: null /* 'assets/caldo_mama_v5.2.png' */,    frames: 1, size: 28 },
  // Obstáculos (ocupan una casilla completa de 32x32)
  estereofon: { src: null /* 'assets/estereofon_v5.2.png' */, frames: 1, size: 32 },
  zapallo:    { src: null /* 'assets/zapallo_v5.2.png' */,    frames: 1, size: 32 },
};

/* ---------------------------------------------------------------------
   AJUSTES DEL JUEGO (cámbialos con confianza)
   --------------------------------------------------------------------- */
export const ARCADE_TICKET_SCORE = 300; // "X puntos" que otorgan 1 Ticket

const TILE = 32;
const COLS = 15;
const ROWS = 15;

const CFG = {
  lives: 3,
  playerSpeed: 125,       // px por segundo
  foamSlow: 0.45,         // multiplicador sobre Estereofón
  redbullBoost: 1.9,      // multiplicador de supervelocidad
  redbullTime: 6,         // segundos
  caldoTime: 5,           // segundos de invencibilidad
  hitInvuln: 2,           // segundos de parpadeo tras un golpe
  snacksOnMap: 6,
  powerupEvery: 9,        // cada cuántos segundos aparece un power-up
  powerupLife: 10,        // segundos antes de desaparecer
  zapallos: 12,
  foams: 12,
  // Momento (segundos) en el que entra cada enemigo
  enemySchedule: [
    { type: 'vader', at: 0 },
    { type: 'homelander', at: 6 },
    { type: 'salov', at: 14 },
    { type: 'zombie', at: 28 }, // extra: quítalo de la lista si no lo quieres
  ],
};

const SNACKS = {
  skittles: { points: 10, weight: 5 },
  gomitas:  { points: 20, weight: 3 },
  puffs:    { points: 30, weight: 2 },
};

const ENEMY_LABELS = { homelander: 'HOMELANDER', vader: 'VADER', salov: 'SALOV', zombie: 'ZOMBI' };

// Tipos de casilla
const FLOOR = 0, WALL = 1, ZAPALLO = 2, FOAM = 3;

/* ---------------------------------------------------------------------
   PLACEHOLDERS EN PIXEL ART (se usan cuando el sprite no tiene imagen)
   Cada letra es un color de la paleta; el punto es transparente.
   --------------------------------------------------------------------- */
const PLACEHOLDERS = {
  homelander: {
    palette: { y: '#f4d35e', s: '#f1c9a5', k: '#1b1b26', b: '#1d4e89', r: '#c1121f', w: '#ffffff' },
    rows: ['..yyyy..', '..ssss..', '..ksks..', '..ssss..', 'rbbbbbbr', 'rbbwwbbr', 'rbbbbbbr', 'r.bbbb.r', '..b..b..', '..r..r..'],
  },
  vader: {
    palette: { k: '#15151c', g: '#8d99ae', r: '#d1495b', b: '#2f6fed' },
    rows: ['..kkkk..', '.kkkkkk.', '.kgkkgk.', '.kkggkk.', 'kkkkkkkk', 'kkrgbkkk', 'kkkkkkkk', 'kkkkkkkk', '.kk..kk.', '.kk..kk.'],
  },
  salov: {
    palette: { g: '#c9c9c9', s: '#f1c9a5', k: '#1b1b26', n: '#5b4636', w: '#ffffff' },
    rows: ['..gggg..', '..ssss..', '..ksks..', '..ssss..', '.nnwwnn.', '.nnwwnn.', 'snnnnnns', '..nnnn..', '..n..n..', '..k..k..'],
  },
  zombie: {
    palette: { g: '#8fbf6a', k: '#1b1b26', b: '#1d6fa5', n: '#22304f' },
    rows: ['..gggg..', '.gggggg.', '.gkggkg.', '..gggg..', '.bbbbbb.', 'ggbbbbgg', '.bbbbbb.', '..nnnn..', '..n..n..', '..g..g..'],
  },
  player: {
    palette: { y: '#f2b632', s: '#c68642', k: '#1b1b26', n: '#6f4e37', w: '#bcd4f6', b: '#2f6fed', t: '#c8a27c' },
    rows: ['..yyyy..', '.yyyyyy.', '..ksks..', '..ssss..', '.nnwwnn.', '.nnwwnn.', 'snnwwnns', '..bbbb..', '..b..b..', '..t..t..'],
  },
  skittles: {
    palette: { r: '#d1495b', w: '#ffffff' },
    rows: ['..rrrr..', '.rrrrrr.', 'rrwwwrrr', 'rrwrrrrr', 'rrrwwrrr', 'rrrrrwrr', '.rwwwrr.', '..rrrr..'],
  },
  gomitas: {
    palette: { g: '#3fa34d', k: '#1b1b26' },
    rows: ['.g....g.', '.gggggg.', '.gkggkg.', '.gggggg.', 'gggggggg', '.gggggg.', '.gggggg.', '.gg..gg.'],
  },
  puffs: {
    palette: { o: '#e76f51', y: '#f4d35e' },
    rows: ['.oooooo.', 'oyyyyyyo', 'oyooooyo', 'oyoyyoyo', 'oyoyyoyo', 'oyooooyo', 'oyyyyyyo', '.oooooo.'],
  },
  redbull: {
    palette: { s: '#c9c9c9', g: '#2a9d4b', r: '#d1495b' },
    rows: ['..ssss..', '.gggggg.', '.gggggg.', '.grrggg.', '.ggrrgg.', '.gggggg.', '.gggggg.', '..ssss..'],
  },
  caldo: {
    palette: { w: '#ffffff', b: '#2f6fed', y: '#f4d35e' },
    rows: ['..w..w..', '.w..w...', '..w..w..', 'bbbbbbbb', 'byyyyyyb', '.bbbbbb.', '..bbbb..', '.bbbbbb.'],
  },
};

const rand = (n) => Math.floor(Math.random() * n);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const tileCenter = (t) => t * TILE + TILE / 2;

/* =====================================================================
   CLASE PRINCIPAL
   ===================================================================== */
export class ArcadeGame {
  /**
   * @param {HTMLCanvasElement} canvas
   * @param {object} hooks
   * @param {(score:number, lives:number) => void} hooks.onHud
   * @param {(score:number) => void} hooks.onTicketGoal  Se llama una vez por partida al llegar a ARCADE_TICKET_SCORE.
   * @param {(score:number) => void} hooks.onGameOver
   */
  constructor(canvas, hooks = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.hooks = hooks;
    this.running = false;
    this.input = { up: false, down: false, left: false, right: false };
    this.images = {};
    this.#loadSprites();
    this.#bindKeyboard();
    this.#reset();
    this.#draw();
  }

  /* ---------- carga de imágenes ---------- */
  #loadSprites() {
    for (const [key, def] of Object.entries(SPRITES)) {
      if (!def.src) continue;
      const img = new Image();
      img.onload = () => { this.images[key] = img; if (!this.running) this.#draw(); };
      img.onerror = () => console.warn(`[arcade] No se pudo cargar ${def.src}; se usa el placeholder.`);
      img.src = def.src;
    }
  }

  /* ---------- entrada ---------- */
  #bindKeyboard() {
    const KEYS = {
      ArrowUp: 'up', KeyW: 'up', ArrowDown: 'down', KeyS: 'down',
      ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right',
    };
    const handler = (down) => (e) => {
      const dir = KEYS[e.code];
      if (!dir || !this.running) return;
      e.preventDefault(); // que las flechas no muevan la página
      this.input[dir] = down;
    };
    window.addEventListener('keydown', handler(true));
    window.addEventListener('keyup', handler(false));
    window.addEventListener('blur', () => this.#clearInput());
  }

  /** Para la cruceta táctil: game.setDir('left', true/false) */
  setDir(dir, pressed) {
    if (dir in this.input) this.input[dir] = pressed;
  }

  #clearInput() {
    this.input = { up: false, down: false, left: false, right: false };
  }

  /* ---------- ciclo de vida ---------- */
  start() {
    this.stop();
    this.#reset();
    this.running = true;
    this.lastTime = performance.now();
    const frame = (now) => {
      if (!this.running) return;
      const dt = Math.min(0.05, (now - this.lastTime) / 1000); // tope para no atravesar paredes
      this.lastTime = now;
      this.#update(dt);
      this.#draw();
      if (this.running) this.raf = requestAnimationFrame(frame);
    };
    this.raf = requestAnimationFrame(frame);
  }

  stop() {
    this.running = false;
    cancelAnimationFrame(this.raf);
    this.#clearInput();
  }

  #reset() {
    this.time = 0;
    this.score = 0;
    this.lives = CFG.lives;
    this.goalReached = false;
    this.shake = 0;
    this.floaters = [];
    this.#buildMap();
    this.player = {
      x: tileCenter(7), y: tileCenter(7), half: 9,
      facing: 1, moving: false, anim: 0,
      speedT: 0, shieldT: 0, invulnT: 0,
    };
    this.enemies = [];
    this.pending = CFG.enemySchedule.map((e) => ({ ...e }));
    this.snacks = [];
    this.powerups = [];
    this.powerupTimer = CFG.powerupEvery * 0.6;
    while (this.snacks.length < CFG.snacksOnMap) this.#spawnSnack();
    this.hooks.onHud?.(this.score, this.lives);
  }

  /* ---------- mapa ---------- */
  #buildMap() {
    const map = Array.from({ length: ROWS }, (_, r) =>
      Array.from({ length: COLS }, (_, c) => (r === 0 || c === 0 || r === ROWS - 1 || c === COLS - 1 ? WALL : FLOOR)));

    const reserved = (r, c) =>
      (Math.abs(r - 7) <= 1 && Math.abs(c - 7) <= 1) ||           // zona de inicio del jugador
      ((r <= 2 || r >= ROWS - 3) && (c <= 2 || c >= COLS - 3));   // esquinas donde aparecen enemigos

    const place = (type, count) => {
      let placed = 0, guard = 0;
      while (placed < count && guard++ < 2000) {
        const r = 1 + rand(ROWS - 2);
        const c = 1 + rand(COLS - 2);
        if (map[r][c] !== FLOOR || reserved(r, c)) continue;
        map[r][c] = type;
        placed++;
      }
    };
    place(ZAPALLO, CFG.zapallos);
    place(FOAM, CFG.foams);
    this.map = map;

    // Casillas alcanzables desde el inicio (los zapallos podrían encerrar alguna)
    const seen = new Set(['7,7']);
    const queue = [[7, 7]];
    while (queue.length) {
      const [r, c] = queue.shift();
      for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nr = r + dr, nc = c + dc;
        const key = `${nr},${nc}`;
        if (seen.has(key) || this.#solidTile(nr, nc)) continue;
        seen.add(key);
        queue.push([nr, nc]);
      }
    }
    this.freeTiles = [...seen].map((k) => k.split(',').map(Number)).filter(([r, c]) => map[r][c] === FLOOR);
  }

  #tileAt(x, y) {
    const c = Math.floor(x / TILE), r = Math.floor(y / TILE);
    if (r < 0 || c < 0 || r >= ROWS || c >= COLS) return WALL;
    return this.map[r][c];
  }

  #solidTile(r, c) {
    if (r < 0 || c < 0 || r >= ROWS || c >= COLS) return true;
    const t = this.map[r][c];
    return t === WALL || t === ZAPALLO; // el Zapallo es un bloque sólido
  }

  /** ¿Una caja centrada en (x,y) toca alguna casilla sólida? */
  #boxHitsSolid(x, y, half) {
    const c0 = Math.floor((x - half) / TILE), c1 = Math.floor((x + half) / TILE);
    const r0 = Math.floor((y - half) / TILE), r1 = Math.floor((y + half) / TILE);
    for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) if (this.#solidTile(r, c)) return true;
    return false;
  }

  /** Mueve una entidad eje por eje. Devuelve true si chocó con algo sólido. */
  #moveWithCollisions(ent, dx, dy) {
    let hit = false;
    if (dx) {
      if (!this.#boxHitsSolid(ent.x + dx, ent.y, ent.half)) ent.x += dx; else hit = true;
    }
    if (dy) {
      if (!this.#boxHitsSolid(ent.x, ent.y + dy, ent.half)) ent.y += dy; else hit = true;
    }
    return hit;
  }

  #randomFreeTile(minDistFromPlayer = 0) {
    for (let i = 0; i < 60; i++) {
      const [r, c] = this.freeTiles[rand(this.freeTiles.length)];
      const x = tileCenter(c), y = tileCenter(r);
      const taken = [...this.snacks, ...this.powerups].some((it) => it.x === x && it.y === y);
      if (taken) continue;
      if (this.player && Math.hypot(x - this.player.x, y - this.player.y) < minDistFromPlayer) continue;
      return { x, y };
    }
    return { x: tileCenter(7), y: tileCenter(7) };
  }

  /* ---------- instanciación ---------- */
  #spawnSnack() {
    const total = Object.values(SNACKS).reduce((a, s) => a + s.weight, 0);
    let roll = Math.random() * total;
    let type = 'skittles';
    for (const [key, s] of Object.entries(SNACKS)) { roll -= s.weight; if (roll <= 0) { type = key; break; } }
    this.snacks.push({ type, ...this.#randomFreeTile(48) });
  }

  #spawnPowerup() {
    const type = Math.random() < 0.5 ? 'redbull' : 'caldo';
    this.powerups.push({ type, life: CFG.powerupLife, ...this.#randomFreeTile(64) });
  }

  #spawnEnemy(type) {
    // Aparece en la esquina más lejana al jugador
    const corners = [[1, 1], [1, COLS - 2], [ROWS - 2, 1], [ROWS - 2, COLS - 2]];
    corners.sort((a, b) =>
      Math.hypot(tileCenter(b[1]) - this.player.x, tileCenter(b[0]) - this.player.y) -
      Math.hypot(tileCenter(a[1]) - this.player.x, tileCenter(a[0]) - this.player.y));
    const [r, c] = corners[0];
    const e = { type, x: tileCenter(c), y: tileCenter(r), half: 10, facing: 1, anim: 0, stun: 0.8 };
    if (type === 'homelander') Object.assign(e, { state: 'aim', timer: 0.8, dx: 0, dy: 0 });
    if (type === 'salov') Object.assign(e, { timer: 0.9, hop: null });
    if (type === 'zombie') Object.assign(e, { timer: 0, dx: 0, dy: 0 });
    this.enemies.push(e);
    this.#float(`¡${ENEMY_LABELS[type]}!`, e.x, e.y - 20, '#ff8fa3');
  }

  #float(text, x, y, color = '#fff') {
    this.floaters.push({ text, x: clamp(x, 50, COLS * TILE - 50), y, color, life: 1.1 });
  }

  /* =================================================================
     UPDATE
     ================================================================= */
  #update(dt) {
    this.time += dt;
    const p = this.player;

    // --- Entrada de enemigos según el reloj ---
    while (this.pending.length && this.time >= this.pending[0].at) this.#spawnEnemy(this.pending.shift().type);

    // --- Temporizadores del jugador ---
    p.speedT = Math.max(0, p.speedT - dt);
    p.shieldT = Math.max(0, p.shieldT - dt);
    p.invulnT = Math.max(0, p.invulnT - dt);
    this.shake = Math.max(0, this.shake - dt);

    // --- Movimiento del jugador ---
    let ix = (this.input.right ? 1 : 0) - (this.input.left ? 1 : 0);
    let iy = (this.input.down ? 1 : 0) - (this.input.up ? 1 : 0);
    p.moving = ix !== 0 || iy !== 0;
    if (p.moving) {
      const len = Math.hypot(ix, iy);
      ix /= len; iy /= len;
      let speed = CFG.playerSpeed;
      if (this.#tileAt(p.x, p.y) === FOAM) speed *= CFG.foamSlow;   // Estereofón: ralentiza
      if (p.speedT > 0) speed *= CFG.redbullBoost;                   // Red Bull: supervelocidad
      this.#moveWithCollisions(p, ix * speed * dt, iy * speed * dt); // Zapallo y muros: sólidos
      if (ix) p.facing = Math.sign(ix);
      p.anim += dt * (p.speedT > 0 ? 14 : 8);
    }

    // --- Coleccionables ---
    for (let i = this.snacks.length - 1; i >= 0; i--) {
      const s = this.snacks[i];
      if (Math.hypot(s.x - p.x, s.y - p.y) < 18) {
        this.snacks.splice(i, 1);
        this.#addScore(SNACKS[s.type].points, s.x, s.y);
        this.#spawnSnack();
      }
    }

    // --- Power-ups ---
    this.powerupTimer -= dt;
    if (this.powerupTimer <= 0 && this.powerups.length < 2) {
      this.#spawnPowerup();
      this.powerupTimer = CFG.powerupEvery;
    }
    for (let i = this.powerups.length - 1; i >= 0; i--) {
      const u = this.powerups[i];
      u.life -= dt;
      if (u.life <= 0) { this.powerups.splice(i, 1); continue; }
      if (Math.hypot(u.x - p.x, u.y - p.y) < 20) {
        this.powerups.splice(i, 1);
        if (u.type === 'redbull') { p.speedT = CFG.redbullTime; this.#float('¡SUPERVELOCIDAD!', p.x, p.y - 26, '#7dffa0'); }
        else { p.shieldT = CFG.caldoTime; this.#float('¡INVENCIBLE!', p.x, p.y - 26, '#ffe08a'); }
      }
    }

    // --- Enemigos ---
    const difficulty = 1 + Math.min(0.5, this.time / 150); // se aceleran poco a poco
    for (const e of this.enemies) {
      e.anim += dt * 6;
      if (e.stun > 0) { e.stun -= dt; continue; }
      if (e.type === 'vader') this.#updateVader(e, dt, difficulty);
      else if (e.type === 'homelander') this.#updateHomelander(e, dt, difficulty);
      else if (e.type === 'salov') this.#updateSalov(e, dt, difficulty);
      else this.#updateZombie(e, dt, difficulty);

      // Colisión enemigo-jugador (Salov no hace daño mientras va en el aire)
      const airborne = e.type === 'salov' && e.hop;
      if (!airborne && Math.hypot(e.x - p.x, e.y - p.y) < 20) this.#touchEnemy(e);
      if (!this.running) return;
    }

    // --- Textos flotantes ---
    for (let i = this.floaters.length - 1; i >= 0; i--) {
      const f = this.floaters[i];
      f.life -= dt; f.y -= 22 * dt;
      if (f.life <= 0) this.floaters.splice(i, 1);
    }
  }

  /* Darth Vader: lento pero implacable. Va directo hacia ti y la Fuerza
     le deja atravesar los obstáculos. */
  #updateVader(e, dt, k) {
    const p = this.player;
    const d = Math.hypot(p.x - e.x, p.y - e.y) || 1;
    const speed = 46 * k;
    e.x = clamp(e.x + ((p.x - e.x) / d) * speed * dt, TILE + 10, (COLS - 1) * TILE - 10);
    e.y = clamp(e.y + ((p.y - e.y) / d) * speed * dt, TILE + 10, (ROWS - 1) * TILE - 10);
    e.facing = p.x >= e.x ? 1 : -1;
  }

  /* Homelander: apunta, y sale disparado en línea recta hasta chocar. */
  #updateHomelander(e, dt, k) {
    const p = this.player;
    if (e.state === 'aim') {
      e.timer -= dt;
      e.facing = p.x >= e.x ? 1 : -1;
      if (e.timer <= 0) {
        const dx = p.x - e.x, dy = p.y - e.y;
        // Elige el eje dominante: siempre vuela en horizontal o vertical
        if (Math.abs(dx) > Math.abs(dy)) { e.dx = Math.sign(dx); e.dy = 0; } else { e.dx = 0; e.dy = Math.sign(dy) || 1; }
        e.state = 'dash';
        e.timer = 1.6;
      }
      return;
    }
    const speed = 230 * k;
    const blocked = this.#moveWithCollisions(e, e.dx * speed * dt, e.dy * speed * dt);
    e.timer -= dt;
    if (e.dx) e.facing = e.dx;
    if (blocked || e.timer <= 0) { e.state = 'aim'; e.timer = 0.7 / k; }
  }

  /* Valery Salov: se mueve en "L" como el caballo de ajedrez, saltando
     por encima de los obstáculos. */
  #updateSalov(e, dt, k) {
    if (e.hop) {
      e.hop.t += dt / 0.32;
      const t = Math.min(1, e.hop.t);
      e.x = e.hop.x0 + (e.hop.x1 - e.hop.x0) * t;
      e.y = e.hop.y0 + (e.hop.y1 - e.hop.y0) * t;
      e.lift = Math.sin(t * Math.PI) * 16; // arco del salto
      if (t >= 1) { e.hop = null; e.lift = 0; e.timer = 0.85 / k; }
      return;
    }
    e.timer -= dt;
    if (e.timer > 0) return;

    const p = this.player;
    const r = Math.floor(e.y / TILE), c = Math.floor(e.x / TILE);
    const moves = [[1, 2], [2, 1], [-1, 2], [-2, 1], [1, -2], [2, -1], [-1, -2], [-2, -1]]
      .map(([dr, dc]) => [r + dr, c + dc])
      .filter(([nr, nc]) => !this.#solidTile(nr, nc));
    if (!moves.length) { e.timer = 0.5; return; }
    // Casi siempre elige el salto que más lo acerca; a veces improvisa
    moves.sort((a, b) =>
      Math.hypot(tileCenter(a[1]) - p.x, tileCenter(a[0]) - p.y) -
      Math.hypot(tileCenter(b[1]) - p.x, tileCenter(b[0]) - p.y));
    const [nr, nc] = Math.random() < 0.8 ? moves[0] : moves[rand(moves.length)];
    e.hop = { t: 0, x0: e.x, y0: e.y, x1: tileCenter(nc), y1: tileCenter(nr) };
    e.facing = tileCenter(nc) >= e.x ? 1 : -1;
  }

  /* Zombi (extra): deambula despacio y a ratos te sigue. */
  #updateZombie(e, dt, k) {
    const p = this.player;
    e.timer -= dt;
    if (e.timer <= 0) {
      e.timer = 1 + Math.random();
      if (Math.random() < 0.65) {
        const d = Math.hypot(p.x - e.x, p.y - e.y) || 1;
        e.dx = (p.x - e.x) / d; e.dy = (p.y - e.y) / d;
      } else {
        const a = Math.random() * Math.PI * 2;
        e.dx = Math.cos(a); e.dy = Math.sin(a);
      }
    }
    const speed = 38 * k;
    if (this.#moveWithCollisions(e, e.dx * speed * dt, e.dy * speed * dt)) e.timer = Math.min(e.timer, 0.2);
    if (e.dx) e.facing = e.dx > 0 ? 1 : -1;
  }

  #touchEnemy(e) {
    const p = this.player;
    if (p.shieldT > 0) {
      // Con el Caldo de mamá mandas al enemigo de vuelta a su esquina
      this.#addScore(50, e.x, e.y);
      this.#sendToCorner(e);
      return;
    }
    if (p.invulnT > 0) return;
    this.lives -= 1;
    p.invulnT = CFG.hitInvuln;
    this.shake = 0.35;
    this.#float('¡AUCH!', p.x, p.y - 26, '#ff8fa3');
    this.hooks.onHud?.(this.score, this.lives);
    if (this.lives <= 0) {
      this.#draw();
      this.stop();
      this.hooks.onGameOver?.(this.score);
    }
  }

  #sendToCorner(e) {
    const p = this.player;
    const far = (v, max) => (v < max / 2 ? max - 2 : 1);
    e.x = tileCenter(far(Math.floor(p.x / TILE), COLS));
    e.y = tileCenter(far(Math.floor(p.y / TILE), ROWS));
    e.stun = 1.5;
    e.hop = null; e.lift = 0;
    if (e.type === 'homelander') { e.state = 'aim'; e.timer = 0.8; }
  }

  #addScore(points, x, y) {
    this.score += points;
    this.#float(`+${points}`, x, y - 10, '#ffe08a');
    this.hooks.onHud?.(this.score, this.lives);
    if (!this.goalReached && this.score >= ARCADE_TICKET_SCORE) {
      this.goalReached = true;
      this.hooks.onTicketGoal?.(this.score);
    }
  }

  /* =================================================================
     DRAW
     ================================================================= */
  #draw() {
    const ctx = this.ctx;
    ctx.imageSmoothingEnabled = false;
    ctx.save();
    if (this.shake > 0) ctx.translate((Math.random() - 0.5) * 8, (Math.random() - 0.5) * 8);

    // --- Suelo y casillas ---
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const x = c * TILE, y = r * TILE;
        ctx.fillStyle = (r + c) % 2 ? '#23395d' : '#27406a';
        ctx.fillRect(x, y, TILE, TILE);
        const t = this.map[r][c];
        if (t === WALL) this.#drawWall(x, y);
        else if (t === ZAPALLO) this.#drawTile('zapallo', x, y);
        else if (t === FOAM) this.#drawTile('estereofon', x, y);
      }
    }

    // --- Items ---
    const bob = Math.sin(this.time * 5) * 2;
    for (const s of this.snacks) this.#drawSprite(s.type, s.x, s.y + bob + SPRITES[s.type].size / 2, 1, 0);
    for (const u of this.powerups) {
      if (u.life < 3 && Math.floor(u.life * 6) % 2) continue; // parpadea antes de irse
      ctx.fillStyle = u.type === 'redbull' ? 'rgba(125,255,160,.25)' : 'rgba(255,224,138,.3)';
      ctx.beginPath(); ctx.arc(u.x, u.y, 17 + bob, 0, Math.PI * 2); ctx.fill();
      this.#drawSprite(u.type, u.x, u.y + SPRITES[u.type].size / 2, 1, 0);
    }

    // --- Personajes (ordenados por Y para dar profundidad) ---
    const p = this.player;
    const actors = [...this.enemies.map((e) => ({ e, y: e.y })), { p, y: p.y }].sort((a, b) => a.y - b.y);
    for (const a of actors) {
      if (a.p) this.#drawPlayer();
      else this.#drawEnemy(a.e);
    }

    // --- Textos flotantes ---
    ctx.textAlign = 'center';
    ctx.font = '10px "Press Start 2P", monospace';
    for (const f of this.floaters) {
      ctx.globalAlpha = Math.min(1, f.life * 2);
      ctx.fillStyle = '#14213d'; ctx.fillText(f.text, f.x + 1, f.y + 1);
      ctx.fillStyle = f.color; ctx.fillText(f.text, f.x, f.y);
    }
    ctx.globalAlpha = 1;

    // --- Barras de power-up ---
    const bar = (label, t, max, color, row) => {
      if (t <= 0) return;
      const y = TILE + 6 + row * 14;
      ctx.fillStyle = 'rgba(20,33,61,.8)'; ctx.fillRect(TILE + 4, y, 132, 11);
      ctx.fillStyle = color; ctx.fillRect(TILE + 6, y + 2, 128 * (t / max), 7);
      ctx.fillStyle = '#14213d'; ctx.font = '6px "Press Start 2P", monospace'; ctx.textAlign = 'left';
      ctx.fillText(label, TILE + 9, y + 8);
    };
    bar('RED BULL', p.speedT, CFG.redbullTime, '#7dffa0', 0);
    bar('CALDO', p.shieldT, CFG.caldoTime, '#ffe08a', p.speedT > 0 ? 1 : 0);

    ctx.restore();
  }

  #drawWall(x, y) {
    const ctx = this.ctx;
    ctx.fillStyle = '#4a3222'; ctx.fillRect(x, y, TILE, TILE);
    ctx.fillStyle = '#6f4e37';
    ctx.fillRect(x + 1, y + 1, 14, 14); ctx.fillRect(x + 17, y + 1, 14, 14);
    ctx.fillRect(x + 1, y + 17, 6, 14); ctx.fillRect(x + 9, y + 17, 14, 14); ctx.fillRect(x + 25, y + 17, 6, 14);
  }

  #drawTile(key, x, y) {
    const ctx = this.ctx;
    const img = this.images[key];
    if (img) { ctx.drawImage(img, x, y, TILE, TILE); return; }
    if (key === 'zapallo') {
      // Placeholder: trozo de zapallo
      ctx.fillStyle = '#2f6b3a'; ctx.fillRect(x + 2, y + 2, 28, 28);
      ctx.fillStyle = '#e8891c'; ctx.fillRect(x + 5, y + 5, 22, 22);
      ctx.fillStyle = '#f6b24a'; ctx.fillRect(x + 8, y + 8, 16, 16);
      ctx.fillStyle = '#fde9b8';
      ctx.fillRect(x + 11, y + 12, 3, 4); ctx.fillRect(x + 18, y + 12, 3, 4); ctx.fillRect(x + 14, y + 18, 3, 4);
    } else {
      // Placeholder: bloque de estereofón
      ctx.fillStyle = '#c9d6e6'; ctx.fillRect(x + 2, y + 2, 28, 28);
      ctx.fillStyle = '#f7fbff'; ctx.fillRect(x + 2, y + 2, 26, 26);
      ctx.fillStyle = '#c9d6e6';
      for (const [dx, dy] of [[7, 7], [16, 5], [22, 12], [10, 16], [18, 20], [6, 23], [24, 23]]) ctx.fillRect(x + dx, y + dy, 2, 2);
    }
  }

  /**
   * Dibuja un sprite con los pies en (x, footY).
   * Usa la imagen si existe; si no, el placeholder de PLACEHOLDERS.
   */
  #drawSprite(key, x, footY, facing = 1, frame = 0) {
    const ctx = this.ctx;
    const def = SPRITES[key];
    const img = this.images[key];
    ctx.save();
    ctx.translate(Math.round(x), Math.round(footY));
    if (facing < 0) ctx.scale(-1, 1);
    if (img) {
      const fw = img.width / def.frames;
      const h = def.size;
      const w = (fw / img.height) * h;
      ctx.drawImage(img, fw * (frame % def.frames), 0, fw, img.height, -w / 2, -h, w, h);
    } else {
      const ph = PLACEHOLDERS[key];
      const px = Math.max(2, Math.floor(def.size / ph.rows.length));
      const w = ph.rows[0].length * px, h = ph.rows.length * px;
      ph.rows.forEach((row, ry) => {
        [...row].forEach((ch, rx) => {
          if (ch === '.') return;
          ctx.fillStyle = ph.palette[ch];
          ctx.fillRect(-w / 2 + rx * px, -h + ry * px, px, px);
        });
      });
    }
    ctx.restore();
  }

  #shadow(x, y, w = 10) {
    const ctx = this.ctx;
    ctx.fillStyle = 'rgba(0,0,0,.3)';
    ctx.beginPath(); ctx.ellipse(x, y, w, 4, 0, 0, Math.PI * 2); ctx.fill();
  }

  #drawPlayer() {
    const ctx = this.ctx;
    const p = this.player;
    const footY = p.y + 12;
    this.#shadow(p.x, footY - 1);
    if (p.shieldT > 0) {
      // Aura del Caldo de mamá
      ctx.strokeStyle = p.shieldT < 1.5 && Math.floor(p.shieldT * 8) % 2 ? '#fff' : '#ffe08a';
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(p.x, p.y - 8, 26, 0, Math.PI * 2); ctx.stroke();
    }
    if (p.speedT > 0 && p.moving) {
      // Estela del Red Bull
      ctx.globalAlpha = 0.35;
      this.#drawSprite('player', p.x - p.facing * 12, footY, p.facing, Math.floor(p.anim));
      ctx.globalAlpha = 1;
    }
    if (p.invulnT > 0 && Math.floor(p.invulnT * 12) % 2) return; // parpadeo tras un golpe
    this.#drawSprite('player', p.x, footY, p.facing, p.moving ? Math.floor(p.anim) : 0);
  }

  #drawEnemy(e) {
    const ctx = this.ctx;
    const lift = e.lift || 0;
    const footY = e.y + 12;
    this.#shadow(e.x, footY - 1, lift ? 7 : 10);
    if (e.stun > 0 && Math.floor(e.stun * 10) % 2) ctx.globalAlpha = 0.4;
    if (e.type === 'homelander' && e.state === 'aim' && e.timer < 0.45) {
      // Aviso: ojos láser cargando antes de embestir
      ctx.fillStyle = 'rgba(255,60,60,.35)';
      ctx.beginPath(); ctx.arc(e.x, e.y - 8, 24, 0, Math.PI * 2); ctx.fill();
    }
    this.#drawSprite(e.type, e.x, footY - lift, e.facing, Math.floor(e.anim));
    ctx.globalAlpha = 1;
    // Etiqueta con el nombre
    ctx.font = '6px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#14213d'; ctx.fillText(ENEMY_LABELS[e.type], e.x + 1, footY - lift - 47);
    ctx.fillStyle = '#ffd6dd'; ctx.fillText(ENEMY_LABELS[e.type], e.x, footY - lift - 48);
  }
}
