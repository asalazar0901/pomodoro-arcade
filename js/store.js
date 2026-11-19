/* =====================================================================
   store.js — Estado global: tickets, estadísticas, cupones y misiones.
   Todo se guarda en localStorage (no hay backend).
   ===================================================================== */

const STORAGE_KEY = 'pomodoroArcade.v1';
const SHADOW_KEY = 'pomodoroArcade.v1.s'; // copia firmada de los tickets (anti-trampas)

/* Firma sencilla (FNV-1a) de los datos que no se deben tocar a mano. */
function signature(state) {
  const text = `pa|${state.tickets}|${state.stats.totalPomodoros}|${state.owned.length}|grogu`;
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) { h ^= text.charCodeAt(i); h = Math.imul(h, 0x01000193); }
  return (h >>> 0).toString(36);
}

/* ---------------------------------------------------------------------
   CATÁLOGO DE CUPONES
   ---------------------------------------------------------------------
   Cada cupón es un objeto plano (serializable a JSON), así que mañana
   puede venir de Google Sheets o Firebase sin tocar el resto de la app.
   Una fila de la hoja = un objeto de este array:

     id      -> identificador único (texto, sin espacios)
     title   -> texto del vale
     note    -> letra pequeña / descripción
     emoji   -> icono de la tarjeta
     price   -> costo en tickets
     goal    -> misión que hay que cumplir ADEMÁS de pagar los tickets:
                { type, value }  (ver GOAL_TYPES más abajo)

   Para editar premios, precios o misiones solo cambia este array.
   --------------------------------------------------------------------- */
export const COUPON_CATALOG = [
  {
    id: 'brownie',
    title: 'Vale por un Brownie la próxima vez que nos veamos',
    note: 'Te prometo que estará rico.',
    emoji: '🍫',
    price: 2,
    goal: { type: 'totalPomodoros', value: 2 },
  },
  {
    id: 'skittles',
    title: 'Vale por unas Skittles',
    note: 'Saborea el arcoíris. Las llevo la próxima vez que nos veamos.',
    emoji: '🌈',
    price: 2,
    goal: { type: 'mapDone', value: 'apodos' },
  },
  {
    id: 'gomitas',
    title: 'Vale por unas gomitas',
    note: 'Las que tú escojas. Prometo no robarte más de dos.',
    emoji: '🍬',
    price: 2,
    goal: { type: 'totalPomodoros', value: 3 },
  },
  {
    id: 'red-bull',
    title: 'Vale por una Red Bull',
    note: 'Green Edition si la encuentro. Para tu próxima noche de estudio.',
    emoji: '🥫',
    price: 3,
    goal: { type: 'dailyStreak', value: 2 },
  },
  {
    id: 'before-sunset',
    title: 'Vale por ver 30 mins de Before Sunset juntos',
    note: 'Con mantita y sin mirar el celular.',
    emoji: '🎬',
    price: 3,
    goal: { type: 'mapDone', value: 'carino' },
  },
  {
    id: 'platos',
    title: 'Hoy yo lavo los platos',
    note: 'Válido la próxima vez que cocinemos algo juntos.',
    emoji: '🍽️',
    price: 4,
    goal: { type: 'dailyStreak', value: 3 },
  },
  {
    id: 'masaje-5',
    title: 'Vale por un masaje de espalda de 5 minutos',
    note: 'Cortito pero con cariño. Ideal después de un bloque pesado.',
    emoji: '💆',
    price: 2,
    goal: { type: 'totalPomodoros', value: 4 },
  },
  {
    id: 'masaje-10',
    title: 'Vale por un masaje de espalda de 10 minutos',
    note: 'Para cuando la espalda ya no aguanta la silla.',
    emoji: '💆',
    price: 3,
    goal: { type: 'arcadeScore', value: 250 },
  },
  {
    id: 'masaje',
    title: 'Vale por un masaje de espalda de 15 minutos',
    note: '15 minutos, sin quejas de la masajista i promise.',
    emoji: '💆',
    price: 5,
    goal: { type: 'arcadeScore', value: 400 },
  },
  {
    id: 'favor-absoluto',
    title: 'El Favor Absoluto (Úsalo cuando quieras)',
    note: 'Lo que pidas. Sin preguntas. Úsalo con sabiduría y ten cuidado de desperdiciarlo.',
    emoji: '👑',
    price: 13,
    goal: { type: 'legend', value: { pomodoros: 12, arcade: 700 } },
  },
];

