/* =====================================================================
   app.js — Controlador principal y UI.
   Conecta el temporizador, la tienda y los minijuegos.
   ===================================================================== */

import { store } from './store.js';
import { PomodoroTimer, formatTime, getMinutes, saveMinutes, validateMinutes, LIMITS } from './timer.js';
import { security } from './security.js';
import { WordSearch, WORD_MAPS, setMaps } from './wordsearch.js';
import { loadGameData } from './gamedata.js';
import { Hangman, Cosidle, Trivia, ChessPuzzle } from './minigames.js';
import { ArcadeGame, ARCADE_TICKET_SCORE } from './arcade.js';
import { initSyllabus } from './syllabus.js';
import { initAgenda } from './agenda.js';
import { audio } from './audio.js';
import { initAntiCheat } from './anticheat.js';

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => [...document.querySelectorAll(sel)];

/* ---------------------------------------------------------------------
   Utilidades de UI
   --------------------------------------------------------------------- */
function toast(text, ms = 3200) {
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = text;
  $('#toasts').appendChild(el);
  setTimeout(() => el.remove(), ms);
}

const escapeHtml = (s) => String(s).replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
const formatDate = (iso) => new Date(iso).toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' });

/* ---------------------------------------------------------------------
   Navegación entre vistas
   --------------------------------------------------------------------- */
let currentView = 'timer';
function showView(name) {
  currentView = name;
  $$('.view').forEach((v) => v.classList.toggle('is-active', v.id === `view-${name}`));
  $$('.tab').forEach((t) => t.classList.toggle('is-active', t.dataset.view === name));
  if (name !== 'games') leaveArcade(); // el arcade no corre en segundo plano
  if (name === 'games' && canPlay()) showGameMenu();
  window.scrollTo({ top: 0 });
}
$$('.tab').forEach((t) => t.addEventListener('click', () => showView(t.dataset.view)));
$$('[data-goto]').forEach((b) => b.addEventListener('click', () => showView(b.dataset.goto)));

/* ---------------------------------------------------------------------
   Temporizador
   --------------------------------------------------------------------- */
// Premios ya cobrados en el descanso actual (máx. 1 ticket por juego y descanso)
// Se guardan por descanso (breakId) para que recargar la página no permita cobrar dos veces.
const CLAIMS_KEY = 'pomodoroArcade.claims';
let claims = { breakId: 0, rewards: {}, tickets: 0 };
function loadClaims() {
  try {
    const saved = JSON.parse(localStorage.getItem(CLAIMS_KEY));
    if (saved && saved.breakId === timer.breakId) return { rewards: {}, tickets: 0, ...saved };
  } catch { /* datos corruptos: se empieza de cero */ }
  return { breakId: timer.breakId, rewards: {}, tickets: 0 };
}
function saveClaims() {
  try { localStorage.setItem(CLAIMS_KEY, JSON.stringify(claims)); } catch { /* sin almacenamiento */ }
}

/**
 * Intenta dar 1 ticket por ganar un minijuego.
 * Devuelve 'ok', 'free' (fuera del descanso), 'claimed' (ya cobrado en este descanso) o 'cap' (tope alcanzado).
 */
function awardTicket(gameKey) {
  if (!isBreak()) return 'free';
  if (claims.rewards[gameKey]) return 'claimed';
  if (claims.tickets >= gameData.ajustes.ticketsMaxPorDescanso) return 'cap';
  claims.rewards[gameKey] = true;
  claims.tickets += 1;
  saveClaims();
  store.addTickets(1);
  updateGameCards();
  return 'ok';
}

function rewardText(result) {
  return {
    ok: '¡Ganaste! +1 🎟️',
    free: 'Fuera del descanso no se ganan tickets.',
    claimed: 'El ticket de este juego ya lo cobraste en este descanso.',
    cap: `Ya ganaste el máximo de ${gameData.ajustes.ticketsMaxPorDescanso} tickets de minijuegos en este descanso.`,
  }[result];
}
const isBreak = () => timer.mode === 'break';
// Se puede jugar en el descanso, o en cualquier momento con el código de seguridad
const canPlay = () => isBreak() || security.unlocked;

