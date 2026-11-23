/* =====================================================================
   registro.js — Manda cada evento a la hoja de Google Sheets de su novia.
   La dirección de la hoja va en public/contenido/registro.js. Si está
   vacía, no se manda nada. Si no hay internet, los eventos esperan en
   cola y se mandan la próxima vez.
   La app le avisa a él (en «Tu progreso») que su novia ve sus avances.
   ===================================================================== */

const QUEUE_KEY = 'pomodoroArcade.registroCola';
let url = '';
let ready = null;
let sending = false;

function loadQueue() {
  try { return JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]'); } catch { return []; }
}
function saveQueue(q) {
  try { localStorage.setItem(QUEUE_KEY, JSON.stringify(q.slice(-200))); } catch { /* sin almacenamiento */ }
}

async function send(rows) {
  // text/plain evita la "preflight" de CORS; Apps Script lo recibe igual en doPost
  await fetch(url, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ rows }) });
}

async function flush() {
  if (!url) return;
  if (sending) return;
  const q = loadQueue();
  if (!q.length) return;
  sending = true;
  try {
    await send(q);
    saveQueue(loadQueue().slice(q.length)); // quita solo lo enviado
  } catch { /* sin internet: se intenta después */ }
  sending = false;
  if (loadQueue().length && navigator.onLine !== false) setTimeout(flush, 1500);
}

/** Lee la dirección de la hoja. Devuelve true si el registro está activo. */
export async function initRegistro() {
  ready = (async () => {
    try {
      const mod = await import(/* @vite-ignore */ `${import.meta.env.BASE_URL}contenido/registro.js?v=${Date.now()}`);
      const u = String(mod.REGISTRO?.hojaUrl || '').trim();
      url = /^https:\/\/script\.google(usercontent)?\.com\//.test(u) ? u : '';
    } catch { url = ''; }
    if (url) {
      flush();
      window.addEventListener('online', flush);
    }
    return !!url;
  })();
  return ready;
}

/**
 * Anota un evento.
 * @param {string} tipo     p. ej. 'Pomodoro', 'Minijuego', 'Insignia', 'Castigo'
 * @param {string} detalle  una frase legible
 * @param {object} [extra]  { tickets }
 */
export function registrar(tipo, detalle, extra = {}) {
  const row = { fecha: new Date().toISOString(), tipo, detalle: String(detalle).slice(0, 300), ...extra };
  Promise.resolve(ready).then(() => {
    if (!url) return;
    const q = loadQueue();
    q.push(row);
    saveQueue(q);
    flush();
  });
}
