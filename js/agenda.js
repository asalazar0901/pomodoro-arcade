/* =====================================================================
   agenda.js — Pestaña "Agenda".
     1. Nota del día (viene de contenido/notas.js, editable en GitHub).
     2. Cuenta regresiva de eventos (contenido/eventos.js + los que él agregue).
     3. Pendientes por categoría (se guardan en su navegador).
   ===================================================================== */

import { store } from './store.js';

const escapeHtml = (s) => String(s).replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));

/* Categorías de eventos. Para agregar una, añade una línea aquí. */
export const EVENT_CATEGORIES = {
  ajedrez:  { label: 'Ajedrez',  emoji: '♟️' },
  examen:   { label: 'Examen',   emoji: '📝' },
  tarea:    { label: 'Tarea',    emoji: '📚' },
  nosotros: { label: 'Nosotros', emoji: '💙' },
  otro:     { label: 'Otro',     emoji: '📌' },
};

/* ---------- fechas ---------- */
const DAY = 24 * 60 * 60 * 1000;
const startOfToday = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };

/** 'AAAA-MM-DD' -> Date local (o null si está mal escrita). */
function parseDate(text) {
  const m = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(String(text || '').trim());
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return Number.isNaN(d.getTime()) ? null : d;
}
const daysUntil = (date) => Math.round((date - startOfToday()) / DAY);
const todayKey = () => { const d = startOfToday(); return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`; };

function countdownText(days) {
  if (days === 0) return '¡Es hoy!';
  if (days === 1) return 'Mañana';
  if (days > 1) return `Faltan ${days} días`;
  return days === -1 ? 'Fue ayer' : `Hace ${-days} días`;
}

/* ---------- contenido editable en GitHub ----------
   Se importa de forma dinámica: si un archivo queda con un error de
   escritura, la app sigue funcionando y avisa en la Agenda. */
async function loadContent() {
  const result = { notes: [], events: [], errors: [] };
  try {
    const mod = await import('../contenido/notas.js');
    result.notes = (mod.NOTAS || [])
      .map((n) => (typeof n === 'string' ? { texto: n } : n))
      .filter((n) => n && typeof n.texto === 'string' && n.texto.trim());
  } catch (err) {
    console.error('[agenda] contenido/notas.js', err);
    result.errors.push('contenido/notas.js');
  }
  try {
    const mod = await import('../contenido/eventos.js');
    result.events = (mod.EVENTOS || []).filter((e) => e && e.nombre && parseDate(e.fecha));
  } catch (err) {
    console.error('[agenda] contenido/eventos.js', err);
    result.errors.push('contenido/eventos.js');
  }
  return result;
}

export async function initAgenda() {
  const $ = (sel) => document.querySelector(sel);
  const content = await loadContent();
  const openCats = new Set();
  let refocus = null;
  let noteOffset = 0; // cuántas veces pulsó "Otra nota"

  if (content.errors.length) {
    $('#agenda-error').hidden = false;
    $('#agenda-error').textContent = `No se pudo leer ${content.errors.join(' ni ')}. Revisa que no falte una coma o una comilla.`;
  }

  /* ---------- 1. Nota del día ---------- */
  function renderNote() {
    const today = startOfToday();
    const dated = content.notes.filter((n) => n.fecha && parseDate(n.fecha)?.getTime() === today.getTime());
    const general = content.notes.filter((n) => !n.fecha);
    let note = null;
    if (dated.length && noteOffset === 0) note = dated[0];
    else if (general.length) {
      const dayNumber = Math.floor(today.getTime() / DAY);
      note = general[(dayNumber + noteOffset) % general.length];
    }
    $('#note-text').textContent = note ? note.texto : 'Hoy no hay nota, pero igual te quiero.';
    $('#note-next').hidden = general.length < 2;
  }
  $('#note-next').addEventListener('click', () => { noteOffset += 1; renderNote(); });

  /* ---------- 2. Cuenta regresiva ---------- */
  function renderEvents() {
    const fromFile = content.events.map((e) => ({ ...e, date: parseDate(e.fecha), own: false }));
    const own = store.state.events.map((e) => ({ ...e, date: parseDate(e.fecha), own: true })).filter((e) => e.date);
    const all = [...fromFile, ...own]
      .map((e) => ({ ...e, days: daysUntil(e.date) }))
      .filter((e) => e.own || e.days >= 0) // los del archivo que ya pasaron se ocultan solos
      .sort((a, b) => (a.days < 0) - (b.days < 0) || a.date - b.date);

    $('#event-empty').hidden = all.length > 0;
    $('#event-list').innerHTML = all.map((e) => {
      const cat = EVENT_CATEGORIES[e.categoria] || EVENT_CATEGORIES.otro;
      const when = e.date.toLocaleDateString('es', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
      const urgency = e.days < 0 ? 'is-past' : e.days === 0 ? 'is-today' : e.days <= 7 ? 'is-soon' : '';
      return `
        <li class="event ${urgency}">
          <div class="event-days">
            <strong>${e.days === 0 ? '¡HOY!' : Math.abs(e.days)}</strong>
            <span>${e.days === 0 ? '' : e.days < 0 ? 'ya pasó' : e.days === 1 ? 'día' : 'días'}</span>
          </div>
          <div class="event-info">
            <p class="event-name">${cat.emoji} ${escapeHtml(e.nombre)}</p>
            <p class="event-meta">${escapeHtml(cat.label)} · ${escapeHtml(when)} · ${countdownText(e.days)}</p>
            ${e.nota ? `<p class="event-note">${escapeHtml(e.nota)}</p>` : ''}
          </div>
          ${e.own
            ? `<button type="button" class="icon-btn danger" data-remove-event="${e.id}" aria-label="Quitar ${escapeHtml(e.nombre)}">X</button>`
            : '<span class="event-from" title="Te lo puso tu novia">💌</span>'}
        </li>`;
    }).join('');
  }

  $('#event-category').innerHTML = Object.entries(EVENT_CATEGORIES)
    .map(([key, c]) => `<option value="${key}">${c.emoji} ${c.label}</option>`).join('');

  $('#event-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = $('#event-name').value.trim();
    const date = $('#event-date').value;
    const msg = $('#event-msg');
    if (!name || !parseDate(date)) { msg.textContent = 'Escribe el nombre y elige la fecha.'; return; }
    msg.textContent = '';
    store.addEvent({ nombre: name, fecha: date, categoria: $('#event-category').value });
    $('#event-name').value = '';
    $('#event-date').value = '';
  });

  $('#event-list').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-remove-event]');
    if (btn) store.removeEvent(btn.dataset.removeEvent);
  });

  /* ---------- 3. Pendientes por categoría ---------- */
  function renderTasks() {
    const cats = store.state.taskCats;
    $('#taskcat-empty').hidden = cats.length > 0;
    $('#taskcat-list').innerHTML = cats.map((c) => {
      const pending = c.tasks.filter((t) => !t.done).length;
      const tasks = c.tasks.map((t) => `
        <li class="topic ${t.done ? 'is-done' : ''}" data-task="${t.id}">
          <label>
            <input type="checkbox" data-action="toggle" ${t.done ? 'checked' : ''} />
            <span>${escapeHtml(t.text)}</span>
          </label>
          <button type="button" class="icon-btn danger" data-action="remove-task" aria-label="Quitar ${escapeHtml(t.text)}">X</button>
        </li>`).join('');
      return `
        <details class="subject ${c.tasks.length && !pending ? 'is-complete' : ''}" data-cat="${c.id}" ${openCats.has(c.id) ? 'open' : ''}>
          <summary>
            <span class="subject-name">${escapeHtml(c.name)}</span>
            <span class="subject-count">${pending ? `${pending} pendiente${pending === 1 ? '' : 's'}` : c.tasks.length ? '✔ al día' : 'vacía'}</span>
          </summary>
          <div class="subject-body">
            ${c.tasks.length ? `<ul class="topics">${tasks}</ul>` : '<p class="empty-topics">Nada pendiente aquí.</p>'}
            <form class="add-row" data-action="add-task" autocomplete="off">
              <input type="text" maxlength="80" placeholder="Nuevo pendiente" aria-label="Nuevo pendiente en ${escapeHtml(c.name)}" />
              <button class="btn btn-ghost btn-small" type="submit">+ Agregar</button>
            </form>
            <button type="button" class="btn btn-ghost btn-small" data-action="remove-cat">🗑 Quitar categoría</button>
          </div>
        </details>`;
    }).join('');

    if (refocus) {
      $(`#taskcat-list [data-cat="${refocus}"] form input`)?.focus();
      refocus = null;
    }
  }

  const list = $('#taskcat-list');

  $('#taskcat-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const input = $('#taskcat-input');
    const cat = store.addTaskCat(input.value);
    if (!cat) return;
    input.value = '';
    openCats.add(cat.id);
    refocus = cat.id;
    renderTasks();
  });

  list.addEventListener('toggle', (e) => {
    const id = e.target.dataset?.cat;
    if (!id) return;
    e.target.open ? openCats.add(id) : openCats.delete(id);
  }, true);

  list.addEventListener('submit', (e) => {
    const f = e.target.closest('[data-action="add-task"]');
    if (!f) return;
    e.preventDefault();
    const catId = f.closest('[data-cat]').dataset.cat;
    refocus = catId;
    if (!store.addTask(catId, f.querySelector('input').value)) refocus = null;
  });

  list.addEventListener('change', (e) => {
    if (e.target.dataset.action !== 'toggle') return;
    store.toggleTask(e.target.closest('[data-cat]').dataset.cat, e.target.closest('[data-task]').dataset.task, e.target.checked);
  });

  list.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;
    const catId = btn.closest('[data-cat]').dataset.cat;
    if (btn.dataset.action === 'remove-task') {
      store.removeTask(catId, btn.closest('[data-task]').dataset.task);
    } else if (btn.dataset.action === 'remove-cat') {
      const cat = store.state.taskCats.find((c) => c.id === catId);
      const n = cat.tasks.length;
      if (n && !confirm(`¿Quitar "${cat.name}" con sus ${n} pendiente${n === 1 ? '' : 's'}?`)) return;
      openCats.delete(catId);
      store.removeTaskCat(catId);
    }
  });

  /* ---------- render general ---------- */
  let lastDay = todayKey();
  function render() {
    renderNote();
    renderEvents();
    renderTasks();
  }
  // Si deja la pestaña abierta toda la noche, al cambiar el día se actualiza sola
  setInterval(() => {
    if (todayKey() !== lastDay) { lastDay = todayKey(); noteOffset = 0; render(); }
  }, 60 * 1000);

  return { render };
}