/** Abre o cierra la zona de minijuegos según el modo y el código. */
function refreshGamesLock() {
  const open = canPlay();
  $('#games-lock').hidden = open;
  $('#games-locked').hidden = open;
  $('#games-open').hidden = !open;
  $('#break-banner').hidden = !isBreak();
  $('#free-banner').hidden = isBreak() || !security.unlocked;
  if (!open) {
    leaveArcade();
    if (currentView === 'games') showGameMenu();
  }
}

const timer = new PomodoroTimer({
  onTick({ mode, remainingMs, totalMs, running }) {
    const text = formatTime(remainingMs);
    $('#clock').textContent = text;
    $('#break-left').textContent = text;
    $('#progress-fill').style.width = `${100 * (1 - remainingMs / totalMs)}%`;
    $('#btn-start').textContent = running ? '⏸ Pausar' : '▶ Iniciar';
    $('#walker').classList.toggle('is-walking', running);
    document.title = `${text} · ${mode === 'work' ? 'Foco' : 'Descanso'} · Pomodoro Arcade`;
  },

  onPhaseEnd(finished) {
    if (finished === 'work') {
      const studied = store.focusedTopic();
      store.recordPomodoro();
      audio.play('pomodoroDone');
      toast('¡Bloque terminado! +1 🎟️. Empieza tu descanso: los minijuegos están abiertos.', 5000);
      if (studied) toast(`Bloque anotado en ${studied.subject.name}: ${studied.topic.name}. Si ya lo dominas, márcalo en el temario.`, 6000);
    } else {
      audio.play('breakDone');
      toast('Se acabó el descanso. Pulsa «Iniciar» para el siguiente bloque.', 5000);
    }
  },

  onModeChange(mode) {
    const onBreak = mode === 'break';
    $('#timer-panel').dataset.mode = mode;
    $('#mode-label').textContent = onBreak ? 'Descanso' : 'Modo concentración';
    $('#btn-skip').hidden = !onBreak;
    $('#btn-go-games').hidden = !onBreak;
    refreshGamesLock();

    if (onBreak) {
      claims = loadClaims();
      updateGameCards();
      showGameMenu();
    } else {
      // Fin del descanso: se cierran los juegos (salvo modo libre con código)
      $('#phrase').textContent = 'Pulsa «Iniciar» cuando estés listo para el siguiente bloque.';
      if (!canPlay()) {
        leaveArcade();
        if (currentView === 'games') showView('timer');
      }
    }
  },

  onPhrase(text) {
    const el = $('#phrase');
    el.textContent = text;
    el.classList.remove('swap');
    void el.offsetWidth; // reinicia la animación
    el.classList.add('swap');
  },
});

$('#btn-start').addEventListener('click', () => { audio.play('click'); timer.toggle(); });
$('#btn-reset').addEventListener('click', () => timer.reset());
$('#btn-skip').addEventListener('click', () => timer.skipBreak());
$('#btn-go-games').addEventListener('click', () => showView('games'));

/* ---------------------------------------------------------------------
   Minijuegos
   --------------------------------------------------------------------- */
function showGameMenu() {
  leaveArcade();
  $('#game-menu').hidden = false;
  $('#game-wordsearch').hidden = true;
  $('#game-arcade').hidden = true;
  $('#game-mini').hidden = true;
  updateGameCards();
}

/** Tarjetas del menú. Las sopas de letras salen de public/contenido/juegos.js. */
function gameCards() {
  return [
    ...gameData.sopa.map((m) => ({ key: `ws:${m.id}`, emoji: '🔤', name: 'Sopa de letras', desc: m.titulo, reward: 'al completarla' })),
    { key: 'ahorcado', emoji: '🍡', name: 'Salva el malvavisco', desc: 'Ahorcado con villanos', reward: 'al salvarlo' },
    { key: 'cosidle', emoji: '🟩', name: 'Cosi-dle', desc: 'La palabra en 6 intentos', reward: 'al adivinarla' },
    { key: 'trivia', emoji: '📝', name: 'Examen sorpresa', desc: gameData.trivia.titulo, reward: 'al aprobar' },
    { key: 'ajedrez', emoji: '♟️', name: 'Reto de ajedrez', desc: 'Mate en 1', reward: 'al dar mate' },
    { key: 'arcade', emoji: '👷', name: 'Arcade de supervivencia', desc: 'Snacks, jefes y Red Bull', reward: `a los ${ARCADE_TICKET_SCORE} pts` },
  ];
}

