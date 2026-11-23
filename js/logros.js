/* =====================================================================
   logros.js — Insignias, potenciadores y castigos.

   INSIGNIAS: se ganan solas al cumplir algo (pomodoros, minijuegos...).
     Cada una trae un premio:
       tickets  -> tickets de regalo
       letra    -> una letra de la clave secreta (public/contenido/logros.js)
       fiebre   -> "Fiebre del oro": por unos minutos cada ticket vale 1.5
       escudo   -> "Escudo de netherite": bloquea el siguiente castigo
   CASTIGOS: salen por portarse mal en el descanso.
       manzana  -> muchas pistas en un descanso: se come tickets para sobrevivir
       creeper  -> muchos juegos perdidos en un descanso: explota tickets
       sindarov -> retos de ajedrez perdidos seguidos: le debes tickets
       zombi    -> días sin estudiar: te muerde un ticket

   Para agregar una insignia copia una línea de BADGES y cambia
   `progress`: recibe (stats, contadores, juegos) y devuelve [actual, meta].
   ===================================================================== */

import { registrar } from './registro.js';

const escapeHtml = (s) => String(s).replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
const todayKey = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const daysBetween = (a, b) => Math.round((new Date(`${b}T12:00`) - new Date(`${a}T12:00`)) / 86400000);
const wins = (c, k) => c.wins[k] || 0;

