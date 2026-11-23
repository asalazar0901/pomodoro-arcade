/* =====================================================================
   chess.js — Modo Ajedrez.
   Un interruptor cambia toda la app entre "Universidad" y "Ajedrez":
   colores, fondo, frases del reloj y paneles de la vista Pomodoro.
   En modo Ajedrez aparecen:
     - Pequeñas victorias: lo que logró hoy, una oración por cosa
     - Próximos torneos con cuenta regresiva (se guardan en la Agenda)
     - Bitácora de ELO por ritmo, con gráfica, máximo y avance
     - Metas a corto, mediano y largo plazo
   Todo se guarda en su navegador, dentro del estado de la app (store).
   ===================================================================== */

import { registrar } from './registro.js';

const MODE_KEY = 'pomodoroArcade.modo';
const RITMOS = ['Blitz', 'Rápido', 'Clásico', 'Bala', 'FIDE'];
const PLAZOS = [
  { id: 'corto', title: 'Corto plazo', hint: 'Esta semana o este mes' },
  { id: 'mediano', title: 'Mediano plazo', hint: 'Este semestre' },
  { id: 'largo', title: 'Largo plazo', hint: 'El gran sueño' },
];

export const CHESS_WORK_PHRASES = [
  'Calcula como si el reloj no existiera. Ah, pero sí existe. Concéntrate.',
  'Cada táctica que resuelves hoy es una partida que ganas mañana.',
  'Sindarov no se hizo solo. Abre el tablero y entrena.',
  'Primero las jugadas forzadas: jaques, capturas y amenazas.',
  'Los finales no se estudian solos. Bueno, ahorita sí: tú solo.',
  'Una apertura repasada hoy son 10 minutos ahorrados en el torneo.',
  'Piensa en el plan, no solo en la jugada.',
  'Tu novia cree en tu próximo ELO más que tú. Demuéstrale que tiene razón.',
];
export const CHESS_BREAK_PHRASES = [
  'Descanso de gran maestro: estira, toma agua y deja que el cerebro procese.',
  'Analiza tu última partida… después del descanso. Ahora relájate.',
  'Hasta Magnus se toma un respiro entre rondas.',
  'Anota tu pequeña victoria de este bloque antes de que se te olvide.',
];

const escapeHtml = (s) => String(s).replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
const todayKey = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const newId = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
const parseDate = (s) => (/^\d{4}-\d{2}-\d{2}$/.test(String(s)) ? new Date(`${s}T00:00`) : null);
const fmtDay = (key) => new Date(`${key}T12:00`).toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'short' });

const fresh = () => ({
  elo: [],                                  // { id, fecha, rating, ritmo, nota }
  goals: { corto: [], mediano: [], largo: [] }, // { id, text, done, doneAt }
  wins: [],                                 // pequeñas victorias: { id, text, fecha }
  pomodoros: 0,                             // bloques terminados en modo ajedrez
});

/**
 * @param {object} deps { store, toast, audio, $ }
 */