function renderGameMenu() {
  $('#game-menu').innerHTML = gameCards().map((g) => `
    <button class="game-card" type="button" data-game="${escapeHtml(g.key)}">
      <span class="game-emoji" aria-hidden="true">${g.emoji}</span>
      <span class="game-name">${escapeHtml(g.name)}</span>
      <span class="game-desc">${escapeHtml(g.desc)}</span>
      <span class="game-reward">+1 🎟️ ${escapeHtml(g.reward)}</span>
    </button>`).join('');
  updateGameCards();
}

function updateGameCards() {
  $$('#game-menu [data-game]').forEach((card) => card.classList.toggle('done', !!claims.rewards[card.dataset.game]));
  const cap = gameData.ajustes.ticketsMaxPorDescanso;
  $('#games-cap').textContent = isBreak()
    ? `Tickets de minijuegos en este descanso: ${Math.min(claims.tickets, cap)}/${cap}`
    : '';
}

$$('[data-back]').forEach((b) => b.addEventListener('click', showGameMenu));

$('#game-menu').addEventListener('click', (e) => {
  const card = e.target.closest('[data-game]');
  if (!card || !canPlay()) return; // seguridad: solo en descansos o con código
  const game = card.dataset.game;
  $('#game-menu').hidden = true;
  if (game === 'arcade') {
    $('#game-arcade').hidden = false;
    showArcadeOverlay('Arcade de supervivencia', `Recoge snacks y esquiva a los jefes. A los ${ARCADE_TICKET_SCORE} puntos ganas 1 🎟️.`, '▶ Jugar');
  } else if (game.startsWith('ws:')) {
    $('#game-wordsearch').hidden = false;
    wordsearch.load(game.slice(3));
  } else {
    openMini(game);
  }
  window.scrollTo({ top: 0 });
});

/* ---- Ahorcado, Cosi-dle, examen sorpresa y ajedrez ---- */
const MINI_GAMES = {
  ahorcado: { title: 'Salva el malvavisco', make: (root, hooks) => new Hangman(root, gameData.ahorcado, hooks) },
  cosidle: { title: 'Cosi-dle', make: (root, hooks) => new Cosidle(root, gameData.cosidle, hooks) },
  trivia: { title: 'Examen sorpresa', make: (root, hooks) => new Trivia(root, gameData.trivia, hooks) },
  ajedrez: { title: 'Reto de ajedrez', make: (root, hooks) => new ChessPuzzle(root, gameData.ajedrez, hooks) },
};
let currentMini = null;

function openMini(key) {
  leaveMini();
  const def = MINI_GAMES[key];
  const result = $('#mini-result');
  result.textContent = '';
  $('#mini-title').textContent = def.title;
  $('#game-mini').hidden = false;
  currentMini = def.make($('#mini-root'), {
    sfx: (name) => audio.play(name),
    onWin: () => {
      const r = awardTicket(key);
      result.textContent = rewardText(r);
      result.classList.toggle('is-ok', r === 'ok');
      if (r === 'ok') toast('¡Minijuego ganado! +1 🎟️');
    },
    onLose: () => {
      result.textContent = 'Sin ticket esta vez. Pulsa «Nueva» para intentarlo otra vez.';
      result.classList.remove('is-ok');
    },
  });
  currentMini.start();
}

function leaveMini() {
  currentMini?.destroy();
  currentMini = null;
}

$('#mini-new').addEventListener('click', () => {
  $('#mini-result').textContent = '';
  currentMini?.start();
});