/* tier: bronce | plata | oro | netherite  (el color de la medalla) */
export const BADGES = [
  // ---- Estudio ----
  { id: 'primer-bloque', icon: '🍅', tier: 'bronce', name: 'Calentando motores', desc: 'Termina 5 pomodoros.', reward: { tickets: 1 }, progress: (s) => [s.totalPomodoros, 5] },
  { id: 'constante', icon: '📚', tier: 'plata', name: 'Estudiante constante', desc: 'Termina 25 pomodoros.', reward: { letra: 1 }, progress: (s) => [s.totalPomodoros, 25] },
  { id: 'maquina', icon: '⚙️', tier: 'oro', name: 'Máquina de estudio', desc: 'Termina 100 pomodoros.', reward: { fiebre: 1 }, progress: (s) => [s.totalPomodoros, 100] },
  { id: 'racha-4', icon: '🔥', tier: 'plata', name: 'En llamas', desc: 'Haz 6 pomodoros en un mismo día.', reward: { escudo: 1 }, progress: (s) => [s.bestDaily, 6] },
  { id: 'racha-8', icon: '☄️', tier: 'netherite', name: 'Imparable', desc: 'Haz 10 pomodoros en un mismo día.', reward: { letra: 1 }, progress: (s) => [s.bestDaily, 10] },
  { id: 'nocturno', icon: '🦉', tier: 'bronce', name: 'Búho nocturno', desc: 'Termina 5 pomodoros después de las 9 de la noche.', reward: { tickets: 1 }, progress: (s, c) => [c.night, 5] },
  { id: 'madrugador', icon: '🐓', tier: 'bronce', name: 'Madrugador', desc: 'Termina 5 pomodoros antes de las 8 de la mañana.', reward: { escudo: 1 }, progress: (s, c) => [c.early, 5] },
  // ---- Arcade ----
  { id: 'arcade-300', icon: '👷', tier: 'bronce', name: 'Ingeniero sobreviviente', desc: 'Llega a 500 puntos en el arcade.', reward: { letra: 1 }, progress: (s) => [s.bestArcade, 500] },
  { id: 'arcade-700', icon: '🥫', tier: 'plata', name: 'Rey de los snacks', desc: 'Llega a 1000 puntos en el arcade.', reward: { tickets: 2 }, progress: (s) => [s.bestArcade, 1000] },
  { id: 'arcade-1000', icon: '🦹', tier: 'oro', name: 'Ni Homelander pudo', desc: 'Llega a 1500 puntos en el arcade.', reward: { fiebre: 1 }, progress: (s) => [s.bestArcade, 1500] },
  // ---- Sopa de letras ----
  { id: 'sopa-5', icon: '🔤', tier: 'plata', name: 'Ojo de águila', desc: 'Completa 10 sopas de letras distintas.', reward: { letra: 1 }, progress: (s, c, g) => [Object.keys(s.mapsDone).filter((k) => s.mapsDone[k] && g.sopaIds.includes(k)).length, 10] },
  { id: 'sopa-todas', icon: '🗺️', tier: 'netherite', name: 'Cartógrafo', desc: 'Completa todas las sopas de letras disponibles.', reward: { tickets: 3 }, progress: (s, c, g) => [g.sopaIds.filter((k) => s.mapsDone[k]).length, g.sopaIds.length || 1] },
  // ---- Críptico ----
  { id: 'criptico-1', icon: '🧩', tier: 'bronce', name: 'Descifrador', desc: 'Resuelve 5 crípticos.', reward: { letra: 1 }, progress: (s, c) => [wins(c, 'criptico'), 5] },
  { id: 'criptico-10', icon: '🕵️', tier: 'oro', name: 'Mente críptica', desc: 'Resuelve 25 crípticos.', reward: { fiebre: 1 }, progress: (s, c) => [wins(c, 'criptico'), 25] },
  { id: 'criptico-solo', icon: '🧠', tier: 'plata', name: 'Sin ayuda', desc: 'Resuelve 5 crípticos sin pedir ninguna pista.', reward: { escudo: 1 }, progress: (s, c) => [c.cripticoSolo, 5] },
  // ---- Ahorcado y Cosi-dle ----
  { id: 'malvavisco-5', icon: '🍡', tier: 'plata', name: 'Guardián del malvavisco', desc: 'Salva el malvavisco 15 veces.', reward: { letra: 1 }, progress: (s, c) => [wins(c, 'ahorcado'), 15] },
  { id: 'cosidle-2', icon: '🟩', tier: 'oro', name: 'Telepatía', desc: 'Adivina 5 Cosi-dles en 2 intentos o menos.', reward: { tickets: 2 }, progress: (s, c) => [c.cosidleFast, 5] },
  { id: 'cosidle-10', icon: '🔠', tier: 'plata', name: 'Diccionario andante', desc: 'Adivina 25 Cosi-dles.', reward: { escudo: 1 }, progress: (s, c) => [wins(c, 'cosidle'), 25] },
  // ---- Ajedrez ----
  { id: 'mate-1', icon: '♞', tier: 'oro', name: 'Calculador', desc: 'Resuelve 5 mates en 6.', reward: { letra: 1 }, progress: (s, c) => [wins(c, 'ajedrez'), 5] },
  { id: 'mate-5', icon: '♛', tier: 'netherite', name: 'Gran maestro', desc: 'Resuelve 15 mates en 6.', reward: { tickets: 3 }, progress: (s, c) => [wins(c, 'ajedrez'), 15] },
  // ---- Varias ----
  { id: 'cupones-3', icon: '🎟️', tier: 'plata', name: 'Coleccionista', desc: 'Compra 5 cupones en la tienda.', reward: { fiebre: 1 }, progress: (s, c, g) => [g.owned, 5] },
  { id: 'castigos-3', icon: '🛡️', tier: 'bronce', name: 'Sobreviviente', desc: 'Sobrevive a 5 castigos. Algo es algo.', reward: { escudo: 1 }, progress: (s, c) => [c.punished, 5] },
  { id: 'clave', icon: '🔑', tier: 'netherite', name: 'Clave completa', desc: 'Descubre todas las letras de la clave secreta.', reward: { tickets: 2 }, progress: (s, c, g) => [Math.min(c.letters, g.clave.length), g.clave.length || 1] },
];

