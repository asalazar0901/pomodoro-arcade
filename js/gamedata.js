/* =====================================================================
   gamedata.js — Carga y valida los datos de los minijuegos.
   Los datos viven en public/contenido/juegos.js (editable en GitHub).
   Si ese archivo falta o tiene un error, se usan los de fábrica de aquí.
   ===================================================================== */

const FALLBACK = {
  ahorcado: [{ tema: 'Variado', fondo: 'cafe', palabras: [{ palabra: 'brownie', pista: 'Un postre de la tienda' }] }],
  criptico: [{ pista: 'Roma al revés es lo que siento por ti', respuesta: 'amor', tipo: 'al revés', definicion: 'lo que siento por ti', explicacion: 'ROMA al revés = AMOR.' }],
  cripto: [{ frase: 'Cuando veas una buena jugada, busca una mejor.', autor: 'Emanuel Lasker' }],
  cosidle: ['grogu', 'besos', 'pasta'],
  trivia: {
    titulo: 'Examen sorpresa', segundos: 15, cuantas: 3, aprobar: 2,
    preguntas: [
      { pregunta: '¿Cuántos minutos dura un Pomodoro clásico?', opciones: ['15', '25', '45', '60'], correcta: 'B' },
    ],
  },
  ajedrez: [{ titulo: 'Mate en 2', fen: '8/K5pk/7P/7P/n4Q1R/5Bp1/3p1r2/8 w', solucion: ['f4-f7', 'h7-h8', 'f7-g7'] }],
  sopa: [
    { id: 'tu-novia', tema: 'Tu novia', titulo: 'Tu novia', palabras: ['picnic', 'noviembre', 'crepas', 'rosado', 'besitos'] },
    { id: 'clasicos-cine', tema: 'Películas románticas', titulo: 'Clásicos del cine', palabras: ['titanic', 'diario', 'notting', 'orgullo', 'fantasma'] },
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

/** Fondos disponibles para los temas del ahorcado (ver css/styles.css). */
export const FONDOS = ['cafe', 'espacio', 'tablero', 'biblioteca', 'plano', 'musica'];

const MOVE = /^[a-h][1-8]-[a-h][1-8]$/;
const isList = (v) => Array.isArray(v) && v.length > 0;

/** 'h5-f7' o ['f4-f7', 'h7-h8', 'f7-g7'] -> lista de jugadas; [] si algo está mal. */
function parseSolution(sol) {
  const moves = (Array.isArray(sol) ? sol : String(sol || '').split(/[\s,]+/))
    .map((m) => String(m).toLowerCase().replace(/\s/g, '')).filter(Boolean);
  return moves.length % 2 === 1 && moves.every((m) => MOVE.test(m)) ? moves : [];
}

/** Número entero entre min y max; si no viene, `def`. Con `zeroOk`, 0 = apagado. */
function num(v, min, max, def, zeroOk = false) {
  const n = Math.floor(Number(v));
  if (!Number.isFinite(n)) return def;
  if (zeroOk && n <= 0) return 0;
  return Math.max(min, Math.min(n, max));
}
const bool = (v, def) => (typeof v === 'boolean' ? v : def);

/** Bloque `dificultad` de juegos.js. Si falta, todo queda en modo difícil. */
function cleanDifficulty(d = {}) {
  const dif = {
    ahorcadoFallos: num(d.ahorcadoFallos, 2, 10, 4),
    ahorcadoPistaTrasFallos: num(d.ahorcadoPistaTrasFallos, 0, 9, 2),
    cosidleIntentos: num(d.cosidleIntentos, 2, 8, 4),
    cosidleModoDificil: bool(d.cosidleModoDificil, true),
    ajedrezIntentos: num(d.ajedrezIntentos, 1, 5, 1),
    ajedrezSegundos: num(d.ajedrezSegundos, 15, 900, 120, true),
    sopaOcultarPalabras: bool(d.sopaOcultarPalabras, true),
    sopaSenuelos: bool(d.sopaSenuelos, true),
    sopaSegundos: num(d.sopaSegundos, 30, 1800, 240, true),
    criptoPistas: num(d.criptoPistas, 0, 10, 2, true),
    criptoErrores: num(d.criptoErrores, 1, 10, 3),
    cripticoPistas: num(d.cripticoPistas, 0, 3, 3, true),
    cripticoIntentos: num(d.cripticoIntentos, 1, 10, 3),
  };
  dif.ahorcadoPistaTrasFallos = Math.min(dif.ahorcadoPistaTrasFallos, dif.ahorcadoFallos - 1);
  return dif;
}

function clean(raw) {
  const data = {};

  const max = Math.floor(Number(raw.ajustes?.ticketsMaxPorDescanso));
  data.ajustes = {
    ticketsMaxPorDescanso: Number.isFinite(max) ? Math.max(1, Math.min(max, 10)) : 2,
    ocultar: Array.isArray(raw.ajustes?.ocultar) ? raw.ajustes.ocultar.map((k) => String(k).trim()) : [],
  };
  data.dificultad = cleanDifficulty(raw.dificultad);

  // Ahorcado por temas: [{ tema, fondo, palabras: [{ palabra, pista }] }]
  // (también acepta palabras sueltas sin tema, como antes)
  data.ahorcado = (raw.ahorcado || []).flatMap((x) => {
    const list = Array.isArray(x?.palabras) ? x.palabras : [x];
    const tema = String(x?.tema || 'Variado');
    const fondo = FONDOS.includes(x?.fondo) ? x.fondo : 'cafe';
    return list.map((w) => ({ palabra: normalizeWord(w?.palabra, true), pista: String(w?.pista || ''), tema, fondo }));
  }).filter((x) => x.palabra.replace(/ /g, '').length >= 3);

  data.criptico = (raw.criptico || [])
    .map((x) => ({
      pista: String(x?.pista || '').trim(),
      respuesta: normalizeWord(x?.respuesta, true),
      tipo: String(x?.tipo || '').trim().toLowerCase(),
      definicion: String(x?.definicion || ''),
      explicacion: String(x?.explicacion || ''),
    }))
    .filter((x) => x.pista && x.respuesta.replace(/ /g, '').length >= 2);

  data.cripto = (raw.cripto || [])
    .map((x) => ({ frase: String(x?.frase || '').replace(/\s+/g, ' ').trim(), autor: String(x?.autor || '') }))
    .filter((x) => normalizeWord(x.frase).length >= 8);

  data.cosidle = [...new Set((raw.cosidle || []).map((w) => normalizeWord(w)).filter((w) => w.length === 5))];

  const t = raw.trivia || {};
  const preguntas = (t.preguntas || []).filter((q) =>
    q && q.pregunta && Array.isArray(q.opciones) && q.opciones.length >= 2
    && 'ABCD'.indexOf(String(q.correcta).toUpperCase()) >= 0
    && 'ABCD'.indexOf(String(q.correcta).toUpperCase()) < q.opciones.length);
  data.trivia = {
    activo: t.activo !== false,
    titulo: String(t.titulo || FALLBACK.trivia.titulo),
    segundos: Math.max(5, Number(t.segundos) || 15),
    cuantas: Math.max(1, Math.min(Number(t.cuantas) || 5, preguntas.length || 1)),
    aprobar: Math.max(1, Number(t.aprobar) || 3),
    preguntas,
  };
  data.trivia.aprobar = Math.min(data.trivia.aprobar, data.trivia.cuantas);

  data.ajedrez = (raw.ajedrez || [])
    .filter((p) => p && typeof p.fen === 'string' && p.fen.trim().split(' ')[0].split('/').length === 8)
    .map((p) => ({ ...p, solucion: parseSolution(p.solucion) }))
    .filter((p) => p.solucion.length);

  data.sopa = (raw.sopa || [])
    .map((m) => ({
      id: String(m?.id || '').trim(),
      tema: String(m?.tema || 'Sopas'),
      titulo: String(m?.titulo || m?.id || ''),
      palabras: (m?.palabras || []).map((w) => normalizeWord(w)).filter((w) => w.length >= 2 && w.length <= 15),
    }))
    .filter((m) => m.id && m.palabras.length);

  // Lo que quede vacío se rellena con lo de fábrica
  const usedFallback = [];
  for (const key of ['ahorcado', 'criptico', 'cripto', 'cosidle', 'ajedrez', 'sopa']) {
    if (!isList(data[key])) { data[key] = clean0(key); usedFallback.push(key); }
  }
  if (!isList(data.trivia.preguntas)) {
    const { activo } = data.trivia;
    data.trivia = { ...clean0('trivia'), activo };
    if (activo) usedFallback.push('trivia');
  }
  return { data, usedFallback };
}

// Los datos de fábrica ya limpios (se calculan una sola vez)
let fallbackClean = null;
function clean0(key) {
  if (!fallbackClean) {
    fallbackClean = {
      ahorcado: FALLBACK.ahorcado[0].palabras.map((x) => ({ palabra: normalizeWord(x.palabra, true), pista: x.pista, tema: 'Variado', fondo: 'cafe' })),
      cripto: FALLBACK.cripto,
      criptico: FALLBACK.criptico.map((x) => ({ ...x, respuesta: normalizeWord(x.respuesta, true) })),
      cosidle: FALLBACK.cosidle.map((w) => normalizeWord(w)),
      trivia: FALLBACK.trivia,
      ajedrez: FALLBACK.ajedrez.map((p) => ({ ...p, solucion: parseSolution(p.solucion) })),
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