/* ---- Sopa de letras ---- */
const wordsearch = new WordSearch(
  { grid: $('#ws-grid'), words: $('#ws-words'), msg: $('#ws-msg'), title: $('#ws-title') },
  {
    onWordFound() { audio.play('word'); },
    onComplete(mapId) {
      store.recordMapDone(mapId);
      audio.play('win');
      const r = awardTicket(`ws:${mapId}`);
      $('#ws-msg').textContent = r === 'ok' ? `¡${WORD_MAPS[mapId].title} completado! +1 🎟️` : `¡Completado! ${rewardText(r)}`;
      if (r === 'ok') toast('¡Sopa de letras completada! +1 🎟️');
    },
  },
);
$('#ws-new').addEventListener('click', () => wordsearch.load());

/* ---- Arcade ---- */
function showArcadeOverlay(title, text, button) {
  $('#overlay-title').textContent = title;
  $('#overlay-text').textContent = text;
  $('#arcade-play').textContent = button;
  $('#arcade-overlay').hidden = false;
}

const arcade = new ArcadeGame($('#arcade-canvas'), {
  onHud(score, lives) {
    $('#hud-score').textContent = score;
    $('#hud-lives').textContent = '❤'.repeat(Math.max(0, lives)) || '✖';
  },
  onSfx(event) { audio.play(event); },
  onTicketGoal() {
    if (awardTicket('arcade') === 'ok') {
      audio.play('win');
      toast(`¡${ARCADE_TICKET_SCORE} puntos! +1 🎟️`);
    }
  },
  onGameOver(score) {
    const record = store.recordArcadeScore(score);
    audio.play('gameOver');
    showArcadeOverlay(
      record ? '¡Nuevo récord!' : 'Game over',
      `Hiciste ${score} puntos.${record ? ' Tu mejor marca hasta ahora.' : ''}`,
      '↻ Otra vez',
    );
  },
});

/** Detiene el arcade; si había partida en curso, guarda su puntaje como posible récord. */
function leaveArcade() {
  if (arcade.running && arcade.score > 0) store.recordArcadeScore(arcade.score);
  arcade.stop();
  leaveMini(); // también cierra el ahorcado, Cosi-dle, trivia o ajedrez
}

function startArcade() {
  if (!canPlay()) return;
  $('#arcade-overlay').hidden = true;
  // Penalización anti-trampas: mientras queden partidas castigadas, todos son Darth Vader
  const penalty = store.usePenalty();
  arcade.vaderMode = penalty > 0;
  if (penalty > 0) toast(`😈 Penalización por tramposo: todos los enemigos son Darth Vader. Te queda${penalty === 1 ? '' : 'n'} ${penalty} partida${penalty === 1 ? '' : 's'} así.`, 5000);
  arcade.start();
  $('#arcade-canvas').scrollIntoView({ block: 'center', behavior: 'smooth' });
}
$('#arcade-play').addEventListener('click', startArcade);
$('#arcade-restart').addEventListener('click', () => {
  leaveArcade(); // guarda el récord de la partida en curso antes de reiniciar
  startArcade();
});

// Cruceta táctil
$$('.dpad-btn').forEach((btn) => {
  const set = (pressed) => (e) => {
    e.preventDefault();
    btn.classList.toggle('is-down', pressed);
    arcade.setDir(btn.dataset.dir, pressed);
  };
  btn.addEventListener('pointerdown', set(true));
  btn.addEventListener('pointerup', set(false));
  btn.addEventListener('pointercancel', set(false));
  btn.addEventListener('pointerleave', set(false));
  btn.addEventListener('contextmenu', (e) => e.preventDefault());
});

/* ---------------------------------------------------------------------
   Tienda y cupones
   --------------------------------------------------------------------- */