/* Castigos: texto y dibujo. `costo` y `cuando` vienen de public/contenido/logros.js */
const PUNISHMENTS = {
  manzana: { icon: '🍎', title: '¡Manzana envenenada!', text: (n, cost) => `Pediste ${n} pistas en este descanso y te dieron una manzana envenenada de Minecraft. Para sobrevivir te comiste ${cost} 🎟️.` },
  creeper: { icon: '💥', title: '¡Sssss... BOOM!', text: (n, cost) => `Perdiste ${n} juegos en este descanso y un creeper se te acercó por la espalda. Explotó ${cost} 🎟️.` },
  sindarov: { icon: '♚', title: 'Sindarov te ganó', text: (n, cost) => `Perdiste ${n} retos de ajedrez seguidos. Sindarov te ganó la partida y le debías ${cost} 🎟️. Ya se los cobró.` },
  zombi: { icon: '🧟', title: '¡Ataque zombi!', text: (n, cost) => `Llevabas ${n} días sin hacer un pomodoro y te mordió un zombi. Perdiste ${cost} 🎟️.` },
};

const DEFAULT_CONFIG = {
  claveSecreta: 'MINION',
  premioClave: 'Un premio sorpresa de tu novia.',
  fiebreMinutos: 15,
  castigos: { manzana: { cuando: 3, costo: 1 }, creeper: { cuando: 3, costo: 1 }, sindarov: { cuando: 2, costo: 2 }, zombi: { cuando: 3, costo: 1 } },
};

async function loadConfig() {
  try {
    const mod = await import(/* @vite-ignore */ `${import.meta.env.BASE_URL}contenido/logros.js?v=${Date.now()}`);
    const raw = mod.LOGROS || {};
    const cfg = { ...DEFAULT_CONFIG, ...raw, castigos: { ...DEFAULT_CONFIG.castigos } };
    for (const k of Object.keys(DEFAULT_CONFIG.castigos)) {
      const c = raw.castigos?.[k] || {};
      cfg.castigos[k] = {
        cuando: Math.max(1, Math.floor(Number(c.cuando ?? DEFAULT_CONFIG.castigos[k].cuando)) || 1),
        costo: Math.max(0, Math.floor(Number(c.costo ?? DEFAULT_CONFIG.castigos[k].costo)) || 0),
      };
    }
    cfg.fiebreMinutos = Math.max(1, Math.min(120, Number(cfg.fiebreMinutos) || 15));
    return cfg;
  } catch (err) {
    console.error('[logros] public/contenido/logros.js', err);
    return DEFAULT_CONFIG;
  }
}

const freshData = () => ({
  unlocked: {},              // id -> fecha ISO
  wins: {},                  // juego -> victorias
  cripticoSolo: 0, cosidleFast: 0, night: 0, early: 0, punished: 0,
  letters: 0,                // letras de la clave descubiertas
  shields: 0,                // escudos guardados
  feverUntil: 0,             // fin de la fiebre del oro (ms)
  feverHalf: 0,              // medios tickets acumulados
  chessLossStreak: 0,
  brk: { id: null, hints: 0, losses: 0, apple: false, creeper: false }, // lo que pasa en este descanso
  lastStudy: null,           // último día con pomodoro
  log: [],                   // bitácora: { icon, text, date, good }
});

/**
 * @param {object} deps { store, toast, audio, getBreakId, getSopaIds }
 */