/* ---------------------------------------------------------------------
   TIPOS DE MISIÓN
   Cada tipo sabe describirse y evaluarse contra las estadísticas.
   Las misiones usan récords históricos: una vez cumplida, queda cumplida.
   --------------------------------------------------------------------- */
const MAP_NAMES = { apodos: 'Mapa 1 (Apodos)', carino: 'Mapa 2 (Cariño)' };

export const GOAL_TYPES = {
  totalPomodoros: {
    label: (v) => `Completa ${v} pomodoros en total`,
    progress: (s, v) => [Math.min(s.totalPomodoros, v), v],
  },
  dailyStreak: {
    label: (v) => `Racha de ${v} pomodoros en un mismo día`,
    progress: (s, v) => [Math.min(s.bestDaily, v), v],
  },
  mapDone: {
    label: (v) => `Completa la sopa de letras: ${MAP_NAMES[v] || v}`,
    progress: (s, v) => [s.mapsDone[v] ? 1 : 0, 1],
  },
  arcadeScore: {
    label: (v) => `Llega a ${v} puntos en el arcade`,
    progress: (s, v) => [Math.min(s.bestArcade, v), v],
  },
  // Misión final: todo a la vez.
  legend: {
    label: (v) => `Modo leyenda: ${v.pomodoros} pomodoros totales, ${v.arcade} pts en arcade y las dos sopas de letras`,
    progress: (s, v) => {
      const parts = [
        s.totalPomodoros >= v.pomodoros,
        s.bestArcade >= v.arcade,
        !!s.mapsDone.apodos,
        !!s.mapsDone.carino,
      ];
      return [parts.filter(Boolean).length, parts.length];
    },
  },
};

/**
 * Carga el catálogo de cupones.
 * HOY: devuelve el array local.
 * FUTURO (Google Sheets / Firebase): reemplaza el cuerpo por un fetch, p. ej.
 *
 *   const res = await fetch('https://opensheet.elk.sh/<ID_DE_TU_HOJA>/Cupones');
 *   const rows = await res.json();
 *   return rows.map((r) => ({
 *     id: r.id, title: r.title, note: r.note, emoji: r.emoji,
 *     price: Number(r.price),
 *     goal: { type: r.goalType, value: JSON.parse(r.goalValue) },
 *   }));
 *
 *   // o con Firebase:
 *   // const snap = await getDocs(collection(db, 'cupones'));
 *   // return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
 */
export async function loadCatalog() {
  return COUPON_CATALOG;
}

/* ---------------------------------------------------------------------
   ESTADO
   --------------------------------------------------------------------- */
const todayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const DEFAULT_STATE = () => ({
  tickets: 0,
  stats: {
    totalPomodoros: 0,
    day: todayKey(),
    today: 0, // pomodoros de hoy
    bestDaily: 0, // mejor racha en un solo día
    bestArcade: 0,
    mapsDone: { apodos: 0, carino: 0 }, // veces completado cada mapa
  },
  owned: [], // cupones comprados: { code, couponId, title, note, emoji, date, redeemed }
  // Temarios: materias con su lista de temas
  //   { id, name, topics: [{ id, name, done, pomodoros }] }
  subjects: [],
  focus: null, // tema que se está estudiando: { subjectId, topicId }
  // Agenda
  events: [], // eventos que él agrega: { id, nombre, fecha: 'AAAA-MM-DD', categoria }
  // Pendientes por categoría: { id, name, tasks: [{ id, text, done }] }
  notes: [],        // notas que se agregan desde la app: { id, texto, fecha? }
  hiddenNotes: [],  // textos de notas predeterminadas que se quitaron en la app
  hiddenEvents: [], // claves de eventos predeterminados que se quitaron o editaron en la app
  penalty: 0,       // partidas de arcade con penalización anti-trampas pendientes
  taskCats: [
    { id: 'universidad', name: 'Universidad', tasks: [] },
    { id: 'ajedrez', name: 'Ajedrez', tasks: [] },
    { id: 'personal', name: 'Personal', tasks: [{ id: 'mensajito', text: 'Mandarle un mensajito a tu novia', done: false }] },
  ],
});