function renderShop() {
  const grid = $('#shop-grid');
  grid.innerHTML = store.catalog.map((c) => {
    const { goal, enoughTickets, ok } = store.canBuy(c);
    const progress = goal.target > 1 ? ` (${goal.current}/${goal.target})` : '';
    return `
      <article class="coupon ${goal.done ? '' : 'is-locked'}">
        <div class="coupon-top">
          <span class="emoji" aria-hidden="true">${escapeHtml(c.emoji)}</span>
          <h3>${escapeHtml(c.title)}</h3>
        </div>
        <p class="note">${escapeHtml(c.note)}</p>
        <p class="req ${goal.done ? 'ok' : 'no'}"><span>${goal.done ? '✔' : '🔒'}</span><span>Misión: ${escapeHtml(goal.label)}${progress}</span></p>
        <p class="req ${enoughTickets ? 'ok' : 'no'}"><span>${enoughTickets ? '✔' : '✖'}</span><span class="price">${c.price} 🎟️</span></p>
        <button class="btn btn-primary" type="button" data-buy="${escapeHtml(c.id)}" ${ok ? '' : 'disabled'}>
          ${ok ? 'Canjear' : goal.done ? 'Faltan tickets' : 'Bloqueado'}
        </button>
      </article>`;
  }).join('');
}

function renderOwned() {
  const owned = store.state.owned;
  $('#owned-empty').hidden = owned.length > 0;
  $('#owned-grid').innerHTML = owned.map((o) => `
    <article class="coupon ${o.redeemed ? 'is-redeemed' : ''}">
      <div class="coupon-top">
        <span class="emoji" aria-hidden="true">${escapeHtml(o.emoji)}</span>
        <h3>${escapeHtml(o.title)}</h3>
      </div>
      <p class="code">${escapeHtml(o.code)} · ${formatDate(o.date)} · ${o.redeemed ? 'Canjeado' : 'Disponible'}</p>
      <button class="btn btn-brown" type="button" data-open="${escapeHtml(o.code)}">📸 Ver cupón</button>
    </article>`).join('');
}

function renderStats() {
  const { tickets, stats } = store.state;
  const counter = $('#ticket-count');
  if (counter.textContent !== String(tickets)) {
    counter.textContent = tickets;
    const wallet = counter.parentElement;
    wallet.classList.remove('bump');
    void wallet.offsetWidth;
    wallet.classList.add('bump');
  }
  $('#stat-today').textContent = stats.today;
  $('#stat-total').textContent = stats.totalPomodoros;
  $('#stat-arcade').textContent = stats.bestArcade;
  $('#hud-best').textContent = stats.bestArcade;
}

$('#shop-grid').addEventListener('click', (e) => {
  const btn = e.target.closest('[data-buy]');
  if (!btn) return;
  const owned = store.buy(btn.dataset.buy);
  if (!owned) return;
  audio.play('coupon');
  openCoupon(owned.code);
});

$('#owned-grid').addEventListener('click', (e) => {
  const btn = e.target.closest('[data-open]');
  if (btn) openCoupon(btn.dataset.open);
});

/* ---- Modal del cupón (pensado para captura de pantalla) ---- */
let openCode = null;
function openCoupon(code) {
  const o = store.state.owned.find((x) => x.code === code);
  if (!o) return;
  openCode = code;
  $('#coupon-modal-emoji').textContent = o.emoji;
  $('#coupon-modal-title').textContent = o.title;
  $('#coupon-modal-note').textContent = o.note;
  $('#coupon-modal-code').textContent = o.code;
  $('#coupon-modal-date').textContent = formatDate(o.date);
  const status = $('#coupon-modal-status');
  status.textContent = o.redeemed ? '✖ YA CANJEADO' : '✔ VÁLIDO';
  status.classList.toggle('used', o.redeemed);
  $('#coupon-redeem').hidden = o.redeemed;
  $('#coupon-modal').hidden = false;
}
function closeCoupon() { $('#coupon-modal').hidden = true; openCode = null; }

