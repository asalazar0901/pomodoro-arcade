/* =====================================================================
   INSIGNIAS, POTENCIADORES Y CASTIGOS
   =====================================================================
   Este archivo lo editas TÚ en GitHub (lápiz ✏️ y "Commit changes").
   Las insignias en sí viven en js/logros.js; aquí cambias el premio
   secreto y qué tan fuertes son los potenciadores y castigos.
   ===================================================================== */

export const LOGROS = {
  /* -------------------------------------------------------------------
     CLAVE SECRETA
     Algunas insignias le revelan una letra de esta frase (en orden).
     Cuando la completa, en Logros le aparece una tarjeta con el premio
     para que le haga captura y te la mande.
     Usa pocas letras: hay 7 insignias que dan letra (los espacios no cuentan).
     ------------------------------------------------------------------- */
  claveSecreta: 'MINION',
  premioClave: 'Una cita sorpresa planeada por tu novia, sin límite de presupuesto (bueno, casi).',

  /* -------------------------------------------------------------------
     POTENCIADORES
       fiebreMinutos -> cuánto dura la "Fiebre del oro" (cada ticket vale 1.5)
     ------------------------------------------------------------------- */
  fiebreMinutos: 15,

  /* -------------------------------------------------------------------
     CASTIGOS (pon 0 en el costo para apagar uno)
       manzana  -> pistas pedidas en un mismo descanso para que salga la
                   manzana envenenada, y cuántos tickets se come
       creeper  -> juegos perdidos en un mismo descanso para que explote
       sindarov -> retos de ajedrez perdidos seguidos para que te gane
       zombi    -> días sin hacer un pomodoro para que te muerda
     ------------------------------------------------------------------- */
  castigos: {
    manzana:  { cuando: 3, costo: 1 },
    creeper:  { cuando: 3, costo: 1 },
    sindarov: { cuando: 2, costo: 2 },
    zombi:    { cuando: 3, costo: 1 },
  },
};
