/* =====================================================================
   agenda.js — Pestaña "Agenda".
     1. Nota del día (public/contenido/notas.js + las que se agreguen en la app).
     2. Cuenta regresiva (public/contenido/eventos.js + los que se agreguen en la app).
     3. Pendientes por categoría.
   Todo se puede editar desde la app. Lo que se cambia en la app se guarda
   en ese navegador; lo que se cambia en GitHub llega a todos los dispositivos.
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
/** Clave que identifica a un evento predeterminado (para poder ocultarlo). */
const eventKey = (e) => `${e.nombre}|${e.fecha}`;
const todayKey = () => { const d = startOfToday(); return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`; };

function countdownText(days) {
  if (days === 0) return '¡Es hoy!';
  if (days === 1) return 'Mañana';
  if (days > 1) return `Faltan ${days} días`;
  return days === -1 ? 'Fue ayer' : `Hace ${-days} días`;
}

/* ---------- contenido editable en GitHub ----------
   Viven en public/contenido/ y se cargan al abrir la app (no pasan por
   el empaquetador): si un archivo queda con un error de escritura, la
   app sigue funcionando y avisa en la Agenda. */
const contentUrl = (file) => `${import.meta.env.BASE_URL}contenido/${file}?v=${Date.now()}`;
async function loadContent() {
  const result = { notes: [], events: [], errors: [] };
  try {
    const mod = await import(/* @vite-ignore */ contentUrl('notas.js'));
    result.notes = (mod.NOTAS || [])
      .map((n) => (typeof n === 'string' ? { texto: n } : n))
      .filter((n) => n && typeof n.texto === 'string' && n.texto.trim());
  } catch (err) {
    console.error('[agenda] public/contenido/notas.js', err);
    result.errors.push('public/contenido/notas.js');
  }
  try {
    const mod = await import(/* @vite-ignore */ contentUrl('eventos.js'));
    result.events = (mod.EVENTOS || []).filter((e) => e && e.nombre && parseDate(e.fecha));
  } catch (err) {
    console.error('[agenda] public/contenido/eventos.js', err);
    result.errors.push('public/contenido/eventos.js');
  }
  return result;
}

export async function initAgenda() {
  const $ = (sel) => document.querySelector(sel);
  const content = await loadContent();
  const openCats = new Set();
  let refocus = null;
  let noteOffset = 0; // cuántas veces pulsó "Otra nota"
  let visibleEvents = [];
  let editing = null;  // ref del evento que se está editando

  if (content.errors.length) {
    $('#agenda-error').hidden = false;
    $('#agenda-error').textContent = `No se pudo leer ${content.errors.join(' ni ')}. Revisa que no falte una coma o una comilla.`;
  }

  /* ---------- 1. Nota del día ---------- */
  /** Todas las notas visibles: las del archivo (menos las ocultas) + las de la app. */
  function allNotes() {
    const hidden = new Set(store.state.hiddenNotes);
    return [
      ...store.state.notes.map((n) => ({ ...n, own: true })),
      ...content.notes.filter((n) => !hidden.has(n.texto)).map((n) => ({ ...n, own: false })),
    ];
  }

  function renderNote() {
    const today = startOfToday();
    const notes = allNotes();
    const dated = notes.filter((n) => n.fecha && parseDate(n.fecha)?.getTime() === today.getTime());
    const general = notes.filter((n) => !n.fecha);
    let note = null;
    if (dated.length && noteOffset === 0) note = dated[0];
    else if (general.length) {
      const dayNumber = Math.floor(today.getTime() / DAY);
      note = general[(dayNumber + noteOffset) % general.length];
    }
    $('#note-text').textContent = note ? note.texto : 'Hoy no hay nota, pero igual te quiero.';
    $('#note-next').hidden = general.length < 2;

    // Lista del editor
    $('#note-list').innerHTML = notes.map((n, i) => `
      <li>
        <span>${escapeHtml(n.texto)}</span>
        ${n.fecha ? `<span class="tag">📅 ${escapeHtml(n.fecha)}</span>` : ''}
        <button type="button" class="icon-btn danger" data-note-index="${i}" aria-label="Quitar nota">X</button>
      </li>`).join('') || '<li><span>No hay notas. Escribe la primera arriba.</span></li>';
  }
  $('#note-next').addEventListener('click', () => { noteOffset += 1; renderNote(); });

  $('#note-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const date = $('#note-date').value;
    if (!store.addNote($('#note-input').value, parseDate(date) ? date : '')) return;
    $('#note-input').value = '';
    $('#note-date').value = '';
  });

  $('#note-list').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-note-index]');
    if (!btn) return;
    const note = allNotes()[Number(btn.dataset.noteIndex)];
    if (!note) return;
    if (note.own) store.removeNote(note.id);
    else store.hideNote(note.texto); // las predeterminadas se ocultan en este navegador
  });

  /* ---------- 2. Cuenta regresiva ---------- */
  function renderEvents() {
    const hidden = new Set(store.state.hiddenEvents);
    const fromFile = content.events
      .filter((e) => !hidden.has(eventKey(e)))
      .map((e) => ({ ...e, date: parseDate(e.fecha), own: false, ref: `file:${eventKey(e)}` }));
    const own = store.state.events.map((e) => ({ ...e, date: parseDate(e.fecha), own: true, ref: `own:${e.id}` })).filter((e) => e.date);
    const all = [...fromFile, ...own]
      .map((e) => ({ ...e, days: daysUntil(e.date) }))
      .filter((e) => e.own || e.days >= 0) // los del archivo que ya pasaron se ocultan solos
      .sort((a, b) => (a.days < 0) - (b.days < 0) || a.date - b.date);

    visibleEvents = all;
    $('#event-empty').hidden = all.length > 0;
    $('#event-list').innerHTML = all.map((e) => {
      const cat = EVENT_CATEGORIES[e.categoria] || EVENT_CATEGORIES.otro;
      const when = e.date.toLocaleDateString('es', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
      const urgency = e.days < 0 ? 'is-past' : e.days === 0 ? 'is-today' : e.days <= 7 ? 'is-soon' : '';
      return `
        <li class="event ${urgency} ${editing === e.ref ? 'is-editing' : ''}">
          <div class="event-days">
            <strong>${e.days === 0 ? '¡HOY!' : Math.abs(e.days)}</strong>
            <span>${e.days === 0 ? '' : e.days < 0 ? 'ya pasó' : e.days === 1 ? 'día' : 'días'}</span>
          </div>
          <div class="event-info">
            <p class="event-name">${cat.emoji} ${escapeHtml(e.nombre)}${e.own ? '' : ' <span title="Te lo puso tu novia">💌</span>'}</p>
            <p class="event-meta">${escapeHtml(cat.label)} · ${escapeHtml(when)} · ${countdownText(e.days)}</p>
            ${e.nota ? `<p class="event-note">${escapeHtml(e.nota)}</p>` : ''}
          </div>
          <div class="event-actions">
            <button type="button" class="icon-btn" data-edit-event="${escapeHtml(e.ref)}" aria-label="Editar ${escapeHtml(e.nombre)}">✏️</button>
            <button type="button" class="icon-btn danger" data-remove-event="${escapeHtml(e.ref)}" aria-label="Quitar ${escapeHtml(e.nombre)}">X</button>
          </div>
        </li>`;
    }).join('');
  }

  $('#event-category').innerHTML = Object.entries(EVENT_CATEGORIES)
    .map(([key, c]) => `<option value="${key}">${c.emoji} ${c.label}</option>`).join('');

  /** Quita un evento: los propios se borran; los predeterminados se ocultan. */
  function removeEvent(ref) {
    const ev = visibleEvents.find((x) => x.ref === ref);
    if (!ev) return;
    if (ev.own) store.removeEvent(ev.id);
    else store.hideEvent(eventKey(ev));
  }

  function stopEditing() {
    editing = null;
    $('#event-name').value = '';
    $('#event-date').value = '';
    $('#event-submit').textContent = '+ Evento';
    $('#event-cancel').hidden = true;
    $('#event-msg').textContent = '';
  }

  $('#event-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const data = { nombre: $('#event-name').value.trim(), fecha: $('#event-date').value, categoria: $('#event-category').value };
    if (!data.nombre || !parseDate(data.fecha)) { $('#event-msg').textContent = 'Escribe el nombre y elige la fecha.'; return; }
    const ev = editing && visibleEvents.find((x) => x.ref === editing);
    const ref = editing;
    stopEditing();
    if (ev?.own) store.updateEvent(ev.id, data);
    else {
      // Editar uno predeterminado = ocultar el original y guardar la versión nueva
      if (ev) { if (ev.nota) data.nota = ev.nota; store.hideEvent(eventKey(ev)); }
      store.addEvent(data);
    }
    if (!ref) renderEvents();
  });

  $('#event-cancel').addEventListener('click', () => { stopEditing(); renderEvents(); });

  $('#event-list').addEventListener('click', (e) => {
    const remove = e.target.closest('[data-remove-event]');
    if (remove) {
      if (editing === remove.dataset.removeEvent) stopEditing();
      removeEvent(remove.dataset.removeEvent);
      return;
    }
    const edit = e.target.closest('[data-edit-event]');
    if (!edit) return;
    const ev = visibleEvents.find((x) => x.ref === edit.dataset.editEvent);
    if (!ev) return;
    editing = ev.ref;
    $('#event-name').value = ev.nombre;
    $('#event-date').value = `${ev.date.getFullYear()}-${String(ev.date.getMonth() + 1).padStart(2, '0')}-${String(ev.date.getDate()).padStart(2, '0')}`;
    $('#event-category').value = EVENT_CATEGORIES[ev.categoria] ? ev.categoria : 'otro';
    $('#event-submit').textContent = '✔ Guardar';
    $('#event-cancel').hidden = false;
    renderEvents();
    $('#event-name').focus();
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
          <button type="button" class="icon-btn" data-action="edit-task" aria-label="Editar ${escapeHtml(t.text)}">✏️</button>
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
            <button type="button" class="btn btn-ghost btn-small" data-action="rename-cat">✏️ Renombrar</button>
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
    } else if (btn.dataset.action === 'edit-task') {
      const taskId = btn.closest('[data-task]').dataset.task;
      const task = store.state.taskCats.find((c) => c.id === catId)?.tasks.find((t) => t.id === taskId);
      const text = prompt('Editar pendiente:', task?.text || '');
      if (text) store.renameTask(catId, taskId, text);
    } else if (btn.dataset.action === 'rename-cat') {
      const cat = store.state.taskCats.find((c) => c.id === catId);
      const name = prompt('Nuevo nombre de la categoría:', cat?.name || '');
      if (name) store.renameTaskCat(catId, name);
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
    $('#restore-wrap').hidden = !(store.state.hiddenNotes.length || store.state.hiddenEvents.length);
  }

  $('#restore-defaults').addEventListener('click', () => store.restoreDefaults());
  // Si deja la pestaña abierta toda la noche, al cambiar el día se actualiza sola
  setInterval(() => {
    if (todayKey() !== lastDay) { lastDay = todayKey(); noteOffset = 0; render(); }
  }, 60 * 1000);

  return { render };
}