$('#coupon-close').addEventListener('click', closeCoupon);
$('#coupon-modal').addEventListener('click', (e) => { if (e.target.id === 'coupon-modal') closeCoupon(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeCoupon(); });
$('#coupon-redeem').addEventListener('click', () => {
  if (!openCode) return;
  if (!confirm('¿Marcar este cupón como canjeado? Hazlo cuando ya te lo hayan pagado.')) return;
  const code = openCode;
  store.redeem(code);
  openCoupon(code);
});

/* ---------------------------------------------------------------------
   Ajustes del reloj y código de seguridad
   --------------------------------------------------------------------- */
function renderSettings() {
  const { work, break: brk } = getMinutes();
  $('#set-work').value = work;
  $('#set-break').value = brk;
  $$('[data-work-min]').forEach((el) => { el.textContent = work; });
  $$('[data-break-min]').forEach((el) => { el.textContent = brk; });
  $('#settings-limits').textContent = security.unlocked
    ? `Código activo: puedes poner de ${LIMITS.adminMin} a ${LIMITS.adminMax} minutos.`
    : `Estudio: de ${LIMITS.workMin} a ${LIMITS.workMax} min. Descanso: de ${LIMITS.breakMin} a ${LIMITS.breakMax} min.`;
}

function setMsg(el, text, isError = false) {
  el.textContent = text;
  el.classList.toggle('is-error', isError);
}

$('#settings-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const work = Number($('#set-work').value);
  const brk = Number($('#set-break').value);
  const error = validateMinutes(work, brk, security.unlocked);
  if (error) { setMsg($('#settings-msg'), error, true); return; }
  saveMinutes(work, brk);
  const appliedNow = timer.applyDurations();
  renderSettings();
  setMsg($('#settings-msg'), appliedNow ? '✔ Tiempos guardados.' : '✔ Guardado. El cambio entra en el siguiente bloque.');
});

// Hay dos formularios de código: en Ajustes y en la zona de juegos bloqueada
$$('[data-code-form]').forEach((form) => form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const input = form.querySelector('input');
  const msg = form.parentElement.querySelector('[data-code-msg]');
  const ok = await security.unlock(input.value);
  input.value = '';
  if (ok) { setMsg(msg, ''); audio.play('coupon'); toast('🔓 Código correcto. Modo libre activado hasta recargar la página.'); }
  else setMsg(msg, '✖ Código incorrecto.', true);
}));

$('#code-lock').addEventListener('click', () => security.lock());

security.onChange((unlocked) => {
  $('#settings .code-box').classList.toggle('is-unlocked', unlocked);
  $('#settings [data-code-form]').hidden = unlocked;
  $('#code-lock').hidden = !unlocked;
  $('#code-status').textContent = unlocked
    ? '🔓 Código activo: sin mínimo de minutos y minijuegos abiertos. Se bloquea solo al recargar la página.'
    : '🔒 Con el código de seguridad se pueden poner bloques de menos de 15 minutos y abrir los minijuegos sin esperar al descanso.';
  renderSettings();
  refreshGamesLock();
  if (unlocked && currentView === 'games') showGameMenu();
});

/* ---------------------------------------------------------------------
   Sonido (botón de silencio) y anti-trampas
   --------------------------------------------------------------------- */
const muteBtn = $('#btn-mute');
const paintMute = () => {
  muteBtn.textContent = audio.muted ? '🔇' : '🔊';
  muteBtn.setAttribute('aria-pressed', String(audio.muted));
  muteBtn.title = audio.muted ? 'Activar sonido' : 'Silenciar';
};
muteBtn.addEventListener('click', () => { audio.toggleMute(); paintMute(); audio.play('click'); });
paintMute();

initAntiCheat((message) => {
  audio.play('busted');
  toast(`🚨 ${message}`, 7000);
  toast('😈 Penalización: tus próximas 3 partidas del arcade son todo Darth Vader.', 7000);
});

/* ---------------------------------------------------------------------
   Arranque
   --------------------------------------------------------------------- */
const syllabus = initSyllabus();
const agenda = await initAgenda(); // lee public/contenido/notas.js y eventos.js
store.subscribe(() => { renderStats(); renderShop(); renderOwned(); syllabus.render(); agenda.render(); });
const { data: gameData, error: gameDataError } = await loadGameData(); // public/contenido/juegos.js
setMaps(gameData.sopa);
if (gameDataError) { $('#games-error').hidden = false; $('#games-error').textContent = gameDataError; }
renderGameMenu();
renderSettings();
await store.init();   // carga el catálogo (hoy local; mañana Sheets/Firebase) y pinta todo
timer.refresh();      // pinta el reloj y restaura el estado si se recargó la página