export async function initChessMode({ store, toast, audio }) {
  const $ = (sel) => document.querySelector(sel);
  const data = { ...fresh(), ...(store.chess || {}) };
  data.goals = { ...fresh().goals, ...(data.goals || {}) };
  const save = () => store.setChess(data);

  // Torneos predeterminados: los eventos de ajedrez de public/contenido/eventos.js
  let fileEvents = [];
  try {
    const mod = await import(/* @vite-ignore */ `${import.meta.env.BASE_URL}contenido/eventos.js?v=${Date.now()}`);
    fileEvents = (mod.EVENTOS || []).filter((e) => e && e.categoria === 'ajedrez' && parseDate(e.fecha));
  } catch { /* la agenda ya avisa si el archivo tiene errores */ }

  let mode = 'u';
  try { mode = localStorage.getItem(MODE_KEY) === 'ajedrez' ? 'ajedrez' : 'u'; } catch { /* nada */ }
  let eloRitmo = 'Blitz';

  function applyMode() {
    const chess = mode === 'ajedrez';
    document.body.dataset.modo = chess ? 'ajedrez' : 'u';
    document.querySelectorAll('[data-modo-btn]').forEach((b) => {
      const on = b.dataset.modoBtn === mode;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-pressed', String(on));
    });
    document.querySelectorAll('[data-solo="u"]').forEach((el) => { el.hidden = chess; });
    document.querySelectorAll('[data-solo="ajedrez"]').forEach((el) => { el.hidden = !chess; });
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', chess ? '#2a1d14' : '#14213d');
    render();
  }

  function setMode(next) {
    mode = next === 'ajedrez' ? 'ajedrez' : 'u';
    try { localStorage.setItem(MODE_KEY, mode); } catch { /* nada */ }
    audio.play('click');
    applyMode();
    toast(mode === 'ajedrez' ? '♟️ Modo Ajedrez: a entrenar, gran maestro.' : '🎓 Modo Universidad: a estudiar, ingeniero.');
  }
  document.querySelectorAll('[data-modo-btn]').forEach((b) => b.addEventListener('click', () => setMode(b.dataset.modoBtn)));

  /* ---------------- Pequeñas victorias ---------------- */
  $('#win-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const input = $('#win-input');
    const text = input.value.trim();
    if (!text) return;
    data.wins.unshift({ id: newId(), text, fecha: todayKey() });
    registrar('Pequeña victoria', text);
    data.wins = data.wins.slice(0, 400);
    input.value = '';
    save();
    audio.play('word');
    const today = data.wins.filter((w) => w.fecha === todayKey()).length;
    toast(today === 1 ? '🏆 Primera pequeña victoria del día. Así se empieza.' : `🏆 Ya van ${today} pequeñas victorias hoy. Todo suma.`);
  });

  /* ---------------- Torneos ---------------- */
  $('#tourney-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const nombre = $('#tourney-name').value.trim();
    const fecha = $('#tourney-date').value;
    if (!nombre || !parseDate(fecha)) return;
    store.addEvent({ nombre, fecha, categoria: 'ajedrez' }); // también sale en la Agenda
    registrar('Torneo', `Agregó el torneo «${nombre}» para el ${fecha}`);
    $('#tourney-name').value = '';
    $('#tourney-date').value = '';
    audio.play('word');
  });

  /* ---------------- ELO ---------------- */
  $('#elo-date').value = todayKey();
  $('#elo-ritmo').innerHTML = RITMOS.map((r) => `<option>${r}</option>`).join('');
  $('#elo-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const rating = Math.round(Number($('#elo-rating').value));
    const ritmo = $('#elo-ritmo').value;
    const fecha = $('#elo-date').value || todayKey();
    if (!Number.isFinite(rating) || rating < 100 || rating > 3500) {
      toast('Escribe un ELO entre 100 y 3500.');
      return;
    }
    const before = data.elo.filter((x) => x.ritmo === ritmo);
    const peak = before.length ? Math.max(...before.map((x) => x.rating)) : 0;
    data.elo.push({ id: newId(), fecha, rating, ritmo, nota: $('#elo-note').value.trim() });
    registrar('ELO', `${ritmo}: ${rating}${before.length && rating > peak ? ' (¡nuevo récord!)' : ''}${$('#elo-note').value.trim() ? ` · ${$('#elo-note').value.trim()}` : ''}`);
    data.elo.sort((a, b) => a.fecha.localeCompare(b.fecha));
    eloRitmo = ritmo;
    $('#elo-rating').value = '';
    $('#elo-note').value = '';
    save();
    if (before.length && rating > peak) { audio.play('powerup'); toast(`🚀 ¡Nuevo récord en ${ritmo}: ${rating}! Antes era ${peak}.`, 5000); }
    else audio.play('word');
  });

  /* ---------------- Metas ---------------- */
  document.querySelectorAll('[data-goal-form]').forEach((form) => form.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = form.querySelector('input');
    const text = input.value.trim();
    if (!text) return;
    data.goals[form.dataset.goalForm].push({ id: newId(), text, done: false });
    registrar('Meta nueva', `${form.dataset.goalForm} plazo: ${text}`);
    input.value = '';
    save();
  }));

  // Clics dentro del panel (borrar, marcar, cambiar ritmo de la gráfica)
  $('#chess-panels').addEventListener('click', (e) => {
    const el = e.target.closest('[data-act]');
    if (!el) return;
    const { act, id, plazo } = el.dataset;
    if (act === 'del-win') data.wins = data.wins.filter((w) => w.id !== id);
    if (act === 'del-elo') data.elo = data.elo.filter((x) => x.id !== id);
    if (act === 'del-goal') data.goals[plazo] = data.goals[plazo].filter((g) => g.id !== id);
    if (act === 'del-tourney') { store.removeEvent(id); return; }
    if (act === 'ritmo') { eloRitmo = el.dataset.ritmo; render(); return; }
    save();
  });
  $('#chess-panels').addEventListener('change', (e) => {
    const box = e.target.closest('[data-goal-check]');
    if (!box) return;
    const goal = data.goals[box.dataset.plazo].find((g) => g.id === box.dataset.goalCheck);
    if (!goal) return;
    goal.done = box.checked;
    goal.doneAt = box.checked ? todayKey() : null;
    save();
    if (box.checked) registrar('Meta cumplida', goal.text);
    if (box.checked) { audio.play('win'); toast(`🎯 ¡Meta cumplida! «${goal.text}». Date crédito, eso costó.`, 5000); }
  });

  /* ---------------- Pintar ---------------- */
  function render() {
    if (mode !== 'ajedrez') return;
    renderWins();
    renderTourneys();
    renderElo();
    renderGoals();
  }

  function renderWins() {
    const today = todayKey();
    const todays = data.wins.filter((w) => w.fecha === today);
    const week = data.wins.filter((w) => (Date.now() - new Date(`${w.fecha}T12:00`)) / 86400000 < 7).length;
    $('#win-summary').textContent = `Hoy: ${todays.length} · Últimos 7 días: ${week} · Total: ${data.wins.length} · Bloques de ajedrez: ${data.pomodoros}`;
    $('#win-today').innerHTML = todays.length
      ? todays.map((w) => `<li>🏆 ${escapeHtml(w.text)} <button class="icon-btn" type="button" data-act="del-win" data-id="${w.id}" aria-label="Quitar">✕</button></li>`).join('')
      : '<li class="hint">Todavía nada hoy. Algo tan simple como «resolví 10 tácticas» cuenta.</li>';
    // Días anteriores (los últimos 6 días con victorias)
    const days = [...new Set(data.wins.filter((w) => w.fecha !== today).map((w) => w.fecha))].slice(0, 6);
    $('#win-past').innerHTML = days.map((d) => `
      <details><summary>${fmtDay(d)} · ${data.wins.filter((w) => w.fecha === d).length}</summary>
        <ul>${data.wins.filter((w) => w.fecha === d).map((w) => `<li>🏆 ${escapeHtml(w.text)}</li>`).join('')}</ul>
      </details>`).join('');
  }

  function renderTourneys() {
    const now = new Date(); now.setHours(0, 0, 0, 0);
    const own = store.state.events.filter((e) => e.categoria === 'ajedrez').map((e) => ({ ...e, own: true }));
    const hidden = new Set(store.state.hiddenEvents);
    const file = fileEvents.filter((e) => !hidden.has(`${e.nombre}|${e.fecha}`));
    const list = [...file, ...own]
      .map((e) => ({ ...e, date: parseDate(e.fecha) }))
      .filter((e) => e.date && e.date >= now)
      .sort((a, b) => a.date - b.date);
    $('#tourney-list').innerHTML = list.length ? list.map((e, i) => {
      const days = Math.round((e.date - now) / 86400000);
      return `<li class="tourney ${i === 0 ? 'is-next' : ''}">
        <div class="tourney-count"><strong>${days === 0 ? '¡HOY!' : days}</strong>${days === 0 ? '' : `<span>día${days === 1 ? '' : 's'}</span>`}</div>
        <div class="tourney-info"><strong>♟️ ${escapeHtml(e.nombre)}</strong><span>${e.date.toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' })}</span></div>
        ${e.own ? `<button class="icon-btn" type="button" data-act="del-tourney" data-id="${e.id}" aria-label="Quitar torneo">✕</button>` : ''}
      </li>`;
    }).join('') : '<li class="hint">Sin torneos próximos. Agrega el siguiente para ver la cuenta regresiva.</li>';
  }

  function renderElo() {
    const used = RITMOS.filter((r) => data.elo.some((x) => x.ritmo === r));
    if (used.length && !used.includes(eloRitmo)) eloRitmo = used[0];
    $('#elo-tabs').innerHTML = used.map((r) => `<button type="button" class="chip ${r === eloRitmo ? 'is-active' : ''}" data-act="ritmo" data-ritmo="${r}">${r}</button>`).join('');
    const rows = data.elo.filter((x) => x.ritmo === eloRitmo);
    if (!rows.length) {
      $('#elo-stats').innerHTML = '<p class="hint">Anota tu ELO de hoy y aquí verás tu gráfica, tu máximo y cuánto has subido.</p>';
      $('#elo-chart').innerHTML = '';
      $('#elo-list').innerHTML = '';
      return;
    }
    const first = rows[0].rating;
    const last = rows[rows.length - 1].rating;
    const peak = Math.max(...rows.map((x) => x.rating));
    const diff = last - first;
    $('#elo-stats').innerHTML = `
      <div class="elo-stat"><strong>${last}</strong><span>actual</span></div>
      <div class="elo-stat"><strong>${peak}</strong><span>máximo</span></div>
      <div class="elo-stat ${diff >= 0 ? 'is-up' : 'is-down'}"><strong>${diff >= 0 ? '+' : ''}${diff}</strong><span>desde el inicio</span></div>`;
    // Gráfica en SVG
    const W = 320; const H = 120; const P = 10;
    const min = Math.min(...rows.map((x) => x.rating)); const max = Math.max(...rows.map((x) => x.rating));
    const span = Math.max(20, max - min);
    const pts = rows.map((x, i) => [P + (rows.length === 1 ? (W - 2 * P) / 2 : (i * (W - 2 * P)) / (rows.length - 1)), H - P - ((x.rating - min) / span) * (H - 2 * P)]);
    $('#elo-chart').innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Gráfica de ELO en ${eloRitmo}">
      <polyline points="${pts.map((p) => p.join(',')).join(' ')}" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round" />
      ${pts.map((p, i) => `<rect x="${p[0] - 3}" y="${p[1] - 3}" width="6" height="6" class="${rows[i].rating === peak ? 'is-peak' : ''}"><title>${rows[i].fecha}: ${rows[i].rating}</title></rect>`).join('')}
    </svg>`;
    $('#elo-list').innerHTML = rows.slice(-8).reverse().map((x, i, arr) => {
      const prev = arr[i + 1];
      const d = prev ? x.rating - prev.rating : 0;
      return `<li><span>${new Date(`${x.fecha}T12:00`).toLocaleDateString('es', { day: 'numeric', month: 'short' })}</span>
        <strong>${x.rating}</strong>${prev ? `<em class="${d >= 0 ? 'is-up' : 'is-down'}">${d >= 0 ? '▲' : '▼'} ${Math.abs(d)}</em>` : '<em></em>'}
        <small>${escapeHtml(x.nota || '')}</small>
        <button class="icon-btn" type="button" data-act="del-elo" data-id="${x.id}" aria-label="Quitar registro">✕</button></li>`;
    }).join('');
  }

  function renderGoals() {
    for (const { id } of PLAZOS) {
      const list = data.goals[id];
      const done = list.filter((g) => g.done).length;
      document.querySelector(`[data-goal-count="${id}"]`).textContent = list.length ? `${done}/${list.length}` : '';
      document.querySelector(`[data-goal-list="${id}"]`).innerHTML = list.length ? list.map((g) => `
        <li class="${g.done ? 'is-done' : ''}">
          <label><input type="checkbox" data-goal-check="${g.id}" data-plazo="${id}" ${g.done ? 'checked' : ''} /> <span>${escapeHtml(g.text)}</span></label>
          <button class="icon-btn" type="button" data-act="del-goal" data-id="${g.id}" data-plazo="${id}" aria-label="Quitar meta">✕</button>
        </li>`).join('') : '<li class="hint">Sin metas aún.</li>';
    }
  }

  applyMode();

  return {
    get mode() { return mode; },
    render,
    /** Frase del reloj según el modo (null = usar la normal). */
    phrase(timerMode) {
      if (mode !== 'ajedrez') return null;
      const pool = timerMode === 'work' ? CHESS_WORK_PHRASES : CHESS_BREAK_PHRASES;
      return pool[Math.floor(Math.random() * pool.length)];
    },
    onPomodoro() {
      if (mode !== 'ajedrez') return;
      data.pomodoros += 1;
      save();
      toast('♟️ Bloque de entrenamiento terminado. Anota tu pequeña victoria abajo.', 6000);
      $('#win-panel')?.classList.add('is-glow');
      setTimeout(() => $('#win-panel')?.classList.remove('is-glow'), 6000);
    },
  };
}
