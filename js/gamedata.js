/* =====================================================================
   gamedata.js — Carga y valida los datos de los minijuegos.
   Los datos viven en public/contenido/juegos.js (editable en GitHub).
   Si ese archivo falta o tiene un error, se usan los de fábrica de aquí.
   ===================================================================== */

const FALLBACK = {
  ahorcado: [{ palabra: 'brownie', pista: 'El premio más barato de la tienda' }],
  cosidle: ['grogu', 'besos', 'pasta'],
  trivia: {
    titulo: 'Examen sorpresa', segundos: 15, cuantas: 3, aprobar: 2,
    preguntas: [
      { pregunta: '¿Cuántos minutos dura un Pomodoro clásico?', opciones: ['15', '25', '45', '60'], correcta: 'B' },
    ],
  },
  ajedrez: [{ titulo: 'Mate del pasillo', fen: '6k1/5ppp/8/8/8/8/5PPP/4R1K1 w - - 0 1', solucion: 'e1-e8' }],
  sopa: [
    { id: 'apodos', titulo: 'Mapa 1: Apodos', palabras: ['cosi', 'marshmello', 'grogu', 'besito', 'precioso', 'mivida'] },
    { id: 'carino', titulo: 'Mapa 2: Cariño', palabras: ['tequiero', 'teamo', 'sosasombroso'] },
  ],
};

/** MAYÚSCULAS, sin tildes (la Ñ se conserva) y solo letras; `keepSpaces` deja los espacios. */
export function normalizeWord(text, keepSpaces = false) {
  const clean = String(text ?? '')
    .toUpperCase()
    .replace(/Ñ/g, '\u0001')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/\u0001/g, 'Ñ')
    .replace(keepSpaces ? /[^A-ZÑ ]/g : /[^A-ZÑ]/g, '');
  return keepSpaces ? clean.replace(/\s+/g, ' ').trim() : clean;
}

const SQUARE = /^[a-h][1-8]$/;
const isList = (v) => Array.isArray(v) && v.length > 0;

function clean(raw) {
  const data = {};

  const max = Math.floor(Number(raw.ajustes?.ticketsMaxPorDescanso));
  data.ajustes = { ticketsMaxPorDescanso: Number.isFinite(max) ? Math.max(1, Math.min(max, 10)) : 2 };

  data.ahorcado = (raw.ahorcado || [])
    .map((x) => ({ palabra: normalizeWord(x?.palabra, true), pista: String(x?.pista || '') }))
    .filter((x) => x.palabra.replace(/ /g, '').length >= 3);

  data.cosidle = [...new Set((raw.cosidle || []).map((w) => normalizeWord(w)).filter((w) => w.length === 5))];

  const t = raw.trivia || {};
  const preguntas = (t.preguntas || []).filter((q) =>
    q && q.pregunta && Array.isArray(q.opciones) && q.opciones.length >= 2
    && 'ABCD'.indexOf(String(q.correcta).toUpperCase()) >= 0
    && 'ABCD'.indexOf(String(q.correcta).toUpperCase()) < q.opciones.length);
  data.trivia = {
    titulo: String(t.titulo || FALLBACK.trivia.titulo),
    segundos: Math.max(5, Number(t.segundos) || 15),
    cuantas: Math.max(1, Math.min(Number(t.cuantas) || 5, preguntas.length || 1)),
    aprobar: Math.max(1, Number(t.aprobar) || 3),
    preguntas,
  };
  data.trivia.aprobar = Math.min(data.trivia.aprobar, data.trivia.cuantas);

  data.ajedrez = (raw.ajedrez || []).filter((p) => {
    const [from, to] = String(p?.solucion || '').toLowerCase().split('-');
    return p && typeof p.fen === 'string' && p.fen.split(' ')[0].split('/').length === 8 && SQUARE.test(from) && SQUARE.test(to);
  });

  data.sopa = (raw.sopa || [])
    .map((m) => ({
      id: String(m?.id || '').trim(),
      titulo: String(m?.titulo || m?.id || ''),
      palabras: (m?.palabras || []).map((w) => normalizeWord(w)).filter((w) => w.length >= 2 && w.length <= 12),
    }))
    .filter((m) => m.id && m.palabras.length);

  // Lo que quede vacío se rellena con lo de fábrica
  const usedFallback = [];
  for (const key of ['ahorcado', 'cosidle', 'ajedrez', 'sopa']) {
    if (!isList(data[key])) { data[key] = clean0(key); usedFallback.push(key); }
  }
  if (!isList(data.trivia.preguntas)) { data.trivia = clean0('trivia'); usedFallback.push('trivia'); }
  return { data, usedFallback };
}

// Los datos de fábrica ya limpios (se calculan una sola vez)
let fallbackClean = null;
function clean0(key) {
  if (!fallbackClean) {
    fallbackClean = {
      ahorcado: FALLBACK.ahorcado.map((x) => ({ palabra: normalizeWord(x.palabra, true), pista: x.pista })),
      cosidle: FALLBACK.cosidle.map((w) => normalizeWord(w)),
      trivia: FALLBACK.trivia,
      ajedrez: FALLBACK.ajedrez,
      sopa: FALLBACK.sopa.map((m) => ({ ...m, palabras: m.palabras.map((w) => normalizeWord(w)) })),
    };
  }
  return fallbackClean[key];
}

/**
 * @returns {Promise<{data: object, error: string|null}>}
 */
export async function loadGameData() {
  try {
    const url = `${import.meta.env.BASE_URL}contenido/juegos.js?v=${Date.now()}`;
    const mod = await import(/* @vite-ignore */ url);
    const { data, usedFallback } = clean(mod.JUEGOS || {});
    return {
      data,
      error: usedFallback.length ? `En public/contenido/juegos.js no encontré datos válidos de: ${usedFallback.join(', ')}. Uso los de fábrica.` : null,
    };
  } catch (err) {
    console.error('[juegos] public/contenido/juegos.js', err);
    return { data: clean({}).data, error: 'No se pudo leer public/contenido/juegos.js (revisa comas y comillas). Uso los juegos de fábrica.' };
  }
}