const newId = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

class Store {
  constructor() {
    this.listeners = new Set();
    this.catalog = COUPON_CATALOG;
    this.tampered = false; // true si alguien editó los tickets a mano en localStorage
    this.state = this.#load();
    this.#rollDay();
  }

  /* ---------- persistencia ---------- */
  #load() {
    const base = DEFAULT_STATE();
    try {
      const raw = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (!raw) return base;
      const state = {
        ...base,
        ...raw,
        stats: { ...base.stats, ...raw.stats, mapsDone: { ...base.stats.mapsDone, ...(raw.stats?.mapsDone || {}) } },
        owned: Array.isArray(raw.owned) ? raw.owned : [],
        subjects: Array.isArray(raw.subjects) ? raw.subjects : [],
        events: Array.isArray(raw.events) ? raw.events : [],
        taskCats: Array.isArray(raw.taskCats) ? raw.taskCats : base.taskCats,
        notes: Array.isArray(raw.notes) ? raw.notes : [],
        hiddenNotes: Array.isArray(raw.hiddenNotes) ? raw.hiddenNotes : [],
        hiddenEvents: Array.isArray(raw.hiddenEvents) ? raw.hiddenEvents : [],
      };
      state.tickets = Math.max(0, Math.floor(Number(state.tickets) || 0));
      // Anti-trampas: si la firma no cuadra, alguien tocó los datos a mano.
      if (raw._sig && raw._sig !== signature(state)) {
        this.tampered = true;
        state.tickets = this.#shadowTickets() ?? 0; // se restauran los tickets de verdad
      }
      return state;
    } catch {
      return base;
    }
  }

  /** Tickets de la copia firmada, o null si no existe o también fue alterada. */
  #shadowTickets() {
    try {
      const [tickets, sig] = atob(localStorage.getItem(SHADOW_KEY) || '').split('.');
      const n = Number(tickets);
      let h = 0x811c9dc5;
      for (const ch of `sh|${n}|marshmello`) { h ^= ch.charCodeAt(0); h = Math.imul(h, 0x01000193); }
      return Number.isInteger(n) && n >= 0 && sig === (h >>> 0).toString(36) ? n : null;
    } catch { return null; }
  }

  /** Compara lo guardado con lo que hay en memoria. false = alguien lo cambió por fuera. */
  verifyStorage() {
    try {
      const raw = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (!raw) return true;
      const ok = raw.tickets === this.state.tickets && raw._sig === signature(this.state);
      if (!ok) this.#save(); // se vuelve a escribir el estado bueno
      return ok;
    } catch { return true; }
  }

  /** Penalización cómica: las próximas partidas del arcade son todo Darth Vader. */
  applyPenalty(games = 3) {
    this.state.penalty = games;
    this.#save();
  }

  /** Consume una partida de penalización. Devuelve cuántas quedaban antes (0 = sin castigo). */
  usePenalty() {
    const left = this.state.penalty || 0;
    if (left > 0) { this.state.penalty = left - 1; this.#save(); }
    return left;
  }

  #save() {
    try {
      this.state._sig = signature(this.state);
      let h = 0x811c9dc5;
      for (const ch of `sh|${this.state.tickets}|marshmello`) { h ^= ch.charCodeAt(0); h = Math.imul(h, 0x01000193); }
      localStorage.setItem(SHADOW_KEY, btoa(`${this.state.tickets}.${(h >>> 0).toString(36)}`));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch { /* modo privado o almacenamiento lleno: la app sigue funcionando */ }
    this.listeners.forEach((fn) => fn(this.state));
  }

  #rollDay() {
    const s = this.state.stats;
    if (s.day !== todayKey()) {
      s.day = todayKey();
      s.today = 0;
    }
  }

  /** Suscribirse a cambios de estado. Devuelve la función para desuscribirse. */
  subscribe(fn) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  async init() {
    this.catalog = await loadCatalog();
    this.#save();
  }

  /* ---------- tickets ---------- */
  get tickets() { return this.state.tickets; }

  addTickets(n = 1) {
    this.state.tickets += n;
    this.#save();
  }

  /* ---------- registro de logros ---------- */
  recordPomodoro() {
    this.#rollDay();
    const s = this.state.stats;
    s.totalPomodoros += 1;
    s.today += 1;
    s.bestDaily = Math.max(s.bestDaily, s.today);
    this.state.tickets += 1; // 1 ticket por bloque de 25 min
    const topic = this.focusedTopic()?.topic;
    if (topic) topic.pomodoros = (topic.pomodoros || 0) + 1; // el bloque cuenta para el tema elegido
    this.#save();
  }

  recordMapDone(mapId) {
    const m = this.state.stats.mapsDone;
    m[mapId] = (m[mapId] || 0) + 1;
    this.#save();
  }

  /** Devuelve true si es un nuevo récord. */
  recordArcadeScore(score) {
    const s = this.state.stats;
    if (score <= s.bestArcade) return false;
    s.bestArcade = score;
    this.#save();
    return true;
  }

  /* ---------- misiones ---------- */
  goalStatus(goal) {
    const type = GOAL_TYPES[goal?.type];
    if (!type) return { label: 'Sin misión', done: true, current: 1, target: 1 };
    const [current, target] = type.progress(this.state.stats, goal.value);
    return { label: type.label(goal.value), done: current >= target, current, target };
  }

  /* ---------- tienda ---------- */
  canBuy(coupon) {
    const goal = this.goalStatus(coupon.goal);
    return { goal, enoughTickets: this.state.tickets >= coupon.price, ok: goal.done && this.state.tickets >= coupon.price };
  }

  buy(couponId) {
    const coupon = this.catalog.find((c) => c.id === couponId);
    if (!coupon || !this.canBuy(coupon).ok) return null;
    this.state.tickets -= coupon.price;
    const owned = {
      code: `${coupon.id.slice(0, 3).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
      couponId: coupon.id,
      title: coupon.title,
      note: coupon.note,
      emoji: coupon.emoji,
      date: new Date().toISOString(),
      redeemed: false,
    };
    this.state.owned.unshift(owned);
    this.#save();
    return owned;
  }

  /* ---------- temarios (materias y temas) ---------- */
  get subjects() { return this.state.subjects; }

  addSubject(name) {
    name = name.trim();
    if (!name) return null;
    const subject = { id: newId(), name, topics: [] };
    this.state.subjects.push(subject);
    this.#save();
    return subject;
  }

  removeSubject(subjectId) {
    this.state.subjects = this.state.subjects.filter((s) => s.id !== subjectId);
    if (this.state.focus?.subjectId === subjectId) this.state.focus = null;
    this.#save();
  }

  addTopic(subjectId, name) {
    name = name.trim();
    const subject = this.state.subjects.find((s) => s.id === subjectId);
    if (!subject || !name) return null;
    const topic = { id: newId(), name, done: false, pomodoros: 0 };
    subject.topics.push(topic);
    this.#save();
    return topic;
  }

  removeTopic(subjectId, topicId) {
    const subject = this.state.subjects.find((s) => s.id === subjectId);
    if (!subject) return;
    subject.topics = subject.topics.filter((t) => t.id !== topicId);
    if (this.state.focus?.topicId === topicId) this.state.focus = null;
    this.#save();
  }

  toggleTopic(subjectId, topicId, done) {
    const topic = this.state.subjects.find((s) => s.id === subjectId)?.topics.find((t) => t.id === topicId);
    if (!topic) return;
    topic.done = done ?? !topic.done;
    this.#save();
  }

  /** Elige el tema que se estudia en el Pomodoro. Sin argumentos lo quita. */
  setFocus(subjectId = null, topicId = null) {
    this.state.focus = subjectId && topicId ? { subjectId, topicId } : null;
    this.#save();
  }

  /** Devuelve { subject, topic } del tema elegido, o null. */
  focusedTopic() {
    const f = this.state.focus;
    if (!f) return null;
    const subject = this.state.subjects.find((s) => s.id === f.subjectId);
    const topic = subject?.topics.find((t) => t.id === f.topicId);
    return topic ? { subject, topic } : null;
  }

  /* ---------- agenda: eventos propios ---------- */
  addEvent({ nombre, fecha, categoria, nota }) {
    const event = { id: newId(), nombre: nombre.trim(), fecha, categoria, ...(nota ? { nota } : {}) };
    this.state.events.push(event);
    this.#save();
    return event;
  }

  removeEvent(eventId) {
    this.state.events = this.state.events.filter((e) => e.id !== eventId);
    this.#save();
  }

  updateEvent(eventId, { nombre, fecha, categoria }) {
    const event = this.state.events.find((e) => e.id === eventId);
    if (!event) return;
    Object.assign(event, { nombre: nombre.trim(), fecha, categoria });
    this.#save();
  }

  /** Oculta un evento predeterminado (los del archivo de GitHub) en este navegador. */
  hideEvent(key) {
    if (!this.state.hiddenEvents.includes(key)) this.state.hiddenEvents.push(key);
    this.#save();
  }

  /* ---------- agenda: notas ---------- */
  addNote(texto, fecha = '') {
    texto = texto.trim();
    if (!texto) return null;
    const note = { id: newId(), texto, ...(fecha ? { fecha } : {}) };
    this.state.notes.push(note);
    this.#save();
    return note;
  }

  removeNote(noteId) {
    this.state.notes = this.state.notes.filter((n) => n.id !== noteId);
    this.#save();
  }

  /** Oculta una nota predeterminada en este navegador. */
  hideNote(texto) {
    if (!this.state.hiddenNotes.includes(texto)) this.state.hiddenNotes.push(texto);
    this.#save();
  }

  /** Vuelve a mostrar todas las notas y eventos predeterminados. */
  restoreDefaults() {
    this.state.hiddenNotes = [];
    this.state.hiddenEvents = [];
    this.#save();
  }

  renameTaskCat(catId, name) {
    const cat = this.state.taskCats.find((c) => c.id === catId);
    if (!cat || !name.trim()) return;
    cat.name = name.trim();
    this.#save();
  }

  renameTask(catId, taskId, text) {
    const task = this.state.taskCats.find((c) => c.id === catId)?.tasks.find((t) => t.id === taskId);
    if (!task || !text.trim()) return;
    task.text = text.trim();
    this.#save();
  }

  /* ---------- agenda: pendientes por categoría ---------- */
  addTaskCat(name) {
    name = name.trim();
    if (!name) return null;
    const cat = { id: newId(), name, tasks: [] };
    this.state.taskCats.push(cat);
    this.#save();
    return cat;
  }

  removeTaskCat(catId) {
    this.state.taskCats = this.state.taskCats.filter((c) => c.id !== catId);
    this.#save();
  }

  addTask(catId, text) {
    text = text.trim();
    const cat = this.state.taskCats.find((c) => c.id === catId);
    if (!cat || !text) return null;
    const task = { id: newId(), text, done: false };
    cat.tasks.push(task);
    this.#save();
    return task;
  }

  removeTask(catId, taskId) {
    const cat = this.state.taskCats.find((c) => c.id === catId);
    if (!cat) return;
    cat.tasks = cat.tasks.filter((t) => t.id !== taskId);
    this.#save();
  }

  toggleTask(catId, taskId, done) {
    const task = this.state.taskCats.find((c) => c.id === catId)?.tasks.find((t) => t.id === taskId);
    if (!task) return;
    task.done = done ?? !task.done;
    this.#save();
  }

  redeem(code) {
    const item = this.state.owned.find((o) => o.code === code);
    if (!item) return;
    item.redeemed = true;
    this.#save();
  }
}

export const store = new Store();