export async function initLogros({ store, toast, audio, getBreakId, getSopaIds }) {
  const cfg = await loadConfig();
  const clave = String(cfg.claveSecreta || '').toUpperCase();
  const claveLetters = [...clave].filter((ch) => ch.trim());
  const data = { ...freshData(), ...(store.logros || {}) };
  data.brk = { ...freshData().brk, ...(data.brk || {}) };
  const save = () => store.setLogros(data);

  /* ---------- ventana emergente (una a la vez) ---------- */
  const queue = [];
  const pop = document.getElementById('logro-pop');
  function showNext() {
    if (!pop || !pop.hidden || !queue.length) return;
    const item = queue.shift();
    pop.querySelector('.lp-medal').className = `lp-medal medal is-${item.tier || 'castigo'}`;
    pop.querySelector('.lp-medal').textContent = item.icon;
    pop.querySelector('.lp-kicker').textContent = item.kicker;
    pop.querySelector('.lp-title').textContent = item.title;
    pop.querySelector('.lp-text').textContent = item.text;
    pop.classList.toggle('is-bad', !!item.bad);
    pop.hidden = false;
    audio.play(item.bad ? 'busted' : 'powerup');
  }
  pop?.querySelector('.lp-ok').addEventListener('click', () => { pop.hidden = true; setTimeout(showNext, 150); });
  const announce = (item) => { queue.push(item); showNext(); };

  function log(icon, text, good) {
    data.log.unshift({ icon, text, good, date: new Date().toISOString() });
    data.log = data.log.slice(0, 30);
    registrar(good ? 'Logro' : 'Castigo', `${icon} ${text}`, { tickets: store.state.tickets });
  }

  /* ---------- descanso actual ---------- */
  function currentBreak() {
    const id = getBreakId();
    if (data.brk.id !== id) data.brk = { id, hints: 0, losses: 0, apple: false, creeper: false };
    return data.brk;
  }

  /* ---------- premios ---------- */
  function giveReward(reward) {
    const parts = [];
    if (reward.tickets) { store.addTickets(reward.tickets); parts.push(`+${reward.tickets} 🎟️`); }
    if (reward.escudo) { data.shields += reward.escudo; parts.push('🛡️ Escudo de netherite (bloquea el siguiente castigo)'); }
    if (reward.fiebre) {
      data.feverUntil = Math.max(Date.now(), data.feverUntil) + cfg.fiebreMinutos * 60000;
      parts.push(`🔥 Fiebre del oro: ${cfg.fiebreMinutos} min donde cada ticket vale 1.5`);
    }
    if (reward.letra) {
      if (data.letters < claveLetters.length) {
        data.letters += 1;
        parts.push(`🔑 Letra de la clave secreta: «${claveLetters[data.letters - 1]}»`);
      } else { store.addTickets(1); parts.push('+1 🎟️ (ya tenías toda la clave)'); }
    }
    return parts.join(' · ');
  }

  const ctx = () => ({ sopaIds: getSopaIds(), owned: store.state.owned.length, clave: claveLetters });

  /** Revisa todas las insignias y entrega las nuevas. */
  function checkAll() {
    let changed = false;
    for (let round = 0; round < 3; round++) { // una insignia puede destrabar otra (p. ej. la clave)
      let any = false;
      for (const b of BADGES) {
        if (data.unlocked[b.id]) continue;
        const [cur, target] = b.progress(store.state.stats, data, ctx());
        if (cur < target) continue;
        data.unlocked[b.id] = new Date().toISOString();
        const prize = giveReward(b.reward);
        log(b.icon, `Insignia «${b.name}»: ${prize}`, true);
        announce({ icon: b.icon, tier: b.tier, kicker: '¡Insignia nueva!', title: b.name, text: `${b.desc}\nPremio: ${prize}` });
        any = true; changed = true;
      }
      if (!any) break;
    }
    if (changed) save();
    return changed;
  }

  /* ---------- castigos ---------- */
  function punish(kind, count) {
    const { costo } = cfg.castigos[kind];
    if (!costo) return;
    const p = PUNISHMENTS[kind];
    if (data.shields > 0) {
      data.shields -= 1;
      log('🛡️', `El escudo de netherite te salvó: ${p.title.replace(/[¡!]/g, '')}`, true);
      announce({ icon: '🛡️', tier: 'netherite', kicker: '¡Salvado!', title: 'Escudo de netherite', text: `${p.title} ...pero tu escudo lo bloqueó. Se gastó el escudo.` });
      save();
      return;
    }
    const taken = store.spendTickets(costo);
    data.punished += 1;
    log(p.icon, `${p.title} ${taken ? `-${taken} 🎟️` : '(no tenías tickets, te salvaste)'}`, false);
    announce({ icon: p.icon, kicker: 'Castigo', title: p.title, text: p.text(count, taken), bad: true });
    save();
    checkAll();
  }

  /* ---------- fiebre del oro ---------- */
  /** Llamar cada vez que gana tickets "normales". Suma el medio ticket extra si hay fiebre. */
  function bonus(n = 1) {
    if (Date.now() >= data.feverUntil) return 0;
    data.feverHalf += 0.5 * n;
    const extra = Math.floor(data.feverHalf);
    data.feverHalf -= extra;
    if (extra) { store.addTickets(extra); toast(`🔥 Fiebre del oro: +${extra} 🎟️ extra`); }
    save();
    return extra;
  }

  /* ---------- eventos que manda app.js ---------- */
  const api = {
    data,
    config: cfg,
    claveLetters,
    checkAll,
    bonus,

    onLoad() {
      const today = todayKey();
      if (data.lastStudy) {
        const gap = daysBetween(data.lastStudy, today);
        if (gap >= cfg.castigos.zombi.cuando) {
          data.lastStudy = today; // un solo mordisco por racha
          save();
          punish('zombi', gap);
        }
      }
      checkAll();
    },

    onPomodoro() {
      const h = new Date().getHours();
      if (h >= 21) data.night = (data.night || 0) + 1;
      if (h < 8 && h >= 4) data.early = (data.early || 0) + 1;
      data.lastStudy = todayKey();
      save();
      bonus(1);
      checkAll();
    },

    onGame(key, won, detail = {}) {
      const brk = currentBreak();
      if (won) {
        data.wins[key] = (data.wins[key] || 0) + 1;
        if (key === 'criptico' && !detail.hints) data.cripticoSolo += 1;
        if (key === 'cosidle' && detail.tries <= 2) data.cosidleFast = (data.cosidleFast || 0) + 1;
        if (key === 'ajedrez') data.chessLossStreak = 0;
        save();
        checkAll();
        return;
      }
      brk.losses += 1;
      if (key === 'ajedrez') data.chessLossStreak += 1;
      save();
      if (key === 'ajedrez' && data.chessLossStreak >= cfg.castigos.sindarov.cuando) {
        const n = data.chessLossStreak;
        data.chessLossStreak = 0;
        punish('sindarov', n);
      } else if (!brk.creeper && brk.losses >= cfg.castigos.creeper.cuando) {
        brk.creeper = true;
        punish('creeper', brk.losses);
      }
    },

    onHint() {
      const brk = currentBreak();
      brk.hints += 1;
      save();
      if (!brk.apple && brk.hints >= cfg.castigos.manzana.cuando) {
        brk.apple = true;
        punish('manzana', brk.hints);
      }
    },

    feverLeft() { return Math.max(0, data.feverUntil - Date.now()); },
    sopaIds: getSopaIds,
  };
  return api;
}

