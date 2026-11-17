/* =====================================================================
   syllabus.js — Temarios de examen.
   Materias (categorías) que se abren como carpetas, cada una con su
   checklist de temas. También el selector "Estudiando ahora" del Pomodoro.
   Los datos viven en store.js (state.subjects y state.focus).
   ===================================================================== */

import { store } from './store.js';

const escapeHtml = (s) => String(s).replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));

export function initSyllabus() {
  const list = document.querySelector('#subject-list');
  const empty = document.querySelector('#subject-empty');
  const form = document.querySelector('#subject-form');
  const input = document.querySelector('#subject-input');
  const select = document.querySelector('#focus-select');

  const open = new Set();   // materias desplegadas (para no cerrarlas al repintar)
  let refocus = null;       // materia cuyo campo "nuevo tema" debe recuperar el foco

  /* ---------- render ---------- */
  function render() {
    const subjects = store.subjects;
    const focus = store.state.focus;
    empty.hidden = subjects.length > 0;

    list.innerHTML = subjects.map((s) => {
      const done = s.topics.filter((t) => t.done).length;
      const total = s.topics.length;
      const complete = total > 0 && done === total;
      const topics = s.topics.map((t) => {
        const isFocus = focus?.topicId === t.id;
        return `
          <li class="topic ${t.done ? 'is-done' : ''} ${isFocus ? 'is-focus' : ''}" data-topic="${t.id}">
            <label>
              <input type="checkbox" data-action="toggle" ${t.done ? 'checked' : ''} />
              <span>${escapeHtml(t.name)}</span>
            </label>
            ${t.pomodoros ? `<span class="topic-poms" title="Pomodoros dedicados">🍅×${t.pomodoros}</span>` : ''}
            <button type="button" class="icon-btn ${isFocus ? 'is-on' : ''}" data-action="focus"
              title="${isFocus ? 'Es el tema del Pomodoro' : 'Estudiar este tema en el Pomodoro'}"
              aria-label="Estudiar ${escapeHtml(t.name)} en el Pomodoro" aria-pressed="${isFocus}">🎯</button>
            <button type="button" class="icon-btn danger" data-action="remove-topic" aria-label="Quitar tema ${escapeHtml(t.name)}">X</button>
          </li>`;
      }).join('');

      return `
        <details class="subject ${complete ? 'is-complete' : ''}" data-subject="${s.id}" ${open.has(s.id) ? 'open' : ''}>
          <summary>
            <span class="subject-name">${escapeHtml(s.name)}</span>
            <span class="subject-count">${complete ? '✔ ' : ''}${done}/${total}</span>
          </summary>
          <div class="subject-body">
            <div class="subject-bar"><div style="width:${total ? (100 * done) / total : 0}%"></div></div>
            ${total ? `<ul class="topics">${topics}</ul>` : '<p class="empty-topics">Sin temas todavía. Agrega el primero aquí abajo.</p>'}
            <form class="add-row" data-action="add-topic" autocomplete="off">
              <input type="text" maxlength="60" placeholder="Nuevo tema (ej. Derivadas)" aria-label="Nuevo tema de ${escapeHtml(s.name)}" />
              <button class="btn btn-ghost btn-small" type="submit">+ Tema</button>
            </form>
            <button type="button" class="btn btn-ghost btn-small" data-action="remove-subject">🗑 Quitar materia</button>
          </div>
        </details>`;
    }).join('');

    // Selector "Estudiando ahora" del Pomodoro
    const groups = subjects.filter((s) => s.topics.length).map((s) => `
      <optgroup label="${escapeHtml(s.name)}">
        ${s.topics.map((t) => `<option value="${s.id}|${t.id}" ${focus?.topicId === t.id ? 'selected' : ''}>${t.done ? '✔ ' : ''}${escapeHtml(t.name)}</option>`).join('')}
      </optgroup>`).join('');
    select.innerHTML = `<option value="">${groups ? 'Sin tema elegido' : 'Agrega temas en tu temario'}</option>${groups}`;
    if (!store.focusedTopic()) select.value = '';

    if (refocus) {
      list.querySelector(`[data-subject="${refocus}"] form input`)?.focus();
      refocus = null;
    }
  }

  /* ---------- eventos ---------- */
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const subject = store.addSubject(input.value);
    if (!subject) return;
    input.value = '';
    open.add(subject.id);   // la materia nueva queda abierta, lista para escribir temas
    refocus = subject.id;
    render();
  });

  // Recordar qué carpetas están abiertas
  list.addEventListener('toggle', (e) => {
    const id = e.target.dataset?.subject;
    if (!id) return;
    e.target.open ? open.add(id) : open.delete(id);
  }, true);

  list.addEventListener('submit', (e) => {
    const f = e.target.closest('[data-action="add-topic"]');
    if (!f) return;
    e.preventDefault();
    const subjectId = f.closest('[data-subject]').dataset.subject;
    refocus = subjectId;    // para seguir escribiendo temas uno tras otro
    if (!store.addTopic(subjectId, f.querySelector('input').value)) refocus = null;
  });

  list.addEventListener('change', (e) => {
    if (e.target.dataset.action !== 'toggle') return;
    const subjectId = e.target.closest('[data-subject]').dataset.subject;
    const topicId = e.target.closest('[data-topic]').dataset.topic;
    store.toggleTopic(subjectId, topicId, e.target.checked);
  });

  list.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;
    const subjectId = btn.closest('[data-subject]').dataset.subject;
    const topicId = btn.closest('[data-topic]')?.dataset.topic;
    const subject = store.subjects.find((s) => s.id === subjectId);

    if (btn.dataset.action === 'focus') {
      const already = store.state.focus?.topicId === topicId;
      store.setFocus(already ? null : subjectId, already ? null : topicId);
    } else if (btn.dataset.action === 'remove-topic') {
      store.removeTopic(subjectId, topicId);
    } else if (btn.dataset.action === 'remove-subject') {
      const n = subject.topics.length;
      if (n && !confirm(`¿Quitar "${subject.name}" con sus ${n} tema${n === 1 ? '' : 's'}?`)) return;
      open.delete(subjectId);
      store.removeSubject(subjectId);
    }
  });

  select.addEventListener('change', () => {
    const [subjectId, topicId] = select.value.split('|');
    store.setFocus(subjectId || null, topicId || null);
  });

  return { render };
}
