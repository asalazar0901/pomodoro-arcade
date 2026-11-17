/* =====================================================================
   security.js — Código de seguridad (modo novia).
   Con el código se puede:
     1. Poner bloques de trabajo de menos de 15 minutos.
     2. Abrir los minijuegos fuera del descanso.

   El código NO está escrito aquí: solo se guarda su huella SHA-256, así
   que leer este archivo no revela cuál es.

   PARA CAMBIAR EL CÓDIGO:
     1. Abre la app, pulsa F12 y ve a la pestaña "Console".
     2. Escribe:  await hashCode('tu-codigo-nuevo')
     3. Copia el texto que devuelve y pégalo abajo en ADMIN_CODE_HASH.
   (No distingue mayúsculas de minúsculas ni espacios al inicio o al final.)
   ===================================================================== */

const ADMIN_CODE_HASH = '407d575c54987a8a13a2cecb1a461aa480f0a718b2ba10da6d886669b6e4ba3f';

export async function hashCode(text) {
  const data = new TextEncoder().encode(String(text).trim().toLowerCase());
  const digest = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}
window.hashCode = hashCode; // disponible en la consola para generar una huella nueva

/* El desbloqueo vive solo en memoria: al recargar o cerrar la página se
   vuelve a bloquear, para que el código no se quede "puesto". */
let unlocked = false;
const listeners = new Set();

export const security = {
  get unlocked() { return unlocked; },

  /** Devuelve true si el código es correcto (y deja la sesión desbloqueada). */
  async unlock(code) {
    if (!code || !code.trim()) return false;
    let ok = false;
    try { ok = (await hashCode(code)) === ADMIN_CODE_HASH; } catch { ok = false; }
    if (ok && !unlocked) {
      unlocked = true;
      listeners.forEach((fn) => fn(unlocked));
    }
    return ok;
  },

  lock() {
    if (!unlocked) return;
    unlocked = false;
    listeners.forEach((fn) => fn(unlocked));
  },

  onChange(fn) { listeners.add(fn); },
};
