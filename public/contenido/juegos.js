/* =====================================================================
   DATOS DE LOS MINIJUEGOS
   =====================================================================
   Este archivo lo editas TÚ directamente en GitHub:
     1. Abre este archivo y pulsa el lápiz ✏️ (arriba a la derecha).
     2. Copia una línea de la sección que quieras, pégala debajo y cámbiala.
     3. Pulsa "Commit changes". Vercel publica el cambio en un minuto.

   REGLAS (solo tres):
     - Los textos van entre comillas simples '...'. Si llevan apóstrofo, usa "..."
     - Cada línea termina con una coma.
     - No borres corchetes [ ] ni llaves { }.

   Si algo queda mal escrito, la app no se rompe: usa los juegos de fábrica
   y avisa en la zona de minijuegos.
   ===================================================================== */

export const JUEGOS = {

  /* -------------------------------------------------------------------
     AJUSTES GENERALES
       ticketsMaxPorDescanso -> cuántos tickets se pueden ganar con
                                minijuegos en un mismo descanso
     ------------------------------------------------------------------- */
  ajustes: {
    ticketsMaxPorDescanso: 2,
  },

  /* -------------------------------------------------------------------
     DIFICULTAD (cambia solo los números o true/false)
     Si un juego se le hace imposible, súbele aquí los intentos o el tiempo.
       ahorcadoFallos          -> fallos antes de que se coman el malvavisco
       ahorcadoPistaTrasFallos -> la pista sale después de estos fallos (0 = desde el inicio)
       cosidleIntentos         -> intentos para adivinar la palabra
       cosidleModoDificil      -> true: tiene que reusar las letras que ya descubrió
       ajedrezIntentos         -> jugadas equivocadas permitidas
       ajedrezSegundos         -> tiempo para resolver (0 = sin reloj)
       sopaOcultarPalabras     -> true: solo ve la inicial y cuántas letras lleva
       sopaSenuelos            -> true: cuadrícula más grande y palabras falsas parecidas
       sopaSegundos            -> tiempo para encontrar todo (0 = sin reloj)
     ------------------------------------------------------------------- */
  dificultad: {
    ahorcadoFallos: 4,
    ahorcadoPistaTrasFallos: 2,
    cosidleIntentos: 4,
    cosidleModoDificil: true,
    ajedrezIntentos: 1,
    ajedrezSegundos: 120,
    sopaOcultarPalabras: true,
    sopaSenuelos: true,
    sopaSegundos: 240,
  },

  /* -------------------------------------------------------------------
     1. AHORCADO: "Salva el Malvavisco"
     Cada fallo acerca al villano al malvavisco. Los fallos permitidos
     se cambian arriba, en DIFICULTAD.
       palabra -> lo que hay que adivinar (puede llevar espacios)
       pista   -> la ayuda que se muestra
     ------------------------------------------------------------------- */
  ahorcado: [
    { palabra: 'ornitorrinco', pista: 'El animal con el peor diseño de la naturaleza' },
    { palabra: 'dipper', pista: 'Disfraz goated que no sé cómo usasaste un día' },
    { palabra: 'marshmello', pista: 'Resultado que pasaría si no hay time out' },
    { palabra: 'before sunset', pista: 'Película que te encanta' },
    { palabra: 'brownie', pista: 'Un postre que te gusta mucho' },
    { palabra: 'estereofon', pista: 'Bloque blanco que te frena en el arcade' },
    { palabra: 'gambito de dama', pista: 'Apertura de ajedrez con nombre de serie' },
    { palabra: 'grogu', pista: 'Pequeño, verde y fan de las galletas azules' },
  ],

  /* -------------------------------------------------------------------
     2. COSI-DLE
     Adivina la palabra (los intentos se cambian arriba, en DIFICULTAD).
     IMPORTANTE: cada palabra debe tener exactamente 5 letras y no llevar
     espacios. Las que no cumplan se ignoran solas.
     ------------------------------------------------------------------- */
  cosidle: [
    'cuaces', 'chess', 'grogu', 'besos', 'pasta', 'torre',
    'reina', 'jaque', 'amigo', 'novio', 'cielo', 'cosi',
    'sushi', 'mabel', 'vader', 'sueño',
    'motor', 'insta', 'blitz', 'tacos', 'negra',
  ],

  /* -------------------------------------------------------------------
     3. EXAMEN SORPRESA (trivia)
       titulo    -> el nombre del examen
       segundos  -> tiempo para responder cada pregunta
       cuantas   -> cuántas preguntas salen en cada intento (al azar)
       aprobar   -> cuántas hay que acertar para ganar el ticket
     Cada pregunta lleva 4 opciones y la letra de la correcta: 'A', 'B', 'C' o 'D'.
     En el juego las opciones salen revueltas, así que no se puede memorizar la letra.
     ------------------------------------------------------------------- */
  trivia: {
    titulo: 'Física 3: Dinámica de Nuestra Relación',
    segundos: 8,
    cuantas: 7,
    aprobar: 6,
    preguntas: [
      {
        pregunta: 'Si no me pongo alarma un domingo, ¿a qué hora me despierto por inercia?',
        opciones: ['9:00 AM', '7:30 AM', '10:00 AM', '6:00 AM'],
        correcta: 'B',
      },
      {
        pregunta: '¿Cuál es el color favorito del ingeniero de esta app?',
        opciones: ['Verde', 'Café', 'Azul', 'Rojo'],
        correcta: 'C',
      },
      {
        pregunta: '¿Qué película se puede ver 30 minutos con un cupón de la tienda?',
        opciones: ['Before Sunset', 'Interstellar', 'Gravity Falls', 'Star Wars'],
        correcta: 'A',
      },
      {
        pregunta: 'En el arcade, ¿qué enemigo se mueve en "L" como el caballo?',
        opciones: ['Homelander', 'Darth Vader', 'El zombi', 'Valery Salov'],
        correcta: 'D',
      },
      {
        pregunta: '¿Qué te da supervelocidad en el arcade?',
        opciones: ['El plato de pasta', 'Red Bull Green Edition', 'Los Skittles', 'El zapallo'],
        correcta: 'B',
      },
      {
        pregunta: '¿Cuál es el animal con el peor diseño de la naturaleza?',
        opciones: ['El ornitorrinco', 'La jirafa', 'El pez globo', 'El koala'],
        correcta: 'A',
      },
      {
        pregunta: '¿Quiénes resuelven misterios y te inspiran a terminar el bloque?',
        opciones: ['Rick y Morty', 'Finn y Jake', 'Dipper y Mabel', 'Phineas y Ferb'],
        correcta: 'C',
      },

      // ---------- Sobre nosotros ----------
      {
        pregunta: '¿Cuál ha sido tu cita favorita conmigo?',
        opciones: ['El parquecito y luego ir a comer', 'El cine', 'Un café', 'Una película en casa'],
        correcta: 'A',
      },
      {
        pregunta: '¿Qué canción te recuerda a mí?',
        opciones: ['Perfect', 'Yellow', 'Brown Eyed Girl', 'Die With A Smile'],
        correcta: 'C',
      },
      {
        pregunta: '¿Qué lugar te gustaría que conociéramos juntos?',
        opciones: ['Japón', 'París', 'Todo el mundo', 'La playa'],
        correcta: 'C',
      },
      {
        pregunta: '¿Qué es lo que más te gusta de cuando nos vemos?',
        opciones: ['La comida', 'El tiempo de calidad', 'Los besos', 'Los brownies'],
        correcta: 'B',
      },
      {
        pregunta: '¿Cuál de mis apodos para ti es tu favorito?',
        opciones: ['Cosi', 'Marshmello', 'Grogu', 'Mati'],
        correcta: 'D',
      },
      {
        pregunta: 'Si tuvieras que describirnos con una película, ¿cuál sería?',
        opciones: ['Before Sunset', 'Titanic', 'Up', 'La La Land'],
        correcta: 'A',
      },
    ],
  },

  /* -------------------------------------------------------------------
     4. RETO DE AJEDREZ (mate en 2)
       titulo    -> texto que se muestra arriba del tablero
       fen       -> la posición en código FEN (se copia de lichess.org/editor)
       solucion  -> la línea completa, cada jugada como 'salida-llegada':
                    [tu jugada, respuesta del rival, tu jugada de mate]
                    El rival juega solo. Para un mate en 1 basta una: ['h5-f7']
       nota      -> (opcional) texto que sale al terminar
     El turno lo dice el propio FEN: la letra "w" es blancas y "b" es negras.
     Todos estos los revisó un motor: la primera jugada es la única que fuerza mate.
     ------------------------------------------------------------------- */
  ajedrez: [
    {
      titulo: 'Mate en 2 · Reto 1',
      fen: '8/K5pk/7P/7P/n4Q1R/5Bp1/3p1r2/8 w',
      solucion: ['f4-f7', 'h7-h8', 'f7-g7'],
    },
    {
      titulo: 'Mate en 2 · Reto 2',
      fen: '8/K6n/8/k1NP3B/8/rp2P3/p7/5Q1n w',
      solucion: ['f1-c4', 'h7-f8', 'c5-b7'],
    },
    {
      titulo: 'Mate en 2 · Reto 3',
      fen: '3q4/6p1/3Pr3/1P5p/Nr1ppBPP/K7/4k1P1/8 b',
      solucion: ['d8-a5', 'a3-a2', 'a5-a4'],
    },
    {
      titulo: 'Mate en 2 · Reto 4',
      fen: 'k7/P3P1n1/2P1N3/5p1p/3pP2p/4b2K/8/7Q w',
      solucion: ['h1-b1', 'a8-a7', 'b1-b7'],
    },
    {
      titulo: 'Mate en 2 · Reto 5',
      fen: '8/3p4/p7/4p2Q/p2P3b/3R3B/P7/r1k4K w',
      solucion: ['h5-e2', 'h4-d8', 'd3-d1'],
    },
    {
      titulo: 'Mate en 2 · Reto 6',
      fen: '8/2q5/3P1k2/2p1p2K/4R1pP/b2n4/7p/3B4 b',
      solucion: ['c7-g7', 'd1-e2', 'g7-g6'],
    },
    {
      titulo: 'Mate en 2 · Reto 7',
      fen: '8/5p2/1Q6/4PK2/rN6/5k1P/2pP4/2b4R w',
      solucion: ['h1-h2', 'a4-a3', 'b6-f2'],
    },
    {
      titulo: 'Mate en 2 · Reto 8',
      fen: 'k7/P2P3B/2KR3b/5B2/1p3p2/p4P2/1P1p4/4n3 w',
      solucion: ['c6-b6', 'h6-g5', 'f5-e4'],
    },
    {
      titulo: 'Mate en 2 · Reto 9',
      fen: '1B4b1/8/3P4/2NPn3/6p1/5P1P/k4rp1/6K1 b',
      solucion: ['g4-g3', 'c5-d3', 'e5-f3'],
    },
    {
      titulo: 'Mate en 2 · Reto 10',
      fen: 'K3k3/Q5n1/8/2p1P1N1/1B6/8/6pP/b7 w',
      solucion: ['b4-a5', 'e8-f8', 'a7-f7'],
    },
  ],

  /* -------------------------------------------------------------------
     5. SOPA DE LETRAS
     Cada mapa es un nivel. Puedes agregar mapas nuevos copiando un bloque.
       id      -> nombre corto sin espacios (no cambies 'apodos' ni 'carino':
                  algunos cupones dependen de ellos)
       titulo  -> cómo se llama el mapa
       palabras -> sin espacios; máximo 12 letras cada una
     ------------------------------------------------------------------- */
  sopa: [
    { id: 'apodos', titulo: 'Mapa 1: Apodos', palabras: ['cosi', 'marshmello', 'grogu', 'besito', 'precioso', 'mivida'] },
    { id: 'carino', titulo: 'Mapa 2: Cariño', palabras: ['tequiero', 'teamo', 'sosasombroso'] },
  ],
};