/** Pinta la pestaña de Logros. */
export function renderLogros(root, logros, store) {
  if (!root || !logros) return;
  const { data, claveLetters, config } = logros;
  const stats = store.state.stats;
  const ctx = { sopaIds: logros.sopaIds?.() || [], owned: store.state.owned.length, clave: claveLetters };
  const got = BADGES.filter((b) => data.unlocked[b.id]).length;
  const fever = logros.feverLeft();
  const feverText = fever ? `${Math.floor(fever / 60000)}:${String(Math.floor(fever / 1000) % 60).padStart(2, '0')}` : '';
  const claveComplete = data.letters >= claveLetters.length && claveLetters.length > 0;
  let k = 0;
  const claveHtml = [...String(config.claveSecreta || '').toUpperCase()].map((ch) => {
    if (!ch.trim()) return '<span class="lg-gap"></span>';
    const shown = k < data.letters; k += 1;
    return `<span class="lg-letter ${shown ? 'is-shown' : ''}">${shown ? escapeHtml(ch) : '?'}</span>`;
  }).join('');

  root.innerHTML = `
    <div class="lg-summary panel">
      <div class="lg-stat"><strong>${got}/${BADGES.length}</strong><span>insignias</span></div>
      <div class="lg-stat"><strong>${data.shields}</strong><span>🛡️ escudos</span></div>
      <div class="lg-stat ${fever ? 'is-hot' : ''}"><strong>${fever ? feverText : '—'}</strong><span>🔥 fiebre del oro</span></div>
    </div>
    <div class="panel lg-clave">
      <h3>🔑 Clave secreta</h3>
      <div class="lg-letters">${claveHtml}</div>
      ${claveComplete
        ? `<div class="lg-prize"><p><strong>¡Clave completa!</strong> Hazle captura a esto y mándaselo a tu novia:</p><p class="lg-prize-text">🎁 ${escapeHtml(config.premioClave)}</p></div>`
        : '<p class="hint">Algunas insignias te dan una letra. Cuando la completes, ganas un premio secreto.</p>'}
    </div>
    <div class="lg-grid">
      ${BADGES.map((b) => {
        const done = !!data.unlocked[b.id];
        const [cur, target] = b.progress(stats, data, ctx);
        const pct = Math.min(100, Math.round((Math.min(cur, target) / target) * 100));
        const prize = b.reward.tickets ? `+${b.reward.tickets} 🎟️` : b.reward.letra ? '🔑 letra' : b.reward.fiebre ? '🔥 fiebre' : '🛡️ escudo';
        return `<div class="lg-badge ${done ? 'is-done' : ''}">
          <div class="medal is-${b.tier}">${b.icon}</div>
          <div class="lg-info">
            <strong>${escapeHtml(b.name)}</strong>
            <span>${escapeHtml(b.desc)}</span>
            ${done ? `<em>Ganada · ${prize}</em>` : `<div class="lg-bar"><i style="width:${pct}%"></i></div><em>${Math.min(cur, target)}/${target} · premio: ${prize}</em>`}
          </div>
        </div>`;
      }).join('')}
    </div>
    <div class="panel lg-rules">
      <h3>☠️ Castigos</h3>
      <ul>
        <li>🍎 <strong>Manzana envenenada:</strong> pedir ${config.castigos.manzana.cuando} pistas en un descanso cuesta ${config.castigos.manzana.costo} 🎟️.</li>
        <li>💥 <strong>Creeper:</strong> perder ${config.castigos.creeper.cuando} juegos en un descanso explota ${config.castigos.creeper.costo} 🎟️.</li>
        <li>♚ <strong>Sindarov:</strong> perder ${config.castigos.sindarov.cuando} retos de ajedrez seguidos y le debes ${config.castigos.sindarov.costo} 🎟️.</li>
        <li>🧟 <strong>Zombi:</strong> ${config.castigos.zombi.cuando} días sin pomodoro y te muerde ${config.castigos.zombi.costo} 🎟️.</li>
      </ul>
      <p class="hint">Un 🛡️ escudo de netherite bloquea el siguiente castigo.</p>
    </div>
    <div class="panel lg-log">
      <h3>📜 Bitácora</h3>
      ${data.log.length ? `<ul>${data.log.slice(0, 15).map((e) => `<li class="${e.good ? 'is-good' : 'is-bad'}">${e.icon} ${escapeHtml(e.text)} <small>${new Date(e.date).toLocaleDateString('es', { day: 'numeric', month: 'short' })}</small></li>`).join('')}</ul>` : '<p class="hint">Aquí se anotan tus insignias y castigos.</p>'}
    </div>`;
}
