/* =====================================================================
   anticheat.js — Easter egg anti-trampas para ingenieros curiosos.

   Los tickets reales viven dentro del módulo store.js (no hay ninguna
   variable global que se pueda tocar desde la consola) y cada guardado
   va firmado. Aquí se ponen "señuelos" en la consola: si alguien escribe
   `tickets = 999`, `store.tickets = 999` o `addTickets(50)`, salta la trampa.
   ===================================================================== */

import { store } from './store.js';

const MESSAGE = 'Buen intento, ingeniero. Pero los tickets se ganan estudiando. Atte: Tu novia.';

function bigConsoleMessage() {
  console.log(
    `%c🚨 ${MESSAGE} 🚨`,
    'font-size:28px;font-weight:bold;color:#fff;background:#2f6fed;padding:16px 20px;border:6px solid #4a3222;line-height:1.4;',
  );
  console.log('%cPenalización: en tus próximas partidas del arcade TODOS los enemigos serán Darth Vader. 😈', 'font-size:14px;color:#d1495b;');
}

/**
 * @param {(message: string) => void} onCaught  Se llama al detectar la trampa (para avisar en la app).
 */
export function initAntiCheat(onCaught) {
  const caught = () => {
    bigConsoleMessage();
    store.applyPenalty();
    onCaught?.(MESSAGE);
    return 0;
  };

  // 1) ¿Se editó localStorage a mano antes de cargar? (lo detecta store.js con la firma)
  if (store.tampered) caught();

  // 2) Señuelos en la consola
  const bait = (obj, name, value) => {
    try {
      Object.defineProperty(obj, name, { configurable: false, get: () => value(), set: () => { caught(); } });
    } catch { /* ya existía: no pasa nada */ }
  };
  bait(window, 'tickets', () => store.tickets);
  bait(window, 'monedas', () => store.tickets);

  const fakeStore = new Proxy({}, {
    get: (_, prop) => {
      if (prop === 'tickets') return store.tickets;
      if (typeof prop === 'string' && /add|set|give|ticket|buy/i.test(prop)) return () => caught();
      return undefined;
    },
    set: () => { caught(); return true; },
  });
  try { Object.defineProperty(window, 'store', { configurable: false, get: () => fakeStore, set: () => { caught(); } }); } catch { /* */ }
  window.addTickets = () => caught();
  window.setTickets = () => caught();

  // 3) ¿Editó localStorage desde otra pestaña mientras la app está abierta?
  window.addEventListener('storage', (e) => {
    if (e.key && e.key.startsWith('pomodoroArcade.v1') && store.verifyStorage() === false) caught();
  });
}
